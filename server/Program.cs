using System.IdentityModel.Tokens.Jwt;
using Api.Data;
using Api.Interfaces;
using Api.Repositories;
using Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Elastic Beanstalk (.NET on Linux) nginx proxies to port 5000 by default. ASP.NET Core 8+
// may otherwise listen on 8080 when ASPNETCORE_URLS is unset, which yields 502 from nginx
// while EB can still report Green. Honor PORT when set; else default to 5000 in Production.
if (builder.Environment.IsProduction())
{
    var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS");
    if (string.IsNullOrWhiteSpace(urls))
    {
        var port = Environment.GetEnvironmentVariable("PORT");
        var listenPort = string.IsNullOrWhiteSpace(port) ? "5000" : port.Trim();
        builder.WebHost.UseUrls($"http://0.0.0.0:{listenPort}");
    }
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddOpenApi();

// Clerk session JWT (SaaS). When CLERK_FRONTEND_API is unset, JWT validation rejects all tokens so [Authorize] still returns 401 locally without a Clerk instance.
var clerkFrontend = builder.Configuration["CLERK_FRONTEND_API"]?.Trim();
var clerkMetadata = builder.Configuration["CLERK_METADATA_ADDRESS"]?.Trim();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        if (string.IsNullOrEmpty(clerkFrontend))
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateLifetime = false,
                ValidateIssuerSigningKey = false,
                SignatureValidator = (_, _) =>
                    throw new SecurityTokenInvalidSignatureException(
                        "Set CLERK_FRONTEND_API to your Clerk Frontend API URL (JWT iss) to validate session tokens."),
            };
        }
        else
        {
            var authority = clerkFrontend.TrimEnd('/');
            options.Authority = authority;
            options.MetadataAddress = string.IsNullOrEmpty(clerkMetadata)
                ? $"{authority}/.well-known/openid-configuration"
                : clerkMetadata;
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = authority,
                ValidateAudience = false,
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromMinutes(2),
                NameClaimType = JwtRegisteredClaimNames.Sub,
            };
        }

        options.Events = new JwtBearerEvents
        {
            OnTokenValidated = context =>
            {
                var parties = context.HttpContext.RequestServices.GetRequiredService<IConfiguration>()["CLERK_AUTHORIZED_PARTIES"];
                if (string.IsNullOrWhiteSpace(parties))
                    return Task.CompletedTask;

                var azp = context.Principal?.FindFirst("azp")?.Value;
                if (string.IsNullOrEmpty(azp))
                    return Task.CompletedTask;

                var allowed = parties.Split(',', StringSplitOptions.TrimEntries | StringSplitOptions.RemoveEmptyEntries);
                if (allowed.Length > 0 && !allowed.Contains(azp, StringComparer.Ordinal))
                    context.Fail("azp is not listed in CLERK_AUTHORIZED_PARTIES.");
                return Task.CompletedTask;
            },
        };
    });
builder.Services.AddAuthorization();

// Behind Nginx (EB) or CloudFront: honor X-Forwarded-Proto / X-Forwarded-For
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Configure SQLite with EF Core and retry strategy for concurrent access (busy/locked)
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection")
    ?? "Data Source=/var/app/data/justingritten.db";
builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlite(connectionString, sqliteOptions =>
    {
        sqliteOptions.ExecutionStrategy(dependencies =>
            new SqliteRetryingExecutionStrategy(dependencies, maxRetryCount: 5, TimeSpan.FromSeconds(30)));
    });
});

// Register repositories
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IContactRepository, ContactRepository>();
builder.Services.AddScoped<IMetricRepository, MetricRepository>();
builder.Services.AddScoped<IMetricsService, MetricsService>();

var emailProvider = (builder.Configuration["EMAIL_PROVIDER"] ?? "Resend").Trim();
if (emailProvider.Equals("Resend", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.AddHttpClient(nameof(ResendContactEmailSender));
    builder.Services.Configure<ResendEmailOptions>(options =>
    {
        options.ApiKey = builder.Configuration["RESEND_API_KEY"] ?? string.Empty;
        options.FromEmail = builder.Configuration["RESEND_FROM_EMAIL"] ?? string.Empty;
        options.ToEmail = builder.Configuration["CONTACT_TO_EMAIL"] ?? string.Empty;
        options.ContactTemplateId = builder.Configuration["RESEND_CONTACT_TEMPLATE_ID"] ?? string.Empty;
    });
    builder.Services.AddScoped<IContactEmailSender, ResendContactEmailSender>();
}
else if (emailProvider.Equals("Ses", StringComparison.OrdinalIgnoreCase))
{
    builder.Services.Configure<SesEmailOptions>(options =>
    {
        options.Region = builder.Configuration["SES_REGION"] ?? builder.Configuration["AWS_REGION"] ?? string.Empty;
        options.FromEmail = builder.Configuration["SES_FROM_EMAIL"] ?? string.Empty;
        options.ToEmail = builder.Configuration["CONTACT_TO_EMAIL"] ?? string.Empty;
    });
    builder.Services.AddScoped<IContactEmailSender, SesContactEmailSender>();
}
else
{
    builder.Services.AddScoped<IContactEmailSender, NoOpContactEmailSender>();
}

// Configure CORS for React frontend (local and production)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins(
                  "http://localhost:5173",
                  "http://localhost:3000",
                  "https://www.justingritten.dev",
                  "https://justingritten.dev"
              )
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

// Apply pending EF Core migrations (creates or updates database schema)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.Migrate();
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseForwardedHeaders();

app.UseCors("AllowReactApp");

// TLS terminates at CloudFront/ALB; Kestrel is HTTP-only on EB — skip redirect to avoid warnings and mis-detection
if (app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Health check for load balancer (EB/ELB). Configure EB health check path to /health.
app.MapGet("/health", () => Results.Ok());

app.Run();

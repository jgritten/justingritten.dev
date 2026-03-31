using Api.Data;
using Api.Interfaces;
using Api.Repositories;
using Api.Services;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

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

app.UseAuthorization();

app.MapControllers();

// Health check for load balancer (EB/ELB). Configure EB health check path to /health.
app.MapGet("/health", () => Results.Ok());

app.Run();

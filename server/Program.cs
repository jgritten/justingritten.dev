using Api.Data;
using Api.Interfaces;
using Api.Repositories;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

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
    ?? "Data Source=justingritten.db";
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

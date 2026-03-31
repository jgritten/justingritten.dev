using System.Linq;
using Api.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests;

/// <summary>
/// Integration test host that uses a dedicated SQLite file per fixture instance and applies migrations via <c>Program</c>.
/// Each fixture gets its own temp file so parallel test classes (xUnit default) do not contend on one database.
/// </summary>
public class ApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly string _dbPath = Path.Combine(Path.GetTempPath(), $"justingritten-test-{Guid.NewGuid():N}.db");
    private readonly string _connectionString;

    public ApiWebApplicationFactory()
    {
        _connectionString = $"Data Source={_dbPath}";
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (descriptor != null)
                services.Remove(descriptor);

            services.AddDbContext<AppDbContext>(options =>
                options.UseSqlite(_connectionString));
        });
    }

    public new void Dispose()
    {
        base.Dispose();
        try
        {
            if (File.Exists(_dbPath))
                File.Delete(_dbPath);
        }
        catch
        {
            // best-effort temp file cleanup
        }
    }
}

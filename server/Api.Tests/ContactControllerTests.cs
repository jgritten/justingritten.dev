using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace Api.Tests;

public class ContactControllerTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public ContactControllerTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task Create_ValidBody_ReturnsOkAndPersistsMessage()
    {
        var client = _factory.CreateClient();
        var body = new
        {
            firstName = "Jane",
            lastName = "Doe",
            email = "jane@example.com",
            companyOrProject = "Test Co",
            message = "Hello, I would like to discuss a project.",
            source = (string?)"test"
        };

        var response = await client.PostAsJsonAsync("/api/contact", body);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        Assert.True(json.TryGetProperty("message", out var msg));
        Assert.Contains("received", msg.GetString()!, StringComparison.OrdinalIgnoreCase);

        // Verify persistence via GET
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var saved = await context.ContactMessages
            .Where(m => m.Email == "jane@example.com")
            .OrderByDescending(m => m.CreatedAt)
            .FirstOrDefaultAsync();
        Assert.NotNull(saved);
        Assert.Equal("Jane", saved.FirstName);
        Assert.Equal("Doe", saved.LastName);
        Assert.Equal("Test Co", saved.CompanyOrProject);
    }

    [Fact]
    public async Task Create_EmptyFirstName_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var body = new
        {
            firstName = "",
            lastName = "Doe",
            email = "jane@example.com",
            companyOrProject = "Test Co",
            message = "Hello"
        };

        var response = await client.PostAsJsonAsync("/api/contact", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Create_FirstNameOverMaxLength_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var body = new
        {
            firstName = new string('a', 101),
            lastName = "Doe",
            email = "jane@example.com",
            companyOrProject = "Test Co",
            message = "Hello"
        };

        var response = await client.PostAsJsonAsync("/api/contact", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}

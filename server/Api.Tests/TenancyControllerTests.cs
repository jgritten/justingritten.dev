using System.Net;
using Xunit;

namespace Api.Tests;

public class TenancyControllerTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly HttpClient _client;

    public TenancyControllerTests(ApiWebApplicationFactory factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetWorkspace_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/v1/Tenancy/workspace");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateClient_WithoutToken_Returns401()
    {
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/v1/Tenancy/clients");
        request.Content = new StringContent("{\"name\":\"Acme\"}", System.Text.Encoding.UTF8, "application/json");
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task UpdatePreferences_WithoutToken_Returns401()
    {
        using var request = new HttpRequestMessage(HttpMethod.Put, "/api/v1/Tenancy/preferences");
        request.Content = new StringContent(
            "{\"defaultClientId\":null,\"skipHubWhenDefaultAvailable\":false}",
            System.Text.Encoding.UTF8,
            "application/json");
        var response = await _client.SendAsync(request);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task AcceptInvitation_WithoutToken_Returns401()
    {
        var id = Guid.NewGuid();
        var response = await _client.PostAsync($"/api/v1/Tenancy/invitations/{id}/accept", null);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}

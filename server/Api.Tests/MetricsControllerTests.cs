using System.Net;
using System.Net.Http.Json;
using System.Text.Json.Serialization;
using Xunit;

namespace Api.Tests;

public class MetricsControllerTests : IClassFixture<ApiWebApplicationFactory>
{
    private readonly ApiWebApplicationFactory _factory;

    public MetricsControllerTests(ApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task RecordVisit_ValidRoute_ReturnsAcceptedAndIncrementsSummary()
    {
        var client = _factory.CreateClient();
        var body = new { route = "/" };

        var response = await client.PostAsJsonAsync("/api/metrics/visit", body);

        Assert.Equal(HttpStatusCode.Accepted, response.StatusCode);

        var summaryResponse = await client.GetAsync("/api/metrics/summary?route=/");
        summaryResponse.EnsureSuccessStatusCode();
        var summary = await summaryResponse.Content.ReadFromJsonAsync<VisitSummaryDto>();
        Assert.NotNull(summary);
        Assert.Equal("/", summary.Route);
        Assert.True(summary.TotalCount >= 1);
    }

    [Fact]
    public async Task GetSummary_DefaultRoute_ReturnsOkWithShape()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/metrics/summary?route=/");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var summary = await response.Content.ReadFromJsonAsync<VisitSummaryDto>();
        Assert.NotNull(summary);
        Assert.Equal("/", summary.Route);
        Assert.True(summary.TotalCount >= 0);
    }

    [Fact]
    public async Task RecordVisit_EmptyRoute_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();
        var body = new { route = "" };

        var response = await client.PostAsJsonAsync("/api/metrics/visit", body);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private sealed class VisitSummaryDto
    {
        [JsonPropertyName("route")]
        public string Route { get; set; } = "";

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }
    }
}

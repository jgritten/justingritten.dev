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

    [Fact]
    public async Task GetOverview_Week_ReturnsAggregatedDataWithDates()
    {
        var client = _factory.CreateClient();

        await client.PostAsJsonAsync("/api/metrics/visit", new { route = "/" });
        await client.PostAsJsonAsync("/api/metrics/visit", new { route = "/build" });
        await client.PostAsJsonAsync("/api/metrics/visit", new { route = "/outbound/resume" });

        var response = await client.GetAsync("/api/metrics/overview?period=week");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var overview = await response.Content.ReadFromJsonAsync<MetricsOverviewDto>();
        Assert.NotNull(overview);
        Assert.Equal("week", overview.Period);
        Assert.NotEmpty(overview.RouteTotals);
        Assert.NotEmpty(overview.OutboundTotals);
        Assert.NotEmpty(overview.BucketTotals);
        Assert.NotEmpty(overview.RouteBucketTotals);
        Assert.Contains(overview.RouteTotals, x => x.Route == "/");
        Assert.Contains(overview.RouteTotals, x => x.Route == "/build");
        Assert.Contains(overview.OutboundTotals, x => x.Route == "/outbound/resume");
    }

    [Fact]
    public async Task GetOverview_InvalidPeriod_ReturnsBadRequest()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/metrics/overview?period=year");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private sealed class VisitSummaryDto
    {
        [JsonPropertyName("route")]
        public string Route { get; set; } = "";

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }
    }

    private sealed class MetricRouteTotalDto
    {
        [JsonPropertyName("route")]
        public string Route { get; set; } = "";

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }
    }

    private sealed class MetricBucketTotalDto
    {
        [JsonPropertyName("bucketStartUtc")]
        public string BucketStartUtc { get; set; } = "";

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }
    }

    private sealed class MetricBucketRouteTotalDto
    {
        [JsonPropertyName("bucketStartUtc")]
        public string BucketStartUtc { get; set; } = "";

        [JsonPropertyName("route")]
        public string Route { get; set; } = "";

        [JsonPropertyName("totalCount")]
        public int TotalCount { get; set; }
    }

    private sealed class MetricsOverviewDto
    {
        [JsonPropertyName("period")]
        public string Period { get; set; } = "";

        [JsonPropertyName("fromUtc")]
        public string FromUtc { get; set; } = "";

        [JsonPropertyName("toUtc")]
        public string ToUtc { get; set; } = "";

        [JsonPropertyName("routeTotals")]
        public List<MetricRouteTotalDto> RouteTotals { get; set; } = [];

        [JsonPropertyName("outboundTotals")]
        public List<MetricRouteTotalDto> OutboundTotals { get; set; } = [];

        [JsonPropertyName("bucketTotals")]
        public List<MetricBucketTotalDto> BucketTotals { get; set; } = [];

        [JsonPropertyName("routeBucketTotals")]
        public List<MetricBucketRouteTotalDto> RouteBucketTotals { get; set; } = [];
    }
}

using Api.DTOs;
using Api.Interfaces;

namespace Api.Services;

public class MetricsService : IMetricsService
{
    private const string OutboundRoutePrefix = "/outbound/";

    private readonly IMetricRepository _metricRepository;

    public MetricsService(IMetricRepository metricRepository)
    {
        _metricRepository = metricRepository;
    }

    public async Task<DateTime> RecordVisitAsync(string route, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(route))
            throw new ArgumentException("Route is required.");

        var normalizedRoute = route.Trim();
        if (normalizedRoute.Length > 200)
            throw new ArgumentException("Route is too long.");

        var occurredAtUtc = DateTime.UtcNow;
        await _metricRepository.RecordVisitAsync(normalizedRoute, occurredAtUtc, cancellationToken);
        return occurredAtUtc;
    }

    public async Task<VisitSummaryDto> GetSummaryAsync(string? route, CancellationToken cancellationToken = default)
    {
        var normalizedRoute = string.IsNullOrWhiteSpace(route) ? "/" : route.Trim();
        var total = await _metricRepository.GetTotalForRouteAsync(normalizedRoute, cancellationToken);
        return new VisitSummaryDto(normalizedRoute, total);
    }

    public async Task<MetricsOverviewDto> GetOverviewAsync(string? period, CancellationToken cancellationToken = default)
    {
        var normalizedPeriod = (period ?? "week").Trim().ToLowerInvariant();
        var periodConfig = normalizedPeriod switch
        {
            "hour" => new PeriodConfig(12, TimeSpan.FromMinutes(5)),
            "day" => new PeriodConfig(24, TimeSpan.FromHours(1)),
            "week" => new PeriodConfig(7, TimeSpan.FromDays(1)),
            "month" => new PeriodConfig(30, TimeSpan.FromDays(1)),
            _ => null
        };

        if (periodConfig is null)
            throw new ArgumentException("Invalid period. Use one of: hour, day, week, month.");

        var nowUtc = DateTime.UtcNow;
        var bucketSize = periodConfig.BucketSize;
        var bucketCount = periodConfig.BucketCount;
        var bucket0StartUtc = new DateTime((nowUtc.Ticks / bucketSize.Ticks) * bucketSize.Ticks, DateTimeKind.Utc);
        var fromUtc = bucket0StartUtc.AddTicks(-(bucketCount - 1L) * bucketSize.Ticks);
        var toUtc = nowUtc;

        var routeTotals = await _metricRepository.GetTotalsByRouteAsync(fromUtc, toUtc, cancellationToken);
        var events = await _metricRepository.GetEventsInRangeAsync(fromUtc, toUtc, cancellationToken);

        var outboundTotals = routeTotals
            .Where(x => x.Route.StartsWith(OutboundRoutePrefix, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(x => x.TotalCount)
            .Select(x => new MetricRouteTotalDto(x.Route, x.TotalCount))
            .ToList();

        var nonOutboundRouteTotals = routeTotals
            .Where(x => !x.Route.StartsWith(OutboundRoutePrefix, StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(x => x.TotalCount)
            .Select(x => new MetricRouteTotalDto(x.Route, x.TotalCount))
            .ToList();

        var nonOutboundEvents = events
            .Where(x => !x.Route.StartsWith(OutboundRoutePrefix, StringComparison.OrdinalIgnoreCase))
            .ToList();

        var bucketTotals = nonOutboundEvents
            .GroupBy(x =>
            {
                var index = (int)((x.OccurredAtUtc - fromUtc).Ticks / bucketSize.Ticks);
                var safeIndex = Math.Clamp(index, 0, bucketCount - 1);
                return fromUtc.AddTicks(safeIndex * bucketSize.Ticks);
            })
            .OrderBy(g => g.Key)
            .Select(g => new MetricBucketTotalDto(g.Key, g.Sum(x => x.Count)))
            .ToList();

        var routeBucketTotals = nonOutboundEvents
            .GroupBy(x =>
            {
                var index = (int)((x.OccurredAtUtc - fromUtc).Ticks / bucketSize.Ticks);
                var safeIndex = Math.Clamp(index, 0, bucketCount - 1);
                var bucketStart = fromUtc.AddTicks(safeIndex * bucketSize.Ticks);
                return new { bucketStart, x.Route };
            })
            .OrderBy(g => g.Key.bucketStart)
            .ThenBy(g => g.Key.Route)
            .Select(g => new MetricBucketRouteTotalDto(g.Key.bucketStart, g.Key.Route, g.Sum(x => x.Count)))
            .ToList();

        return new MetricsOverviewDto(
            normalizedPeriod,
            fromUtc,
            toUtc,
            nonOutboundRouteTotals,
            outboundTotals,
            bucketTotals,
            routeBucketTotals
        );
    }

    private sealed record PeriodConfig(int BucketCount, TimeSpan BucketSize);
}

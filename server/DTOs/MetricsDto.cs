namespace Api.DTOs;

public record RecordVisitRequestDto(string Route);

public record VisitSummaryDto(string Route, int TotalCount);

public record MetricRouteTotalDto(string Route, int TotalCount);

public record MetricBucketTotalDto(DateTime BucketStartUtc, int TotalCount);

public record MetricBucketRouteTotalDto(DateTime BucketStartUtc, string Route, int TotalCount);

public record MetricsOverviewDto(
    string Period,
    DateTime FromUtc,
    DateTime ToUtc,
    IReadOnlyList<MetricRouteTotalDto> RouteTotals,
    IReadOnlyList<MetricRouteTotalDto> OutboundTotals,
    IReadOnlyList<MetricBucketTotalDto> BucketTotals,
    IReadOnlyList<MetricBucketRouteTotalDto> RouteBucketTotals
);

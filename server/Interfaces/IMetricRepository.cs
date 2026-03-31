namespace Api.Interfaces;

public interface IMetricRepository
{
    Task RecordVisitAsync(string route, DateTime occurredAtUtc, CancellationToken cancellationToken = default);
    Task<int> GetTotalForRouteAsync(string route, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<(string Route, int TotalCount)>> GetTotalsByRouteAsync(
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default
    );
    Task<IReadOnlyList<(DateTime OccurredAtUtc, string Route, int Count)>> GetEventsInRangeAsync(
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default
    );
}

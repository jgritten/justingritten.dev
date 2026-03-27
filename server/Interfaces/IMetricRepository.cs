namespace Api.Interfaces;

public interface IMetricRepository
{
    Task<int> RecordVisitAsync(string route, DateOnly date, CancellationToken cancellationToken = default);
    Task<int> GetTotalForRouteAsync(string route, CancellationToken cancellationToken = default);
}

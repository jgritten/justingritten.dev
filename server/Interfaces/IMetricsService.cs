using Api.DTOs;

namespace Api.Interfaces;

public interface IMetricsService
{
    Task<DateTime> RecordVisitAsync(string route, CancellationToken cancellationToken = default);
    Task<VisitSummaryDto> GetSummaryAsync(string? route, CancellationToken cancellationToken = default);
    Task<MetricsOverviewDto> GetOverviewAsync(string? period, CancellationToken cancellationToken = default);
}

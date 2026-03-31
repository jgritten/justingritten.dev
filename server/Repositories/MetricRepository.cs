using Api.Data;
using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class MetricRepository : IMetricRepository
{
    private readonly AppDbContext _context;

    public MetricRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task RecordVisitAsync(string route, DateTime occurredAtUtc, CancellationToken cancellationToken = default)
    {
        await _context.VisitMetrics.AddAsync(new VisitMetric
        {
            Route = route,
            OccurredAtUtc = occurredAtUtc,
            Count = 1
        }, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<int> GetTotalForRouteAsync(string route, CancellationToken cancellationToken = default)
    {
        return await _context.VisitMetrics
            .Where(x => x.Route == route)
            .SumAsync(x => (int?)x.Count, cancellationToken) ?? 0;
    }

    public async Task<IReadOnlyList<(string Route, int TotalCount)>> GetTotalsByRouteAsync(
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.VisitMetrics
            .Where(x => x.OccurredAtUtc >= fromUtc && x.OccurredAtUtc <= toUtc)
            .GroupBy(x => x.Route)
            .Select(g => new ValueTuple<string, int>(g.Key, g.Sum(x => x.Count)))
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<(DateTime OccurredAtUtc, string Route, int Count)>> GetEventsInRangeAsync(
        DateTime fromUtc,
        DateTime toUtc,
        CancellationToken cancellationToken = default
    )
    {
        return await _context.VisitMetrics
            .Where(x => x.OccurredAtUtc >= fromUtc && x.OccurredAtUtc <= toUtc)
            .Select(x => new ValueTuple<DateTime, string, int>(x.OccurredAtUtc, x.Route, x.Count))
            .ToListAsync(cancellationToken);
    }
}

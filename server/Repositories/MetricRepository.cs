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

    public async Task<int> RecordVisitAsync(string route, DateOnly date, CancellationToken cancellationToken = default)
    {
        var metric = await _context.VisitMetrics
            .SingleOrDefaultAsync(x => x.Route == route && x.Date == date, cancellationToken);

        if (metric is null)
        {
            metric = new VisitMetric
            {
                Route = route,
                Date = date,
                Count = 1
            };
            await _context.VisitMetrics.AddAsync(metric, cancellationToken);
        }
        else
        {
            metric.Count += 1;
        }

        // Concurrent requests can race on unique (Route, Date); retry once after reload.
        for (var attempt = 0; ; attempt++)
        {
            try
            {
                await _context.SaveChangesAsync(cancellationToken);
                return metric.Count;
            }
            catch (DbUpdateException) when (attempt == 0)
            {
                _context.ChangeTracker.Clear();
                metric = await _context.VisitMetrics
                    .SingleOrDefaultAsync(x => x.Route == route && x.Date == date, cancellationToken);

                if (metric is null)
                {
                    metric = new VisitMetric { Route = route, Date = date, Count = 1 };
                    await _context.VisitMetrics.AddAsync(metric, cancellationToken);
                }
                else
                {
                    metric.Count += 1;
                }
            }
        }
    }

    public async Task<int> GetTotalForRouteAsync(string route, CancellationToken cancellationToken = default)
    {
        return await _context.VisitMetrics
            .Where(x => x.Route == route)
            .SumAsync(x => (int?)x.Count, cancellationToken) ?? 0;
    }
}

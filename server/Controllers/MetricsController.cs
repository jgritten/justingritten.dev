using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<MetricsController> _logger;

    public MetricsController(AppDbContext context, ILogger<MetricsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public record VisitRequest(string Route);

    public record VisitSummary(string Route, int TotalCount);

    [HttpPost("visit")]
    public async Task<IActionResult> RecordVisit([FromBody] VisitRequest request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Route))
        {
            return BadRequest(new { message = "Route is required." });
        }

        var route = request.Route.Trim();
        if (route.Length > 200)
        {
            return BadRequest(new { message = "Route is too long." });
        }

        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var metric = await _context.VisitMetrics
            .SingleOrDefaultAsync(x => x.Route == route && x.Date == today, cancellationToken);

        if (metric is null)
        {
            metric = new VisitMetric
            {
                Route = route,
                Date = today,
                Count = 1
            };
            await _context.VisitMetrics.AddAsync(metric, cancellationToken);
        }
        else
        {
            metric.Count += 1;
        }

        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Recorded visit for route {Route} on {Date}. Count now {Count}.", route, today, metric.Count);

        return Accepted(new { message = "Visit recorded." });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<VisitSummary>> GetSummary([FromQuery] string route = "/", CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(route))
        {
            route = "/";
        }

        route = route.Trim();

        var total = await _context.VisitMetrics
            .Where(x => x.Route == route)
            .SumAsync(x => (int?)x.Count, cancellationToken) ?? 0;

        return Ok(new VisitSummary(route, total));
    }
}


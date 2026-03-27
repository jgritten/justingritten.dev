using Api.DTOs;
using Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly IMetricRepository _metricRepository;
    private readonly ILogger<MetricsController> _logger;

    public MetricsController(IMetricRepository metricRepository, ILogger<MetricsController> logger)
    {
        _metricRepository = metricRepository;
        _logger = logger;
    }

    [HttpPost("visit")]
    public async Task<IActionResult> RecordVisit([FromBody] RecordVisitRequestDto request, CancellationToken cancellationToken)
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
        var count = await _metricRepository.RecordVisitAsync(route, today, cancellationToken);

        _logger.LogInformation("Recorded visit for route {Route} on {Date}. Count now {Count}.", route, today, count);

        return Accepted(new { message = "Visit recorded." });
    }

    [HttpGet("summary")]
    public async Task<ActionResult<VisitSummaryDto>> GetSummary([FromQuery] string route = "/", CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(route))
        {
            route = "/";
        }

        route = route.Trim();

        var total = await _metricRepository.GetTotalForRouteAsync(route, cancellationToken);

        return Ok(new VisitSummaryDto(route, total));
    }
}


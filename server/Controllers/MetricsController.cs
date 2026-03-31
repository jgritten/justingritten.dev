using Api.DTOs;
using Api.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MetricsController : ControllerBase
{
    private readonly IMetricsService _metricsService;
    private readonly ILogger<MetricsController> _logger;

    public MetricsController(IMetricsService metricsService, ILogger<MetricsController> logger)
    {
        _metricsService = metricsService;
        _logger = logger;
    }

    [HttpPost("visit")]
    public async Task<IActionResult> RecordVisit([FromBody] RecordVisitRequestDto request, CancellationToken cancellationToken)
    {
        try
        {
            var occurredAtUtc = await _metricsService.RecordVisitAsync(request.Route, cancellationToken);
            _logger.LogInformation("Recorded visit for route {Route} at {OccurredAtUtc}.", request.Route?.Trim(), occurredAtUtc);
            return Accepted(new { message = "Visit recorded." });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet("summary")]
    public async Task<ActionResult<VisitSummaryDto>> GetSummary([FromQuery] string route = "/", CancellationToken cancellationToken = default)
    {
        var summary = await _metricsService.GetSummaryAsync(route, cancellationToken);
        return Ok(summary);
    }

    [HttpGet("overview")]
    public async Task<ActionResult<MetricsOverviewDto>> GetOverview(
        [FromQuery] string period = "week",
        CancellationToken cancellationToken = default
    )
    {
        try
        {
            var overview = await _metricsService.GetOverviewAsync(period, cancellationToken);
            return Ok(overview);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}


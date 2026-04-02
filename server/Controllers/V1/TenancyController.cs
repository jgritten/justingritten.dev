using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.DTOs;
using Api.Interfaces;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.V1;

[ApiController]
[Route("api/v1/[controller]")]
[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class TenancyController : ControllerBase
{
    private readonly ITenancyService _tenancyService;

    public TenancyController(ITenancyService tenancyService)
    {
        _tenancyService = tenancyService;
    }

    [HttpGet("workspace")]
    [ProducesResponseType(typeof(TenantWorkspaceResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetWorkspace(CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email");
        var dto = await _tenancyService.GetWorkspaceAsync(sub, email, cancellationToken);
        return Ok(dto);
    }

    [HttpPost("clients")]
    [ProducesResponseType(typeof(CreateTenantClientResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> CreateClient(
        [FromBody] CreateTenantClientRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        if (request is null || string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { message = "Name is required." });

        var result = await _tenancyService.CreateClientAsync(sub, request.Name, cancellationToken);
        if (result is null)
            return BadRequest(new { message = "Invalid client name (1–200 characters)." });

        return StatusCode(StatusCodes.Status201Created, result);
    }

    [HttpPut("preferences")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> UpdatePreferences(
        [FromBody] UpdateTenantPreferencesRequestDto request,
        CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        if (request is null)
            return BadRequest(new { message = "Body is required." });

        var ok = await _tenancyService.UpdatePreferencesAsync(
            sub,
            request.DefaultClientId,
            request.SkipHubWhenDefaultAvailable,
            cancellationToken);
        if (!ok)
            return BadRequest(new { message = "Default client must be a tenant you belong to, or omit it." });

        return NoContent();
    }

    [HttpPost("invitations/{invitationId:guid}/accept")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> AcceptInvitation(Guid invitationId, CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email");
        var ok = await _tenancyService.TryAcceptInvitationAsync(sub, email, invitationId, cancellationToken);
        if (!ok)
            return NotFound();

        return NoContent();
    }

    [HttpPost("invitations/{invitationId:guid}/decline")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeclineInvitation(Guid invitationId, CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        var email = User.FindFirstValue(JwtRegisteredClaimNames.Email)
            ?? User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue("email");
        var ok = await _tenancyService.TryDeclineInvitationAsync(sub, email, invitationId, cancellationToken);
        if (!ok)
            return NotFound();

        return NoContent();
    }

    private bool TryGetClerkSubject(out string sub)
    {
        sub = User.FindFirstValue(JwtRegisteredClaimNames.Sub)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? string.Empty;
        return !string.IsNullOrEmpty(sub);
    }
}

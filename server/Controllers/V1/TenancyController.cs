using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Api.Auth;
using Api.DTOs;
using Api.Http;
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

        var email = ClerkSessionEmailClaims.GetEmail(User);
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

        var ownerEmail = ClerkSessionEmailClaims.GetEmail(User);
        var result = await _tenancyService.CreateClientAsync(sub, request.Name, ownerEmail, cancellationToken);
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

        var email = ClerkSessionEmailClaims.GetEmail(User);
        var ok = await _tenancyService.TryAcceptInvitationAsync(sub, email, invitationId, cancellationToken);
        if (!ok)
            return NotFound();

        return NoContent();
    }

    [HttpPost("clients/invitations")]
    [ProducesResponseType(typeof(CreateTenantInvitationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreateClientInvitation(
        [FromBody] CreateTenantInvitationRequestDto? request,
        CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();
        if (!TryGetTenantClientId(out var tenantClientId))
        {
            return BadRequest(new
            {
                message = $"Missing or invalid {TenantHttpHeaders.TenantClientId} header (expected tenant client GUID).",
            });
        }

        if (request is null || string.IsNullOrWhiteSpace(request.InviteeEmail))
            return BadRequest(new { message = "Invitee email is required." });

        var callerEmail = ClerkSessionEmailClaims.GetEmail(User);
        var (outcome, created) = await _tenancyService.TryCreateInvitationAsync(
            sub,
            tenantClientId,
            request.InviteeEmail,
            request.Role,
            callerEmail,
            cancellationToken);

        return outcome switch
        {
            TenantInvitationCreateOutcome.Created => StatusCode(StatusCodes.Status201Created, created),
            TenantInvitationCreateOutcome.Forbidden => StatusCode(StatusCodes.Status403Forbidden),
            TenantInvitationCreateOutcome.InvalidEmail => BadRequest(new { message = "Invalid invitee email." }),
            TenantInvitationCreateOutcome.InvalidRole => BadRequest(new
            {
                message = "Role must be Admin or User.",
            }),
            TenantInvitationCreateOutcome.CannotInviteSelf => BadRequest(new
            {
                message = "You cannot invite your own email address.",
            }),
            TenantInvitationCreateOutcome.PendingExists => Conflict(new
            {
                message = "A pending invitation already exists for this email in this tenant.",
            }),
            TenantInvitationCreateOutcome.AlreadyMember => Conflict(new
            {
                message = "A member with this email is already in this tenant.",
            }),
            TenantInvitationCreateOutcome.Conflict => Conflict(new
            {
                message = "Could not create invitation (try again).",
            }),
            TenantInvitationCreateOutcome.InvitationEmailMisconfigured => BadRequest(new
            {
                message =
                    "We couldn't send the invitation email right now. Please try again later. If this keeps happening, contact support.",
            }),
            TenantInvitationCreateOutcome.InvitationEmailRejected => StatusCode(StatusCodes.Status502BadGateway, new
            {
                message =
                    "We couldn't deliver the invitation, so nothing was saved. Please try again in a moment. If this keeps happening, contact support.",
            }),
            _ => BadRequest(),
        };
    }

    [HttpDelete("clients/invitations/{invitationId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RevokeClientInvitation(
        Guid invitationId,
        CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();
        if (!TryGetTenantClientId(out var tenantClientId))
        {
            return BadRequest(new
            {
                message = $"Missing or invalid {TenantHttpHeaders.TenantClientId} header (expected tenant client GUID).",
            });
        }

        var outcome = await _tenancyService.TryRevokePendingInvitationAsync(
            sub,
            tenantClientId,
            invitationId,
            cancellationToken);

        return outcome switch
        {
            TenantInvitationRevokeOutcome.Revoked => NoContent(),
            TenantInvitationRevokeOutcome.Forbidden => StatusCode(StatusCodes.Status403Forbidden),
            TenantInvitationRevokeOutcome.NotFound => NotFound(),
            _ => BadRequest(),
        };
    }

    [HttpGet("clients/members")]
    [ProducesResponseType(typeof(TenantClientRosterResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> ListClientMembers(CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();
        if (!TryGetTenantClientId(out var tenantClientId))
        {
            return BadRequest(new
            {
                message = $"Missing or invalid {TenantHttpHeaders.TenantClientId} header (expected tenant client GUID).",
            });
        }

        var roster = await _tenancyService.GetTenantClientRosterAsync(sub, tenantClientId, cancellationToken);
        if (roster is null)
            return StatusCode(StatusCodes.Status403Forbidden);

        return Ok(roster);
    }

    [HttpPatch("clients/members/{membershipId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> PatchMemberRole(
        Guid membershipId,
        [FromBody] UpdateTenantMemberRoleRequestDto? body,
        CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();
        if (!TryGetTenantClientId(out var tenantClientId))
        {
            return BadRequest(new
            {
                message = $"Missing or invalid {TenantHttpHeaders.TenantClientId} header (expected tenant client GUID).",
            });
        }

        if (body is null || string.IsNullOrWhiteSpace(body.Role))
            return BadRequest(new { message = "Role is required." });

        var outcome = await _tenancyService.UpdateMemberRoleAsync(
            sub,
            tenantClientId,
            membershipId,
            body.Role,
            cancellationToken);

        return outcome switch
        {
            TenantMemberRoleUpdateOutcome.Success => NoContent(),
            TenantMemberRoleUpdateOutcome.Forbidden => StatusCode(StatusCodes.Status403Forbidden),
            TenantMemberRoleUpdateOutcome.NotFound => NotFound(),
            TenantMemberRoleUpdateOutcome.InvalidRole => BadRequest(new
            {
                message = "Role can only be set to Admin or User, and the Owner membership cannot be changed here.",
            }),
            _ => BadRequest(),
        };
    }

    [HttpPost("invitations/{invitationId:guid}/decline")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> DeclineInvitation(Guid invitationId, CancellationToken cancellationToken)
    {
        if (!TryGetClerkSubject(out var sub))
            return Unauthorized();

        var email = ClerkSessionEmailClaims.GetEmail(User);
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

    private bool TryGetTenantClientId(out Guid tenantClientId)
    {
        tenantClientId = default;
        if (!Request.Headers.TryGetValue(TenantHttpHeaders.TenantClientId, out var raw))
            return false;
        return Guid.TryParse(raw.ToString(), out tenantClientId);
    }
}

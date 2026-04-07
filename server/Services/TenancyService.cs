using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Services;

public class TenancyService : ITenancyService
{
    private readonly ITenantRepository _tenantRepository;
    private readonly ITenantInvitationEmailSender _invitationEmailSender;
    private readonly ILogger<TenancyService> _logger;

    public TenancyService(
        ITenantRepository tenantRepository,
        ITenantInvitationEmailSender invitationEmailSender,
        ILogger<TenancyService> logger)
    {
        _tenantRepository = tenantRepository;
        _invitationEmailSender = invitationEmailSender;
        _logger = logger;
    }

    public async Task<TenantWorkspaceResponseDto> GetWorkspaceAsync(
        string clerkUserId,
        string? email,
        CancellationToken cancellationToken)
    {
        var memberships = await _tenantRepository.GetMembershipsForUserAsync(clerkUserId, cancellationToken);
        var membershipDtos = memberships
            .Select(m => new TenantMembershipResponseDto(
                m.TenantClientId.ToString(),
                m.TenantClient.Name,
                m.Role))
            .ToList();

        var emailNorm = NormalizeEmail(email);
        if (!string.IsNullOrEmpty(emailNorm))
            await EnsureNorthwindsDemoInvitationAsync(clerkUserId, emailNorm, cancellationToken);

        IReadOnlyList<TenantInvitation> invitations;
        if (string.IsNullOrEmpty(emailNorm))
            invitations = Array.Empty<TenantInvitation>();
        else
            invitations = await _tenantRepository.GetPendingInvitationsForEmailAsync(emailNorm, cancellationToken);

        var invitationDtos = invitations
            .Select(i => new TenantInvitationResponseDto(
                i.Id.ToString(),
                i.TenantClientId.ToString(),
                i.TenantClient.Name,
                string.IsNullOrWhiteSpace(i.InviteeEmail) ? i.InviteeEmailNormalized : i.InviteeEmail.Trim(),
                i.Role,
                i.Status.ToString(),
                i.TenantClientId == NorthwindsDemoTenant.ClientId))
            .ToList();

        var pref = await _tenantRepository.GetPreferencesAsync(clerkUserId, cancellationToken);
        var prefDto = pref is null
            ? new TenantPreferencesResponseDto(null, false)
            : new TenantPreferencesResponseDto(
                pref.DefaultTenantClientId?.ToString(),
                pref.SkipHubWhenDefaultAvailable);

        return new TenantWorkspaceResponseDto(
            membershipDtos,
            invitationDtos,
            prefDto,
            !string.IsNullOrEmpty(emailNorm));
    }

    public async Task<CreateTenantClientResponseDto?> CreateClientAsync(
        string clerkUserId,
        string name,
        string? ownerEmailFromSession,
        CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        if (trimmed.Length == 0 || trimmed.Length > 200)
            return null;

        var ownerEmail =
            string.IsNullOrWhiteSpace(ownerEmailFromSession) ? null : ownerEmailFromSession.Trim();
        var (client, _) = await _tenantRepository.CreateClientAndMembershipAsync(
            clerkUserId,
            trimmed,
            ownerEmail,
            cancellationToken);
        return new CreateTenantClientResponseDto(client.Id.ToString(), client.Name);
    }

    public async Task<(TenantInvitationCreateOutcome Outcome, CreateTenantInvitationResponseDto? Created)>
        TryCreateInvitationAsync(
            string callerClerkUserId,
            Guid tenantClientId,
            string inviteeEmail,
            string role,
            string? callerEmailFromSession,
            CancellationToken cancellationToken)
    {
        var caller = await _tenantRepository.GetCallerMembershipInClientAsync(
            callerClerkUserId,
            tenantClientId,
            cancellationToken);
        if (caller is null || (caller.Role != TenantRoles.Owner && caller.Role != TenantRoles.Admin))
            return (TenantInvitationCreateOutcome.Forbidden, null);

        var trimmedDisplay = inviteeEmail?.Trim() ?? string.Empty;
        if (trimmedDisplay.Length == 0 || trimmedDisplay.Length > 320)
            return (TenantInvitationCreateOutcome.InvalidEmail, null);

        var norm = NormalizeEmail(trimmedDisplay);
        if (string.IsNullOrEmpty(norm) || norm.Length > 254)
            return (TenantInvitationCreateOutcome.InvalidEmail, null);

        var callerNorm = NormalizeEmail(callerEmailFromSession);
        if (!string.IsNullOrEmpty(callerNorm) && callerNorm == norm)
            return (TenantInvitationCreateOutcome.CannotInviteSelf, null);

        var normalizedRole = TryNormalizeAssignableRole(role);
        if (normalizedRole is null)
            return (TenantInvitationCreateOutcome.InvalidRole, null);

        if (await _tenantRepository.PendingInvitationExistsForClientAndEmailAsync(
                tenantClientId,
                norm,
                cancellationToken))
            return (TenantInvitationCreateOutcome.PendingExists, null);

        if (await _tenantRepository.MembershipHasNormalizedEmailInClientAsync(
                tenantClientId,
                norm,
                cancellationToken))
            return (TenantInvitationCreateOutcome.AlreadyMember, null);

        var invitation = new TenantInvitation
        {
            Id = Guid.NewGuid(),
            TenantClientId = tenantClientId,
            InviteeEmail = trimmedDisplay,
            InviteeEmailNormalized = norm,
            Role = normalizedRole,
            Status = InvitationStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
        };

        try
        {
            await _tenantRepository.AddInvitationAsync(invitation, cancellationToken);
        }
        catch (DbUpdateException)
        {
            return (TenantInvitationCreateOutcome.Conflict, null);
        }

        TenantInvitationEmailSendResult sendResult;
        try
        {
            var clientName =
                await _tenantRepository.GetTenantClientNameAsync(tenantClientId, cancellationToken)
                ?? "a workspace";
            sendResult = await _invitationEmailSender.SendTenantInvitationAsync(
                new TenantInvitationEmail
                {
                    InvitationId = invitation.Id,
                    InviteeEmail = trimmedDisplay,
                    ClientName = clientName,
                    Role = normalizedRole,
                },
                cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(
                ex,
                "Tenant invitation email threw after save. Rolling back invitation {InvitationId}",
                invitation.Id);
            await _tenantRepository.DeletePendingInvitationAsync(invitation.Id, tenantClientId, cancellationToken);
            return (TenantInvitationCreateOutcome.InvitationEmailRejected, null);
        }

        if (sendResult != TenantInvitationEmailSendResult.Sent)
        {
            await _tenantRepository.DeletePendingInvitationAsync(invitation.Id, tenantClientId, cancellationToken);
            return sendResult == TenantInvitationEmailSendResult.Misconfigured
                ? (TenantInvitationCreateOutcome.InvitationEmailMisconfigured, null)
                : (TenantInvitationCreateOutcome.InvitationEmailRejected, null);
        }

        return (
            TenantInvitationCreateOutcome.Created,
            new CreateTenantInvitationResponseDto(
                invitation.Id.ToString(),
                trimmedDisplay,
                normalizedRole));
    }

    public async Task<TenantInvitationRevokeOutcome> TryRevokePendingInvitationAsync(
        string callerClerkUserId,
        Guid tenantClientId,
        Guid invitationId,
        CancellationToken cancellationToken)
    {
        var caller = await _tenantRepository.GetCallerMembershipInClientAsync(
            callerClerkUserId,
            tenantClientId,
            cancellationToken);
        if (caller is null || (caller.Role != TenantRoles.Owner && caller.Role != TenantRoles.Admin))
            return TenantInvitationRevokeOutcome.Forbidden;

        var deleted = await _tenantRepository.DeletePendingInvitationAsync(
            invitationId,
            tenantClientId,
            cancellationToken);
        return deleted ? TenantInvitationRevokeOutcome.Revoked : TenantInvitationRevokeOutcome.NotFound;
    }

    public async Task<bool> UpdatePreferencesAsync(
        string clerkUserId,
        string? defaultClientId,
        bool skipHubWhenDefaultAvailable,
        CancellationToken cancellationToken)
    {
        Guid? defaultId = null;
        if (!string.IsNullOrWhiteSpace(defaultClientId))
        {
            if (!Guid.TryParse(defaultClientId, out var parsed))
                return false;
            var isMember = await _tenantRepository.UserHasMembershipAsync(clerkUserId, parsed, cancellationToken);
            if (!isMember)
                return false;
            defaultId = parsed;
        }

        await _tenantRepository.UpsertPreferencesAsync(
            new TenantUserPreference
            {
                ClerkUserId = clerkUserId,
                DefaultTenantClientId = defaultId,
                SkipHubWhenDefaultAvailable = skipHubWhenDefaultAvailable,
            },
            cancellationToken);
        return true;
    }

    public async Task<bool> TryAcceptInvitationAsync(
        string clerkUserId,
        string? email,
        Guid invitationId,
        CancellationToken cancellationToken)
    {
        var emailNorm = NormalizeEmail(email);
        if (string.IsNullOrEmpty(emailNorm))
            return false;

        var invitation = await _tenantRepository.GetInvitationByIdAsync(invitationId, cancellationToken);
        if (invitation is null || invitation.Status != InvitationStatus.Pending)
            return false;
        if (invitation.InviteeEmailNormalized != emailNorm)
            return false;

        if (await _tenantRepository.UserHasMembershipAsync(clerkUserId, invitation.TenantClientId, cancellationToken))
        {
            await _tenantRepository.MarkInvitationAcceptedAsync(invitation, cancellationToken);
            return true;
        }

        await _tenantRepository.AcceptInvitationAsync(invitation, clerkUserId, cancellationToken);
        return true;
    }

    public async Task<bool> TryDeclineInvitationAsync(
        string clerkUserId,
        string? email,
        Guid invitationId,
        CancellationToken cancellationToken)
    {
        var emailNorm = NormalizeEmail(email);
        if (string.IsNullOrEmpty(emailNorm))
            return false;

        var invitation = await _tenantRepository.GetInvitationByIdAsync(invitationId, cancellationToken);
        if (invitation is null || invitation.Status != InvitationStatus.Pending)
            return false;
        if (invitation.InviteeEmailNormalized != emailNorm)
            return false;

        await _tenantRepository.DeclineInvitationAsync(invitation, cancellationToken);
        return true;
    }

    public async Task<TenantClientRosterResponseDto?> GetTenantClientRosterAsync(
        string clerkUserId,
        Guid tenantClientId,
        CancellationToken cancellationToken)
    {
        if (!await _tenantRepository.UserHasMembershipAsync(clerkUserId, tenantClientId, cancellationToken))
            return null;

        var members = await _tenantRepository.GetMembershipsForClientAsync(tenantClientId, cancellationToken);
        var memberDtos = members
            .Select(m => new TenantClientMemberResponseDto(
                m.Id.ToString(),
                m.ClerkUserId,
                m.MemberEmail,
                m.Role,
                m.CreatedAtUtc,
                string.Equals(m.ClerkUserId, clerkUserId, StringComparison.Ordinal)))
            .ToList();

        var pending = await _tenantRepository.GetPendingInvitationsForClientAsync(tenantClientId, cancellationToken);
        var inviteDtos = pending
            .Select(i => new TenantClientPendingInvitationDto(
                i.Id.ToString(),
                string.IsNullOrWhiteSpace(i.InviteeEmail) ? i.InviteeEmailNormalized : i.InviteeEmail.Trim(),
                i.Role,
                "Invited"))
            .ToList();

        return new TenantClientRosterResponseDto(memberDtos, inviteDtos);
    }

    public async Task<TenantMemberRoleUpdateOutcome> UpdateMemberRoleAsync(
        string callerClerkUserId,
        Guid tenantClientId,
        Guid membershipId,
        string requestedRole,
        CancellationToken cancellationToken)
    {
        var caller = await _tenantRepository.GetCallerMembershipInClientAsync(
            callerClerkUserId,
            tenantClientId,
            cancellationToken);
        if (caller is null)
            return TenantMemberRoleUpdateOutcome.Forbidden;

        if (caller.Role is not TenantRoles.Owner and not TenantRoles.Admin)
            return TenantMemberRoleUpdateOutcome.Forbidden;

        var normalizedRole = TryNormalizeAssignableRole(requestedRole);
        if (normalizedRole is null)
            return TenantMemberRoleUpdateOutcome.InvalidRole;

        var members = await _tenantRepository.GetMembershipsForClientAsync(tenantClientId, cancellationToken);
        var target = members.FirstOrDefault(m => m.Id == membershipId);
        if (target is null)
            return TenantMemberRoleUpdateOutcome.NotFound;

        if (target.Role == TenantRoles.Owner)
            return TenantMemberRoleUpdateOutcome.InvalidRole;

        if (string.Equals(target.Role, normalizedRole, StringComparison.Ordinal))
            return TenantMemberRoleUpdateOutcome.Success;

        var ok = await _tenantRepository.ApplyMembershipRoleInClientAsync(
            membershipId,
            tenantClientId,
            normalizedRole,
            cancellationToken);
        return ok ? TenantMemberRoleUpdateOutcome.Success : TenantMemberRoleUpdateOutcome.NotFound;
    }

    private static string? TryNormalizeAssignableRole(string requested)
    {
        if (string.IsNullOrWhiteSpace(requested))
            return null;
        var t = requested.Trim();
        if (t.Equals(TenantRoles.Admin, StringComparison.OrdinalIgnoreCase))
            return TenantRoles.Admin;
        if (t.Equals(TenantRoles.User, StringComparison.OrdinalIgnoreCase))
            return TenantRoles.User;
        return null;
    }

    private async Task EnsureNorthwindsDemoInvitationAsync(
        string clerkUserId,
        string emailNorm,
        CancellationToken cancellationToken)
    {
        if (await _tenantRepository.UserHasMembershipAsync(clerkUserId, NorthwindsDemoTenant.ClientId, cancellationToken))
            return;

        if (await _tenantRepository.InvitationExistsForClientAndEmailAsync(
                NorthwindsDemoTenant.ClientId,
                emailNorm,
                cancellationToken))
            return;

        var invitation = new TenantInvitation
        {
            Id = Guid.NewGuid(),
            TenantClientId = NorthwindsDemoTenant.ClientId,
            InviteeEmail = emailNorm,
            InviteeEmailNormalized = emailNorm,
            Role = TenantRoles.User,
            Status = InvitationStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
        };

        try
        {
            await _tenantRepository.AddInvitationAsync(invitation, cancellationToken);
        }
        catch (DbUpdateException)
        {
            // Concurrent GET workspace: unique index IX_TenantInvitations_Pending_UniqueTenantEmail.
        }
    }

    private static string NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;
        return email.Trim().ToLowerInvariant();
    }
}

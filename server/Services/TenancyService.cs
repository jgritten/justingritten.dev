using Api.DTOs;
using Api.Interfaces;
using Api.Models;

namespace Api.Services;

public class TenancyService : ITenancyService
{
    private readonly ITenantRepository _tenantRepository;

    public TenancyService(ITenantRepository tenantRepository)
    {
        _tenantRepository = tenantRepository;
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
                i.InviteeEmailNormalized,
                i.Role,
                i.Status.ToString()))
            .ToList();

        var pref = await _tenantRepository.GetPreferencesAsync(clerkUserId, cancellationToken);
        var prefDto = pref is null
            ? new TenantPreferencesResponseDto(null, false)
            : new TenantPreferencesResponseDto(
                pref.DefaultTenantClientId?.ToString(),
                pref.SkipHubWhenDefaultAvailable);

        return new TenantWorkspaceResponseDto(membershipDtos, invitationDtos, prefDto);
    }

    public async Task<CreateTenantClientResponseDto?> CreateClientAsync(
        string clerkUserId,
        string name,
        CancellationToken cancellationToken)
    {
        var trimmed = name.Trim();
        if (trimmed.Length == 0 || trimmed.Length > 200)
            return null;

        var (client, _) = await _tenantRepository.CreateClientAndMembershipAsync(clerkUserId, trimmed, cancellationToken);
        return new CreateTenantClientResponseDto(client.Id.ToString(), client.Name);
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

    private static string NormalizeEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return string.Empty;
        return email.Trim().ToLowerInvariant();
    }
}

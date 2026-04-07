using Api.DTOs;

namespace Api.Interfaces;

public interface ITenancyService
{
    Task<TenantWorkspaceResponseDto> GetWorkspaceAsync(string clerkUserId, string? email, CancellationToken cancellationToken);

    Task<CreateTenantClientResponseDto?> CreateClientAsync(
        string clerkUserId,
        string name,
        string? ownerEmailFromSession,
        CancellationToken cancellationToken);

    Task<(TenantInvitationCreateOutcome Outcome, CreateTenantInvitationResponseDto? Created)> TryCreateInvitationAsync(
        string callerClerkUserId,
        Guid tenantClientId,
        string inviteeEmail,
        string role,
        string? callerEmailFromSession,
        CancellationToken cancellationToken);

    /// <summary>Deletes a pending invitation for <paramref name="tenantClientId"/> when the caller is Owner or Admin on that client.</summary>
    Task<TenantInvitationRevokeOutcome> TryRevokePendingInvitationAsync(
        string callerClerkUserId,
        Guid tenantClientId,
        Guid invitationId,
        CancellationToken cancellationToken);

    Task<bool> UpdatePreferencesAsync(
        string clerkUserId,
        string? defaultClientId,
        bool skipHubWhenDefaultAvailable,
        CancellationToken cancellationToken);

    /// <summary>Returns false if not found, not pending, or email mismatch.</summary>
    Task<bool> TryAcceptInvitationAsync(string clerkUserId, string? email, Guid invitationId, CancellationToken cancellationToken);

    /// <summary>Returns false if not found, not pending, or email mismatch.</summary>
    Task<bool> TryDeclineInvitationAsync(string clerkUserId, string? email, Guid invitationId, CancellationToken cancellationToken);

    /// <summary>Null if the caller is not a member of <paramref name="tenantClientId"/>.</summary>
    Task<TenantClientRosterResponseDto?> GetTenantClientRosterAsync(
        string clerkUserId,
        Guid tenantClientId,
        CancellationToken cancellationToken);

    Task<TenantMemberRoleUpdateOutcome> UpdateMemberRoleAsync(
        string callerClerkUserId,
        Guid tenantClientId,
        Guid membershipId,
        string requestedRole,
        CancellationToken cancellationToken);
}

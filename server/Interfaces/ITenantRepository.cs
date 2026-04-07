using Api.Models;

namespace Api.Interfaces;

public interface ITenantRepository
{
    Task<IReadOnlyList<TenantMembership>> GetMembershipsForUserAsync(string clerkUserId, CancellationToken cancellationToken);

    Task<IReadOnlyList<TenantInvitation>> GetPendingInvitationsForEmailAsync(
        string inviteeEmailNormalized,
        CancellationToken cancellationToken);

    Task<TenantUserPreference?> GetPreferencesAsync(string clerkUserId, CancellationToken cancellationToken);

    Task UpsertPreferencesAsync(TenantUserPreference preferences, CancellationToken cancellationToken);

    Task<(TenantClient Client, TenantMembership Membership)> CreateClientAndMembershipAsync(
        string clerkUserId,
        string clientName,
        string? ownerMemberEmail,
        CancellationToken cancellationToken);

    Task<string?> GetTenantClientNameAsync(Guid tenantClientId, CancellationToken cancellationToken);

    Task<TenantInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken);

    Task<bool> UserHasMembershipAsync(string clerkUserId, Guid tenantClientId, CancellationToken cancellationToken);

    /// <summary>True if any invitation row exists for this tenant and normalized email (any status).</summary>
    Task<bool> InvitationExistsForClientAndEmailAsync(
        Guid tenantClientId,
        string inviteeEmailNormalized,
        CancellationToken cancellationToken);

    Task<bool> PendingInvitationExistsForClientAndEmailAsync(
        Guid tenantClientId,
        string inviteeEmailNormalized,
        CancellationToken cancellationToken);

    Task<bool> MembershipHasNormalizedEmailInClientAsync(
        Guid tenantClientId,
        string emailNormalized,
        CancellationToken cancellationToken);

    Task AddInvitationAsync(TenantInvitation invitation, CancellationToken cancellationToken);

    Task<bool> DeletePendingInvitationAsync(Guid invitationId, Guid tenantClientId, CancellationToken cancellationToken);

    Task<IReadOnlyList<TenantInvitation>> GetPendingInvitationsForClientAsync(
        Guid tenantClientId,
        CancellationToken cancellationToken);

    Task AcceptInvitationAsync(TenantInvitation invitation, string clerkUserId, CancellationToken cancellationToken);

    Task DeclineInvitationAsync(TenantInvitation invitation, CancellationToken cancellationToken);

    /// <summary>Sets invitation to Accepted without creating a membership (e.g. user already a member).</summary>
    Task MarkInvitationAcceptedAsync(TenantInvitation invitation, CancellationToken cancellationToken);

    Task<IReadOnlyList<TenantMembership>> GetMembershipsForClientAsync(
        Guid tenantClientId,
        CancellationToken cancellationToken);

    Task<TenantMembership?> GetCallerMembershipInClientAsync(
        string clerkUserId,
        Guid tenantClientId,
        CancellationToken cancellationToken);

    /// <summary>Persists a new role for a membership in the client. Returns false if the row does not exist.</summary>
    Task<bool> ApplyMembershipRoleInClientAsync(
        Guid membershipId,
        Guid tenantClientId,
        string newRole,
        CancellationToken cancellationToken);
}

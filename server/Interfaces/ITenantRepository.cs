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
        CancellationToken cancellationToken);

    Task<TenantInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken);

    Task<bool> UserHasMembershipAsync(string clerkUserId, Guid tenantClientId, CancellationToken cancellationToken);

    Task AcceptInvitationAsync(TenantInvitation invitation, string clerkUserId, CancellationToken cancellationToken);

    Task DeclineInvitationAsync(TenantInvitation invitation, CancellationToken cancellationToken);

    /// <summary>Sets invitation to Accepted without creating a membership (e.g. user already a member).</summary>
    Task MarkInvitationAcceptedAsync(TenantInvitation invitation, CancellationToken cancellationToken);
}

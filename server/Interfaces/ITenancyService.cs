using Api.DTOs;

namespace Api.Interfaces;

public interface ITenancyService
{
    Task<TenantWorkspaceResponseDto> GetWorkspaceAsync(string clerkUserId, string? email, CancellationToken cancellationToken);

    Task<CreateTenantClientResponseDto?> CreateClientAsync(string clerkUserId, string name, CancellationToken cancellationToken);

    Task<bool> UpdatePreferencesAsync(
        string clerkUserId,
        string? defaultClientId,
        bool skipHubWhenDefaultAvailable,
        CancellationToken cancellationToken);

    /// <summary>Returns false if not found, not pending, or email mismatch.</summary>
    Task<bool> TryAcceptInvitationAsync(string clerkUserId, string? email, Guid invitationId, CancellationToken cancellationToken);

    /// <summary>Returns false if not found, not pending, or email mismatch.</summary>
    Task<bool> TryDeclineInvitationAsync(string clerkUserId, string? email, Guid invitationId, CancellationToken cancellationToken);
}

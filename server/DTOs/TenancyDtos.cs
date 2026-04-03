namespace Api.DTOs;

public record TenantMembershipResponseDto(string ClientId, string Name, string Role);

public record TenantInvitationResponseDto(
    string Id,
    string ClientId,
    string ClientName,
    string InviteeEmail,
    string Role,
    string Status,
    bool IsDemoWorkspace);

public record TenantPreferencesResponseDto(string? DefaultClientId, bool SkipHubWhenDefaultAvailable);

/// <summary>Post-sign-in hub payload. <see cref="HasEmailClaim"/> is false when the session JWT had no email claim (invites require it).</summary>
public record TenantWorkspaceResponseDto(
    IReadOnlyList<TenantMembershipResponseDto> Memberships,
    IReadOnlyList<TenantInvitationResponseDto> Invitations,
    TenantPreferencesResponseDto Preferences,
    bool HasEmailClaim);

public record CreateTenantClientRequestDto(string Name);

public record CreateTenantClientResponseDto(string ClientId, string Name);

public record UpdateTenantPreferencesRequestDto(string? DefaultClientId, bool SkipHubWhenDefaultAvailable);

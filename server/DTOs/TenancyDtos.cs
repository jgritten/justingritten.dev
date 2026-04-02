namespace Api.DTOs;

public record TenantMembershipResponseDto(string ClientId, string Name, string Role);

public record TenantInvitationResponseDto(
    string Id,
    string ClientId,
    string ClientName,
    string InviteeEmail,
    string Role,
    string Status);

public record TenantPreferencesResponseDto(string? DefaultClientId, bool SkipHubWhenDefaultAvailable);

public record TenantWorkspaceResponseDto(
    IReadOnlyList<TenantMembershipResponseDto> Memberships,
    IReadOnlyList<TenantInvitationResponseDto> Invitations,
    TenantPreferencesResponseDto Preferences);

public record CreateTenantClientRequestDto(string Name);

public record CreateTenantClientResponseDto(string ClientId, string Name);

public record UpdateTenantPreferencesRequestDto(string? DefaultClientId, bool SkipHubWhenDefaultAvailable);

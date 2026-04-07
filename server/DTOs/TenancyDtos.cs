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

public record TenantClientMemberResponseDto(
    string MembershipId,
    string ClerkUserId,
    string? Email,
    string Role,
    DateTime CreatedAtUtc,
    bool IsCurrentUser);

/// <summary>Pending invitation for a tenant client (for Users roster).</summary>
public record TenantClientPendingInvitationDto(
    string InvitationId,
    string InviteeEmail,
    string Role,
    string Status);

public record TenantClientRosterResponseDto(
    IReadOnlyList<TenantClientMemberResponseDto> Members,
    IReadOnlyList<TenantClientPendingInvitationDto> PendingInvitations);

public record CreateTenantInvitationRequestDto(string InviteeEmail, string Role);

public record CreateTenantInvitationResponseDto(string InvitationId, string InviteeEmail, string Role);

public enum TenantInvitationCreateOutcome
{
    Created,
    Forbidden,
    InvalidEmail,
    InvalidRole,
    CannotInviteSelf,
    PendingExists,
    AlreadyMember,
    Conflict,
    InvitationEmailMisconfigured,
    InvitationEmailRejected,
}

public record UpdateTenantMemberRoleRequestDto(string Role);

public enum TenantMemberRoleUpdateOutcome
{
    Success,
    Forbidden,
    NotFound,
    InvalidRole,
}

/// <summary>Outcome when an Owner or Admin removes a pending invitation for the active tenant client.</summary>
public enum TenantInvitationRevokeOutcome
{
    Revoked,
    Forbidden,
    NotFound,
}

namespace Api.Models;

/// <summary>Payload for notifying an invitee that a tenant invitation was created (email delivery is best-effort).</summary>
public class TenantInvitationEmail
{
    public Guid InvitationId { get; init; }
    public string InviteeEmail { get; init; } = string.Empty;
    public string ClientName { get; init; } = string.Empty;
    public string Role { get; init; } = string.Empty;
}

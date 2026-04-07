namespace Api.Models;

public class TenantInvitation
{
    public Guid Id { get; set; }
    public Guid TenantClientId { get; set; }
    public TenantClient TenantClient { get; set; } = null!;

    /// <summary>Address as entered (or from JWT) for display; matching uses normalized form.</summary>
    public string InviteeEmail { get; set; } = string.Empty;

    public string InviteeEmailNormalized { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;
    public InvitationStatus Status { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}

namespace Api.Models;

public class TenantMembership
{
    public Guid Id { get; set; }
    public string ClerkUserId { get; set; } = string.Empty;
    public Guid TenantClientId { get; set; }
    public TenantClient TenantClient { get; set; } = null!;
    public string Role { get; set; } = string.Empty;

    /// <summary>Roster email (JWT at signup, or invitee address when joining via invitation). Not a second auth source.</summary>
    public string? MemberEmail { get; set; }

    public DateTime CreatedAtUtc { get; set; }
}

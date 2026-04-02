namespace Api.Models;

public class TenantMembership
{
    public Guid Id { get; set; }
    public string ClerkUserId { get; set; } = string.Empty;
    public Guid TenantClientId { get; set; }
    public TenantClient TenantClient { get; set; } = null!;
    public string Role { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
}

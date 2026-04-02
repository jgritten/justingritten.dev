namespace Api.Models;

/// <summary>
/// Per–Clerk-user workspace preferences (default tenant, hub skip behavior).
/// </summary>
public class TenantUserPreference
{
    public string ClerkUserId { get; set; } = string.Empty;
    public Guid? DefaultTenantClientId { get; set; }
    public bool SkipHubWhenDefaultAvailable { get; set; }
}

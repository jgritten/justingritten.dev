namespace Api.Models;

/// <summary>
/// B2B tenant ("client") in the SaaS sense — not an HTTP client.
/// </summary>
public class TenantClient
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime CreatedAtUtc { get; set; }
    public bool IsDeleted { get; set; }
}

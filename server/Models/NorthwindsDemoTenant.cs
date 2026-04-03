namespace Api.Models;

/// <summary>
/// Well-known SaaS demo tenant: seeded in the database; users receive a lazy-created pending invite on workspace load.
/// </summary>
public static class NorthwindsDemoTenant
{
    /// <summary>Stable id for migrations, API checks, and future tenant-scoped demo data.</summary>
    public static readonly Guid ClientId = Guid.Parse("c4a6e8d0-9b2f-4e7a-8c1d-0f5e6d7c8b4a");

    public const string DisplayName = "Northwinds Demo";
}

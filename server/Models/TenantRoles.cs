namespace Api.Models;

/// <summary>
/// Client-scoped roles (string stored on <see cref="TenantMembership"/>).
/// </summary>
public static class TenantRoles
{
    /// <summary>Exactly one per <see cref="TenantClient"/> — the creator until ownership is transferred. Strict rule enforced in the database.</summary>
    public const string Owner = "Owner";

    /// <summary>Delegated administrators; multiple per client allowed. Permissions vs Owner are product-defined (e.g. delete tenant = Owner only).</summary>
    public const string Admin = "Admin";

    /// <summary>Standard member (e.g. from invitation).</summary>
    public const string User = "User";
}

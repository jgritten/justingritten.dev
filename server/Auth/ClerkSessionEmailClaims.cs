using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace Api.Auth;

/// <summary>
/// Clerk session JWTs do not include a primary email by default. Teams add it under Sessions → Customize session token;
/// claim names vary (e.g. <c>email</c>, <c>primaryEmail</c>). This tries common shapes so tenancy/invites work out of the box.
/// </summary>
public static class ClerkSessionEmailClaims
{
    private static readonly string[] PreferredClaimTypes =
    [
        JwtRegisteredClaimNames.Email,
        System.Security.Claims.ClaimTypes.Email,
        "email",
        "primary_email_address",
        "primaryEmail",
        "email_address",
    ];

    public static string? GetEmail(ClaimsPrincipal? principal)
    {
        if (principal?.Identity?.IsAuthenticated != true)
            return null;

        foreach (var claimType in PreferredClaimTypes)
        {
            var v = principal.FindFirstValue(claimType);
            if (!string.IsNullOrWhiteSpace(v))
                return v.Trim();
        }

        return null;
    }
}

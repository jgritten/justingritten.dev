using Api.Data;
using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class TenantRepository : ITenantRepository
{
    private readonly AppDbContext _db;

    public TenantRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<TenantMembership>> GetMembershipsForUserAsync(
        string clerkUserId,
        CancellationToken cancellationToken)
    {
        return await _db.TenantMemberships
            .AsNoTracking()
            .Include(m => m.TenantClient)
            .Where(m => m.ClerkUserId == clerkUserId && !m.TenantClient.IsDeleted)
            .OrderBy(m => m.TenantClient.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TenantInvitation>> GetPendingInvitationsForEmailAsync(
        string inviteeEmailNormalized,
        CancellationToken cancellationToken)
    {
        return await _db.TenantInvitations
            .AsNoTracking()
            .Include(i => i.TenantClient)
            .Where(i =>
                i.InviteeEmailNormalized == inviteeEmailNormalized &&
                i.Status == InvitationStatus.Pending &&
                !i.TenantClient.IsDeleted)
            .OrderBy(i => i.TenantClient.Name)
            .ToListAsync(cancellationToken);
    }

    public async Task<TenantUserPreference?> GetPreferencesAsync(string clerkUserId, CancellationToken cancellationToken)
    {
        return await _db.TenantUserPreferences
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.ClerkUserId == clerkUserId, cancellationToken);
    }

    public async Task UpsertPreferencesAsync(TenantUserPreference preferences, CancellationToken cancellationToken)
    {
        var existing = await _db.TenantUserPreferences
            .FirstOrDefaultAsync(p => p.ClerkUserId == preferences.ClerkUserId, cancellationToken);
        if (existing is null)
        {
            _db.TenantUserPreferences.Add(preferences);
        }
        else
        {
            existing.DefaultTenantClientId = preferences.DefaultTenantClientId;
            existing.SkipHubWhenDefaultAvailable = preferences.SkipHubWhenDefaultAvailable;
        }

        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<(TenantClient Client, TenantMembership Membership)> CreateClientAndMembershipAsync(
        string clerkUserId,
        string clientName,
        string? ownerMemberEmail,
        CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var client = new TenantClient
        {
            Id = Guid.NewGuid(),
            Name = clientName,
            CreatedAtUtc = now,
            IsDeleted = false,
        };
        var membership = new TenantMembership
        {
            Id = Guid.NewGuid(),
            ClerkUserId = clerkUserId,
            TenantClientId = client.Id,
            TenantClient = client,
            Role = TenantRoles.Owner,
            CreatedAtUtc = now,
            MemberEmail = string.IsNullOrWhiteSpace(ownerMemberEmail) ? null : ownerMemberEmail.Trim(),
        };
        _db.TenantClients.Add(client);
        _db.TenantMemberships.Add(membership);
        await _db.SaveChangesAsync(cancellationToken);
        return (client, membership);
    }

    public async Task<string?> GetTenantClientNameAsync(Guid tenantClientId, CancellationToken cancellationToken)
    {
        return await _db.TenantClients.AsNoTracking()
            .Where(c => c.Id == tenantClientId && !c.IsDeleted)
            .Select(c => c.Name)
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<TenantInvitation?> GetInvitationByIdAsync(Guid invitationId, CancellationToken cancellationToken)
    {
        return await _db.TenantInvitations
            .Include(i => i.TenantClient)
            .FirstOrDefaultAsync(i => i.Id == invitationId, cancellationToken);
    }

    public async Task<bool> UserHasMembershipAsync(string clerkUserId, Guid tenantClientId, CancellationToken cancellationToken)
    {
        return await _db.TenantMemberships
            .AnyAsync(
                m => m.ClerkUserId == clerkUserId && m.TenantClientId == tenantClientId,
                cancellationToken);
    }

    public async Task<bool> InvitationExistsForClientAndEmailAsync(
        Guid tenantClientId,
        string inviteeEmailNormalized,
        CancellationToken cancellationToken)
    {
        return await _db.TenantInvitations.AnyAsync(
            i =>
                i.TenantClientId == tenantClientId &&
                i.InviteeEmailNormalized == inviteeEmailNormalized,
            cancellationToken);
    }

    public async Task<bool> PendingInvitationExistsForClientAndEmailAsync(
        Guid tenantClientId,
        string inviteeEmailNormalized,
        CancellationToken cancellationToken)
    {
        return await _db.TenantInvitations.AnyAsync(
            i =>
                i.TenantClientId == tenantClientId &&
                i.InviteeEmailNormalized == inviteeEmailNormalized &&
                i.Status == InvitationStatus.Pending,
            cancellationToken);
    }

    public async Task<bool> MembershipHasNormalizedEmailInClientAsync(
        Guid tenantClientId,
        string emailNormalized,
        CancellationToken cancellationToken)
    {
        return await _db.TenantMemberships
            .Include(m => m.TenantClient)
            .Where(m => m.TenantClientId == tenantClientId && !m.TenantClient.IsDeleted)
            .Where(m => m.MemberEmail != null)
            .AnyAsync(
                m => m.MemberEmail!.ToLower() == emailNormalized,
                cancellationToken);
    }

    public async Task AddInvitationAsync(TenantInvitation invitation, CancellationToken cancellationToken)
    {
        _db.TenantInvitations.Add(invitation);
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<bool> DeletePendingInvitationAsync(
        Guid invitationId,
        Guid tenantClientId,
        CancellationToken cancellationToken)
    {
        var row = await _db.TenantInvitations.FirstOrDefaultAsync(
            i =>
                i.Id == invitationId &&
                i.TenantClientId == tenantClientId &&
                i.Status == InvitationStatus.Pending,
            cancellationToken);
        if (row is null)
            return false;
        _db.TenantInvitations.Remove(row);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<TenantInvitation>> GetPendingInvitationsForClientAsync(
        Guid tenantClientId,
        CancellationToken cancellationToken)
    {
        return await _db.TenantInvitations
            .AsNoTracking()
            .Include(i => i.TenantClient)
            .Where(i =>
                i.TenantClientId == tenantClientId &&
                i.Status == InvitationStatus.Pending &&
                !i.TenantClient.IsDeleted)
            .OrderBy(i => i.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task AcceptInvitationAsync(TenantInvitation invitation, string clerkUserId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var role = invitation.Role;
        if (!string.Equals(role, TenantRoles.Admin, StringComparison.Ordinal) &&
            !string.Equals(role, TenantRoles.User, StringComparison.Ordinal))
            role = TenantRoles.User;

        var memberEmail = string.IsNullOrWhiteSpace(invitation.InviteeEmail)
            ? invitation.InviteeEmailNormalized
            : invitation.InviteeEmail.Trim();

        var membership = new TenantMembership
        {
            Id = Guid.NewGuid(),
            ClerkUserId = clerkUserId,
            TenantClientId = invitation.TenantClientId,
            Role = role,
            CreatedAtUtc = now,
            MemberEmail = memberEmail,
        };
        _db.TenantMemberships.Add(membership);
        invitation.Status = InvitationStatus.Accepted;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task DeclineInvitationAsync(TenantInvitation invitation, CancellationToken cancellationToken)
    {
        invitation.Status = InvitationStatus.Declined;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task MarkInvitationAcceptedAsync(TenantInvitation invitation, CancellationToken cancellationToken)
    {
        invitation.Status = InvitationStatus.Accepted;
        await _db.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<TenantMembership>> GetMembershipsForClientAsync(
        Guid tenantClientId,
        CancellationToken cancellationToken)
    {
        return await _db.TenantMemberships
            .AsNoTracking()
            .Include(m => m.TenantClient)
            .Where(m => m.TenantClientId == tenantClientId && !m.TenantClient.IsDeleted)
            .OrderBy(m => m.CreatedAtUtc)
            .ToListAsync(cancellationToken);
    }

    public async Task<TenantMembership?> GetCallerMembershipInClientAsync(
        string clerkUserId,
        Guid tenantClientId,
        CancellationToken cancellationToken)
    {
        return await _db.TenantMemberships
            .AsNoTracking()
            .Include(m => m.TenantClient)
            .FirstOrDefaultAsync(
                m =>
                    m.ClerkUserId == clerkUserId &&
                    m.TenantClientId == tenantClientId &&
                    !m.TenantClient.IsDeleted,
                cancellationToken);
    }

    public async Task<bool> ApplyMembershipRoleInClientAsync(
        Guid membershipId,
        Guid tenantClientId,
        string newRole,
        CancellationToken cancellationToken)
    {
        var membership = await _db.TenantMemberships
            .Include(m => m.TenantClient)
            .FirstOrDefaultAsync(
                m => m.Id == membershipId && m.TenantClientId == tenantClientId && !m.TenantClient.IsDeleted,
                cancellationToken);
        if (membership is null)
            return false;

        membership.Role = newRole;
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}

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
        };
        _db.TenantClients.Add(client);
        _db.TenantMemberships.Add(membership);
        await _db.SaveChangesAsync(cancellationToken);
        return (client, membership);
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

    public async Task AcceptInvitationAsync(TenantInvitation invitation, string clerkUserId, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;
        var membership = new TenantMembership
        {
            Id = Guid.NewGuid(),
            ClerkUserId = clerkUserId,
            TenantClientId = invitation.TenantClientId,
            // Invited members are always User for now; Owner is assigned only on client create (see ADR 0011).
            Role = TenantRoles.User,
            CreatedAtUtc = now,
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
}

using Api.Data;
using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Api.Repositories;
using Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;
using Xunit;

namespace Api.Tests;

public sealed class TenancyServiceTests : IDisposable
{
    private readonly SqliteConnection _connection;
    private readonly AppDbContext _db;
    private readonly TenancyService _sut;

    public TenancyServiceTests()
    {
        _connection = new SqliteConnection("DataSource=:memory:;Cache=Shared");
        _connection.Open();
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;
        _db = new AppDbContext(options);
        _db.Database.Migrate();
        _sut = new TenancyService(
            new TenantRepository(_db),
            new OkTenantInvitationEmailSender(),
            NullLogger<TenancyService>.Instance);
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task CreateClient_SavesOwnerMemberEmailWhenProvided()
    {
        _ = await _sut.CreateClientAsync(
            "clerk_owner_email",
            "EmailCo",
            "Owner@Example.com",
            CancellationToken.None);
        var row = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.ClerkUserId == "clerk_owner_email");
        Assert.Equal("Owner@Example.com", row.MemberEmail);
    }

    [Fact]
    public async Task CreateClient_AddsOwnerMembership()
    {
        var created = await _sut.CreateClientAsync("clerk_user_1", "Acme Legal", null, CancellationToken.None);
        Assert.NotNull(created);
        Assert.Equal("Acme Legal", created.Name);

        var ws = await _sut.GetWorkspaceAsync("clerk_user_1", "any@example.com", CancellationToken.None);
        Assert.Single(ws.Memberships);
        Assert.Equal(TenantRoles.Owner, ws.Memberships[0].Role);
        Assert.Equal("Acme Legal", ws.Memberships[0].Name);
    }

    [Fact]
    public async Task SecondOwnerSameClient_RejectedByDatabase()
    {
        var created = await _sut.CreateClientAsync("owner_a", "DupTest", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);
        _db.TenantMemberships.Add(new TenantMembership
        {
            Id = Guid.NewGuid(),
            ClerkUserId = "owner_b",
            TenantClientId = clientId,
            Role = TenantRoles.Owner,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await Assert.ThrowsAsync<DbUpdateException>(() => _db.SaveChangesAsync());
    }

    [Fact]
    public async Task UpdatePreferences_DefaultClientMustBeMembership()
    {
        await _sut.CreateClientAsync("clerk_user_2", "Beta", null, CancellationToken.None);
        var ws = await _sut.GetWorkspaceAsync("clerk_user_2", null, CancellationToken.None);
        var clientId = ws.Memberships[0].ClientId;

        var ok = await _sut.UpdatePreferencesAsync(
            "clerk_user_2",
            clientId,
            true,
            CancellationToken.None);
        Assert.True(ok);

        var ws2 = await _sut.GetWorkspaceAsync("clerk_user_2", null, CancellationToken.None);
        Assert.Equal(clientId, ws2.Preferences.DefaultClientId);
        Assert.True(ws2.Preferences.SkipHubWhenDefaultAvailable);
    }

    [Fact]
    public async Task UpdatePreferences_UnknownClient_ReturnsFalse()
    {
        var ok = await _sut.UpdatePreferencesAsync(
            "clerk_user_3",
            Guid.NewGuid().ToString(),
            false,
            CancellationToken.None);
        Assert.False(ok);
    }

    [Fact]
    public async Task AcceptInvitation_AddsMembership_WhenEmailMatches()
    {
        var other = await _sut.CreateClientAsync("owner_1", "Shared Org", null, CancellationToken.None);
        var clientGuid = Guid.Parse(other!.ClientId);

        _db.TenantInvitations.Add(new TenantInvitation
        {
            Id = Guid.NewGuid(),
            TenantClientId = clientGuid,
            InviteeEmail = "Invitee@example.com",
            InviteeEmailNormalized = "invitee@example.com",
            Role = TenantRoles.User,
            Status = InvitationStatus.Pending,
            CreatedAtUtc = DateTime.UtcNow,
        });
        await _db.SaveChangesAsync();

        var invite = await _db.TenantInvitations.AsNoTracking().FirstAsync();
        var accepted = await _sut.TryAcceptInvitationAsync(
            "clerk_invitee_1",
            "Invitee@example.com",
            invite.Id,
            CancellationToken.None);
        Assert.True(accepted);

        var ws = await _sut.GetWorkspaceAsync("clerk_invitee_1", "invitee@example.com", CancellationToken.None);
        Assert.Single(ws.Memberships);
        Assert.Equal(TenantRoles.User, ws.Memberships[0].Role);

        var memberRow = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.ClerkUserId == "clerk_invitee_1");
        Assert.Equal("Invitee@example.com", memberRow.MemberEmail);
    }

    [Fact]
    public async Task CreateInvitation_OwnerCanInvite_AdminRole()
    {
        var created = await _sut.CreateClientAsync("owner_inv", "InviteCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var (outcome, body) = await _sut.TryCreateInvitationAsync(
            "owner_inv",
            clientId,
            "new.admin@example.com",
            TenantRoles.Admin,
            null,
            CancellationToken.None);

        Assert.Equal(TenantInvitationCreateOutcome.Created, outcome);
        Assert.NotNull(body);
        Assert.Equal("new.admin@example.com", body!.InviteeEmail);

        var inv = await _db.TenantInvitations.AsNoTracking().SingleAsync();
        Assert.Equal("new.admin@example.com", inv.InviteeEmail);
        Assert.Equal("new.admin@example.com", inv.InviteeEmailNormalized);
        Assert.Equal(TenantRoles.Admin, inv.Role);
    }

    [Fact]
    public async Task CreateInvitation_UserMember_Forbidden()
    {
        var created = await _sut.CreateClientAsync("owner_x", "NoInviteCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);
        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "plain_inv",
                TenantClientId = clientId,
                Role = TenantRoles.User,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var (outcome, body) = await _sut.TryCreateInvitationAsync(
            "plain_inv",
            clientId,
            "x@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);

        Assert.Equal(TenantInvitationCreateOutcome.Forbidden, outcome);
        Assert.Null(body);
    }

    [Fact]
    public async Task CreateInvitation_SameEmailAsCaller_ReturnsCannotInviteSelf()
    {
        var created = await _sut.CreateClientAsync("owner_self", "SelfCo", "me@example.com", CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var (outcome, body) = await _sut.TryCreateInvitationAsync(
            "owner_self",
            clientId,
            "Me@Example.com",
            TenantRoles.User,
            "me@example.com",
            CancellationToken.None);

        Assert.Equal(TenantInvitationCreateOutcome.CannotInviteSelf, outcome);
        Assert.Null(body);
    }

    [Fact]
    public async Task CreateInvitation_SameEmailToTwoDifferentClients_Succeeds()
    {
        var a = await _sut.CreateClientAsync("owner_a", "Client A", null, CancellationToken.None);
        var b = await _sut.CreateClientAsync("owner_b", "Client B", null, CancellationToken.None);
        var idA = Guid.Parse(a!.ClientId);
        var idB = Guid.Parse(b!.ClientId);

        var (o1, _) = await _sut.TryCreateInvitationAsync(
            "owner_a",
            idA,
            "shared@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        var (o2, _) = await _sut.TryCreateInvitationAsync(
            "owner_b",
            idB,
            "shared@example.com",
            TenantRoles.Admin,
            null,
            CancellationToken.None);

        Assert.Equal(TenantInvitationCreateOutcome.Created, o1);
        Assert.Equal(TenantInvitationCreateOutcome.Created, o2);
        Assert.Equal(2, await _db.TenantInvitations.CountAsync(i => i.InviteeEmailNormalized == "shared@example.com"));
    }

    [Fact]
    public async Task NorthwindsDemoInvitation_CreatedOnFirstWorkspaceLoad_WithEmail()
    {
        var ws = await _sut.GetWorkspaceAsync("clerk_demo_user", "visitor@example.com", CancellationToken.None);

        var demo = Assert.Single(ws.Invitations, i => i.ClientId == NorthwindsDemoTenant.ClientId.ToString());
        Assert.Equal(NorthwindsDemoTenant.DisplayName, demo.ClientName);
        Assert.True(demo.IsDemoWorkspace);
        Assert.Equal(TenantRoles.User, demo.Role);
        Assert.True(ws.HasEmailClaim);
    }

    [Fact]
    public async Task NorthwindsDemoInvitation_NotDuplicated_OnSecondWorkspaceLoad()
    {
        _ = await _sut.GetWorkspaceAsync("clerk_demo_user_2", "twice@example.com", CancellationToken.None);
        var ws2 = await _sut.GetWorkspaceAsync("clerk_demo_user_2", "twice@example.com", CancellationToken.None);

        Assert.Single(ws2.Invitations, i => i.ClientId == NorthwindsDemoTenant.ClientId.ToString());
    }

    [Fact]
    public async Task NorthwindsDemoInvitation_SkippedWhenAlreadyMember()
    {
        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "clerk_member_demo",
                TenantClientId = NorthwindsDemoTenant.ClientId,
                Role = TenantRoles.User,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var ws = await _sut.GetWorkspaceAsync("clerk_member_demo", "member@example.com", CancellationToken.None);

        Assert.Empty(ws.Invitations);
    }

    [Fact]
    public async Task NorthwindsDemoInvitation_SkippedWithoutEmail()
    {
        var ws = await _sut.GetWorkspaceAsync("clerk_no_email", null, CancellationToken.None);

        Assert.Empty(ws.Invitations);
        Assert.False(ws.HasEmailClaim);
    }

    [Fact]
    public async Task NorthwindsDemoInvitation_NotRecreated_AfterDecline()
    {
        var ws1 = await _sut.GetWorkspaceAsync("clerk_decline_demo", "decliner@example.com", CancellationToken.None);
        var invId = Guid.Parse(Assert.Single(ws1.Invitations).Id);

        var declined = await _sut.TryDeclineInvitationAsync(
            "clerk_decline_demo",
            "decliner@example.com",
            invId,
            CancellationToken.None);
        Assert.True(declined);

        var ws2 = await _sut.GetWorkspaceAsync("clerk_decline_demo", "decliner@example.com", CancellationToken.None);
        Assert.Empty(ws2.Invitations);

        var ws3 = await _sut.GetWorkspaceAsync("clerk_decline_demo", "decliner@example.com", CancellationToken.None);
        Assert.Empty(ws3.Invitations);
    }

    [Fact]
    public async Task GetTenantClientRoster_ReturnsMembers_WhenCallerIsMember()
    {
        var created = await _sut.CreateClientAsync("clerk_list_a", "ListCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var roster = await _sut.GetTenantClientRosterAsync("clerk_list_a", clientId, CancellationToken.None);
        Assert.NotNull(roster);
        var row = Assert.Single(roster!.Members);
        Assert.Empty(roster.PendingInvitations);
        Assert.Equal("clerk_list_a", row.ClerkUserId);
        Assert.Null(row.Email);
        Assert.True(row.IsCurrentUser);
        Assert.Equal(TenantRoles.Owner, row.Role);
    }

    [Fact]
    public async Task GetTenantClientRoster_ReturnsNull_WhenCallerNotMember()
    {
        var created = await _sut.CreateClientAsync("clerk_list_b", "OtherCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var roster = await _sut.GetTenantClientRosterAsync("stranger", clientId, CancellationToken.None);
        Assert.Null(roster);
    }

    [Fact]
    public async Task GetTenantClientRoster_IncludesPendingInvitations()
    {
        var created = await _sut.CreateClientAsync("owner_roster", "RosterCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var (outcome, _) = await _sut.TryCreateInvitationAsync(
            "owner_roster",
            clientId,
            "pending@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        Assert.Equal(TenantInvitationCreateOutcome.Created, outcome);

        var roster = await _sut.GetTenantClientRosterAsync("owner_roster", clientId, CancellationToken.None);
        Assert.NotNull(roster);
        Assert.Single(roster!.Members);
        var inv = Assert.Single(roster.PendingInvitations);
        Assert.Equal("pending@example.com", inv.InviteeEmail);
        Assert.Equal("Invited", inv.Status);
        Assert.Equal(TenantRoles.User, inv.Role);
    }

    [Fact]
    public async Task CreateInvitation_WhenEmailMisconfigured_RollsBackRow()
    {
        var sut = new TenancyService(
            new TenantRepository(_db),
            new MisconfiguredTenantInvitationEmailSender(),
            NullLogger<TenancyService>.Instance);
        var created = await sut.CreateClientAsync("owner_mb", "MailBack", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var (outcome, body) = await sut.TryCreateInvitationAsync(
            "owner_mb",
            clientId,
            "nobody@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);

        Assert.Equal(TenantInvitationCreateOutcome.InvitationEmailMisconfigured, outcome);
        Assert.Null(body);
        Assert.Equal(0, await _db.TenantInvitations.CountAsync());
    }

    [Fact]
    public async Task UpdateMemberRole_AdminCanDemoteUser()
    {
        var created = await _sut.CreateClientAsync("owner_c", "RoleCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "member_c",
                TenantClientId = clientId,
                Role = TenantRoles.User,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var memberRow = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.ClerkUserId == "member_c");

        var outcome = await _sut.UpdateMemberRoleAsync(
            "owner_c",
            clientId,
            memberRow.Id,
            TenantRoles.Admin,
            CancellationToken.None);
        Assert.Equal(TenantMemberRoleUpdateOutcome.Success, outcome);

        var updated = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.Id == memberRow.Id);
        Assert.Equal(TenantRoles.Admin, updated.Role);
    }

    [Fact]
    public async Task RevokePendingInvitation_Owner_DeletesRow()
    {
        var created = await _sut.CreateClientAsync("owner_rev", "RevCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var (createOutcome, invBody) = await _sut.TryCreateInvitationAsync(
            "owner_rev",
            clientId,
            "typo@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        Assert.Equal(TenantInvitationCreateOutcome.Created, createOutcome);
        var invitationId = Guid.Parse(invBody!.InvitationId);

        var revoke = await _sut.TryRevokePendingInvitationAsync(
            "owner_rev",
            clientId,
            invitationId,
            CancellationToken.None);
        Assert.Equal(TenantInvitationRevokeOutcome.Revoked, revoke);

        Assert.Equal(0, await _db.TenantInvitations.CountAsync());
        var roster = await _sut.GetTenantClientRosterAsync("owner_rev", clientId, CancellationToken.None);
        Assert.NotNull(roster);
        Assert.Empty(roster!.PendingInvitations);
    }

    [Fact]
    public async Task RevokePendingInvitation_Admin_DeletesRow()
    {
        var created = await _sut.CreateClientAsync("owner_r2", "RevCo2", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "admin_rev",
                TenantClientId = clientId,
                Role = TenantRoles.Admin,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var (createOutcome, invBody) = await _sut.TryCreateInvitationAsync(
            "owner_r2",
            clientId,
            "guest@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        Assert.Equal(TenantInvitationCreateOutcome.Created, createOutcome);
        var invitationId = Guid.Parse(invBody!.InvitationId);

        var revoke = await _sut.TryRevokePendingInvitationAsync(
            "admin_rev",
            clientId,
            invitationId,
            CancellationToken.None);
        Assert.Equal(TenantInvitationRevokeOutcome.Revoked, revoke);
        Assert.Equal(0, await _db.TenantInvitations.CountAsync());
    }

    [Fact]
    public async Task RevokePendingInvitation_UserRole_Forbidden()
    {
        var created = await _sut.CreateClientAsync("owner_r3", "RevCo3", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "user_rev",
                TenantClientId = clientId,
                Role = TenantRoles.User,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var (createOutcome, invBody) = await _sut.TryCreateInvitationAsync(
            "owner_r3",
            clientId,
            "x@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        Assert.Equal(TenantInvitationCreateOutcome.Created, createOutcome);
        var invitationId = Guid.Parse(invBody!.InvitationId);

        var revoke = await _sut.TryRevokePendingInvitationAsync(
            "user_rev",
            clientId,
            invitationId,
            CancellationToken.None);
        Assert.Equal(TenantInvitationRevokeOutcome.Forbidden, revoke);
        Assert.Equal(1, await _db.TenantInvitations.CountAsync());
    }

    [Fact]
    public async Task RevokePendingInvitation_WrongClient_ReturnsNotFound()
    {
        var a = await _sut.CreateClientAsync("oa", "CoA", null, CancellationToken.None);
        var b = await _sut.CreateClientAsync("ob", "CoB", null, CancellationToken.None);
        var clientA = Guid.Parse(a!.ClientId);

        var (_, invBody) = await _sut.TryCreateInvitationAsync(
            "oa",
            clientA,
            "only@example.com",
            TenantRoles.User,
            null,
            CancellationToken.None);
        var invitationId = Guid.Parse(invBody!.InvitationId);
        var clientB = Guid.Parse(b!.ClientId);

        var revoke = await _sut.TryRevokePendingInvitationAsync("ob", clientB, invitationId, CancellationToken.None);
        Assert.Equal(TenantInvitationRevokeOutcome.NotFound, revoke);
        Assert.Equal(1, await _db.TenantInvitations.CountAsync());
    }

    [Fact]
    public async Task RevokePendingInvitation_UnknownId_ReturnsNotFound()
    {
        var created = await _sut.CreateClientAsync("owner_r4", "RevCo4", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        var revoke = await _sut.TryRevokePendingInvitationAsync(
            "owner_r4",
            clientId,
            Guid.NewGuid(),
            CancellationToken.None);
        Assert.Equal(TenantInvitationRevokeOutcome.NotFound, revoke);
    }

    [Fact]
    public async Task UpdateMemberRole_UserCaller_Forbidden()
    {
        var created = await _sut.CreateClientAsync("owner_d", "UserCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);

        _db.TenantMemberships.Add(
            new TenantMembership
            {
                Id = Guid.NewGuid(),
                ClerkUserId = "plain_d",
                TenantClientId = clientId,
                Role = TenantRoles.User,
                CreatedAtUtc = DateTime.UtcNow,
            });
        await _db.SaveChangesAsync();

        var other = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.ClerkUserId == "plain_d");

        var outcome = await _sut.UpdateMemberRoleAsync(
            "plain_d",
            clientId,
            other.Id,
            TenantRoles.Admin,
            CancellationToken.None);
        Assert.Equal(TenantMemberRoleUpdateOutcome.Forbidden, outcome);
    }

    [Fact]
    public async Task UpdateMemberRole_OwnerRow_InvalidRole()
    {
        var created = await _sut.CreateClientAsync("owner_e", "OwnCo", null, CancellationToken.None);
        var clientId = Guid.Parse(created!.ClientId);
        var ownerRow = await _db.TenantMemberships.AsNoTracking().FirstAsync(m => m.ClerkUserId == "owner_e");

        var outcome = await _sut.UpdateMemberRoleAsync(
            "owner_e",
            clientId,
            ownerRow.Id,
            TenantRoles.User,
            CancellationToken.None);
        Assert.Equal(TenantMemberRoleUpdateOutcome.InvalidRole, outcome);
    }
}

internal sealed class OkTenantInvitationEmailSender : ITenantInvitationEmailSender
{
    public Task<TenantInvitationEmailSendResult> SendTenantInvitationAsync(
        TenantInvitationEmail notification,
        CancellationToken cancellationToken) =>
        Task.FromResult(TenantInvitationEmailSendResult.Sent);
}

internal sealed class MisconfiguredTenantInvitationEmailSender : ITenantInvitationEmailSender
{
    public Task<TenantInvitationEmailSendResult> SendTenantInvitationAsync(
        TenantInvitationEmail notification,
        CancellationToken cancellationToken) =>
        Task.FromResult(TenantInvitationEmailSendResult.Misconfigured);
}

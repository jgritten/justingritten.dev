using Api.Data;
using Api.Models;
using Api.Repositories;
using Api.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
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
        _sut = new TenancyService(new TenantRepository(_db));
    }

    public void Dispose()
    {
        _db.Dispose();
        _connection.Dispose();
    }

    [Fact]
    public async Task CreateClient_AddsOwnerMembership()
    {
        var created = await _sut.CreateClientAsync("clerk_user_1", "Acme Legal", CancellationToken.None);
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
        var created = await _sut.CreateClientAsync("owner_a", "DupTest", CancellationToken.None);
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
        await _sut.CreateClientAsync("clerk_user_2", "Beta", CancellationToken.None);
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
        var other = await _sut.CreateClientAsync("owner_1", "Shared Org", CancellationToken.None);
        var clientGuid = Guid.Parse(other!.ClientId);

        _db.TenantInvitations.Add(new TenantInvitation
        {
            Id = Guid.NewGuid(),
            TenantClientId = clientGuid,
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
    }
}

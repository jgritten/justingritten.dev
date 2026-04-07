using Api.Models;

namespace Api.Interfaces;

public interface ITenantInvitationEmailSender
{
    /// <summary>Sends invitee notification via configured provider. Does not throw for HTTP or configuration failures; returns a result for transactional handling upstream.</summary>
    Task<TenantInvitationEmailSendResult> SendTenantInvitationAsync(
        TenantInvitationEmail notification,
        CancellationToken cancellationToken);
}

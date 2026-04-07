using Api.Interfaces;
using Api.Models;

namespace Api.Services;

public class NoOpTenantInvitationEmailSender : ITenantInvitationEmailSender
{
    private readonly ILogger<NoOpTenantInvitationEmailSender> _logger;

    public NoOpTenantInvitationEmailSender(ILogger<NoOpTenantInvitationEmailSender> logger)
    {
        _logger = logger;
    }

    public Task<TenantInvitationEmailSendResult> SendTenantInvitationAsync(
        TenantInvitationEmail notification,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Tenant invitation email not sent (NoOp / non-Resend provider). InvitationId {InvitationId}, To {Email}.",
            notification.InvitationId,
            notification.InviteeEmail);
        return Task.FromResult(TenantInvitationEmailSendResult.Misconfigured);
    }
}

using Api.Interfaces;
using Api.Models;

namespace Api.Services;

public class NoOpContactEmailSender : IContactEmailSender
{
    private readonly ILogger<NoOpContactEmailSender> _logger;

    public NoOpContactEmailSender(ILogger<NoOpContactEmailSender> logger)
    {
        _logger = logger;
    }

    public Task SendContactNotificationAsync(ContactNotificationEmail notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Email provider set to None. Contact notification email not sent for ContactId {ContactId}.",
            notification.ContactId);
        return Task.CompletedTask;
    }
}

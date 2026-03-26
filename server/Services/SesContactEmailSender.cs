using Api.Interfaces;
using Api.Models;
using Microsoft.Extensions.Options;

namespace Api.Services;

public class SesContactEmailSender : IContactEmailSender
{
    private readonly SesEmailOptions _options;
    private readonly ILogger<SesContactEmailSender> _logger;

    public SesContactEmailSender(
        IOptions<SesEmailOptions> options,
        ILogger<SesContactEmailSender> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public Task SendContactNotificationAsync(ContactNotificationEmail notification, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.FromEmail) ||
            string.IsNullOrWhiteSpace(_options.ToEmail))
        {
            _logger.LogWarning(
                "Skipping SES contact email send because SES is not fully configured. ContactId: {ContactId}",
                notification.ContactId);
            return Task.CompletedTask;
        }

        _logger.LogInformation(
            "SES provider scaffold active for ContactId {ContactId}. Configure AWS SES client integration to enable sending.",
            notification.ContactId);

        return Task.CompletedTask;
    }
}

public class SesEmailOptions
{
    public string Region { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string ToEmail { get; set; } = string.Empty;
}

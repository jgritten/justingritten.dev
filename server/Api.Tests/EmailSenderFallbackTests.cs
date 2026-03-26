using Api.Models;
using Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Api.Tests;

public class EmailSenderFallbackTests
{
    [Fact]
    public async Task NoOpContactEmailSender_SendContactNotificationAsync_DoesNotThrow()
    {
        var sender = new NoOpContactEmailSender(NullLogger<NoOpContactEmailSender>.Instance);

        var ex = await Record.ExceptionAsync(() =>
            sender.SendContactNotificationAsync(BuildNotification(), CancellationToken.None));

        Assert.Null(ex);
    }

    [Fact]
    public async Task SesContactEmailSender_SendContactNotificationAsync_DoesNotThrowWhenUnconfigured()
    {
        var options = Options.Create(new SesEmailOptions());
        var sender = new SesContactEmailSender(options, NullLogger<SesContactEmailSender>.Instance);

        var ex = await Record.ExceptionAsync(() =>
            sender.SendContactNotificationAsync(BuildNotification(), CancellationToken.None));

        Assert.Null(ex);
    }

    [Fact]
    public async Task SesContactEmailSender_SendContactNotificationAsync_DoesNotThrowWhenConfigured()
    {
        var options = Options.Create(new SesEmailOptions
        {
            Region = "us-east-1",
            FromEmail = "noreply@contact.justingritten.dev",
            ToEmail = "justin.gritten@gmail.com"
        });
        var sender = new SesContactEmailSender(options, NullLogger<SesContactEmailSender>.Instance);

        var ex = await Record.ExceptionAsync(() =>
            sender.SendContactNotificationAsync(BuildNotification(), CancellationToken.None));

        Assert.Null(ex);
    }

    private static ContactNotificationEmail BuildNotification()
    {
        return new ContactNotificationEmail
        {
            ContactId = 99,
            CreatedAtUtc = DateTime.UtcNow,
            FirstName = "Unit",
            LastName = "Test",
            Email = "unit@example.com",
            CompanyOrProject = "Coverage",
            Message = "Coverage test"
        };
    }
}

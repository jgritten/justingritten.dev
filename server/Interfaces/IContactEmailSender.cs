using Api.Models;

namespace Api.Interfaces;

public interface IContactEmailSender
{
    Task SendContactNotificationAsync(
        ContactNotificationEmail notification,
        CancellationToken cancellationToken);
}

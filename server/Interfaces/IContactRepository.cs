using Api.Models;

namespace Api.Interfaces;

public interface IContactRepository
{
    Task<ContactMessage> CreateAsync(ContactMessage message, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ContactMessage>> GetRecentAsync(int limit, CancellationToken cancellationToken = default);
}

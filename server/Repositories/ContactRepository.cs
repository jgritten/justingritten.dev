using Api.Data;
using Api.Interfaces;
using Api.Models;
using Microsoft.EntityFrameworkCore;

namespace Api.Repositories;

public class ContactRepository : IContactRepository
{
    private readonly AppDbContext _context;

    public ContactRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<ContactMessage> CreateAsync(ContactMessage message, CancellationToken cancellationToken = default)
    {
        await _context.ContactMessages.AddAsync(message, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return message;
    }

    public async Task<IReadOnlyList<ContactMessage>> GetRecentAsync(int limit, CancellationToken cancellationToken = default)
    {
        return await _context.ContactMessages
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}

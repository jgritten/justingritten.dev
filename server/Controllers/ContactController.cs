using Api.Data;
using Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly ILogger<ContactController> _logger;

    public ContactController(AppDbContext context, ILogger<ContactController> logger)
    {
        _context = context;
        _logger = logger;
    }

    public record ContactRequest(
        string FirstName,
        string LastName,
        string Email,
        string CompanyOrProject,
        string Message,
        string? Source
    );

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContactRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.FirstName) ||
            string.IsNullOrWhiteSpace(request.LastName) ||
            string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.CompanyOrProject) ||
            string.IsNullOrWhiteSpace(request.Message))
        {
            return BadRequest(new { message = "All fields are required." });
        }

        if (request.FirstName.Length > 100 ||
            request.LastName.Length > 100 ||
            request.Email.Length > 254 ||
            request.CompanyOrProject.Length > 200 ||
            request.Message.Length > 2000)
        {
            return BadRequest(new { message = "One or more fields exceed the maximum length." });
        }

        var entity = new ContactMessage
        {
            FirstName = request.FirstName.Trim(),
            LastName = request.LastName.Trim(),
            Email = request.Email.Trim(),
            CompanyOrProject = request.CompanyOrProject.Trim(),
            Message = request.Message.Trim(),
            Source = string.IsNullOrWhiteSpace(request.Source) ? "portfolio-contact" : request.Source.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _context.ContactMessages.AddAsync(entity, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Stored contact message {ContactId} from {Email} ({FirstName} {LastName})",
            entity.Id,
            entity.Email,
            entity.FirstName,
            entity.LastName);

        return Ok(new { message = "Thank you for reaching out. Your message has been received." });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactMessage>>> GetRecent([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        if (limit <= 0 || limit > 100)
        {
            limit = 20;
        }

        var messages = await _context.ContactMessages
            .OrderByDescending(m => m.CreatedAt)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        return Ok(messages);
    }
}


using Api.DTOs;
using Api.Interfaces;
using Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactRepository _contactRepository;
    private readonly IContactEmailSender _contactEmailSender;
    private readonly ILogger<ContactController> _logger;

    public ContactController(
        IContactRepository contactRepository,
        IContactEmailSender contactEmailSender,
        ILogger<ContactController> logger)
    {
        _contactRepository = contactRepository;
        _contactEmailSender = contactEmailSender;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ContactCreateRequestDto request, CancellationToken cancellationToken)
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

        await _contactRepository.CreateAsync(entity, cancellationToken);

        var notification = new ContactNotificationEmail
        {
            ContactId = entity.Id,
            CreatedAtUtc = entity.CreatedAt,
            FirstName = entity.FirstName,
            LastName = entity.LastName,
            Email = entity.Email,
            CompanyOrProject = entity.CompanyOrProject,
            Message = entity.Message,
            Source = entity.Source
        };

        await _contactEmailSender.SendContactNotificationAsync(
            notification,
            cancellationToken);

        _logger.LogInformation(
            "Stored contact message {ContactId} from {Email} ({FirstName} {LastName})",
            entity.Id,
            entity.Email,
            entity.FirstName,
            entity.LastName);

        return Ok(new { message = "Thank you for reaching out. Your message has been received." });
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ContactMessageDto>>> GetRecent([FromQuery] int limit = 20, CancellationToken cancellationToken = default)
    {
        if (limit <= 0 || limit > 100)
        {
            limit = 20;
        }

        var messages = await _contactRepository.GetRecentAsync(limit, cancellationToken);

        return Ok(messages.Select(MapToDto));
    }

    private static ContactMessageDto MapToDto(ContactMessage message) => new(
        message.Id,
        message.FirstName,
        message.LastName,
        message.Email,
        message.CompanyOrProject,
        message.Message,
        message.Source,
        message.CreatedAt
    );
}


namespace Api.Models;

public class ContactNotificationEmail
{
    public int ContactId { get; init; }
    public DateTime CreatedAtUtc { get; init; }
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string CompanyOrProject { get; init; } = string.Empty;
    public string Message { get; init; } = string.Empty;
    public string Source { get; init; } = "portfolio-contact";
}

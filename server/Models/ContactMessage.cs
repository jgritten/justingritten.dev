using System.ComponentModel.DataAnnotations;

namespace Api.Models;

public class ContactMessage
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string FirstName { get; set; }

    [Required]
    [MaxLength(100)]
    public required string LastName { get; set; }

    [Required]
    [MaxLength(254)]
    [EmailAddress]
    public required string Email { get; set; }

    [Required]
    [MaxLength(200)]
    public required string CompanyOrProject { get; set; }

    [Required]
    [MaxLength(2000)]
    public required string Message { get; set; }

    /// <summary>
    /// Optional source identifier (e.g. "portfolio-contact").
    /// </summary>
    [MaxLength(100)]
    public string? Source { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}


namespace Api.DTOs;

public record ContactCreateRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string CompanyOrProject,
    string Message,
    string? Source
);

public record ContactMessageDto(
    int Id,
    string FirstName,
    string LastName,
    string Email,
    string CompanyOrProject,
    string Message,
    string? Source,
    DateTime CreatedAt
);

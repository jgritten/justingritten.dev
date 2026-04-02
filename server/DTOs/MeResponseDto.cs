namespace Api.DTOs;

/// <summary>
/// Authenticated user identity from the validated Clerk session JWT (no local DB join yet).
/// </summary>
public record MeResponseDto(string Sub, string? SessionId, string? Issuer);

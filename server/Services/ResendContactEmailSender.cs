using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Api.Interfaces;
using Api.Models;
using Microsoft.Extensions.Options;

namespace Api.Services;

public class ResendContactEmailSender : IContactEmailSender
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ResendEmailOptions _options;
    private readonly ILogger<ResendContactEmailSender> _logger;

    public ResendContactEmailSender(
        IHttpClientFactory httpClientFactory,
        IOptions<ResendEmailOptions> options,
        ILogger<ResendContactEmailSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task SendContactNotificationAsync(
        ContactNotificationEmail notification,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey) ||
            string.IsNullOrWhiteSpace(_options.FromEmail) ||
            string.IsNullOrWhiteSpace(_options.ToEmail))
        {
            _logger.LogWarning(
                "Skipping contact email send because Resend is not fully configured. ContactId: {ContactId}",
                notification.ContactId);
            return;
        }

        var subject = $"New contact request from {notification.FirstName} {notification.LastName}";
        var textBody = BuildTextBody(notification);

        var payload = new
        {
            from = _options.FromEmail,
            to = new[] { _options.ToEmail },
            subject,
            text = textBody,
            reply_to = notification.Email.Trim()
        };

        var json = JsonSerializer.Serialize(payload);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var client = _httpClientFactory.CreateClient(nameof(ResendContactEmailSender));
        using var response = await client.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError(
                "Resend email send failed for ContactId {ContactId}. Status: {StatusCode}. Body: {ErrorBody}",
                notification.ContactId,
                (int)response.StatusCode,
                errorBody);
            return;
        }

        _logger.LogInformation("Sent contact notification email for ContactId {ContactId}", notification.ContactId);
    }

    private static string BuildTextBody(ContactNotificationEmail notification)
    {
        var source = string.IsNullOrWhiteSpace(notification.Source) ? "portfolio-contact" : notification.Source.Trim();

        return $"""
               New contact request

               Contact ID: {notification.ContactId}
               Received (UTC): {notification.CreatedAtUtc:O}
               Source: {source}

               Name: {notification.FirstName.Trim()} {notification.LastName.Trim()}
               Email: {notification.Email.Trim()}
               Company/Project: {notification.CompanyOrProject.Trim()}

               Message:
               {notification.Message.Trim()}
               """;
    }
}

public class ResendEmailOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string ToEmail { get; set; } = string.Empty;
}

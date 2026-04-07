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
            string.IsNullOrWhiteSpace(_options.ToEmail) ||
            string.IsNullOrWhiteSpace(_options.ContactTemplateId))
        {
            _logger.LogWarning(
                "Skipping contact email send because Resend is not fully configured. ContactId: {ContactId}",
                notification.ContactId);
            return;
        }

        var payload = new
        {
            from = _options.FromEmail,
            to = new[] { _options.ToEmail },
            reply_to = notification.Email.Trim(),
            template = new
            {
                id = _options.ContactTemplateId.Trim(),
                variables = BuildTemplateVariables(notification)
            }
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

    private static Dictionary<string, string> BuildTemplateVariables(ContactNotificationEmail notification)
    {
        var source = string.IsNullOrWhiteSpace(notification.Source) ? "portfolio-contact" : notification.Source.Trim();

        return new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["CONTACT_ID"] = notification.ContactId.ToString(),
            ["RECEIVED_UTC"] = notification.CreatedAtUtc.ToString("O"),
            ["SOURCE"] = source,
            ["FIRST_NAME"] = notification.FirstName.Trim(),
            ["LAST_NAME"] = notification.LastName.Trim(),
            ["EMAIL"] = notification.Email.Trim(),
            ["COMPANY_OR_PROJECT"] = notification.CompanyOrProject.Trim(),
            ["MESSAGE"] = notification.Message.Trim()
        };
    }
}

public class ResendEmailOptions
{
    public string ApiKey { get; set; } = string.Empty;
    public string FromEmail { get; set; } = string.Empty;
    public string ToEmail { get; set; } = string.Empty;

    /// <summary>
    /// Published Resend template id (UUID) for contact notifications; variables must match the template.
    /// </summary>
    public string ContactTemplateId { get; set; } = string.Empty;

    /// <summary>Optional Resend template UUID for tenant invitation emails to invitees. If empty, a built-in HTML body is used.</summary>
    public string InviteTemplateId { get; set; } = string.Empty;

    /// <summary>SPA origin without trailing slash (e.g. https://www.justingritten.dev). Used to build SIGN_IN_URL ({origin}/saas) for invite emails; if empty, see <see cref="ResendTenantInvitationEmailSender"/> default.</summary>
    public string PublicAppOrigin { get; set; } = string.Empty;
}

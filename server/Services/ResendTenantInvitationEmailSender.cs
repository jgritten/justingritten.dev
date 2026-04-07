using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Api.Interfaces;
using Api.Models;
using Microsoft.Extensions.Options;

namespace Api.Services;

/// <summary>Sends tenant invitation emails through Resend, using a published template (same API as contact mail).</summary>
public class ResendTenantInvitationEmailSender : ITenantInvitationEmailSender
{
    /// <summary>Used for <c>/saas</c> sign-in link when <c>APP_PUBLIC_ORIGIN</c> is unset (production safety net for this site).</summary>
    public const string DefaultInvitationPublicOrigin = "https://www.justingritten.dev";

    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ResendEmailOptions _options;
    private readonly ILogger<ResendTenantInvitationEmailSender> _logger;

    public ResendTenantInvitationEmailSender(
        IHttpClientFactory httpClientFactory,
        IOptions<ResendEmailOptions> options,
        ILogger<ResendTenantInvitationEmailSender> logger)
    {
        _httpClientFactory = httpClientFactory;
        _options = options.Value;
        _logger = logger;
    }

    public async Task<TenantInvitationEmailSendResult> SendTenantInvitationAsync(
        TenantInvitationEmail notification,
        CancellationToken cancellationToken)
    {
        var hasApiKey = !string.IsNullOrWhiteSpace(_options.ApiKey);
        var hasFrom = !string.IsNullOrWhiteSpace(_options.FromEmail);
        var hasInviteTemplate = !string.IsNullOrWhiteSpace(_options.InviteTemplateId);
        if (!hasApiKey || !hasFrom || !hasInviteTemplate)
        {
            _logger.LogWarning(
                "Tenant invitation email skipped: Resend misconfigured (RESEND_API_KEY set: {HasApiKey}, RESEND_FROM_EMAIL set: {HasFrom}, RESEND_INVITE_TEMPLATE_ID set: {HasInviteTemplate}). InvitationId {InvitationId}",
                hasApiKey,
                hasFrom,
                hasInviteTemplate,
                notification.InvitationId);
            return TenantInvitationEmailSendResult.Misconfigured;
        }

        var to = notification.InviteeEmail.Trim();
        if (to.Length == 0)
            return TenantInvitationEmailSendResult.Misconfigured;

        var signInUrl = BuildSignInUrl();
        var payload = new
        {
            from = _options.FromEmail,
            to = new[] { to },
            template = new
            {
                id = _options.InviteTemplateId.Trim(),
                variables = BuildTemplateVariables(notification, signInUrl),
            },
        };

        var json = JsonSerializer.Serialize(payload);

        using var httpRequest = new HttpRequestMessage(HttpMethod.Post, "https://api.resend.com/emails")
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
        };
        httpRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _options.ApiKey);

        var client = _httpClientFactory.CreateClient(nameof(ResendTenantInvitationEmailSender));
        using var response = await client.SendAsync(httpRequest, cancellationToken);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError(
                "Resend tenant invitation email failed. InvitationId {InvitationId}. Status: {StatusCode}. Body: {ErrorBody}",
                notification.InvitationId,
                (int)response.StatusCode,
                errorBody);
            return TenantInvitationEmailSendResult.ProviderRejected;
        }

        _logger.LogInformation("Sent tenant invitation email for InvitationId {InvitationId}", notification.InvitationId);
        return TenantInvitationEmailSendResult.Sent;
    }

    private string BuildSignInUrl()
    {
        var origin = _options.PublicAppOrigin.Trim().TrimEnd('/');
        if (string.IsNullOrEmpty(origin))
        {
            origin = DefaultInvitationPublicOrigin;
            _logger.LogWarning(
                "APP_PUBLIC_ORIGIN is not set; using default {DefaultOrigin} for invitation SIGN_IN_URL. Set APP_PUBLIC_ORIGIN to your SPA origin (no trailing slash).",
                origin);
        }

        return $"{origin}/saas";
    }

    private static Dictionary<string, string> BuildTemplateVariables(
        TenantInvitationEmail notification,
        string signInUrl)
    {
        return new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["INVITATION_ID"] = notification.InvitationId.ToString(),
            ["CLIENT_NAME"] = notification.ClientName.Trim(),
            ["ROLE"] = notification.Role.Trim(),
            ["INVITEE_EMAIL"] = notification.InviteeEmail.Trim(),
            ["SIGN_IN_URL"] = signInUrl,
        };
    }
}

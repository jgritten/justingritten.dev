using System.Net;
using System.Text;
using System.Text.Json;
using Api.Interfaces;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Api.Tests;

public class ResendTenantInvitationEmailSenderTests
{
    [Fact]
    public async Task SendTenantInvitationAsync_WithTemplate_SendsExpectedRequest()
    {
        var handler = new RecordingHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"id":"email_inv"}""", Encoding.UTF8, "application/json"),
            });
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_key",
            FromEmail = "onboarding@example.com",
            InviteTemplateId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            PublicAppOrigin = "https://app.example.com",
        });
        var sender = new ResendTenantInvitationEmailSender(
            clientFactory,
            options,
            NullLogger<ResendTenantInvitationEmailSender>.Instance);

        var result = await sender.SendTenantInvitationAsync(
            new TenantInvitationEmail
            {
                InvitationId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                InviteeEmail = "invitee@example.com",
                ClientName = "Acme Co",
                Role = "Admin",
            },
            CancellationToken.None);

        Assert.Equal(TenantInvitationEmailSendResult.Sent, result);
        Assert.NotNull(handler.LastRequestBody);
        using var doc = JsonDocument.Parse(handler.LastRequestBody!);
        var root = doc.RootElement;
        Assert.Equal("onboarding@example.com", root.GetProperty("from").GetString());
        Assert.Equal("invitee@example.com", root.GetProperty("to")[0].GetString());
        var template = root.GetProperty("template");
        Assert.Equal("aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee", template.GetProperty("id").GetString());
        var variables = template.GetProperty("variables");
        Assert.Equal("Acme Co", variables.GetProperty("CLIENT_NAME").GetString());
        Assert.Equal("Admin", variables.GetProperty("ROLE").GetString());
        Assert.Equal("https://app.example.com/saas", variables.GetProperty("SIGN_IN_URL").GetString());
        Assert.False(root.TryGetProperty("html", out _));
    }

    [Fact]
    public async Task SendTenantInvitationAsync_WhenPublicOriginMissing_UsesDefaultSignInUrl()
    {
        var handler = new RecordingHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"id":"email_inv"}""", Encoding.UTF8, "application/json"),
            });
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_key",
            FromEmail = "onboarding@example.com",
            InviteTemplateId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
            PublicAppOrigin = string.Empty,
        });
        var sender = new ResendTenantInvitationEmailSender(
            clientFactory,
            options,
            NullLogger<ResendTenantInvitationEmailSender>.Instance);

        var result = await sender.SendTenantInvitationAsync(
            new TenantInvitationEmail
            {
                InvitationId = Guid.NewGuid(),
                InviteeEmail = "invitee@example.com",
                ClientName = "Acme Co",
                Role = "Admin",
            },
            CancellationToken.None);

        Assert.Equal(TenantInvitationEmailSendResult.Sent, result);
        using var doc = JsonDocument.Parse(handler.LastRequestBody!);
        var signInUrl = doc.RootElement
            .GetProperty("template")
            .GetProperty("variables")
            .GetProperty("SIGN_IN_URL")
            .GetString();
        Assert.Equal(
            $"{ResendTenantInvitationEmailSender.DefaultInvitationPublicOrigin}/saas",
            signInUrl);
    }

    [Fact]
    public async Task SendTenantInvitationAsync_WithoutTemplateId_ReturnsMisconfigured()
    {
        var handler = new RecordingHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK));
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_key",
            FromEmail = "onboarding@example.com",
            InviteTemplateId = string.Empty,
        });
        var sender = new ResendTenantInvitationEmailSender(
            clientFactory,
            options,
            NullLogger<ResendTenantInvitationEmailSender>.Instance);

        var result = await sender.SendTenantInvitationAsync(
            new TenantInvitationEmail
            {
                InvitationId = Guid.NewGuid(),
                InviteeEmail = "who@example.com",
                ClientName = "Beta LLC",
                Role = "User",
            },
            CancellationToken.None);

        Assert.Equal(TenantInvitationEmailSendResult.Misconfigured, result);
        Assert.Null(handler.LastRequest);
    }

    [Fact]
    public async Task SendTenantInvitationAsync_WithMissingApiKey_ReturnsMisconfigured()
    {
        var handler = new RecordingHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK));
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            FromEmail = "x@y.z",
            InviteTemplateId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        });
        var sender = new ResendTenantInvitationEmailSender(
            clientFactory,
            options,
            NullLogger<ResendTenantInvitationEmailSender>.Instance);

        var result = await sender.SendTenantInvitationAsync(
            new TenantInvitationEmail
            {
                InvitationId = Guid.NewGuid(),
                InviteeEmail = "a@b.c",
                ClientName = "C",
                Role = "User",
            },
            CancellationToken.None);

        Assert.Equal(TenantInvitationEmailSendResult.Misconfigured, result);
        Assert.Null(handler.LastRequest);
    }

    [Fact]
    public async Task SendTenantInvitationAsync_WhenProviderReturnsError_ReturnsProviderRejected()
    {
        var handler = new RecordingHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("""{"message":"bad"}""", Encoding.UTF8, "application/json"),
            });
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_key",
            FromEmail = "onboarding@example.com",
            InviteTemplateId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
        });
        var sender = new ResendTenantInvitationEmailSender(
            clientFactory,
            options,
            NullLogger<ResendTenantInvitationEmailSender>.Instance);

        var result = await sender.SendTenantInvitationAsync(
            new TenantInvitationEmail
            {
                InvitationId = Guid.NewGuid(),
                InviteeEmail = "a@b.c",
                ClientName = "C",
                Role = "User",
            },
            CancellationToken.None);

        Assert.Equal(TenantInvitationEmailSendResult.ProviderRejected, result);
        Assert.NotNull(handler.LastRequest);
    }

    private sealed class StubHttpClientFactory : IHttpClientFactory
    {
        private readonly HttpClient _client;

        public StubHttpClientFactory(HttpClient client)
        {
            _client = client;
        }

        public HttpClient CreateClient(string name) => _client;
    }

    private sealed class RecordingHttpMessageHandler : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responseFactory;

        public RecordingHttpMessageHandler(Func<HttpRequestMessage, HttpResponseMessage> responseFactory)
        {
            _responseFactory = responseFactory;
        }

        public HttpRequestMessage? LastRequest { get; private set; }
        public string? LastRequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(
            HttpRequestMessage request,
            CancellationToken cancellationToken)
        {
            LastRequest = request;
            LastRequestBody = request.Content is null
                ? null
                : await request.Content.ReadAsStringAsync(cancellationToken);
            return _responseFactory(request);
        }
    }
}

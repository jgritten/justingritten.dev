using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Api.Models;
using Api.Services;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Xunit;

namespace Api.Tests;

public class ResendContactEmailSenderTests
{
    [Fact]
    public async Task SendContactNotificationAsync_WithValidConfiguration_SendsExpectedRequest()
    {
        var handler = new RecordingHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.OK)
            {
                Content = new StringContent("""{"id":"email_123"}""", Encoding.UTF8, "application/json")
            });
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_test_key",
            FromEmail = "noreply@contact.justingritten.dev",
            ToEmail = "justin.gritten@gmail.com"
        });
        var sender = new ResendContactEmailSender(clientFactory, options, NullLogger<ResendContactEmailSender>.Instance);
        var notification = BuildNotification();

        await sender.SendContactNotificationAsync(notification, CancellationToken.None);

        Assert.NotNull(handler.LastRequest);
        Assert.Equal(HttpMethod.Post, handler.LastRequest!.Method);
        Assert.Equal("https://api.resend.com/emails", handler.LastRequestUri);
        Assert.NotNull(handler.LastAuthorization);
        Assert.Equal("Bearer", handler.LastAuthorization!.Scheme);
        Assert.Equal("re_test_key", handler.LastAuthorization.Parameter);

        var json = handler.LastRequestBody;
        Assert.False(string.IsNullOrWhiteSpace(json));
        using var doc = JsonDocument.Parse(json);
        var root = doc.RootElement;
        Assert.Equal("noreply@contact.justingritten.dev", root.GetProperty("from").GetString());
        Assert.Equal("justin.gritten@gmail.com", root.GetProperty("to")[0].GetString());
        Assert.Equal("jane@example.com", root.GetProperty("reply_to").GetString());
        Assert.Contains("New contact request from Jane Doe", root.GetProperty("subject").GetString());
        Assert.Contains("Contact ID: 42", root.GetProperty("text").GetString());
    }

    [Fact]
    public async Task SendContactNotificationAsync_WithMissingConfiguration_DoesNotCallProvider()
    {
        var handler = new RecordingHttpMessageHandler(_ => new HttpResponseMessage(HttpStatusCode.OK));
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions());
        var sender = new ResendContactEmailSender(clientFactory, options, NullLogger<ResendContactEmailSender>.Instance);

        await sender.SendContactNotificationAsync(BuildNotification(), CancellationToken.None);

        Assert.Null(handler.LastRequest);
    }

    [Fact]
    public async Task SendContactNotificationAsync_WhenProviderReturnsError_DoesNotThrow()
    {
        var handler = new RecordingHttpMessageHandler(_ =>
            new HttpResponseMessage(HttpStatusCode.BadRequest)
            {
                Content = new StringContent("""{"message":"bad request"}""", Encoding.UTF8, "application/json")
            });
        var client = new HttpClient(handler);
        var clientFactory = new StubHttpClientFactory(client);
        var options = Options.Create(new ResendEmailOptions
        {
            ApiKey = "re_test_key",
            FromEmail = "noreply@contact.justingritten.dev",
            ToEmail = "justin.gritten@gmail.com"
        });
        var sender = new ResendContactEmailSender(clientFactory, options, NullLogger<ResendContactEmailSender>.Instance);

        var ex = await Record.ExceptionAsync(() =>
            sender.SendContactNotificationAsync(BuildNotification(), CancellationToken.None));

        Assert.Null(ex);
        Assert.NotNull(handler.LastRequest);
    }

    private static ContactNotificationEmail BuildNotification()
    {
        return new ContactNotificationEmail
        {
            ContactId = 42,
            CreatedAtUtc = DateTime.UtcNow,
            FirstName = "Jane",
            LastName = "Doe",
            Email = "jane@example.com",
            CompanyOrProject = "Test Co",
            Message = "Hello",
            Source = "portfolio-contact"
        };
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
        public string? LastRequestUri { get; private set; }
        public AuthenticationHeaderValue? LastAuthorization { get; private set; }
        public string? LastRequestBody { get; private set; }

        protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            LastRequest = request;
            LastRequestUri = request.RequestUri?.ToString();
            LastAuthorization = request.Headers.Authorization;
            LastRequestBody = request.Content is null
                ? null
                : await request.Content.ReadAsStringAsync(cancellationToken);
            return _responseFactory(request);
        }
    }
}

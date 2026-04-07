namespace Api.Interfaces;

/// <summary>Outcome of attempting to deliver a tenant invitation email to the invitee.</summary>
public enum TenantInvitationEmailSendResult
{
    /// <summary>Resend (or provider) accepted the message.</summary>
    Sent,

    /// <summary>Missing API key, from-address, invite template id, or provider not wired — invitation must not be left pending without notice.</summary>
    Misconfigured,

    /// <summary>Provider returned an error response.</summary>
    ProviderRejected,
}

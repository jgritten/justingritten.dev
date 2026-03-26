# ADR 0006: Email provider abstraction for contact notifications

## Status

Accepted.

## Context

The contact endpoint persists requests and now sends internal notification emails. We need to support provider changes (for example, switching from Resend to AWS SES) without reworking controllers or endpoint behavior.

Without an abstraction, provider-specific request models and SDK logic can leak into controller code, making future provider swaps costly and risky.

## Decision

- Introduce `IContactEmailSender` as the provider-agnostic port for contact notification delivery.
- Define a provider-neutral notification model (`ContactNotificationEmail`) in `server/Models`.
- Keep provider implementations in infrastructure services:
  - `ResendContactEmailSender`
  - `SesContactEmailSender` (scaffold)
  - `NoOpContactEmailSender` (safe fallback)
- Select provider in the composition root (`Program.cs`) with `EMAIL_PROVIDER`:
  - `Resend` -> Resend implementation
  - `Ses` -> SES scaffold implementation
  - Any other value -> `NoOp`

## Consequences

- Controllers and request handling remain provider-agnostic.
- Switching providers is primarily a DI/configuration change.
- Future providers can be added by implementing `IContactEmailSender` and registering them in `Program.cs`.
- The SES path is scaffolded but intentionally does not send yet; full AWS SDK sending logic can be added without changing API endpoint contracts.

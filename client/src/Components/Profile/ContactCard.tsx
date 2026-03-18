import { useState, useCallback } from 'react'
import { Button, Card, Flex, Heading, Text, TextArea, TextField } from '@radix-ui/themes'
import { contactApi } from '@/api'
import './ContactCard.css'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_LENGTH = { firstName: 100, lastName: 100, email: 254, company: 200, message: 2000 }
const SUBMIT_COOLDOWN_MS = 60_000

function trim(s: string): string {
  return s.trim()
}

export function ContactCard() {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [lastSubmitAt, setLastSubmitAt] = useState<number>(0)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const validate = useCallback(
    (formData: FormData): Record<string, string> => {
      const firstName = trim((formData.get('firstName') ?? '').toString())
      const lastName = trim((formData.get('lastName') ?? '').toString())
      const email = trim((formData.get('email') ?? '').toString())
      const company = trim((formData.get('company') ?? '').toString())
      const message = trim((formData.get('message') ?? '').toString())

      const next: Record<string, string> = {}
      if (!firstName) next.firstName = 'First name is required.'
      else if (firstName.length > MAX_LENGTH.firstName) next.firstName = `Keep it under ${MAX_LENGTH.firstName} characters.`
      if (!lastName) next.lastName = 'Last name is required.'
      else if (lastName.length > MAX_LENGTH.lastName) next.lastName = `Keep it under ${MAX_LENGTH.lastName} characters.`
      if (!email) next.email = 'Email is required.'
      else if (!EMAIL_REGEX.test(email)) next.email = 'Please enter a valid email address.'
      else if (email.length > MAX_LENGTH.email) next.email = `Keep it under ${MAX_LENGTH.email} characters.`
      if (!company) next.company = 'Company or project is required.'
      else if (company.length > MAX_LENGTH.company) next.company = `Keep it under ${MAX_LENGTH.company} characters.`
      if (!message) next.message = 'Message is required.'
      else if (message.length > MAX_LENGTH.message) next.message = `Keep it under ${MAX_LENGTH.message} characters.`
      return next
    },
    []
  )

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    const form = event.currentTarget
    const formData = new FormData(form)

    const honeypot = (formData.get('website') ?? '').toString().trim()
    if (honeypot) {
      setErrors({ form: 'Something went wrong. Please try again or email me directly.' })
      return
    }

    const now = Date.now()
    if (now - lastSubmitAt < SUBMIT_COOLDOWN_MS) {
      setErrors({ form: 'Please wait a minute before sending again.' })
      return
    }

    const validationErrors = validate(formData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setSuccess(false)
    setSubmitting(true)

    try {
      await contactApi.submit({
        firstName: trim((formData.get('firstName') ?? '').toString()),
        lastName: trim((formData.get('lastName') ?? '').toString()),
        email: trim((formData.get('email') ?? '').toString()),
        companyOrProject: trim((formData.get('company') ?? '').toString()),
        message: trim((formData.get('message') ?? '').toString()),
      })
      setSuccess(true)
      setLastSubmitAt(now)
      form.reset()
    } catch (err) {
      setErrors({
        form:
          err instanceof Error
            ? err.message
            : 'Something went wrong. Please try again or email me at justin.gritten@gmail.com.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="contact-card">
      <Heading as="h2" size="7" weight="bold" className="contact-card__title">
        Ready to work on your product?
      </Heading>
      <Flex direction={{ initial: 'column', md: 'row' }} gap="4" className="contact-card__layout">
        <Flex direction="column" gap="3" className="contact-card__intro">
          <Heading as="h3" size="5" weight="bold">
            I help early‑stage founders and teams launch SaaS MVPs in 2–4 weeks, rework existing
            products, or add higher‑impact features like microservices and integrations.
          </Heading>
          <Text as="p" size="3" color="gray">
            MVPs are best suited for founders who need authentication, dashboards, landing pages, and core
            product workflows brought to life quickly and maintainably.
          </Text>
          <div className="contact-card__primary-cta">
            <Button size="3" asChild>
              <a
                href="https://calendly.com/justin-gritten/30min"
                target="_blank"
                rel="noopener noreferrer"
              >
                Book a 30-minute call
              </a>
            </Button>
          </div>
        </Flex>
        <Card className="contact-card__inner">
          <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
          <form className="contact-card__form" onSubmit={handleSubmit} noValidate>
            <Flex direction="column" gap="3">
              {/* Honeypot: hidden from users; bots that fill it are ignored */}
              <div className="contact-card__honeypot" aria-hidden="true">
                <label htmlFor="contact-website">Website</label>
                <input type="text" id="contact-website" name="website" tabIndex={-1} autoComplete="off" />
              </div>

              {success && (
                <div className="contact-card__success" role="status">
                  <Text as="p" size="2" color="green">
                    Thank you. Your message has been received and I&apos;ll get back to you soon.
                  </Text>
                </div>
              )}

              {errors.form && (
                <div className="contact-card__error contact-card__error--form" role="alert">
                  <Text as="p" size="2" color="red">
                    {errors.form}
                  </Text>
                </div>
              )}

              <div className="contact-card__fallback">
                <Text as="p" size="2" color="gray">
                  Prefer email? Reach me at{' '}
                  <a
                    href="mailto:justin.gritten@gmail.com"
                    className="contact-card__email-link"
                  >
                    justin.gritten@gmail.com
                  </a>
                  , or use the &quot;Book a 30-minute call&quot; button above.
                </Text>
              </div>
              <div className="contact-card__row contact-card__row--split">
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    First name
                  </Text>
                  <TextField.Root
                    name="firstName"
                    placeholder="John"
                    required
                    maxLength={MAX_LENGTH.firstName}
                    color={errors.firstName ? 'red' : undefined}
                  />
                  {errors.firstName && (
                    <Text as="span" size="1" color="red" className="contact-card__field-error">
                      {errors.firstName}
                    </Text>
                  )}
                </label>
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    Last name
                  </Text>
                  <TextField.Root
                    name="lastName"
                    placeholder="Doe"
                    required
                    maxLength={MAX_LENGTH.lastName}
                    color={errors.lastName ? 'red' : undefined}
                  />
                  {errors.lastName && (
                    <Text as="span" size="1" color="red" className="contact-card__field-error">
                      {errors.lastName}
                    </Text>
                  )}
                </label>
              </div>

              <div className="contact-card__row contact-card__row--split">
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    Email
                  </Text>
                  <TextField.Root
                    name="email"
                    placeholder="you@example.com"
                    type="email"
                    required
                    maxLength={MAX_LENGTH.email}
                    color={errors.email ? 'red' : undefined}
                  />
                  {errors.email && (
                    <Text as="span" size="1" color="red" className="contact-card__field-error">
                      {errors.email}
                    </Text>
                  )}
                </label>
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    Company or project
                  </Text>
                  <TextField.Root
                    name="company"
                    placeholder="Company or project name"
                    required
                    maxLength={MAX_LENGTH.company}
                    color={errors.company ? 'red' : undefined}
                  />
                  {errors.company && (
                    <Text as="span" size="1" color="red" className="contact-card__field-error">
                      {errors.company}
                    </Text>
                  )}
                </label>
              </div>

              <label className="contact-card__field">
                <Text as="span" size="2">
                  How can I help?
                </Text>
                <TextArea
                  name="message"
                  placeholder="Tell me about your timeline, goals, and what success looks like."
                  rows={4}
                  required
                  maxLength={MAX_LENGTH.message}
                  color={errors.message ? 'red' : undefined}
                />
                {errors.message && (
                  <Text as="span" size="1" color="red" className="contact-card__field-error">
                    {errors.message}
                  </Text>
                )}
              </label>

              <div className="contact-card__actions">
                <Button size="3" type="submit" disabled={submitting}>
                  {submitting ? 'Sending…' : 'Send message'}
                </Button>
              </div>
            </Flex>
          </form>
          </Flex>
        </Card>
      </Flex>
    </div>
  )
}


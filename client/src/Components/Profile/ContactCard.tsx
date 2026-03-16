import { Button, Card, Flex, Heading, Text, TextArea, TextField } from '@radix-ui/themes'
import './ContactCard.css'

export function ContactCard() {
  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault()
    // Placeholder; real submission wiring will come later.
    window.alert(
      "This contact form isn't wired up yet. Please email me at justin.gritten@gmail.com instead."
    )
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
        </Flex>
        <Card className="contact-card__inner">
          <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
          <form className="contact-card__form" onSubmit={handleSubmit}>
            <Flex direction="column" gap="3">
              <div className="contact-card__notice">
                <Text as="p" size="2">
                  This contact form isn&apos;t wired up yet. For now, please email me at{' '}
                  <a
                    href="mailto:justin.gritten@gmail.com"
                    className="contact-card__email-link"
                  >
                    justin.gritten@gmail.com
                  </a>
                   if you need help.
                </Text>
              </div>
              <div className="contact-card__row contact-card__row--split">
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    First name
                  </Text>
                  <TextField.Root name="firstName" placeholder="John" required />
                </label>
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    Last name
                  </Text>
                  <TextField.Root name="lastName" placeholder="Doe" />
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
                  />
                </label>
                <label className="contact-card__field">
                  <Text as="span" size="2">
                    Company or project
                  </Text>
                  <TextField.Root name="company" placeholder="Company or project name" />
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
                />
              </label>

              <div className="contact-card__actions">
                <Button size="3" type="submit">
                  Submit
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


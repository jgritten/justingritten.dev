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
      <Card className="contact-card__inner">
        <Flex direction={{ initial: 'column', md: 'row' }} gap="4">
          <Flex direction="column" gap="3" className="contact-card__intro">
            <Heading as="h2" size="7" weight="bold">
              Ready to work on your product?
            </Heading>
            <Text as="p" size="3" color="gray">
              Tell me about your idea, existing system, or SaaS product. I&apos;ll follow up with
              next steps and questions within 1-2 business days.
            </Text>
            <div className="contact-card__email-pill">
              <Text as="span" size="2" color="gray">
                Email
              </Text>
              <a
                href="mailto:justin.gritten@gmail.com"
                className="contact-card__email-link"
              >
                justin.gritten@gmail.com
              </a>
            </div>
          </Flex>

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
                  .
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
    </div>
  )
}


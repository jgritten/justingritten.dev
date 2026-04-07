import { Heading, Text } from '@radix-ui/themes'
import '@/styles/App.css'

export function ClientSettings() {
  return (
    <div className="content-card settings__card">
      <Heading as="h2" size="6" className="settings__heading">
        Client
      </Heading>
      <Text as="p" size="2" color="gray" className="settings__description">
        Tenant profile for the client you have selected: name, branding, document headers and footers, offices, and other client-wide defaults.
      </Text>
      <Text as="p" size="2" color="gray">
        Placeholder — future: logo upload, document templates, office directory, and client-level preferences. Manage people under Settings → Users.
      </Text>
    </div>
  )
}

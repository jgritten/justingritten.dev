import { Heading, Text } from '@radix-ui/themes'
import '@/styles/App.css'

export function ClientSettings() {
  return (
    <div className="content-card settings__card">
      <Heading as="h2" size="6" className="settings__heading">
        Client
      </Heading>
      <Text as="p" size="2" color="gray" className="settings__description">
        Client access, affiliations, and user management. Request access, leave client, office location, and client-level settings.
      </Text>
      <Text as="p" size="2" color="gray">
        Application settings placeholder — Client section. Future: request client access, leave client, user management, office location, contact info.
      </Text>
    </div>
  )
}

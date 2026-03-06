import { Heading, Text } from '@radix-ui/themes'
import '@/styles/App.css'

export function AccountSettings() {
  return (
    <div className="content-card settings__card">
      <Heading as="h2" size="6" className="settings__heading">
        Account
      </Heading>
      <Text as="p" size="2" color="gray" className="settings__description">
        Your account, profile, sign-in, and contact info. Address and personal details will be managed here.
      </Text>
      <Text as="p" size="2" color="gray">
        Application settings placeholder — Account section. Future: profile, address, contact info.
      </Text>
    </div>
  )
}

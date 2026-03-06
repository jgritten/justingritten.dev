import { Heading, Text } from '@radix-ui/themes'
import '@/styles/App.css'

export function ApplicationSettings() {
  return (
    <div className="content-card settings__card">
      <Heading as="h2" size="6" className="settings__heading">
        Application
      </Heading>
      <Text as="p" size="2" color="gray" className="settings__description">
        Theme, display, and app preferences. Use the user menu for Theme settings.
      </Text>
      <Text as="p" size="2" color="gray">
        Application settings placeholder — Application section. Future: theme, display, notifications preferences.
      </Text>
    </div>
  )
}

import { Button, Dialog, Flex, Select, Text } from '@radix-ui/themes'
import { useTheme } from '@/contexts/ThemeContext'
import type {
  ThemeAccentColor,
  ThemeAppearance,
  ThemeGrayColor,
  ThemeRadius,
} from '@/contexts/ThemeContext'
import './ThemeSettingsModal.css'

type ThemeSettingsModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const APPEARANCE_OPTIONS: { value: ThemeAppearance; label: string }[] = [
  { value: 'inherit', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

const ACCENT_OPTIONS: { value: ThemeAccentColor; label: string }[] = [
  { value: 'indigo', label: 'Indigo' },
  { value: 'blue', label: 'Blue' },
  { value: 'cyan', label: 'Cyan' },
  { value: 'teal', label: 'Teal' },
  { value: 'green', label: 'Green' },
  { value: 'grass', label: 'Grass' },
  { value: 'lime', label: 'Lime' },
  { value: 'yellow', label: 'Yellow' },
  { value: 'amber', label: 'Amber' },
  { value: 'orange', label: 'Orange' },
  { value: 'red', label: 'Red' },
  { value: 'crimson', label: 'Crimson' },
  { value: 'pink', label: 'Pink' },
  { value: 'plum', label: 'Plum' },
  { value: 'purple', label: 'Purple' },
  { value: 'violet', label: 'Violet' },
  { value: 'iris', label: 'Iris' },
  { value: 'gray', label: 'Gray' },
]

const GRAY_OPTIONS: { value: ThemeGrayColor; label: string }[] = [
  { value: 'auto', label: 'Auto' },
  { value: 'gray', label: 'Gray' },
  { value: 'mauve', label: 'Mauve' },
  { value: 'slate', label: 'Slate' },
  { value: 'sage', label: 'Sage' },
  { value: 'olive', label: 'Olive' },
  { value: 'sand', label: 'Sand' },
]

const RADIUS_OPTIONS: { value: ThemeRadius; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
  { value: 'full', label: 'Full' },
]

export function ThemeSettingsModal({ open, onOpenChange }: ThemeSettingsModalProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        size="2"
        maxWidth="22rem"
        align="start"
        className="theme-settings-modal__content"
        aria-describedby={undefined}
      >
        <Dialog.Title>Theme settings</Dialog.Title>
        <Text as="p" size="2" color="gray" className="theme-settings-modal__intro">
          Customize the look of the app. Changes are saved automatically.
        </Text>

        <div className="theme-settings-modal__grid">
            <label className="theme-settings-modal__label">
              <Text size="2" weight="medium">Appearance</Text>
              <Select.Root
                value={theme.appearance}
                onValueChange={(v) => setTheme({ appearance: v as ThemeAppearance })}
              >
                <Select.Trigger className="theme-settings-modal__trigger" />
                <Select.Content>
                  {APPEARANCE_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <label className="theme-settings-modal__label">
              <Text size="2" weight="medium">Accent color</Text>
              <Select.Root
                value={theme.accentColor}
                onValueChange={(v) => setTheme({ accentColor: v as ThemeAccentColor })}
              >
                <Select.Trigger className="theme-settings-modal__trigger" />
                <Select.Content>
                  {ACCENT_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <label className="theme-settings-modal__label">
              <Text size="2" weight="medium">Gray scale</Text>
              <Select.Root
                value={theme.grayColor}
                onValueChange={(v) => setTheme({ grayColor: v as ThemeGrayColor })}
              >
                <Select.Trigger className="theme-settings-modal__trigger" />
                <Select.Content>
                  {GRAY_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>

            <label className="theme-settings-modal__label">
              <Text size="2" weight="medium">Radius</Text>
              <Select.Root
                value={theme.radius}
                onValueChange={(v) => setTheme({ radius: v as ThemeRadius })}
              >
                <Select.Trigger className="theme-settings-modal__trigger" />
                <Select.Content>
                  {RADIUS_OPTIONS.map((o) => (
                    <Select.Item key={o.value} value={o.value}>
                      {o.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
            </label>
        </div>

        <Flex gap="3" justify="end" mt="4">
<Dialog.Close>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

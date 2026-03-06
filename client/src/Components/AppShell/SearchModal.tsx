import * as Dialog from '@radix-ui/react-dialog'
import { Button, Text } from '@radix-ui/themes'
import './PlaceholderModal.css'

type SearchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="placeholder-modal__overlay" />
        <Dialog.Content className="placeholder-modal__content" aria-describedby={undefined}>
          <Dialog.Title className="placeholder-modal__title">
            Search
          </Dialog.Title>
          <Text as="p" size="2" color="gray" id="search-description">
            Search here. A table with filters will appear when the feature is available.
          </Text>
          <div className="placeholder-modal__actions">
            <Dialog.Close asChild>
              <Button variant="soft">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

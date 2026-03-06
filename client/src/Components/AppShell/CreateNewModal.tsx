import * as Dialog from '@radix-ui/react-dialog'
import { Button, Text } from '@radix-ui/themes'
import './PlaceholderModal.css'

type CreateNewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNewModal({ open, onOpenChange }: CreateNewModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="placeholder-modal__overlay" />
        <Dialog.Content className="placeholder-modal__content" aria-describedby={undefined}>
          <Dialog.Title className="placeholder-modal__title">
            Create New
          </Dialog.Title>
          <Text as="p" size="2" color="gray" id="create-new-description">
            Create new item here. This will open a wizard when the feature is available.
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

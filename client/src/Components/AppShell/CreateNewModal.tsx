import { Button, Dialog, Flex, Text } from '@radix-ui/themes'

type CreateNewModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateNewModal({ open, onOpenChange }: CreateNewModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="28rem" align="start" aria-describedby={undefined}>
        <Dialog.Title>Create New</Dialog.Title>
        <Text as="p" size="2" color="gray" id="create-new-description">
          Create a new SaaS demo entity here. This will become a multi-step wizard that
          showcases validation, domain modeling, and UX flow.
        </Text>
        <Flex gap="3" justify="end" mt="4">
          <Dialog.Close>
            <Button variant="solid" size="3">
              Close
            </Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

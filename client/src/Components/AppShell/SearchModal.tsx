import { Button, Dialog, Flex, Text } from '@radix-ui/themes'

type SearchModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content size="2" maxWidth="28rem" align="start" aria-describedby={undefined}>
        <Dialog.Title>Search</Dialog.Title>
        <Text as="p" size="2" color="gray" id="search-description">
          Search here. A table with filters will appear when the feature is available.
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

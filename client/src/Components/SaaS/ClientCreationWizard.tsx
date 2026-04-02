import { useState } from 'react'
import { useAuth } from '@clerk/react'
import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes'
import { createTenantClient } from '@/api/saasTenancy'
import type { CreateTenantClientResponse } from '@/api/saasTenancy'

type ClientCreationWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (client: CreateTenantClientResponse) => void
}

export function ClientCreationWizard({ open, onOpenChange, onCreated }: ClientCreationWizardProps) {
  const { getToken } = useAuth()
  const [step, setStep] = useState(1)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setStep(1)
    setName('')
    setError(null)
    setSubmitting(false)
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) reset()
    onOpenChange(next)
  }

  const handleCreate = async () => {
    const token = await getToken()
    if (!token) {
      setError('You need an active session to create a client.')
      return
    }
    const trimmed = name.trim()
    if (trimmed.length === 0) {
      setError('Enter a name for your organization.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const created = await createTenantClient(token, trimmed)
      onCreated(created)
      handleOpenChange(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create client.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Content size="3" maxWidth="28rem" align="start" aria-describedby={undefined}>
        <Dialog.Title>Create client</Dialog.Title>
        <Flex direction="column" gap="3" mt="2">
          {step === 1 ? (
            <>
              <Text as="p" size="2" color="gray">
                Name the organization or team this workspace is for. You&apos;ll land on its dashboard when
                creation succeeds.
              </Text>
              <label>
                <Text as="span" size="2" weight="medium">
                  Client name
                </Text>
                <TextField.Root
                  mt="1"
                  placeholder="e.g. Northwind Legal"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={200}
                />
              </label>
              {error ? (
                <Text as="p" size="2" color="red">
                  {error}
                </Text>
              ) : null}
              <Flex gap="2" justify="end" mt="2">
                <Dialog.Close>
                  <Button type="button" variant="soft" size="2">
                    Cancel
                  </Button>
                </Dialog.Close>
                <Button
                  type="button"
                  size="2"
                  disabled={name.trim().length === 0}
                  onClick={() => setStep(2)}
                >
                  Next
                </Button>
              </Flex>
            </>
          ) : (
            <>
              <Text as="p" size="2" color="gray">
                You&apos;re about to create <strong>{name.trim()}</strong> and become its owner.
              </Text>
              {error ? (
                <Text as="p" size="2" color="red">
                  {error}
                </Text>
              ) : null}
              <Flex gap="2" justify="end" mt="2">
                <Button type="button" variant="soft" size="2" disabled={submitting} onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="button" size="2" loading={submitting} onClick={() => void handleCreate()}>
                  Create client
                </Button>
              </Flex>
            </>
          )}
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  )
}

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, Dialog, Flex, Text } from '@radix-ui/themes'
import '@/styles/App.css'
import './CrudSlidePanel.css'

const SUCCESS_MS = 900

export type CrudSlidePanelProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: ReactNode
  children: ReactNode
  /** When true, Cancel / backdrop close shows a discard confirmation first. */
  isDirty: boolean
  onSave: () => void | Promise<void>
  saveLabel?: string
  cancelLabel?: string
  /** Shown as the main child while the panel is open; use for list/table area. */
  main: ReactNode
}

export function CrudSlidePanel({
  open,
  onOpenChange,
  title,
  children,
  isDirty,
  onSave,
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  main,
}: CrudSlidePanelProps) {
  const [discardOpen, setDiscardOpen] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!open) {
      setSaveSuccess(false)
      setDiscardOpen(false)
      setSaving(false)
      clearCloseTimer()
    }
  }, [open, clearCloseTimer])

  useEffect(() => () => clearCloseTimer(), [clearCloseTimer])

  const requestClose = useCallback(() => {
    if (!isDirty) {
      onOpenChange(false)
      return
    }
    setDiscardOpen(true)
  }, [isDirty, onOpenChange])

  const confirmDiscard = useCallback(() => {
    setDiscardOpen(false)
    onOpenChange(false)
  }, [onOpenChange])

  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      await onSave()
      setSaveSuccess(true)
      clearCloseTimer()
      closeTimerRef.current = setTimeout(() => {
        setSaveSuccess(false)
        onOpenChange(false)
      }, SUCCESS_MS)
    } finally {
      setSaving(false)
    }
  }, [onSave, onOpenChange, clearCloseTimer])

  return (
    <div className="crud-slide-panel-layout">
      <div className="crud-slide-panel-layout__main">{main}</div>

      {open && (
        <button
          type="button"
          className="crud-slide-panel-layout__backdrop"
          aria-label="Close panel"
          onClick={() => requestClose()}
        />
      )}

      <aside
        className={`crud-slide-panel-layout__aside${open ? ' crud-slide-panel-layout__aside--open' : ''}`}
        aria-hidden={!open}
      >
        <div
          className="content-card crud-slide-panel__surface crud-slide-panel-layout__aside-inner"
          style={{ position: 'relative' }}
        >
          <header className="crud-slide-panel__header">
            {title ? (
              <h2 className="crud-slide-panel__title" id="crud-slide-panel-title">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <div className="crud-slide-panel__actions">
              <Button type="button" variant="soft" color="gray" disabled={saving} onClick={requestClose}>
                {cancelLabel}
              </Button>
              <Button type="button" disabled={saving || saveSuccess} loading={saving} onClick={handleSave}>
                {saveLabel}
              </Button>
            </div>
          </header>
          <div
            className="crud-slide-panel__body"
            role="region"
            aria-labelledby={title ? 'crud-slide-panel-title' : undefined}
          >
            {children}
          </div>
          {saveSuccess ? (
            <div className="crud-slide-panel__success">
              <Text size="3" weight="medium">
                Saved
              </Text>
            </div>
          ) : null}
        </div>
      </aside>

      <Dialog.Root open={discardOpen} onOpenChange={setDiscardOpen}>
        <Dialog.Content style={{ maxWidth: 420 }}>
          <Dialog.Title>Discard changes?</Dialog.Title>
          <Dialog.Description size="2" color="gray">
            You have unsaved changes. Discard them and close the editor?
          </Dialog.Description>
          <Flex direction="column" gap="3" mt="2">
            <Flex gap="2" justify="end" wrap="wrap">
              <Button type="button" variant="soft" onClick={() => setDiscardOpen(false)}>
                Stay
              </Button>
              <Button type="button" color="red" variant="solid" onClick={confirmDiscard}>
                Discard
              </Button>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </div>
  )
}

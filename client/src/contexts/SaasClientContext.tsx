import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type SaasClient = {
  id: string
  name: string
  logoUrl?: string
}

type SaasClientContextValue = {
  activeClient: SaasClient | null
  setActiveClient: (client: SaasClient | null) => void
}

const SaasClientContext = createContext<SaasClientContextValue | null>(null)

export function useSaasClient(): SaasClientContextValue {
  const ctx = useContext(SaasClientContext)
  if (!ctx) {
    throw new Error('useSaasClient must be used within SaasClientProvider')
  }
  return ctx
}

export function SaasClientProvider({ children }: { children: ReactNode }) {
  const [activeClient, setActiveClientState] = useState<SaasClient | null>(null)

  const setActiveClient = useCallback((client: SaasClient | null) => {
    setActiveClientState(client)
  }, [])

  const value = useMemo(
    () => ({ activeClient, setActiveClient }),
    [activeClient, setActiveClient]
  )

  return <SaasClientContext.Provider value={value}>{children}</SaasClientContext.Provider>
}


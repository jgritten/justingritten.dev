import { Theme } from '@radix-ui/themes'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

const STORAGE_KEY = 'justingritten-theme'

export type ThemeAppearance = 'light' | 'dark' | 'inherit'
export type ThemeAccentColor =
  | 'gray'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'plum'
  | 'crimson'
  | 'red'
  | 'tomato'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'grass'
  | 'teal'
  | 'cyan'
  | 'mint'
  | 'sky'
  | 'iris'
  | 'jade'
  | 'ruby'
  | 'gold'
  | 'bronze'
  | 'brown'
  | 'pink'
export type ThemeGrayColor = 'auto' | 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand'
export type ThemeRadius = 'none' | 'small' | 'medium' | 'large' | 'full'

export interface ThemeState {
  appearance: ThemeAppearance
  accentColor: ThemeAccentColor
  grayColor: ThemeGrayColor
  radius: ThemeRadius
}

const defaultTheme: ThemeState = {
  appearance: 'inherit',
  accentColor: 'indigo',
  grayColor: 'auto',
  radius: 'medium',
}

function loadTheme(): ThemeState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultTheme
    const parsed = JSON.parse(raw) as Partial<ThemeState>
    return {
      appearance: parsed.appearance ?? defaultTheme.appearance,
      accentColor: parsed.accentColor ?? defaultTheme.accentColor,
      grayColor: parsed.grayColor ?? defaultTheme.grayColor,
      radius: parsed.radius ?? defaultTheme.radius,
    }
  } catch {
    return defaultTheme
  }
}

function saveTheme(theme: ThemeState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(theme))
  } catch {
    // ignore
  }
}

interface ThemeContextValue {
  theme: ThemeState
  setTheme: (next: Partial<ThemeState>) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}

/** True when the effective theme is dark (explicit dark or system preference when appearance is inherit). */
export function useIsDarkTheme(): boolean {
  const { theme } = useTheme()
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setSystemDark(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])

  if (theme.appearance === 'dark') return true
  if (theme.appearance === 'light') return false
  return systemDark
}

interface ThemeProviderProps {
  children: ReactNode
}

/** Resolved to 'light' | 'dark' for Radix Theme (so System becomes explicit). */
function useResolvedAppearance(appearance: ThemeAppearance): 'light' | 'dark' {
  const [systemDark, setSystemDark] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  )
  useEffect(() => {
    const m = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => setSystemDark(m.matches)
    m.addEventListener('change', handler)
    return () => m.removeEventListener('change', handler)
  }, [])
  if (appearance === 'dark') return 'dark'
  if (appearance === 'light') return 'light'
  return systemDark ? 'dark' : 'light'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeState>(loadTheme)
  const resolvedAppearance = useResolvedAppearance(theme.appearance)

  /* Sync data-theme to document so we can style body (e.g. dark background overlay) by theme */
  useEffect(() => {
    const root = document.documentElement
    root.dataset.theme = resolvedAppearance
  }, [resolvedAppearance])

  const setTheme = useCallback((next: Partial<ThemeState>) => {
    setThemeState((prev) => {
      const nextState = { ...prev, ...next }
      saveTheme(nextState)
      return nextState
    })
  }, [])

  const value = useMemo(
    () => ({ theme, setTheme }),
    [theme, setTheme]
  )

  return (
    <Theme
      appearance={resolvedAppearance}
      accentColor={theme.accentColor}
      grayColor={theme.grayColor}
      radius={theme.radius}
      hasBackground={false}
    >
      <ThemeContext.Provider value={value}>
        {children}
      </ThemeContext.Provider>
    </Theme>
  )
}

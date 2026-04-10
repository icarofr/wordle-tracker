import { createSignal, onCleanup } from 'solid-js'

type Theme = 'light' | 'dark' | 'system'
type AppliedTheme = 'light' | 'dark'

const isBrowser = typeof window !== 'undefined'
const isStorageAvailable = typeof localStorage !== 'undefined'

function getSystemTheme(): AppliedTheme {
  return isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

function getStoredTheme(): Theme | null {
  return isStorageAvailable ? (localStorage.getItem('theme') as Theme | null) : null
}

function storeTheme(theme: Theme) {
  if (isStorageAvailable)
    localStorage.setItem('theme', theme)
}

function clearStoredTheme() {
  if (isStorageAvailable)
    localStorage.removeItem('theme')
}

function resolveTheme(theme: Theme): AppliedTheme {
  return theme === 'system' ? getSystemTheme() : theme
}

function updateDOMTheme(appliedTheme: AppliedTheme) {
  if (isBrowser) {
    const root = document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(appliedTheme)
  }
}

function applyTheme(theme: Theme) {
  const appliedTheme = resolveTheme(theme)
  updateDOMTheme(appliedTheme)

  if (theme === 'system') {
    clearStoredTheme()
  }
  else {
    storeTheme(theme)
  }
}

function createThemeSignal() {
  const storedTheme = getStoredTheme()
  const initialTheme: Theme = storedTheme ?? 'system'
  const [theme, setTheme] = createSignal<Theme>(initialTheme)

  // Apply the initial theme
  applyTheme(initialTheme)

  if (isBrowser) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (e: MediaQueryListEvent) => {
      // Only react to system changes if theme is set to "system"
      if (theme() === 'system') {
        const systemTheme = e.matches ? 'dark' : 'light'
        updateDOMTheme(systemTheme)
      }
    }
    mediaQuery.addEventListener('change', listener)
    onCleanup(() => mediaQuery.removeEventListener('change', listener))
  }

  return [theme, setTheme] as const
}

const [theme, setTheme] = createThemeSignal()

export function useTheme() {
  const toggleTheme = () => {
    const current = theme()
    let next: Theme

    switch (current) {
      case 'light':
        next = 'dark'
        break
      case 'dark':
        next = 'system'
        break
      case 'system':
        next = 'light'
        break
      default:
        next = 'light'
    }

    setTheme(next)
    applyTheme(next)
  }

  const getAppliedTheme = (): AppliedTheme => resolveTheme(theme())

  return {
    theme,
    appliedTheme: getAppliedTheme,
    toggleTheme,
    setTheme: (newTheme: Theme) => {
      setTheme(newTheme)
      applyTheme(newTheme)
    },
  }
}

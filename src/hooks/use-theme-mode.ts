import { useEffect, useState } from 'react'
import { getStoredThemeMode, setStoredThemeMode } from '../lib/storage'
import { applyThemeMode, type ThemeMode } from '../lib/theme'

export function useThemeMode() {
  const [theme, setTheme] = useState<ThemeMode>(() => getStoredThemeMode())

  useEffect(() => {
    applyThemeMode(theme)
    setStoredThemeMode(theme)
  }, [theme])

  function toggleTheme() {
    setTheme((current) => (current === 'light' ? 'dark' : 'light'))
  }

  return { theme, setTheme, toggleTheme }
}

export type ThemeMode = 'light' | 'dark'

export function applyThemeMode(theme: ThemeMode) {
  document.documentElement.classList.toggle('theme-dark', theme === 'dark')
  document.documentElement.dataset.theme = theme
}

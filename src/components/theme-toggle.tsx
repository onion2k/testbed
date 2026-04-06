import type { ThemeMode } from '../lib/theme'

export function ThemeToggle({ theme, onToggle }: { theme: ThemeMode; onToggle: () => void }) {
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={onToggle}
      className="theme-toggle inline-flex items-center gap-3 rounded-full border border-stone-300 bg-stone-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-stone-100"
    >
      <span className="theme-toggle-label text-xs uppercase tracking-[0.18em] text-slate-500">{isDark ? 'Dark' : 'Light'}</span>
      <span className={`theme-toggle-track relative h-6 w-11 rounded-full transition ${isDark ? 'bg-slate-900' : 'bg-stone-300'}`}>
        <span
          className={`theme-toggle-thumb absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0'}`}
        />
      </span>
    </button>
  )
}

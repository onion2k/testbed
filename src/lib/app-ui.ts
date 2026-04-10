import type { ScenarioPreset, TestControlsConfig } from '../types'

export function inputClass(hasError: boolean) {
  return `w-full rounded-2xl border px-4 py-3 outline-none transition ${
    hasError
      ? 'border-rose-500 bg-rose-50 focus:border-rose-600'
      : 'border-stone-300 focus:border-slate-500'
  }`
}

export function createDownload(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

export function arePresetValuesModified(config: TestControlsConfig | null, presets: ScenarioPreset[]) {
  if (!config?.activePresetId) return false

  const preset = presets.find((candidate) => candidate.id === config.activePresetId)
  if (!preset) return false

  return (
    JSON.stringify(preset.breakModes) !== JSON.stringify(config.breakModes) ||
    JSON.stringify(preset.faults) !== JSON.stringify(config.faults)
  )
}

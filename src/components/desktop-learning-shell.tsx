import type { ReactNode } from 'react'

export const desktopTabOptions = [
  ['dashboard', 'Dashboard'],
  ['workshops', 'Workshops'],
  ['articles', 'Articles'],
  ['catalog', 'Products & Orders'],
  ['users', 'Users'],
  ['break-modes', 'Break Modes'],
  ['scenarios', 'Scenarios & Faults'],
  ['tracing', 'Tracing'],
  ['postman', 'Postman'],
  ['data-folder', 'Data Folder'],
  ['server', 'Server'],
] as const

export type DesktopTab = (typeof desktopTabOptions)[number][0]
type CategoricalEntry = { category: string; title: string; summary: string }
export type GroupedEntries<T extends { category: string }> = Record<string, T[]>

export function groupEntriesByCategory<T extends { category: string }>(entries: T[]): GroupedEntries<T> {
  return entries.reduce<GroupedEntries<T>>((groups, entry) => {
    groups[entry.category] = [...(groups[entry.category] ?? []), entry]
    return groups
  }, {})
}

export function filterCategoricalEntries<T extends CategoricalEntry>(entries: T[], search: string, categoryFilter: string) {
  const normalizedSearch = search.trim().toLowerCase()

  return entries.filter((entry) => {
    const matchesSearch =
      !normalizedSearch || `${entry.title} ${entry.summary} ${entry.category}`.toLowerCase().includes(normalizedSearch)
    const matchesCategory = categoryFilter === 'All categories' || entry.category === categoryFilter
    return matchesSearch && matchesCategory
  })
}

export function LearningLibrarySections<T extends { category: string }>({
  groupedEntries,
  emptyMessage,
  compact = false,
  renderItem,
}: {
  groupedEntries: GroupedEntries<T>
  emptyMessage: string
  compact?: boolean
  renderItem: (entry: T) => ReactNode
}) {
  if (Object.keys(groupedEntries).length === 0) {
    return (
      <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-600">
        {emptyMessage}
      </p>
    )
  }

  return Object.entries(groupedEntries).map(([category, entries]) => (
    <section key={category}>
      <h3 className={`${compact ? 'text-[11px]' : 'text-xs'} font-semibold uppercase tracking-[0.2em] text-slate-500`}>
        {category}
      </h3>
      <div className={`${compact ? 'mt-2' : 'mt-3'} space-y-2`}>{entries.map((entry) => renderItem(entry))}</div>
    </section>
  ))
}

export function CompactLibraryDisclosure({
  label,
  currentTitle,
  children,
}: {
  label: string
  currentTitle: string
  children: ReactNode
}) {
  return (
    <details className="rounded-[1.5rem] border border-stone-300 bg-white p-3 shadow-sm sm:p-4">
      <summary className="cursor-pointer list-none text-left">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{label}</p>
            <p className="truncate text-sm font-semibold text-slate-900">{currentTitle}</p>
          </div>
          <span className="rounded-full bg-stone-100 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
            Browse
          </span>
        </div>
      </summary>

      <div className="mt-3">{children}</div>
    </details>
  )
}

export function LearningShellPanel({
  hidden,
  title,
  heading,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  filterValue,
  onFilterChange,
  categories,
  inputClassName,
  compact = false,
  children,
}: {
  hidden?: boolean
  title: string
  heading: string
  description?: string
  searchValue: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  filterValue: string
  onFilterChange: (value: string) => void
  categories: string[]
  inputClassName: string
  compact?: boolean
  children: ReactNode
}) {
  const filterControl = (
    <select className={inputClassName} value={filterValue} onChange={(event) => onFilterChange(event.target.value)}>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>
  )

  const searchControl = (
    <input
      value={searchValue}
      onChange={(event) => onSearchChange(event.target.value)}
      placeholder={searchPlaceholder}
      className={inputClassName}
    />
  )

  if (compact) {
    return (
      <div>
        <div className="grid gap-2">
          {filterControl}
          {searchControl}
        </div>
        <div className="mt-3 max-h-[34vh] space-y-4 overflow-y-auto pr-1">{children}</div>
      </div>
    )
  }

  return (
    <aside className={`${hidden ? 'hidden' : 'flex'} min-h-0 flex-col rounded-[2rem] border border-stone-300 bg-white p-4 shadow-sm sm:p-5`}>
      <div className="shrink-0">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">{title}</p>
        <h2 className="mt-2 text-2xl font-semibold sm:mt-3 sm:text-3xl">{heading}</h2>
        {description ? <p className="mt-2 text-sm text-slate-600 sm:mt-3">{description}</p> : null}
        <div className="mt-4 grid gap-2 sm:gap-3">
          {searchControl}
          {filterControl}
        </div>
      </div>
      <div className="mt-5 min-h-0 space-y-5 overflow-y-auto pr-1">{children}</div>
    </aside>
  )
}

export function LearningContentHeader({
  compact,
  category,
  title,
  summary,
  meta,
  action,
}: {
  compact: boolean
  category: string
  title: string
  summary?: string
  meta: string
  action?: ReactNode
}) {
  return (
    <div className={`shrink-0 rounded-[1.5rem] border border-stone-200 bg-stone-50 ${compact ? 'p-3' : 'p-4 sm:p-5'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className={`${compact ? 'text-[11px]' : 'text-sm'} font-semibold uppercase tracking-[0.18em] text-slate-500`}>
            {category}
          </p>
          <h2 className={`${compact ? 'mt-1 text-xl' : 'mt-2 text-2xl sm:mt-3 sm:text-3xl xl:text-4xl'} font-semibold tracking-tight text-slate-900`}>
            {title}
          </h2>
          {!compact && summary ? <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:mt-3 sm:text-base">{summary}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`rounded-full border border-stone-200 bg-white ${compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'} font-medium text-slate-600`}>
            {meta}
          </span>
          {action}
        </div>
      </div>
    </div>
  )
}

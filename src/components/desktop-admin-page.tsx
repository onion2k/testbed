import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { MarkdownDocument } from './markdown-document'
import { ThemeToggle } from './theme-toggle'
import {
  CompactLibraryDisclosure,
  desktopTabOptions,
  filterCategoricalEntries,
  groupEntriesByCategory,
  LearningContentHeader,
  LearningLibrarySections,
  LearningShellPanel,
  type DesktopTab,
} from './desktop-learning-shell'
import {
  demoConfig,
  loadRuntimeConfig,
  setRuntimeBreakModes,
} from '../lib/demo-config'
import {
  applyScenarioPreset,
  clearRequestTraces,
  createUser,
  deleteUser,
  fetchAdminSnapshot,
  fetchPostmanCollection,
  fetchPostmanEnvironment,
  fetchRequestTraces,
  fetchScenarioPresets,
  fetchTestControlsConfig,
  refreshDesktopContext,
  resetBreakModes,
  resetRuntimeData,
  saveBreakModes,
  updateProduct,
  updateTestControlsConfig,
  updateTracingConfig,
  updateUser,
} from '../lib/demo-api'
import { articleEntries, defaultArticleSlug } from '../lib/articles'
import { arePresetValuesModified, createDownload, inputClass } from '../lib/app-ui'
import {
  getDesktopPreferences,
  getStoredArticleLastView,
  getStoredArticleReadProgress,
  getStoredWorkshopLastView,
  getStoredWorkshopProgress,
  getStoredWorkshopQuizProgress,
  getStoredWorkshopReadParts,
  resetDemoState,
  resetWorkshopProgress,
  setDesktopPreferences,
  setStoredArticleLastView,
  setStoredArticleReadProgress,
  setStoredWorkshopLastView,
  setStoredWorkshopProgress,
  setStoredWorkshopQuizProgress,
  setStoredWorkshopReadParts,
  updateRecentLearningItem,
} from '../lib/storage'
import { currency, shuffleItems } from '../lib/formatting'
import type { ThemeMode } from '../lib/theme'
import { validateManagedUser } from '../lib/validation'
import { defaultWorkshopSlug, workshopEntries } from '../lib/workshops'
import type {
  AdminSnapshot,
  BreakModes,
  DemoUser,
  DesktopContext,
  EndpointFaultConfig,
  EndpointKey,
  FaultResponseMode,
  RequestTraceEntry,
  Role,
  ScenarioPreset,
  TestControlsConfig,
} from '../types'

function generateStrongPassword(length = 16) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*'
  const bytes = new Uint32Array(length)
  window.crypto.getRandomValues(bytes)

  return Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('')
}

const endpointKeys: EndpointKey[] = [
  'auth.login',
  'runtime.bootstrap',
  'shop.products',
  'orders.list',
  'orders.create',
  'admin.overview',
  'admin.users.list',
  'admin.users.create',
  'admin.users.update',
  'admin.users.delete',
  'admin.products.update',
  'admin.resetRuntime',
  'desktop.context',
]

const endpointLabels: Record<EndpointKey, string> = {
  'auth.login': 'Auth login',
  'runtime.bootstrap': 'Runtime bootstrap',
  'shop.products': 'Shop products',
  'orders.list': 'Orders list',
  'orders.create': 'Orders create',
  'admin.overview': 'Admin overview',
  'admin.users.list': 'Admin users list',
  'admin.users.create': 'Admin users create',
  'admin.users.update': 'Admin users update',
  'admin.users.delete': 'Admin users delete',
  'admin.products.update': 'Admin product update',
  'admin.resetRuntime': 'Admin reset runtime',
  'desktop.context': 'Desktop context',
}

const faultModes: FaultResponseMode[] = [
  'http-error',
  'malformed-json',
  'missing-fields',
  'wrong-types',
  'empty-body',
  'stale-success',
]

const faultStatuses: EndpointFaultConfig['status'][] = [200, 400, 401, 403, 404, 409, 422, 500, 503]

const isDesktop = Boolean(window.desktopBridge?.isDesktop)
type WorkshopEntry = (typeof workshopEntries)[number]
type ArticleEntry = (typeof articleEntries)[number]

export function DesktopAdminPage({ theme, onToggleTheme }: { theme: ThemeMode; onToggleTheme: () => void }) {
  const desktopPreferences = getDesktopPreferences()
  const initialWorkshopLastView = getStoredWorkshopLastView()
  const initialArticleLastView = getStoredArticleLastView()
  const [tab, setTab] = useState<DesktopTab>(
    desktopPreferences.lastDesktopTab === 'articles' ? 'articles' : desktopPreferences.lastDesktopTab === 'workshops' ? 'workshops' : 'dashboard',
  )
  const [selectedArticleSlug, setSelectedArticleSlug] = useState(initialArticleLastView?.articleSlug ?? defaultArticleSlug)
  const [selectedWorkshopSlug, setSelectedWorkshopSlug] = useState(initialWorkshopLastView?.workshopSlug ?? defaultWorkshopSlug)
  const [selectedWorkshopPartSlug, setSelectedWorkshopPartSlug] = useState(initialWorkshopLastView?.partSlug ?? workshopEntries[0]?.parts[0]?.slug ?? 'overview')
  const [workshopResetVersion, setWorkshopResetVersion] = useState(0)
  const [workshopProgress, setWorkshopProgress] = useState<Record<string, number>>(() => getStoredWorkshopProgress())
  const [readWorkshopParts, setReadWorkshopParts] = useState<Record<string, boolean>>(() => getStoredWorkshopReadParts())
  const [workshopQuizProgress, setWorkshopQuizProgress] = useState<Record<string, boolean>>(() => getStoredWorkshopQuizProgress())
  const [articleReadProgress, setArticleReadProgress] = useState<Record<string, boolean>>(() => getStoredArticleReadProgress())
  const [workshopSearch, setWorkshopSearch] = useState('')
  const [workshopCategoryFilter, setWorkshopCategoryFilter] = useState('All categories')
  const [articleSearch, setArticleSearch] = useState('')
  const [articleCategoryFilter, setArticleCategoryFilter] = useState('All categories')
  const [dismissedWelcome, setDismissedWelcome] = useState(Boolean(desktopPreferences.dismissedWelcome))
  const [recentLearningItems, setRecentLearningItems] = useState(desktopPreferences.recentLearningItems ?? [])
  const [traceEndpointFilter, setTraceEndpointFilter] = useState('all')
  const [traceStatusFilter, setTraceStatusFilter] = useState('all')
  const [quizSelections, setQuizSelections] = useState<Record<string, string>>({})
  const [quizFeedback, setQuizFeedback] = useState<Record<string, string | null>>({})
  const [overview, setOverview] = useState<AdminSnapshot | null>(null)
  const [context, setContext] = useState<DesktopContext | null>(null)
  const [testControls, setTestControls] = useState<TestControlsConfig | null>(null)
  const [presets, setPresets] = useState<ScenarioPreset[]>([])
  const [traces, setTraces] = useState<RequestTraceEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userForm, setUserForm] = useState<DemoUser>({
    username: '',
    password: '',
    displayName: '',
    role: 'customer',
  })
  const [editingUsername, setEditingUsername] = useState<string | null>(null)
  const [userErrors, setUserErrors] = useState<Partial<Record<keyof DemoUser, string>>>({})
  const [savingUser, setSavingUser] = useState(false)
  const [savingBreakModes, setSavingBreakModes] = useState(false)
  const [savingFaults, setSavingFaults] = useState(false)
  const [savingTracing, setSavingTracing] = useState(false)
  const [routePanelMode, setRoutePanelMode] = useState<'website' | 'api'>('website')
  const [viewportSize, setViewportSize] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const presetModified = useMemo(() => arePresetValuesModified(testControls, presets), [presets, testControls])
  const introductionWorkshop = workshopEntries[0] ?? null
  const selectedWorkshop =
    workshopEntries.find((entry) => entry.slug === selectedWorkshopSlug) ?? workshopEntries[0] ?? null
  const selectedWorkshopPart =
    selectedWorkshop?.parts.find((part) => part.slug === selectedWorkshopPartSlug) ??
    selectedWorkshop?.parts[0] ??
    null
  const selectedWorkshopPartIndex = selectedWorkshop?.parts.findIndex((part) => part.slug === selectedWorkshopPart?.slug) ?? -1
  const selectedWorkshopPartKey =
    selectedWorkshop && selectedWorkshopPart ? `${selectedWorkshop.slug}:${selectedWorkshopPart.slug}` : null
  const selectedWorkshopQuizKey =
    selectedWorkshop && selectedWorkshopPart?.quiz
      ? `${selectedWorkshop.slug}:${selectedWorkshopPart.slug}:${selectedWorkshopPart.quiz.id}`
      : null
  const shuffledSelectedWorkshopQuizOptions = useMemo(() => {
    if (!selectedWorkshopPart?.quiz) return []
    return shuffleItems(selectedWorkshopPart.quiz.options)
  }, [selectedWorkshopQuizKey, selectedWorkshopPart?.quiz])
  const isSelectedWorkshopPartRead = selectedWorkshopPartKey ? Boolean(readWorkshopParts[selectedWorkshopPartKey]) : false
  const isSelectedWorkshopQuizPassed =
    !selectedWorkshopPart?.quiz || (selectedWorkshopQuizKey ? Boolean(workshopQuizProgress[selectedWorkshopQuizKey]) : false)
  const unlockedWorkshopPartIndex = selectedWorkshop
    ? Math.max(0, Math.min(workshopProgress[selectedWorkshop.slug] ?? 0, selectedWorkshop.parts.length - 1))
    : 0
  const effectiveUnlockedWorkshopPartIndex = selectedWorkshop
    ? Math.max(
        unlockedWorkshopPartIndex,
        isSelectedWorkshopPartRead && isSelectedWorkshopQuizPassed
          ? Math.min(selectedWorkshopPartIndex + 1, selectedWorkshop.parts.length - 1)
          : unlockedWorkshopPartIndex,
        selectedWorkshop.parts.length > 1 ? 1 : 0,
      )
    : 0
  const groupedWorkshops = useMemo(() => groupEntriesByCategory(workshopEntries), [])
  const groupedArticles = useMemo(() => groupEntriesByCategory(articleEntries), [])
  const workshopCategories = useMemo(() => ['All categories', ...Object.keys(groupedWorkshops)], [groupedWorkshops])
  const articleCategories = useMemo(() => ['All categories', ...Object.keys(groupedArticles)], [groupedArticles])
  const filteredWorkshops = useMemo(
    () => filterCategoricalEntries(workshopEntries, workshopSearch, workshopCategoryFilter),
    [workshopCategoryFilter, workshopSearch],
  )
  const filteredArticles = useMemo(
    () => filterCategoricalEntries(articleEntries, articleSearch, articleCategoryFilter),
    [articleCategoryFilter, articleSearch],
  )
  const groupedFilteredWorkshops = useMemo(() => groupEntriesByCategory(filteredWorkshops), [filteredWorkshops])
  const groupedFilteredArticles = useMemo(() => groupEntriesByCategory(filteredArticles), [filteredArticles])
  const selectedArticle = articleEntries.find((entry) => entry.slug === selectedArticleSlug) ?? articleEntries[0] ?? null
  const workshopContentRef = useRef<HTMLDivElement | null>(null)
  const articleContentRef = useRef<HTMLDivElement | null>(null)
  const filteredTraces = useMemo(
    () =>
      traces.filter((trace) => {
        const matchesEndpoint = traceEndpointFilter === 'all' || trace.endpointKey === traceEndpointFilter
        const matchesStatus = traceStatusFilter === 'all' || String(trace.responseStatus) === traceStatusFilter
        return matchesEndpoint && matchesStatus
      }),
    [traceEndpointFilter, traceStatusFilter, traces],
  )
  const completedWorkshopCount = workshopEntries.filter((workshop) => isWorkshopComplete(workshop.slug)).length
  const completedArticleCount = articleEntries.filter((article) => articleReadProgress[article.slug]).length
  const isCompactDesktopShell = viewportSize.width < 1100 || viewportSize.height < 820
  const isSinglePaneLearning = viewportSize.width < 1280 || viewportSize.height < 900

  useEffect(() => {
    function handleResize() {
      setViewportSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  function isWorkshopComplete(workshopSlug: string) {
    const workshop = workshopEntries.find((entry) => entry.slug === workshopSlug)
    if (!workshop || workshop.parts.length === 0) return false

    const lastPart = workshop.parts[workshop.parts.length - 1]
    const lastPartKey = `${workshop.slug}:${lastPart.slug}`
    const lastPartRead = Boolean(readWorkshopParts[lastPartKey])
    const lastQuizPassed = !lastPart.quiz || Boolean(workshopQuizProgress[`${workshop.slug}:${lastPart.slug}:${lastPart.quiz.id}`])

    return lastPartRead && lastQuizPassed
  }

  const isIntroductionComplete = introductionWorkshop ? isWorkshopComplete(introductionWorkshop.slug) : true

  function renderWorkshopLibraryItem(workshop: WorkshopEntry, compact = false) {
    const isActive = workshop.slug === selectedWorkshop?.slug
    const isLocked = !isIntroductionComplete && workshop.slug !== introductionWorkshop?.slug
    const isCompleted = isWorkshopComplete(workshop.slug)

    return (
      <button
        key={workshop.slug}
        type="button"
        onClick={() => {
          if (isLocked) return
          setSelectedWorkshopSlug(workshop.slug)
        }}
        className={`block w-full border text-left transition ${compact ? 'rounded-[1.25rem] px-3 py-2.5' : 'rounded-[1.5rem] px-4 py-3'} ${
          isActive
            ? 'border-slate-900 bg-slate-900 text-white'
            : isLocked
              ? 'border-stone-200 bg-stone-100 text-stone-400'
              : 'border-stone-200 bg-stone-50 text-slate-700 hover:border-stone-300 hover:bg-white'
        }`}
        disabled={isLocked}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold">{workshop.title}</p>
          {isLocked ? (
            <span className="rounded-full bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              Locked
            </span>
          ) : isCompleted ? (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                isActive ? 'bg-white/15 text-slate-100' : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {compact ? 'Done' : 'Completed'}
            </span>
          ) : (
            <span className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${isActive ? 'bg-white/15 text-slate-100' : 'bg-stone-200 text-stone-600'}`}>
              {workshop.estimatedEffort}
            </span>
          )}
        </div>
        {!compact ? (
          <p className={`mt-2 text-sm ${isActive ? 'text-slate-200' : isLocked ? 'text-stone-500' : 'text-slate-600'}`}>
            {isLocked
              ? 'Complete Introduction to Testbed to unlock this workshop.'
              : isCompleted
                ? 'Completed.'
                : workshop.summary}
          </p>
        ) : null}
      </button>
    )
  }

  function renderArticleLibraryItem(article: ArticleEntry) {
    const isActive = article.slug === selectedArticle?.slug

    return (
      <button
        key={article.slug}
        type="button"
        onClick={() => setSelectedArticleSlug(article.slug)}
        className={`block w-full rounded-[1.5rem] border px-4 py-3 text-left transition ${
          isActive
            ? 'border-slate-900 bg-slate-900 text-white'
            : 'border-stone-200 bg-stone-50 text-slate-700 hover:border-stone-300 hover:bg-white'
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="font-semibold">{article.title}</p>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
              isActive
                ? 'bg-white/15 text-slate-100'
                : articleReadProgress[article.slug]
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-stone-200 text-stone-600'
            }`}
          >
            {articleReadProgress[article.slug] ? 'Read' : article.readingLength}
          </span>
        </div>
        <p className={`mt-2 text-sm ${isActive ? 'text-slate-200' : 'text-slate-600'}`}>{article.summary}</p>
      </button>
    )
  }

  function updateWorkshopProgress(workshopSlug: string, nextUnlockedIndex: number) {
    setWorkshopProgress((current) => {
      const previous = current[workshopSlug] ?? 0
      const nextValue = Math.max(previous, nextUnlockedIndex)
      if (nextValue === previous) {
        return current
      }

      const next = {
        ...current,
        [workshopSlug]: nextValue,
      }
      setStoredWorkshopProgress(next)
      return next
    })
  }

  function markWorkshopPartRead(partKey: string) {
    setReadWorkshopParts((current) => {
      if (current[partKey]) {
        return current
      }

      const next = {
        ...current,
        [partKey]: true,
      }
      setStoredWorkshopReadParts(next)
      return next
    })
  }

  function markWorkshopQuizPassed(quizKey: string) {
    setWorkshopQuizProgress((current) => {
      if (current[quizKey]) {
        return current
      }

      const next = {
        ...current,
        [quizKey]: true,
      }
      setStoredWorkshopQuizProgress(next)
      return next
    })
  }

  function markArticleRead(articleSlug: string) {
    setArticleReadProgress((current) => {
      if (current[articleSlug]) {
        return current
      }

      const next = {
        ...current,
        [articleSlug]: true,
      }
      setStoredArticleReadProgress(next)
      return next
    })
  }

  function persistDesktopPreference(update: Partial<ReturnType<typeof getDesktopPreferences>>) {
    const next = {
      ...getDesktopPreferences(),
      ...update,
    }
    setDesktopPreferences(next)
  }

  function rememberLearningItem(item: { kind: 'workshop' | 'article'; slug: string; title: string }) {
    updateRecentLearningItem(item)
    setRecentLearningItems(getDesktopPreferences().recentLearningItems ?? [])
  }

  function checkWorkshopPartCompletion() {
    const content = workshopContentRef.current
    if (!content || !selectedWorkshop || !selectedWorkshopPartKey || selectedWorkshopPartIndex < 0) return

    const isAtBottom = content.scrollTop + content.clientHeight >= content.scrollHeight - 24
    const fitsInView = content.scrollHeight <= content.clientHeight + 24

    if (isAtBottom || fitsInView) {
      markWorkshopPartRead(selectedWorkshopPartKey)
      if (isSelectedWorkshopQuizPassed && selectedWorkshopPartIndex < selectedWorkshop.parts.length - 1) {
        updateWorkshopProgress(selectedWorkshop.slug, selectedWorkshopPartIndex + 1)
      }
    }
  }

  function checkArticleCompletion() {
    const content = articleContentRef.current
    if (!content || !selectedArticle) return

    const isAtBottom = content.scrollTop + content.clientHeight >= content.scrollHeight - 24
    const fitsInView = content.scrollHeight <= content.clientHeight + 24

    if (isAtBottom || fitsInView) {
      markArticleRead(selectedArticle.slug)
    }
  }

  function maybeUnlockWorkshopPart() {
    if (!selectedWorkshop || selectedWorkshopPartIndex < 0) return
    if (!isSelectedWorkshopPartRead || !isSelectedWorkshopQuizPassed) return
    if (selectedWorkshopPartIndex >= selectedWorkshop.parts.length - 1) return

    updateWorkshopProgress(selectedWorkshop.slug, selectedWorkshopPartIndex + 1)
  }

  function handleQuizSubmit() {
    if (!selectedWorkshopPart?.quiz || !selectedWorkshopQuizKey) return

    const selectedOptionId = quizSelections[selectedWorkshopQuizKey]
    const selectedOption = selectedWorkshopPart.quiz.options.find((option) => option.id === selectedOptionId)

    if (!selectedOption) {
      setQuizFeedback((current) => ({
        ...current,
        [selectedWorkshopQuizKey]: 'Choose an answer before continuing.',
      }))
      return
    }

    if (!selectedOption.correct) {
      setQuizFeedback((current) => ({
        ...current,
        [selectedWorkshopQuizKey]: 'Not quite. Re-read the section and try again.',
      }))
      return
    }

    markWorkshopQuizPassed(selectedWorkshopQuizKey)
    setQuizFeedback((current) => ({
      ...current,
      [selectedWorkshopQuizKey]: 'Correct. You can continue when this section is read through.',
    }))
    if (selectedWorkshop && isSelectedWorkshopPartRead && selectedWorkshopPartIndex < selectedWorkshop.parts.length - 1) {
      updateWorkshopProgress(selectedWorkshop.slug, selectedWorkshopPartIndex + 1)
    }
  }

  useEffect(() => {
    if (!selectedWorkshop) return
    const nextIndex = Math.min(workshopProgress[selectedWorkshop.slug] ?? 0, selectedWorkshop.parts.length - 1)
    const lastViewedPartBelongsToWorkshop =
      initialWorkshopLastView?.workshopSlug === selectedWorkshop.slug &&
      selectedWorkshop.parts.some((part) => part.slug === selectedWorkshopPartSlug)
    if (lastViewedPartBelongsToWorkshop) return
    setSelectedWorkshopPartSlug(selectedWorkshop.parts[nextIndex]?.slug ?? selectedWorkshop.parts[0]?.slug ?? 'overview')
  }, [selectedWorkshopSlug])

  useEffect(() => {
    if (!introductionWorkshop || isIntroductionComplete) return
    if (selectedWorkshopSlug === introductionWorkshop.slug) return

    setSelectedWorkshopSlug(introductionWorkshop.slug)
    setSelectedWorkshopPartSlug(introductionWorkshop.parts[0]?.slug ?? 'overview')
  }, [isIntroductionComplete, introductionWorkshop?.slug, selectedWorkshopSlug])

  useEffect(() => {
    if (!selectedWorkshop || !selectedWorkshopPart) return
    setStoredWorkshopLastView({
      workshopSlug: selectedWorkshop.slug,
      partSlug: selectedWorkshopPart.slug,
    })
    rememberLearningItem({
      kind: 'workshop',
      slug: selectedWorkshop.slug,
      title: selectedWorkshop.title,
    })
  }, [selectedWorkshop?.slug, selectedWorkshopPart?.slug])

  useEffect(() => {
    if (!selectedArticle) return
    setStoredArticleLastView({
      articleSlug: selectedArticle.slug,
    })
    rememberLearningItem({
      kind: 'article',
      slug: selectedArticle.slug,
      title: selectedArticle.title,
    })
  }, [selectedArticle?.slug])

  useEffect(() => {
    persistDesktopPreference({ lastDesktopTab: tab })
  }, [tab])

  useEffect(() => {
    const content = workshopContentRef.current
    if (!content || !selectedWorkshop || selectedWorkshopPartIndex < 0) return

    content.scrollTop = 0

    const animationFrameId = window.requestAnimationFrame(() => {
      checkWorkshopPartCompletion()
    })

    const resizeObserver = new ResizeObserver(() => {
      checkWorkshopPartCompletion()
    })

    resizeObserver.observe(content)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [selectedWorkshop?.slug, selectedWorkshopPartIndex, selectedWorkshopPartSlug, workshopResetVersion])

  useEffect(() => {
    maybeUnlockWorkshopPart()
  }, [selectedWorkshop?.slug, selectedWorkshopPartIndex, isSelectedWorkshopPartRead, isSelectedWorkshopQuizPassed])

  useEffect(() => {
    const content = articleContentRef.current
    if (!content || !selectedArticle) return

    content.scrollTop = 0

    const animationFrameId = window.requestAnimationFrame(() => {
      checkArticleCompletion()
    })

    const resizeObserver = new ResizeObserver(() => {
      checkArticleCompletion()
    })

    resizeObserver.observe(content)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
      resizeObserver.disconnect()
    }
  }, [selectedArticle?.slug])

  function handleWorkshopContentScroll() {
    checkWorkshopPartCompletion()
  }

  function handleArticleContentScroll() {
    checkArticleCompletion()
  }

  async function loadDesktopData(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setLoading(true)
    }

    try {
      const [nextOverview, nextContext, nextTestControls, nextPresets] = await Promise.all([
        fetchAdminSnapshot(),
        window.desktopBridge?.getContext() ?? Promise.resolve(null),
        fetchTestControlsConfig(),
        fetchScenarioPresets(),
      ])
      setOverview(nextOverview)
      setContext(nextContext)
      setTestControls(nextTestControls)
      setPresets(nextPresets)
      setError(null)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load desktop data.')
    } finally {
      if (!options?.silent) {
        setLoading(false)
      }
    }
  }

  useEffect(() => {
    void loadDesktopData()
  }, [])

  useEffect(() => {
    if (tab !== 'tracing') return
    void handleRefreshTraces()
  }, [tab])

  async function handleSaveUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateManagedUser(userForm)
    setUserErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setSavingUser(true)
    setError(null)
    try {
      if (editingUsername) {
        await updateUser(editingUsername, userForm)
      } else {
        await createUser(userForm)
      }
      setUserForm({ username: '', password: '', displayName: '', role: 'customer' })
      setEditingUsername(null)
      await loadDesktopData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save user.')
    } finally {
      setSavingUser(false)
    }
  }

  async function handleDeleteUser(username: string) {
    try {
      await deleteUser(username)
      await loadDesktopData()
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Failed to delete user.')
    }
  }

  async function handleBreakModeChange(nextBreakModes: BreakModes) {
    setSavingBreakModes(true)
    try {
      await saveBreakModes(nextBreakModes)
      setRuntimeBreakModes(nextBreakModes)
      await loadDesktopData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save break modes.')
    } finally {
      setSavingBreakModes(false)
    }
  }

  async function handleFaultChange(endpointKey: EndpointKey, nextFault: EndpointFaultConfig) {
    setSavingFaults(true)
    try {
      const nextConfig = await updateTestControlsConfig({
        faults: {
          [endpointKey]: nextFault,
        },
      })
      setTestControls(nextConfig)
      await loadDesktopData({ silent: true })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save fault configuration.')
    } finally {
      setSavingFaults(false)
    }
  }

  async function handleClearFaults() {
    if (!testControls) return

    setSavingFaults(true)
    try {
      const cleared = Object.fromEntries(
        endpointKeys.map((endpointKey) => [
          endpointKey,
          {
            ...testControls.faults[endpointKey],
            enabled: false,
            latencyMs: null,
            message: null,
            mode: 'http-error',
            status: 500,
          },
        ]),
      ) as Record<EndpointKey, EndpointFaultConfig>

      const nextConfig = await updateTestControlsConfig({ faults: cleared })
      setTestControls(nextConfig)
      await loadDesktopData({ silent: true })
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to clear endpoint faults.')
    } finally {
      setSavingFaults(false)
    }
  }

  async function handleApplyPreset(presetId: string) {
    try {
      const nextConfig = await applyScenarioPreset(presetId)
      setRuntimeBreakModes(nextConfig.breakModes)
      setTestControls(nextConfig)
      await loadDesktopData()
    } catch (applyError) {
      setError(applyError instanceof Error ? applyError.message : 'Failed to apply scenario preset.')
    }
  }

  async function handleRestorePreset() {
    if (!testControls?.activePresetId) return
    await handleApplyPreset(testControls.activePresetId)
  }

  async function handleTracingUpdate(update: Partial<TestControlsConfig['tracing']>) {
    setSavingTracing(true)
    try {
      const nextConfig = await updateTracingConfig(update)
      setTestControls(nextConfig)
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to update tracing.')
    } finally {
      setSavingTracing(false)
    }
  }

  async function handleRefreshTraces() {
    try {
      setTraces(await fetchRequestTraces())
    } catch (traceError) {
      setError(traceError instanceof Error ? traceError.message : 'Failed to load traces.')
    }
  }

  async function handleClearTraces() {
    try {
      await clearRequestTraces()
      await handleRefreshTraces()
    } catch (traceError) {
      setError(traceError instanceof Error ? traceError.message : 'Failed to clear traces.')
    }
  }

  async function handleDownloadCollection() {
    try {
      createDownload('testbed-postman-collection.json', await fetchPostmanCollection())
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to download Postman collection.')
    }
  }

  async function handleDownloadEnvironment() {
    try {
      createDownload('testbed-postman-environment.json', await fetchPostmanEnvironment())
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Failed to download Postman environment.')
    }
  }

  async function handleSelectDataDirectory() {
    const nextContext = await window.desktopBridge?.selectDataDirectory()
    setContext(nextContext ?? null)
    await loadDesktopData()
  }

  async function handleOpenDataDirectory() {
    await window.desktopBridge?.openDataDirectory()
    const nextContext = await refreshDesktopContext()
    setContext(nextContext)
  }

  async function handleResetRuntime() {
    await resetRuntimeData()
    resetDemoState()
    await loadRuntimeConfig()
    await loadDesktopData()
  }

  async function handleResetBreakModes() {
    const response = await resetBreakModes()
    setRuntimeBreakModes(response.breakModes)
    await loadDesktopData()
  }

  function handleResetWorkshopProgress() {
    resetWorkshopProgress()
    setWorkshopProgress({})
    setReadWorkshopParts({})
    setWorkshopQuizProgress({})
    setArticleReadProgress({})
    setQuizSelections({})
    setQuizFeedback({})
    setSelectedWorkshopSlug(defaultWorkshopSlug)
    setSelectedWorkshopPartSlug(workshopEntries[0]?.parts[0]?.slug ?? 'overview')
    setSelectedArticleSlug(defaultArticleSlug)
    setStoredArticleReadProgress({})
    persistDesktopPreference({ recentLearningItems: [] })
    setRecentLearningItems([])
    setWorkshopResetVersion((current) => current + 1)
  }

  async function handleProductAdjust(productId: string, currentStock: number, delta: number) {
    await updateProduct(productId, { stock: Math.max(currentStock + delta, 0) })
    await loadDesktopData()
  }

  async function handleProductVisibility(productId: string, hidden: boolean) {
    await updateProduct(productId, { hidden: !hidden })
    await loadDesktopData()
  }

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Loading desktop admin...</section>
  }

  if (error && !overview) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8">
        <h1 className="text-3xl font-semibold">Desktop admin unavailable</h1>
        <p className="mt-3 text-slate-700">{error}</p>
        <button type="button" onClick={() => void loadDesktopData()} className="btn-danger mt-4 rounded-full bg-rose-700 px-4 py-2 font-medium text-white">
          Retry
        </button>
      </section>
    )
  }

  if (!overview || !testControls) return null

  const compactRouteDescriptions: Record<string, string> = {
    '/': 'Route directory and current break-mode status.',
    '/login': 'Username/password sign-in with local credentials.',
    '/shop': 'Browse products and add items to basket.',
    '/checkout': 'Multi-step checkout and order confirmation.',
    '/orders': 'Persisted order history.',
    '/vip': 'Premium route for VIP-only products.',
    '/reset': 'Clears local browser state for a fresh run.',
  }
  const routeAccessOverrides: Record<string, string> = {
    '/shop': 'public',
    '/checkout': 'public',
    '/orders': 'signed-in users',
  }
  const compactApiDescriptions: Array<{ path: string; method: string; access: string; description: string }> = [
    { method: 'GET', path: '/api/health', access: 'public', description: 'Readiness endpoint for smoke checks and local startup verification.' },
    { method: 'GET', path: '/api/runtime/bootstrap', access: 'public', description: 'Returns runtime app config, users, and active break modes.' },
    { method: 'POST', path: '/api/auth/login', access: 'public', description: 'Validates local credentials and returns the signed-in user payload.' },
    { method: 'GET', path: '/api/shop/products', access: 'public', description: 'Returns the product catalog used by the website.' },
    { method: 'GET', path: '/api/orders', access: 'public', description: 'Returns saved orders for learning and website history flows.' },
    { method: 'POST', path: '/api/orders', access: 'public', description: 'Creates an order from the checkout payload.' },
    { method: 'GET', path: '/api/test-controls/config', access: 'public', description: 'Returns current preset, faults, tracing, and break modes.' },
    { method: 'POST', path: '/api/test-controls/config', access: 'public', description: 'Updates test-control break modes, faults, and tracing settings.' },
    { method: 'GET', path: '/api/test-controls/presets', access: 'public', description: 'Lists all available scenario presets.' },
    { method: 'POST', path: '/api/test-controls/presets/:presetId/apply', access: 'public', description: 'Applies a named preset to the runtime state.' },
    { method: 'POST', path: '/api/test-controls/tracing', access: 'public', description: 'Updates trace capture settings.' },
    { method: 'GET', path: '/api/test-controls/traces', access: 'public', description: 'Returns recent trace entries.' },
    { method: 'DELETE', path: '/api/test-controls/traces', access: 'public', description: 'Clears the trace history.' },
    { method: 'GET', path: '/api/postman/collection', access: 'public', description: 'Downloads a generated Postman collection for the running server.' },
    { method: 'GET', path: '/api/postman/environment', access: 'public', description: 'Downloads a generated Postman environment including the admin token.' },
    { method: 'GET', path: '/api/admin/overview', access: 'admin token', description: 'Returns the desktop admin overview payload.' },
    { method: 'GET', path: '/api/admin/users', access: 'admin token', description: 'Lists managed runtime users.' },
    { method: 'POST', path: '/api/admin/users', access: 'admin token', description: 'Creates a new runtime user.' },
    { method: 'PUT', path: '/api/admin/users/:username', access: 'admin token', description: 'Updates an existing runtime user.' },
    { method: 'DELETE', path: '/api/admin/users/:username', access: 'admin token', description: 'Deletes a runtime user.' },
    { method: 'POST', path: '/api/admin/break-modes', access: 'admin token', description: 'Writes break modes used by the website and desktop app.' },
    { method: 'PATCH', path: '/api/admin/products/:id', access: 'admin token', description: 'Updates product stock and visibility.' },
    { method: 'POST', path: '/api/admin/reset-runtime', access: 'admin token', description: 'Resets runtime JSON back to defaults.' },
  ]

  return (
    <div className={`flex h-full min-h-0 w-full flex-col overflow-hidden ${isCompactDesktopShell ? 'gap-3' : 'gap-6'}`}>
      <section className={`rounded-[2rem] border border-stone-300 bg-white shadow-sm ${isCompactDesktopShell ? 'p-3' : 'p-4 sm:p-5 lg:p-6'}`}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className={`${isCompactDesktopShell ? 'text-xl' : 'text-2xl sm:text-3xl'} font-semibold`}>Testbed</h1>
            <p className={`${isCompactDesktopShell ? 'mt-1 text-xs' : 'mt-1 text-sm sm:mt-2 sm:text-base'} text-slate-600`}>
              Learn QA testing and test automation.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            {context?.serverUrl ? (
              <a
                href={context.serverUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary rounded-full border-2 border-emerald-700 bg-emerald-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-400 sm:px-5 sm:py-2.5"
              >
                Open web app
              </a>
            ) : null}
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
      </section>

      {isCompactDesktopShell ? (
        <section className="rounded-[1.25rem] border border-stone-300 bg-white p-3 shadow-sm">
          <label className="flex items-center gap-3 text-sm font-medium text-slate-700">
            <span className="shrink-0 text-[11px] uppercase tracking-[0.18em] text-slate-500">Section</span>
            <select
              className="min-w-0 flex-1 rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500"
              value={tab}
              onChange={(event) => setTab(event.target.value as DesktopTab)}
            >
              {desktopTabOptions.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {desktopTabOptions.slice(0, 3).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${tab === value ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {desktopTabOptions.slice(3).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setTab(value)}
                className={`rounded-full px-4 py-2 text-sm font-medium ${tab === value ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-700'}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`min-h-0 flex-1 ${tab === 'workshops' || tab === 'articles' ? 'overflow-hidden' : 'overflow-y-auto pr-1'}`}>
      {tab === 'dashboard' ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {!dismissedWelcome ? (
            <section className="rounded-[2rem] border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-sm xl:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-emerald-700">Welcome to Testbed</p>
                  <h2 className="mt-3 text-3xl font-semibold text-slate-900">Start in the Introduction workshop, then open the website and try the main shopping flow.</h2>
                  <p className="mt-3 text-slate-600">
                    Testbed is split into two surfaces. The website is the application under test. The desktop app is your learning and control space for workshops, articles, presets, traces, and Postman assets.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <button type="button" onClick={() => setTab('workshops')} className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
                      Open workshops
                    </button>
                    {context?.serverUrl ? (
                      <a href={context.serverUrl} target="_blank" rel="noreferrer" className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                        Open website
                      </a>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedWelcome(true)
                        persistDesktopPreference({ dismissedWelcome: true })
                      }}
                      className="rounded-full bg-white px-4 py-2 font-medium text-slate-700"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          <section className="rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="text-2xl font-semibold">Overview</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
              {[
                ['Users', String(overview.users.length)],
                ['Orders', String(overview.orders.length)],
                ['Products', String(overview.products.length)],
                ['Visible products', String(overview.products.filter((product) => !product.hidden).length)],
                ['Active preset', testControls.activePresetId ?? 'none'],
                ['Trace entries', String(traces.length)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
                  <p className="mt-2 text-2xl font-semibold">{value}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => void handleResetRuntime()} className="btn-danger rounded-full bg-rose-700 px-4 py-2 font-medium text-white">
                Reset runtime data
              </button>
              <button type="button" onClick={() => { resetDemoState(); window.location.reload() }} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                Reset browser state
              </button>
              <button type="button" onClick={() => void handleRefreshTraces()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                Refresh traces
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Learning Progress</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Workshops completed</p>
                <p className="mt-2 text-3xl font-semibold">{completedWorkshopCount}</p>
                <p className="mt-2 text-sm text-slate-600">of {workshopEntries.length} learning tracks</p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Articles read</p>
                <p className="mt-2 text-3xl font-semibold">{completedArticleCount}</p>
                <p className="mt-2 text-sm text-slate-600">of {articleEntries.length} supporting reads</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Resume workshop</p>
                <p className="mt-2 font-semibold">{selectedWorkshop?.title ?? 'Introduction to Testbed'}</p>
                <p className="mt-1 text-sm text-slate-600">
                  Continue from part {Math.max(selectedWorkshopPartIndex + 1, 1)} in your current workshop.
                </p>
                <button type="button" onClick={() => setTab('workshops')} className="mt-3 rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-slate-700">
                  Resume workshop
                </button>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Next recommended</p>
                <p className="mt-2 font-semibold">
                  {isIntroductionComplete ? (articleEntries.find((article) => !articleReadProgress[article.slug])?.title ?? 'Explore Scenarios & Faults') : introductionWorkshop?.title}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  {isIntroductionComplete
                    ? 'Keep momentum by reading the next unread article or practising with presets and traces.'
                    : 'Complete the introduction workshop to unlock the rest of the learning library.'}
                </p>
              </div>
            </div>
          </section>

          <section className="flex min-h-[28rem] flex-col rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">Routes</h2>
              <div className="flex flex-wrap gap-2 rounded-full bg-stone-100 p-1">
                {([
                  ['website', 'Website'],
                  ['api', 'API'],
                ] as const).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRoutePanelMode(value)}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                      routePanelMode === value ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-stone-200'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
              {routePanelMode === 'website'
                ? demoConfig.routes
                    .filter((route) => route.path !== '/desktop')
                    .map((route) => (
                      <div key={route.path} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold leading-tight">{route.label}</p>
                            <div className="mt-1 grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-x-3 text-xs text-slate-600">
                              <p className="font-mono">{route.path}</p>
                              <p className="truncate">{compactRouteDescriptions[route.path] ?? route.description}</p>
                            </div>
                          </div>
                          <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
                            {routeAccessOverrides[route.path] ?? route.access}
                          </span>
                        </div>
                      </div>
                    ))
                : compactApiDescriptions.map((route) => (
                    <div key={`${route.method}-${route.path}`} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold leading-tight">
                            <span className="mr-2 inline-block rounded-full bg-white px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-slate-600">
                              {route.method}
                            </span>
                            {route.path}
                          </p>
                          <p className="mt-2 text-sm text-slate-600">{route.description}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{route.access}</span>
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm xl:col-span-2">
            <h2 className="text-2xl font-semibold">Recently Viewed</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {recentLearningItems.length === 0 ? (
                <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-slate-600">
                  Recently viewed workshops and articles will appear here.
                </p>
              ) : (
                recentLearningItems.map((item) => (
                  <button
                    key={`${item.kind}-${item.slug}`}
                    type="button"
                    onClick={() => {
                      setTab(item.kind === 'workshop' ? 'workshops' : 'articles')
                      if (item.kind === 'workshop') {
                        setSelectedWorkshopSlug(item.slug)
                      } else {
                        setSelectedArticleSlug(item.slug)
                      }
                    }}
                    className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-stone-300 hover:bg-white"
                  >
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.kind}</p>
                    <p className="mt-2 font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{new Date(item.viewedAt).toLocaleString()}</p>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'catalog' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="text-2xl font-semibold">Products</h2>
            <div className="mt-4 space-y-3">
              {overview.products.map((product) => (
                <div key={product.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => void handleProductAdjust(product.id, product.stock, -1)} className="rounded-full bg-stone-200 px-3 py-2 text-sm font-medium">
                        -1 stock
                      </button>
                      <button type="button" onClick={() => void handleProductAdjust(product.id, product.stock, 1)} className="rounded-full bg-stone-200 px-3 py-2 text-sm font-medium">
                        +1 stock
                      </button>
                      <button type="button" onClick={() => void handleProductVisibility(product.id, Boolean(product.hidden))} className="btn-primary rounded-full bg-slate-900 px-3 py-2 text-sm font-medium text-white">
                        {product.hidden ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm xl:col-span-2">
            <h2 className="text-2xl font-semibold">Orders</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {overview.orders.length === 0 ? (
                <p className="text-sm text-slate-600">No orders yet.</p>
              ) : (
                overview.orders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <p className="font-semibold">{order.id}</p>
                    <p className="text-sm text-slate-600">{order.username}</p>
                    <p className="text-sm text-slate-500">Total: {currency(order.total)}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'users' ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Users</h2>
            <div className="mt-4 space-y-3">
              {overview.users.map((user) => (
                <div key={user.username} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{user.displayName}</p>
                      <p className="text-sm text-slate-600">{user.username}</p>
                      <p className="text-sm text-slate-500">Role: {user.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingUsername(user.username)
                          setUserForm(user)
                        }}
                        className="rounded-full bg-stone-200 px-3 py-2 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button type="button" onClick={() => void handleDeleteUser(user.username)} className="btn-danger rounded-full bg-rose-700 px-3 py-2 text-sm font-medium text-white">
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">{editingUsername ? 'Edit user' : 'Create user'}</h2>
            <form className="mt-4 space-y-4" onSubmit={handleSaveUser}>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Display name</span>
                <input className={inputClass(Boolean(userErrors.displayName))} value={userForm.displayName} onChange={(event) => setUserForm((current) => ({ ...current, displayName: event.target.value }))} />
                {userErrors.displayName ? <p className="mt-2 text-sm text-rose-700">{userErrors.displayName}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Username</span>
                <input className={inputClass(Boolean(userErrors.username))} value={userForm.username} onChange={(event) => setUserForm((current) => ({ ...current, username: event.target.value }))} />
                {userErrors.username ? <p className="mt-2 text-sm text-rose-700">{userErrors.username}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Password</span>
                <div className="flex gap-3">
                  <input
                    className={inputClass(Boolean(userErrors.password))}
                    value={userForm.password}
                    onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const password = generateStrongPassword()
                      setUserForm((current) => ({ ...current, password }))
                      setUserErrors((current) => ({ ...current, password: '' }))
                    }}
                    className="shrink-0 rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-slate-700"
                  >
                    Strong password
                  </button>
                </div>
                {userErrors.password ? <p className="mt-2 text-sm text-rose-700">{userErrors.password}</p> : null}
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Role</span>
                <select className={inputClass(false)} value={userForm.role} onChange={(event) => setUserForm((current) => ({ ...current, role: event.target.value as Role }))}>
                  <option value="customer">customer</option>
                  <option value="vip">vip</option>
                  <option value="admin">admin</option>
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <button type="submit" className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white" disabled={savingUser}>
                  {savingUser ? 'Saving...' : editingUsername ? 'Save user' : 'Create user'}
                </button>
                {editingUsername ? (
                  <button type="button" onClick={() => { setEditingUsername(null); setUserForm({ username: '', password: '', displayName: '', role: 'customer' }) }} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                    Cancel
                  </button>
                ) : null}
              </div>
            </form>
          </section>
        </div>
      ) : null}

      {tab === 'break-modes' ? (
        <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">Break Modes</h2>
              <p className="mt-2 text-slate-600">Changes apply to browser sessions and test runners on the local server.</p>
            </div>
            <button type="button" onClick={() => void handleResetBreakModes()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
              Reset break modes
            </button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {([
              ['highLatency', 'High latency', 'Website and API: adds response delay so testers can practise waits, timeouts, and loading-state checks.'],
              ['selectorsChange', 'Selectors change', 'Website only: changes test hooks and DOM identifiers so brittle selectors are more likely to fail.'],
              ['contentChange', 'Content change', 'Website only: renames visible labels and headings to expose assertions that are too copy-dependent.'],
              ['disableAddToCart', 'Disable add to cart', 'Website only: disables the basket action so testers can verify blocked-purchase behaviour and messaging.'],
              ['brokenCheckoutTotal', 'Broken checkout total', 'Website and API: shows the wrong checkout subtotal so testers can catch calculation and pricing defects.'],
              ['bypassVipGuard', 'Bypass VIP guard', 'Website only: removes the VIP route restriction so testers can detect broken authorization rules.'],
              ['emptyProductList', 'Empty product list', 'API first, then website on refetch: returns no products so testers can verify empty states and data-absence handling.'],
            ] as const).map(([key, label, description]) => (
              <label key={key} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium">{label}</span>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={overview.breakModes[key]}
                    onChange={(event) => void handleBreakModeChange({ ...overview.breakModes, [key]: event.target.checked })}
                    disabled={savingBreakModes}
                    className="mt-1"
                  />
                </div>
              </label>
            ))}
            {([
              ['products', 'API failure: products', 'Makes product endpoints fail so testers can verify product-list error handling and recovery.'],
              ['orders', 'API failure: orders', 'Makes order endpoints fail so testers can verify checkout and order-history failure behaviour.'],
            ] as const).map(([scope, label, description]) => (
              <label key={scope} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="font-medium">{label}</span>
                    <p className="mt-2 text-sm text-slate-600">{description}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={overview.breakModes.apiFailures[scope]}
                    onChange={(event) =>
                      void handleBreakModeChange({
                        ...overview.breakModes,
                        apiFailures: {
                          ...overview.breakModes.apiFailures,
                          [scope]: event.target.checked,
                        },
                      })
                    }
                    disabled={savingBreakModes}
                    className="mt-1"
                  />
                </div>
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'scenarios' ? (
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Scenario Presets</h2>
                <p className="mt-2 text-slate-600">Apply named test states and compare them against live modifications.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-stone-100 px-3 py-2 text-sm text-slate-700">
                  Active preset: <strong>{testControls.activePresetId ?? 'none'}</strong>
                </span>
                <span className={`rounded-full px-3 py-2 text-sm ${presetModified ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {presetModified ? 'Modified from preset' : 'Matches preset'}
                </span>
              </div>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {presets.map((preset) => (
                <article key={preset.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold">{preset.label}</h3>
                      <p className="mt-2 text-sm text-slate-600">{preset.description}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-white px-3 py-1">
                          {Object.values(preset.breakModes).flatMap((value) => (typeof value === 'object' ? Object.values(value) : [value])).filter(Boolean).length} break modes
                        </span>
                        <span className="rounded-full bg-white px-3 py-1">
                          {Object.values(preset.faults).filter((fault) => fault.enabled).length} endpoint faults
                        </span>
                      </div>
                    </div>
                    <button type="button" onClick={() => void handleApplyPreset(preset.id)} className="btn-primary rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white">
                      Apply
                    </button>
                  </div>
                  <p className="mt-3 font-mono text-xs text-slate-500">{preset.id}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Fault Matrix</h2>
                <p className="mt-2 text-slate-600">Configure endpoint-specific fault responses and latency overrides.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={() => void handleClearFaults()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700" disabled={savingFaults}>
                  Clear all faults
                </button>
                <button type="button" onClick={() => void handleRestorePreset()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700" disabled={!testControls.activePresetId || savingFaults}>
                  Restore active preset
                </button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {endpointKeys.map((endpointKey) => {
                const fault = testControls.faults[endpointKey]
                return (
                  <div key={endpointKey} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <div className="grid gap-4 xl:grid-cols-[1.1fr_repeat(5,minmax(0,1fr))] xl:items-center">
                      <div>
                        <p className="font-semibold">{endpointLabels[endpointKey]}</p>
                        <p className="font-mono text-xs text-slate-500">{endpointKey}</p>
                      </div>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={fault.enabled}
                          onChange={(event) => void handleFaultChange(endpointKey, { ...fault, enabled: event.target.checked })}
                          disabled={savingFaults}
                        />
                        Enabled
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-slate-500">Status</span>
                        <select className={inputClass(false)} value={String(fault.status)} onChange={(event) => void handleFaultChange(endpointKey, { ...fault, status: Number(event.target.value) as EndpointFaultConfig['status'] })} disabled={savingFaults}>
                          {faultStatuses.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-slate-500">Mode</span>
                        <select className={inputClass(false)} value={fault.mode} onChange={(event) => void handleFaultChange(endpointKey, { ...fault, mode: event.target.value as FaultResponseMode })} disabled={savingFaults}>
                          {faultModes.map((mode) => (
                            <option key={mode} value={mode}>
                              {mode}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-slate-500">Latency ms</span>
                        <input className={inputClass(false)} value={fault.latencyMs ?? ''} onChange={(event) => void handleFaultChange(endpointKey, { ...fault, latencyMs: event.target.value ? Number(event.target.value) : null })} disabled={savingFaults} />
                      </label>
                      <label className="text-sm">
                        <span className="mb-1 block text-slate-500">Message</span>
                        <input className={inputClass(false)} value={fault.message ?? ''} onChange={(event) => void handleFaultChange(endpointKey, { ...fault, message: event.target.value || null })} disabled={savingFaults} />
                      </label>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'tracing' ? (
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Trace Viewer</h2>
                <p className="mt-2 text-slate-600">Inspect recent request metadata, active fault mode, and correlation identifiers.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-full bg-stone-100 px-4 py-2 text-sm text-slate-700">
                  <input type="checkbox" checked={testControls.tracing.enabled} onChange={(event) => void handleTracingUpdate({ enabled: event.target.checked })} disabled={savingTracing} />
                  Tracing enabled
                </label>
                <select className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm" value={String(testControls.tracing.maxEntries)} onChange={(event) => void handleTracingUpdate({ maxEntries: Number(event.target.value) })} disabled={savingTracing}>
                  {[25, 50, 100, 250].map((size) => (
                    <option key={size} value={size}>
                      {size} entries
                    </option>
                  ))}
                </select>
                <button type="button" onClick={() => void handleRefreshTraces()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                  Refresh
                </button>
                <button type="button" onClick={() => void handleClearTraces()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <select className={inputClass(false)} value={traceEndpointFilter} onChange={(event) => setTraceEndpointFilter(event.target.value)}>
                <option value="all">All endpoints</option>
                {endpointKeys.map((endpointKey) => (
                  <option key={endpointKey} value={endpointKey}>
                    {endpointLabels[endpointKey]}
                  </option>
                ))}
              </select>
              <select className={inputClass(false)} value={traceStatusFilter} onChange={(event) => setTraceStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {[200, 400, 401, 403, 404, 409, 422, 500, 503].map((status) => (
                  <option key={status} value={String(status)}>
                    Status {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-6 space-y-3">
              {filteredTraces.length === 0 ? (
                <p className="text-sm text-slate-600">No traces recorded yet.</p>
              ) : (
                filteredTraces.map((trace) => (
                  <details key={trace.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                    <summary className="cursor-pointer list-none">
                      <div className="grid gap-3 md:grid-cols-[1.1fr_1fr_0.7fr_0.9fr_0.8fr_1fr] md:items-center">
                        <span className="text-sm font-medium">{new Date(trace.timestamp).toLocaleTimeString()}</span>
                        <span className="font-mono text-xs text-slate-600">{trace.pathname}</span>
                        <span className="text-sm">{trace.method}</span>
                        <span className="text-sm">Status {trace.responseStatus}</span>
                        <span className="text-sm">{trace.responseMode}</span>
                        <span className="font-mono text-xs text-slate-500">{trace.correlationId}</span>
                      </div>
                    </summary>
                    <div className="mt-4 grid gap-3 lg:grid-cols-2">
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Request</p>
                        <p className="mt-2 text-sm text-slate-700">Endpoint: {trace.endpointKey}</p>
                        <p className="mt-2 text-sm text-slate-700">Latency: {trace.latencyMs}ms</p>
                        <pre className="mt-3 overflow-x-auto rounded-2xl bg-stone-50 p-3 text-xs text-slate-700">{JSON.stringify(trace.requestHeaders, null, 2)}</pre>
                        <pre className="mt-3 overflow-x-auto rounded-2xl bg-stone-50 p-3 text-xs text-slate-700">{trace.requestBody ?? 'No request body'}</pre>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard.writeText(trace.requestBody ?? '')}
                            className="rounded-full bg-stone-200 px-3 py-2 text-sm font-medium text-slate-700"
                            disabled={!trace.requestBody}
                          >
                            Copy request body
                          </button>
                        </div>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Response</p>
                        <p className="mt-2 text-sm text-slate-700">Preset: {trace.presetId ?? 'none'}</p>
                        <pre className="mt-3 overflow-x-auto rounded-2xl bg-stone-50 p-3 text-xs text-slate-700">{trace.matchedFault ? JSON.stringify(trace.matchedFault, null, 2) : 'No fault applied'}</pre>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => void navigator.clipboard.writeText(trace.matchedFault ? JSON.stringify(trace.matchedFault, null, 2) : 'No fault applied')}
                            className="rounded-full bg-stone-200 px-3 py-2 text-sm font-medium text-slate-700"
                          >
                            Copy response summary
                          </button>
                        </div>
                      </div>
                    </div>
                  </details>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'postman' ? (
        <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Postman Assets</h2>
          <p className="mt-2 text-slate-600">Download generated collection and environment files based on the running local server.</p>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Admin Bearer Token</p>
            <p className="mt-3 text-sm text-slate-600">Use this value as a Bearer token in Postman when you call any <code className="rounded bg-white px-1.5 py-0.5 font-mono text-[0.95em] text-slate-800">/api/admin/*</code> route.</p>
            <p className="mt-3 rounded-2xl border border-stone-200 bg-white p-3 font-mono text-sm text-slate-900">
              {context?.adminApiToken ?? 'Unavailable'}
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(context?.adminApiToken ?? '')}
                className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700"
                disabled={!context?.adminApiToken}
              >
                Copy token
              </button>
              <button
                type="button"
                onClick={() => void navigator.clipboard.writeText(`Bearer ${context?.adminApiToken ?? ''}`)}
                className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700"
                disabled={!context?.adminApiToken}
              >
                Copy Bearer header value
              </button>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <button type="button" onClick={() => void handleDownloadCollection()} className="btn-primary rounded-[1.5rem] bg-slate-900 px-5 py-4 text-left font-medium text-white">
              Download Collection
            </button>
            <button type="button" onClick={() => void handleDownloadEnvironment()} className="rounded-[1.5rem] bg-stone-200 px-5 py-4 text-left font-medium text-slate-700">
              Download Environment
            </button>
            <button type="button" onClick={() => void navigator.clipboard.writeText(context?.serverUrl ?? '')} className="rounded-[1.5rem] bg-stone-200 px-5 py-4 text-left font-medium text-slate-700">
              Copy Base URL
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4">
            <p className="text-sm text-slate-600">Base URL</p>
            <p className="mt-2 font-mono text-sm text-slate-900">{context?.serverUrl ?? 'Unavailable'}</p>
          </div>
        </section>
      ) : null}

      {tab === 'workshops' && selectedWorkshop && selectedWorkshopPart ? (
        <div className={`${isSinglePaneLearning ? 'flex h-full min-h-0 flex-col' : 'grid h-full min-h-0 xl:grid-cols-[380px_minmax(0,1fr)]'} gap-4 sm:gap-6`}>
          {isSinglePaneLearning ? (
            <CompactLibraryDisclosure label="Library" currentTitle={selectedWorkshop.title}>
              <LearningShellPanel
                compact
                title="Workshop Library"
                heading="QA Learning Tracks"
                inputClassName={inputClass(false)}
                searchValue={workshopSearch}
                onSearchChange={setWorkshopSearch}
                searchPlaceholder="Search workshops"
                filterValue={workshopCategoryFilter}
                onFilterChange={setWorkshopCategoryFilter}
                categories={workshopCategories}
              >
                <LearningLibrarySections
                  groupedEntries={groupedFilteredWorkshops}
                  emptyMessage="No workshops match the current search and category filters."
                  compact
                  renderItem={(workshop) => renderWorkshopLibraryItem(workshop, true)}
                />
              </LearningShellPanel>
            </CompactLibraryDisclosure>
          ) : null}

          <LearningShellPanel
            hidden={isSinglePaneLearning}
            title="Workshop Library"
            heading="QA Learning Tracks"
            description="Browse the embedded training guides while using the desktop app controls."
            inputClassName={inputClass(false)}
            searchValue={workshopSearch}
            onSearchChange={setWorkshopSearch}
            searchPlaceholder="Search workshops"
            filterValue={workshopCategoryFilter}
            onFilterChange={setWorkshopCategoryFilter}
            categories={workshopCategories}
          >
            <LearningLibrarySections
              groupedEntries={groupedFilteredWorkshops}
              emptyMessage="No workshops match the current search and category filters."
              renderItem={(workshop) => renderWorkshopLibraryItem(workshop)}
            />
          </LearningShellPanel>

          <section className={`flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-stone-300 bg-white shadow-sm ${isSinglePaneLearning ? 'p-3' : 'p-4 sm:p-6 lg:p-8'}`}>
            <LearningContentHeader
              compact={isSinglePaneLearning}
              category={selectedWorkshop.category}
              title={selectedWorkshop.title}
              summary={selectedWorkshop.summary}
              meta={selectedWorkshop.estimatedEffort}
              action={
                selectedWorkshop.launchTarget ? (
                  <button
                    type="button"
                    onClick={() => {
                      const launchTarget = selectedWorkshop.launchTarget
                      if (!launchTarget) return
                      if (launchTarget.type === 'route') {
                        window.open(launchTarget.value, '_blank')
                      } else {
                        setTab(launchTarget.value as typeof tab)
                      }
                    }}
                    className={`rounded-full bg-stone-200 ${isSinglePaneLearning ? 'px-2.5 py-1 text-xs' : 'px-3 py-1 text-sm'} font-medium text-slate-700`}
                  >
                    {selectedWorkshop.launchTarget.label}
                  </button>
                ) : null
              }
            />

            <div className={`shrink-0 rounded-[1.5rem] border border-stone-200 bg-white ${isSinglePaneLearning ? 'mt-3 p-3' : 'mt-4 p-4 sm:mt-6'}`}>
              <div className="flex min-w-0 items-center gap-2">
                <label className="block min-w-0 flex-1 text-sm">
                  <select
                    className={inputClass(false)}
                    value={selectedWorkshopPart.slug}
                    onChange={(event) => {
                      const nextIndex = selectedWorkshop.parts.findIndex((part) => part.slug === event.target.value)
                      if (nextIndex > effectiveUnlockedWorkshopPartIndex) return
                      setSelectedWorkshopPartSlug(event.target.value)
                    }}
                  >
                    {selectedWorkshop.parts.map((part, partIndex) => (
                      <option
                        key={part.slug}
                        value={part.slug}
                        disabled={partIndex > effectiveUnlockedWorkshopPartIndex}
                      >
                        {partIndex + 1}. {part.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  onClick={() => setSelectedWorkshopPartSlug(selectedWorkshop.parts[Math.max(selectedWorkshopPartIndex - 1, 0)]?.slug ?? selectedWorkshopPart.slug)}
                  className="shrink-0 rounded-full border border-stone-300 bg-stone-100 px-2.5 py-2 text-xs font-semibold text-slate-800 shadow-sm transition hover:bg-stone-200 disabled:cursor-not-allowed disabled:border-stone-300 disabled:bg-stone-200 disabled:text-slate-500 disabled:shadow-none"
                  disabled={selectedWorkshopPartIndex <= 0}
                >
                  Previous
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedWorkshopPartSlug(
                      selectedWorkshop.parts[Math.min(selectedWorkshopPartIndex + 1, selectedWorkshop.parts.length - 1)]?.slug ?? selectedWorkshopPart.slug,
                    )
                  }
                  className="shrink-0 rounded-full border border-slate-950 bg-slate-900 px-2.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-500 disabled:bg-slate-500 disabled:text-slate-100 disabled:shadow-none"
                  disabled={
                    selectedWorkshopPartIndex >= selectedWorkshop.parts.length - 1 ||
                    selectedWorkshopPartIndex + 1 > effectiveUnlockedWorkshopPartIndex
                  }
                >
                  Next
                </button>
              </div>
            </div>

            <div
              ref={workshopContentRef}
              onScroll={handleWorkshopContentScroll}
              className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2 sm:mt-6"
            >
              <MarkdownDocument markdown={selectedWorkshopPart.markdown} />
              {selectedWorkshopPart.quiz ? (() => {
                const quiz = selectedWorkshopPart.quiz

                return (
                <section className="mt-8 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Knowledge Check</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{quiz.question}</h3>
                  <div className="mt-4 space-y-3">
                    {shuffledSelectedWorkshopQuizOptions.map((option) => (
                      <label key={option.id} className="flex items-start gap-3 rounded-2xl border border-stone-200 bg-white p-4 text-slate-700">
                        <input
                          type="radio"
                          name={selectedWorkshopQuizKey ?? quiz.id}
                          checked={selectedWorkshopQuizKey ? quizSelections[selectedWorkshopQuizKey] === option.id : false}
                          onChange={() => {
                            if (!selectedWorkshopQuizKey) return
                            setQuizSelections((current) => ({
                              ...current,
                              [selectedWorkshopQuizKey]: option.id,
                            }))
                            setQuizFeedback((current) => ({
                              ...current,
                              [selectedWorkshopQuizKey]: null,
                            }))
                          }}
                          disabled={isSelectedWorkshopQuizPassed}
                          className="mt-1"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={handleQuizSubmit}
                      className="rounded-full border border-slate-950 bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:border-slate-500 disabled:bg-slate-500 disabled:text-slate-100 disabled:shadow-none"
                      disabled={isSelectedWorkshopQuizPassed}
                    >
                      {isSelectedWorkshopQuizPassed ? 'Quiz Passed' : 'Check Answer'}
                    </button>
                    {selectedWorkshopQuizKey && quizFeedback[selectedWorkshopQuizKey] ? (
                      <p className={`text-sm ${isSelectedWorkshopQuizPassed ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {quizFeedback[selectedWorkshopQuizKey]}
                      </p>
                    ) : null}
                  </div>
                </section>
                )
              })() : null}
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'articles' && selectedArticle ? (
        <div className={`${isSinglePaneLearning ? 'flex h-full min-h-0 flex-col' : 'grid h-full min-h-0 xl:grid-cols-[380px_minmax(0,1fr)]'} gap-4 sm:gap-6`}>
          {isSinglePaneLearning ? (
            <CompactLibraryDisclosure label="Library" currentTitle={selectedArticle.title}>
              <LearningShellPanel
                compact
                title="Article Library"
                heading="Tester Reading"
                inputClassName={inputClass(false)}
                searchValue={articleSearch}
                onSearchChange={setArticleSearch}
                searchPlaceholder="Search articles"
                filterValue={articleCategoryFilter}
                onFilterChange={setArticleCategoryFilter}
                categories={articleCategories}
              >
                <LearningLibrarySections
                  groupedEntries={groupedFilteredArticles}
                  emptyMessage="No articles match the current search and category filters."
                  compact
                  renderItem={(article) => renderArticleLibraryItem(article)}
                />
              </LearningShellPanel>
            </CompactLibraryDisclosure>
          ) : null}

          <LearningShellPanel
            hidden={isSinglePaneLearning}
            title="Article Library"
            heading="Tester Reading"
            description="Short reads for testers who want clearer judgement, calmer investigation, and stronger automation habits."
            inputClassName={inputClass(false)}
            searchValue={articleSearch}
            onSearchChange={setArticleSearch}
            searchPlaceholder="Search articles"
            filterValue={articleCategoryFilter}
            onFilterChange={setArticleCategoryFilter}
            categories={articleCategories}
          >
            <LearningLibrarySections
              groupedEntries={groupedFilteredArticles}
              emptyMessage="No articles match the current search and category filters."
              renderItem={(article) => renderArticleLibraryItem(article)}
            />
          </LearningShellPanel>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-stone-300 bg-white p-4 shadow-sm sm:p-6 lg:p-8">
            <LearningContentHeader
              compact={isSinglePaneLearning}
              category={selectedArticle.category}
              title={selectedArticle.title}
              summary={selectedArticle.summary}
              meta={selectedArticle.readingLength}
              action={
                selectedArticle.launchTarget ? (
                  <button
                    type="button"
                    onClick={() => {
                      const launchTarget = selectedArticle.launchTarget
                      if (!launchTarget) return
                      if (launchTarget.type === 'route') {
                        window.open(launchTarget.value, '_blank')
                      } else {
                        setTab(launchTarget.value as typeof tab)
                      }
                    }}
                    className="rounded-full bg-stone-200 px-3 py-1 text-sm font-medium text-slate-700"
                  >
                    {selectedArticle.launchTarget.label}
                  </button>
                ) : null
              }
            />

            <div ref={articleContentRef} onScroll={handleArticleContentScroll} className="mt-4 min-h-0 flex-1 overflow-y-auto pr-2 sm:mt-6">
              <MarkdownDocument markdown={selectedArticle.markdown} hideFirstHeading />
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'data-folder' ? (
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Data Folder</h2>
            <p className="mt-2 text-slate-600">Runtime JSON files are stored outside the app bundle in a user-selected folder.</p>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-sm text-slate-700">
              {context?.dataDirectory ?? 'No folder selected'}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => void loadDesktopData()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                Refresh data
              </button>
              <button type="button" onClick={() => void handleSelectDataDirectory()} className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
                Choose folder
              </button>
              <button type="button" onClick={() => void handleOpenDataDirectory()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                Open folder
              </button>
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Workshop Progress</h2>
            <p className="mt-2 text-slate-600">
              Workshop progress, article read-state, and quiz gate progress are stored locally in the desktop app.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleResetWorkshopProgress}
                className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700"
              >
                Clear workshop progress
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {tab === 'server' ? (
        <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold">Server</h2>
          <dl className="mt-4 space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <dt className="text-sm text-slate-500">Active URL</dt>
              <dd className="mt-1 font-mono text-slate-900">{context?.serverUrl ?? 'Unavailable'}</dd>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <dt className="text-sm text-slate-500">Port</dt>
              <dd className="mt-1 font-mono text-slate-900">{context?.port ?? 'Unavailable'}</dd>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
              <dt className="text-sm text-slate-500">Fallback port used</dt>
              <dd className="mt-1 text-slate-900">{context?.usedFallbackPort ? 'Yes' : 'No'}</dd>
            </div>
          </dl>
          <div className="mt-4 flex flex-wrap gap-3">
            {context?.serverUrl ? (
              <button type="button" onClick={() => void navigator.clipboard.writeText(context.serverUrl ?? '')} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
                Copy URL
              </button>
            ) : null}
            <button type="button" onClick={() => void loadDesktopData()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
              Refresh status
            </button>
          </div>
        </section>
      ) : null}
      </div>
    </div>
  )
}

export function AdminUnavailablePage() {
  return (
    <section className="rounded-[2rem] border border-stone-300 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Admin tools moved to the desktop app</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        The standalone Electron app hosts the desktop-only admin shell. Use the Desktop tab in the desktop app window to manage users, break modes, runtime data, and server settings.
      </p>
    </section>
  )
}

export function DesktopRoute({
  theme = 'light',
  onToggleTheme = () => {},
  children,
}: {
  theme?: ThemeMode
  onToggleTheme?: () => void
  children: ReactNode
}) {
  if (!isDesktop) {
    return <AdminUnavailablePage />
  }

  void theme
  void onToggleTheme
  return <>{children}</>
}

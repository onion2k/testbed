import { useEffect, useMemo, useRef, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  type Location,
} from 'react-router-dom'
import { AuthProvider } from './auth'
import { useAuth } from './auth-context'
import {
  breakModes,
  contentLabels,
  demoConfig,
  demoUsers,
  loadRuntimeConfig,
  setRuntimeBreakModes,
} from './lib/demo-config'
import {
  applyScenarioPreset,
  clearRequestTraces,
  calculateSubtotal,
  createUser,
  deleteUser,
  fetchAdminSnapshot,
  fetchOrders,
  fetchPostmanCollection,
  fetchPostmanEnvironment,
  fetchProducts,
  fetchRequestTraces,
  fetchScenarioPresets,
  fetchTestControlsConfig,
  refreshDesktopContext,
  resetBreakModes,
  resetRuntimeData,
  saveBreakModes,
  submitOrder,
  updateTestControlsConfig,
  updateTracingConfig,
  updateProduct,
  updateUser,
} from './lib/demo-api'
import { qaClass, testId } from './lib/selectors'
import {
  getStoredCart,
  getStoredWorkshopLastView,
  getStoredWorkshopQuizProgress,
  getStoredWorkshopReadParts,
  getStoredWorkshopProgress,
  resetDemoState,
  resetWorkshopProgress,
  setStoredCart,
  setStoredWorkshopLastView,
  setStoredWorkshopQuizProgress,
  setStoredWorkshopReadParts,
  setStoredWorkshopProgress,
} from './lib/storage'
import { defaultWorkshopSlug, workshopEntries } from './lib/workshops'
import type {
  AdminSnapshot,
  BreakModes,
  CartItem,
  DemoUser,
  DesktopContext,
  EndpointFaultConfig,
  EndpointKey,
  FaultResponseMode,
  Order,
  PaymentDetails,
  Product,
  RequestTraceEntry,
  Role,
  ScenarioPreset,
  ShippingDetails,
  TestControlsConfig,
} from './types'

function currency(value: number) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(value)
}

function inputClass(hasError: boolean) {
  return `w-full rounded-2xl border px-4 py-3 outline-none transition ${
    hasError
      ? 'border-rose-500 bg-rose-50 focus:border-rose-600'
      : 'border-stone-300 focus:border-slate-500'
  }`
}

function calculateDisplayedSubtotal(subtotal: number, hasBrokenCheckoutTotal: boolean) {
  return hasBrokenCheckoutTotal ? Math.max(subtotal - 7, 0) : subtotal
}

function calculateCheckoutTotals(subtotal: number, hasBrokenCheckoutTotal: boolean) {
  const shipping = 12
  const displayedSubtotal = calculateDisplayedSubtotal(subtotal, hasBrokenCheckoutTotal)
  const total = displayedSubtotal + shipping

  return {
    subtotal: displayedSubtotal,
    shipping,
    total,
  }
}

function renderInlineMarkdown(text: string) {
  const parts = text.split(/(`[^`]+`)/g)

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={`${part}-${index}`} className="rounded bg-stone-100 px-1.5 py-0.5 font-mono text-[0.95em] text-slate-800">
          {part.slice(1, -1)}
        </code>
      )
    }

    return part
  })
}

function MarkdownDocument({ markdown }: { markdown: string }) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: ReactNode[] = []
  let index = 0

  function collectParagraph(startIndex: number) {
    const collected: string[] = []
    let cursor = startIndex

    while (cursor < lines.length) {
      const line = lines[cursor]
      if (!line.trim()) break
      if (/^#{1,6}\s/.test(line) || /^[-*]\s/.test(line) || /^\d+\.\s/.test(line) || /^```/.test(line) || /^\|/.test(line)) break
      collected.push(line.trim())
      cursor += 1
    }

    return {
      text: collected.join(' '),
      nextIndex: cursor,
    }
  }

  function collectList(startIndex: number, ordered: boolean) {
    const items: string[] = []
    let cursor = startIndex
    const pattern = ordered ? /^\d+\.\s+(.*)$/ : /^[-*]\s+(.*)$/

    while (cursor < lines.length) {
      const match = lines[cursor].match(pattern)
      if (!match) break
      items.push(match[1])
      cursor += 1
    }

    return { items, nextIndex: cursor }
  }

  function collectCodeBlock(startIndex: number) {
    const firstLine = lines[startIndex]
    const language = firstLine.replace(/^```/, '').trim()
    const content: string[] = []
    let cursor = startIndex + 1

    while (cursor < lines.length && !lines[cursor].startsWith('```')) {
      content.push(lines[cursor])
      cursor += 1
    }

    return {
      language,
      code: content.join('\n'),
      nextIndex: cursor + 1,
    }
  }

  function collectTable(startIndex: number) {
    const tableLines: string[] = []
    let cursor = startIndex

    while (cursor < lines.length && lines[cursor].startsWith('|')) {
      tableLines.push(lines[cursor])
      cursor += 1
    }

    const rows = tableLines
      .map((line) => line.split('|').slice(1, -1).map((cell) => cell.trim()))
      .filter((row) => row.length > 0)

    const [header, separator, ...body] = rows
    const usableBody = separator?.every((cell) => /^:?-{3,}:?$/.test(cell)) ? body : [separator, ...body].filter(Boolean)

    return {
      header: header ?? [],
      body: usableBody,
      nextIndex: cursor,
    }
  }

  while (index < lines.length) {
    const line = lines[index]

    if (!line.trim()) {
      index += 1
      continue
    }

    if (/^#{1,6}\s/.test(line)) {
      const level = line.match(/^#+/)?.[0].length ?? 1
      const text = line.replace(/^#{1,6}\s+/, '')
      const isFirstBlock = blocks.length === 0
      const className =
        {
          1: 'text-4xl font-semibold tracking-tight text-slate-900',
          2: `${isFirstBlock ? '' : 'mt-10 '}text-2xl font-semibold text-slate-900`,
          3: `${isFirstBlock ? '' : 'mt-8 '}text-xl font-semibold text-slate-900`,
          4: `${isFirstBlock ? '' : 'mt-6 '}text-lg font-semibold text-slate-900`,
        }[level] ?? `${isFirstBlock ? '' : 'mt-6 '}text-base font-semibold text-slate-900`

      blocks.push(
        <div key={`heading-${index}`} className={className}>
          {renderInlineMarkdown(text)}
        </div>,
      )
      index += 1
      continue
    }

    if (line.startsWith('```')) {
      const block = collectCodeBlock(index)
      blocks.push(
        <pre key={`code-${index}`} className="overflow-x-auto rounded-[1.5rem] bg-slate-950 p-5 text-sm text-slate-100">
          <code>{block.code}</code>
        </pre>,
      )
      index = block.nextIndex
      continue
    }

    if (line.startsWith('|')) {
      const table = collectTable(index)
      blocks.push(
        <div key={`table-${index}`} className="overflow-x-auto rounded-[1.5rem] border border-stone-200 bg-white">
          <table className="min-w-full border-collapse text-left text-sm">
            <thead className="bg-stone-100 text-slate-700">
              <tr>
                {table.header.map((cell, cellIndex) => (
                  <th key={`header-${cellIndex}`} className="border-b border-stone-200 px-4 py-3 font-semibold">
                    {renderInlineMarkdown(cell)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.body.map((row, rowIndex) => (
                <tr key={`row-${rowIndex}`} className="border-t border-stone-200">
                  {row.map((cell, cellIndex) => (
                    <td key={`cell-${rowIndex}-${cellIndex}`} className="px-4 py-3 align-top text-slate-700">
                      {renderInlineMarkdown(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
      index = table.nextIndex
      continue
    }

    if (/^[-*]\s/.test(line)) {
      const list = collectList(index, false)
      blocks.push(
        <ul key={`ul-${index}`} className="ml-6 list-disc space-y-2 text-slate-700">
          {list.items.map((item, itemIndex) => (
            <li key={`ul-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>,
      )
      index = list.nextIndex
      continue
    }

    if (/^\d+\.\s/.test(line)) {
      const list = collectList(index, true)
      blocks.push(
        <ol key={`ol-${index}`} className="ml-6 list-decimal space-y-2 text-slate-700">
          {list.items.map((item, itemIndex) => (
            <li key={`ol-item-${itemIndex}`}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>,
      )
      index = list.nextIndex
      continue
    }

    const paragraph = collectParagraph(index)
    blocks.push(
      <p key={`paragraph-${index}`} className="leading-7 text-slate-700">
        {renderInlineMarkdown(paragraph.text)}
      </p>,
    )
    index = paragraph.nextIndex
  }

  return <div className="space-y-5">{blocks}</div>
}

function canAccessRole(userRole: Role, requiredRole: Role) {
  if (requiredRole === 'customer') {
    return userRole === 'customer' || userRole === 'vip'
  }

  return userRole === requiredRole
}

function validateLoginForm(username: string, password: string) {
  const errors: Record<string, string> = {}

  if (!username.trim()) {
    errors.username = 'Username is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username.trim())) {
    errors.username = 'Enter a valid email address.'
  }

  if (!password.trim()) {
    errors.password = 'Password is required.'
  } else if (password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
}

function validateShippingForm(shipping: ShippingDetails) {
  const errors: Partial<Record<keyof ShippingDetails, string>> = {}

  if (!shipping.fullName.trim()) errors.fullName = 'Full name is required.'
  if (!shipping.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (!shipping.address1.trim()) errors.address1 = 'Address line 1 is required.'
  if (!shipping.city.trim()) errors.city = 'City is required.'
  if (!shipping.postcode.trim()) {
    errors.postcode = 'Postcode is required.'
  } else if (shipping.postcode.trim().length < 4) {
    errors.postcode = 'Postcode must be at least 4 characters.'
  }
  if (!shipping.country.trim()) errors.country = 'Country is required.'

  return errors
}

function validatePaymentForm(payment: PaymentDetails) {
  const errors: Partial<Record<keyof PaymentDetails, string>> = {}
  const normalizedCardNumber = payment.cardNumber.replace(/\s+/g, '')

  if (!payment.cardName.trim()) errors.cardName = 'Name on card is required.'
  if (!normalizedCardNumber) {
    errors.cardNumber = 'Card number is required.'
  } else if (!/^\d{16}$/.test(normalizedCardNumber)) {
    errors.cardNumber = 'Card number must contain 16 digits.'
  }
  if (!payment.expiry.trim()) {
    errors.expiry = 'Expiry is required.'
  } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payment.expiry.trim())) {
    errors.expiry = 'Use MM/YY format.'
  }
  if (!payment.cvv.trim()) {
    errors.cvv = 'CVV is required.'
  } else if (!/^\d{3,4}$/.test(payment.cvv.trim())) {
    errors.cvv = 'CVV must be 3 or 4 digits.'
  }

  return errors
}

function validateManagedUser(user: DemoUser) {
  const errors: Partial<Record<keyof DemoUser, string>> = {}

  if (!user.displayName.trim()) errors.displayName = 'Display name is required.'
  if (!user.username.trim()) {
    errors.username = 'Username is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.username.trim())) {
    errors.username = 'Enter a valid email address.'
  }
  if (!user.password.trim()) {
    errors.password = 'Password is required.'
  } else if (user.password.trim().length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  }

  return errors
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

function createDownload(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  window.URL.revokeObjectURL(url)
}

function arePresetValuesModified(config: TestControlsConfig | null, presets: ScenarioPreset[]) {
  if (!config?.activePresetId) return false

  const preset = presets.find((candidate) => candidate.id === config.activePresetId)
  if (!preset) return false

  return (
    JSON.stringify(preset.breakModes) !== JSON.stringify(config.breakModes) ||
    JSON.stringify(preset.faults) !== JSON.stringify(config.faults)
  )
}

const isDesktop = Boolean(window.desktopBridge?.isDesktop)

function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [, setRuntimeVersion] = useState(0)
  const navLinks = [
    ['/', 'Home'],
    ['/shop', 'Shop'],
    ['/vip', 'VIP'],
    ['/orders', 'Orders'],
    ['/login', user ? 'Switch user' : 'Login'],
  ]

  useEffect(() => {
    let cancelled = false
    let inFlight = false

    async function syncRuntimeState() {
      if (inFlight) return
      inFlight = true
      try {
        await loadRuntimeConfig()
        if (!cancelled) {
          setRuntimeVersion((current) => current + 1)
        }
      } finally {
        inFlight = false
      }
    }

    void syncRuntimeState()

    function handleFocus() {
      void syncRuntimeState()
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void syncRuntimeState()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    const intervalId = window.setInterval(() => {
      void syncRuntimeState()
    }, 2000)

    return () => {
      cancelled = true
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(intervalId)
    }
  }, [location.pathname])

  if (isDesktop && location.pathname === '/desktop') {
    return (
      <div className="min-h-screen bg-stone-100 text-slate-900">
        <main className="w-full px-6 py-8">
          <Routes>
            <Route path="/desktop" element={<DesktopRoute />} />
            <Route path="*" element={<Navigate to="/desktop" replace />} />
          </Routes>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-stone-100 text-slate-900">
      <header className="border-b border-stone-300 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              to="/"
              className={`text-2xl font-semibold tracking-tight ${qaClass('qa-brand-link')}`}
              data-testid={testId('brand-link')}
            >
              {demoConfig.appName}
            </Link>
          </div>
          <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 text-sm">
            {navLinks.map(([path, label]) => (
              <Link
                key={path}
                to={path}
                className={`rounded-full px-4 py-2 transition ${
                  location.pathname === path
                    ? 'nav-pill-active bg-slate-900 text-white'
                    : 'bg-stone-200 text-slate-700 hover:bg-stone-300'
                } ${qaClass('qa-nav-link')}`}
                data-testid={testId(`nav-${label.toLowerCase().replaceAll(' ', '-')}`)}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm">
            {user ? (
              <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                <span>
                  Signed in as <strong>{user.displayName}</strong> ({user.role})
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="btn-primary rounded-full bg-amber-500 px-3 py-1.5 font-medium text-white"
                  data-testid={testId('logout-button')}
                >
                  Logout
                </button>
              </div>
            ) : (
              <span>Not signed in</span>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/shop"
            element={
              <ProtectedRoute role="customer">
                <ShopPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/checkout"
            element={
              <ProtectedRoute role="customer">
                <CheckoutPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders"
            element={
              <ProtectedRoute role="customer">
                <OrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/vip"
            element={
              <ProtectedRoute role="vip">
                <VipPage />
              </ProtectedRoute>
            }
          />
          <Route path="/admin" element={<AdminUnavailablePage />} />
          <Route path="/desktop" element={<DesktopRoute />} />
          <Route path="/reset" element={<ResetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: ReactNode; role: Role }) {
  const { user } = useAuth()
  const location = useLocation()

  const bypass = role === 'vip' && breakModes.bypassVipGuard

  if (bypass) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (!canAccessRole(user.role, role)) {
    return (
      <section className="rounded-3xl border border-rose-200 bg-rose-50 p-8">
        <h1 className="text-3xl font-semibold">Access denied</h1>
        <p className="mt-3 max-w-2xl text-slate-700">
          This route requires <strong>{role === 'customer' ? 'customer or vip' : role}</strong>{' '}
          access. Current user role: {user.role}.
        </p>
      </section>
    )
  }

  return <>{children}</>
}

function HomePage() {
  const featuredProducts = demoUsers.length > 0
    ? [
        {
          title: 'Wireless Headset',
          category: 'Audio',
          description: 'Noise-cancelling sound for focused sessions and cleaner demo calls.',
          accent: 'from-amber-100 to-orange-50',
        },
        {
          title: 'Smart Lamp',
          category: 'Home Office',
          description: 'Adaptive light profiles built for long workdays and late-night checkouts.',
          accent: 'from-sky-100 to-cyan-50',
        },
        {
          title: 'Mechanical Keyboard',
          category: 'Peripherals',
          description: 'Compact, tactile, and fast enough for power users and premium desks.',
          accent: 'from-stone-200 to-stone-50',
        },
      ]
    : []

  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-[2.5rem] bg-white shadow-sm ring-1 ring-stone-200">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="px-8 py-10 lg:px-10 lg:py-12">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-amber-700">Spring Collection</p>
            <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-slate-900 lg:text-6xl">
              Upgrade your workspace with gear that looks as good as it performs.
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-600">
              Discover practical audio, lighting, and desk accessories curated for modern setups. Fast checkout, VIP exclusives, and a clean shopping experience are all built in.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="btn-primary rounded-full bg-slate-900 px-5 py-3 font-medium text-white">
                Shop now
              </Link>
              <Link to="/vip" className="rounded-full bg-stone-200 px-5 py-3 font-medium text-slate-700">
                Explore VIP picks
              </Link>
            </div>
          </div>

          <div className="grid gap-4 bg-stone-50 p-6 lg:p-8">
            {featuredProducts.map((product) => (
              <article
                key={product.title}
                className={`rounded-[1.75rem] bg-gradient-to-br ${product.accent} p-5 shadow-sm ring-1 ring-white/60`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{product.category}</p>
                <h2 className="mt-3 text-2xl font-semibold text-slate-900">{product.title}</h2>
                <p className="mt-2 text-sm text-slate-700">{product.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {[
          {
            title: 'Designed for everyday setups',
            description: 'Smart desk essentials, elevated peripherals, and clean home-office hardware.',
          },
          {
            title: 'Premium member exclusives',
            description: 'VIP shoppers unlock private products and a curated premium area.',
          },
          {
            title: 'Fast checkout experience',
            description: 'Build a basket, move through a multi-step checkout, and keep order history close at hand.',
          },
        ].map((card) => (
          <article key={card.title} className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">{card.title}</h2>
            <p className="mt-3 text-slate-600">{card.description}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Featured categories</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              ['Audio', 'Immersive sound and focus-first listening.'],
              ['Lighting', 'Desk lighting made for flexible workspaces.'],
              ['Peripherals', 'Compact, tactile gear for productive setups.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <h2 className="text-xl font-semibold">{title}</h2>
                <p className="mt-2 text-sm text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Why shoppers love it</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Clean product browsing with clear pricing and stock visibility.</li>
            <li className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">Multi-step checkout flow with persisted basket and order history.</li>
            <li className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">VIP-only collection for premium users looking for exclusive items.</li>
          </ul>
        </div>
      </section>
    </div>
  )
}

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, user } = useAuth()
  const [username, setUsername] = useState('customer@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const from = (location.state as { from?: Location } | null)?.from?.pathname ?? '/'

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true })
    }
  }, [from, navigate, user])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const nextErrors = validateLoginForm(username, password)
    setFieldErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    try {
      await login(username, password)
      navigate(from, { replace: true })
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Login failed.')
    }
  }

  return (
    <section className="mx-auto max-w-xl rounded-[2rem] border border-stone-300 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Login</h1>
      <p className="mt-3 text-slate-600">Credentials are loaded from the runtime JSON data folder.</p>
      {from !== '/' ? (
        <p className="mt-2 text-sm text-slate-500">
          Sign in to continue to <span className="font-mono">{from}</span>.
        </p>
      ) : null}
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Username</span>
          <input
            className={`${inputClass(Boolean(fieldErrors.username))} ${qaClass('qa-login-username')}`}
            data-testid={testId('login-username')}
            aria-label="Username"
            aria-invalid={Boolean(fieldErrors.username)}
            value={username}
            onChange={(event) => {
              setUsername(event.target.value)
              setFieldErrors((current) => ({ ...current, username: '' }))
            }}
          />
          {fieldErrors.username ? <p className="mt-2 text-sm text-rose-700">{fieldErrors.username}</p> : null}
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Password</span>
          <input
            type="password"
            className={`${inputClass(Boolean(fieldErrors.password))} ${qaClass('qa-login-password')}`}
            data-testid={testId('login-password')}
            aria-label="Password"
            aria-invalid={Boolean(fieldErrors.password)}
            value={password}
            onChange={(event) => {
              setPassword(event.target.value)
              setFieldErrors((current) => ({ ...current, password: '' }))
            }}
          />
          {fieldErrors.password ? <p className="mt-2 text-sm text-rose-700">{fieldErrors.password}</p> : null}
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <button
          type="submit"
          className="btn-primary rounded-full bg-slate-900 px-5 py-3 font-medium text-white"
          data-testid={testId('login-submit')}
        >
          Sign in
        </button>
      </form>
    </section>
  )
}

function useCartProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart())

  async function loadProducts() {
    setLoading(true)
    setError(null)

    try {
      setProducts(await fetchProducts())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load products.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadProducts()
  }, [])

  useEffect(() => {
    setStoredCart(cart)
  }, [cart])

  function addToCart(productId: string) {
    setCart((current) => {
      const match = current.find((item) => item.productId === productId)
      if (match) {
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...current, { productId, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) =>
      current
        .map((item) => (item.productId === productId ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0),
    )
  }

  return { products, loading, error, cart, addToCart, updateQuantity, reload: loadProducts, setCart }
}

function BasketSummary({
  cart,
  products,
  updateQuantity,
}: {
  cart: CartItem[]
  products: Product[]
  updateQuantity: (productId: string, quantity: number) => void
}) {
  const items = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }))
    .filter((item) => item.product)

  const subtotal = calculateSubtotal(cart, products)
  const displayedSubtotal = calculateDisplayedSubtotal(subtotal, breakModes.brokenCheckoutTotal)

  return (
    <aside className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
      <h2 className="text-2xl font-semibold">{contentLabels.basketTitle}</h2>
      <div className="mt-4 space-y-3">
        {items.length === 0 ? (
          <p className="text-sm text-slate-600">Your basket is empty.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.productId}
              className={`rounded-2xl border border-stone-200 bg-stone-50 p-4 ${qaClass('qa-basket-item')}`}
              data-testid={testId(`basket-item-${item.productId}`)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{item.product?.name}</p>
                  <p className="text-sm text-slate-600">{currency(item.product?.price ?? 0)}</p>
                </div>
                <label className="text-sm">
                  Qty
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(event) => updateQuantity(item.productId, Number(event.target.value) || 0)}
                    className="ml-2 w-16 rounded-xl border border-stone-300 px-2 py-1"
                    aria-label={`Quantity for ${item.product?.name ?? item.productId}`}
                  />
                </label>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
        <span className="font-medium">Subtotal</span>
        <span className="font-semibold">{currency(displayedSubtotal)}</span>
      </div>
      <Link
        to="/checkout"
        className="btn-primary mt-4 inline-flex rounded-full bg-slate-900 px-4 py-2 font-medium text-white"
        data-testid={testId('basket-checkout-link')}
      >
        Continue to checkout
      </Link>
    </aside>
  )
}

function ProductGrid({
  title,
  products,
  loading,
  error,
  onAddToCart,
  onRetry,
}: {
  title: string
  products: Product[]
  loading: boolean
  error: string | null
  onAddToCart: (productId: string) => void
  onRetry: () => void
}) {
  if (loading) {
    return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Loading products...</section>
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8">
        <h1 className="text-3xl font-semibold">Products unavailable</h1>
        <p className="mt-3 text-slate-700">{error}</p>
        <button type="button" onClick={onRetry} className="btn-danger mt-4 rounded-full bg-rose-700 px-4 py-2 font-medium text-white">
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="mt-2 text-slate-600">
        The markup intentionally exposes ARIA roles, `data-testid` values, and CSS hooks.
      </p>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.length === 0 ? (
          <p className="text-sm text-slate-600">No products returned from the catalog service.</p>
        ) : (
          products.map((product) => (
            <article
              key={product.id}
              className={`overflow-hidden rounded-[1.75rem] border border-stone-200 bg-stone-50 ${qaClass('qa-product-card')}`}
              data-testid={testId(`product-${product.id}`)}
            >
              <img src={product.image} alt={product.name} className="h-48 w-full object-cover" />
              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                    {product.category}
                  </span>
                  {product.vipOnly ? (
                    <span className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">VIP</span>
                  ) : null}
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{product.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">{product.description}</p>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xl font-semibold">{currency(product.price)}</p>
                    <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                  </div>
                  <button
                    type="button"
                    disabled={breakModes.disableAddToCart}
                    onClick={() => onAddToCart(product.id)}
                    className="btn-primary whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-400"
                    data-testid={testId(`add-to-cart-${product.id}`)}
                    aria-label={`${contentLabels.addToCart} ${product.name}`}
                  >
                    {contentLabels.addToCart}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

function ShopPage() {
  const cartState = useCartProducts()
  const shopperProducts = cartState.products.filter((product) => !product.vipOnly)

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <ProductGrid
        title={contentLabels.shopTitle}
        products={shopperProducts}
        loading={cartState.loading}
        error={cartState.error}
        onAddToCart={cartState.addToCart}
        onRetry={cartState.reload}
      />
      <BasketSummary cart={cartState.cart} products={cartState.products} updateQuantity={cartState.updateQuantity} />
    </div>
  )
}

function VipPage() {
  const cartState = useCartProducts()
  const vipProducts = cartState.products.filter((product) => product.vipOnly)

  return (
    <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
      <ProductGrid
        title={contentLabels.vipTitle}
        products={vipProducts}
        loading={cartState.loading}
        error={cartState.error}
        onAddToCart={cartState.addToCart}
        onRetry={cartState.reload}
      />
      <BasketSummary cart={cartState.cart} products={cartState.products} updateQuantity={cartState.updateQuantity} />
    </div>
  )
}

function OrdersPage() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      setLoading(true)
      setError(null)

      try {
        const nextOrders = await fetchOrders()
        setOrders(nextOrders.filter((order) => order.username === user?.username))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load orders.')
      } finally {
        setLoading(false)
      }
    }

    void load()
  }, [user?.username])

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Loading orders...</section>
  }

  if (error) {
    return (
      <section className="rounded-[2rem] border border-rose-200 bg-rose-50 p-8">
        <h1 className="text-3xl font-semibold">Order history unavailable</h1>
        <p className="mt-3 text-slate-700">{error}</p>
      </section>
    )
  }

  return (
    <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
      <h1 className="text-3xl font-semibold">Order history</h1>
      <p className="mt-2 text-slate-600">Orders persist in the selected runtime data folder until reset.</p>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-600">No orders have been created yet.</p>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="rounded-3xl border border-stone-200 bg-stone-50 p-5" data-testid={testId(`order-${order.id}`)}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold">{order.id}</h2>
                  <p className="text-sm text-slate-600">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{currency(order.total)}</p>
                  <p className="text-sm text-slate-500">{order.username}</p>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  )
}

const emptyShipping: ShippingDetails = {
  fullName: '',
  email: '',
  address1: '',
  city: '',
  postcode: '',
  country: 'United Kingdom',
}

const emptyPayment: PaymentDetails = {
  cardName: '',
  cardNumber: '',
  expiry: '',
  cvv: '',
}

function CheckoutPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => getStoredCart())
  const [step, setStep] = useState(1)
  const [shipping, setShipping] = useState<ShippingDetails>(emptyShipping)
  const [payment, setPayment] = useState<PaymentDetails>(emptyPayment)
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingDetails, string>>>({})
  const [paymentErrors, setPaymentErrors] = useState<Partial<Record<keyof PaymentDetails, string>>>({})
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<Order | null>(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setProducts(await fetchProducts())
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load products.')
      } finally {
        setLoading(false)
      }
    }

    void loadProducts()
  }, [])

  useEffect(() => {
    setStoredCart(cart)
  }, [cart])

  const subtotal = useMemo(() => calculateSubtotal(cart, products), [cart, products])
  const checkoutTotals = calculateCheckoutTotals(subtotal, breakModes.brokenCheckoutTotal)

  function goToNextStep() {
    setError(null)

    if (step === 1 && cart.length === 0) {
      setError('Add at least one item before continuing to shipping.')
      return
    }

    if (step === 2) {
      const nextErrors = validateShippingForm(shipping)
      setShippingErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        setError('Complete the shipping form before continuing.')
        return
      }
    }

    if (step === 3) {
      const nextErrors = validatePaymentForm(payment)
      setPaymentErrors(nextErrors)
      if (Object.keys(nextErrors).length > 0) {
        setError('Complete the payment form before reviewing the order.')
        return
      }
    }

    setStep((current) => current + 1)
  }

  async function placeOrder() {
    if (!user) return

    const shippingValidation = validateShippingForm(shipping)
    const paymentValidation = validatePaymentForm(payment)
    setShippingErrors(shippingValidation)
    setPaymentErrors(paymentValidation)

    if (Object.keys(shippingValidation).length > 0 || Object.keys(paymentValidation).length > 0) {
      setError('Fix the highlighted fields before placing the order.')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const order = await submitOrder({
        username: user.username,
        userRole: user.role,
        items: cart,
        products,
        shipping,
        payment,
      })

      setConfirmation(order)
      setCart([])
      setStoredCart([])
      setStep(4)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Checkout failed.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Loading checkout...</section>
  }

  return (
    <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">{contentLabels.checkoutTitle}</h1>
          <p className="mt-2 text-slate-600">Step {step} of 4</p>
        </div>
        <ol className="flex gap-2 text-sm" aria-label="Checkout steps">
          {['Basket', 'Shipping', 'Payment', 'Review'].map((label, index) => (
            <li key={label} className={`rounded-full px-3 py-1 ${step === index + 1 ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-600'}`}>
              {label}
            </li>
          ))}
        </ol>
      </div>

      {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}

      {step === 1 ? (
        <div className="mt-6 grid gap-4">
          {cart.length === 0 ? (
            <div className="rounded-3xl border border-stone-200 bg-stone-50 p-6">
              <p className="text-slate-600">Your basket is empty.</p>
              <button type="button" onClick={() => navigate('/shop')} className="btn-primary mt-4 rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
                Go to shop
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId)
              return (
                <div key={item.productId} className="rounded-3xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product?.name}</p>
                      <p className="text-sm text-slate-500">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold">{currency((product?.price ?? 0) * item.quantity)}</p>
                  </div>
                </div>
              )
            })
          )}
          <div className="flex items-center justify-between rounded-3xl border border-stone-200 bg-stone-50 p-5">
            <span className="font-medium">Subtotal</span>
            <span className="font-semibold">{currency(checkoutTotals.subtotal)}</span>
          </div>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {([
            ['fullName', 'Full name'],
            ['email', 'Email'],
            ['address1', 'Address line 1'],
            ['city', 'City'],
            ['postcode', 'Postcode'],
            ['country', 'Country'],
          ] as const).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-medium">{label}</span>
              <input
                className={inputClass(Boolean(shippingErrors[key]))}
                aria-invalid={Boolean(shippingErrors[key])}
                value={shipping[key]}
                onChange={(event) => {
                  setShipping((current) => ({ ...current, [key]: event.target.value }))
                  setShippingErrors((current) => ({ ...current, [key]: '' }))
                }}
              />
              {shippingErrors[key] ? <p className="mt-2 text-sm text-rose-700">{shippingErrors[key]}</p> : null}
            </label>
          ))}
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {([
            ['cardName', 'Name on card'],
            ['cardNumber', 'Card number'],
            ['expiry', 'Expiry'],
            ['cvv', 'CVV'],
          ] as const).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-2 block text-sm font-medium">{label}</span>
              <input
                className={inputClass(Boolean(paymentErrors[key]))}
                aria-invalid={Boolean(paymentErrors[key])}
                value={payment[key]}
                onChange={(event) => {
                  setPayment((current) => ({ ...current, [key]: event.target.value }))
                  setPaymentErrors((current) => ({ ...current, [key]: '' }))
                }}
              />
              {paymentErrors[key] ? <p className="mt-2 text-sm text-rose-700">{paymentErrors[key]}</p> : null}
            </label>
          ))}
        </div>
      ) : null}

      {step === 4 ? (
        <div className="mt-6 rounded-3xl border border-stone-200 bg-stone-50 p-6">
          {confirmation ? (
            <>
              <h2 className="text-2xl font-semibold">Order confirmed</h2>
              <p className="mt-2 text-slate-600">Reference: {confirmation.id}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Review order</h2>
              <dl className="mt-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Subtotal</dt>
                  <dd>{currency(checkoutTotals.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Shipping</dt>
                  <dd>{currency(checkoutTotals.shipping)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-3 font-semibold">
                  <dt>Total</dt>
                  <dd>{currency(checkoutTotals.total)}</dd>
                </div>
              </dl>
            </>
          )}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 1 && !confirmation ? (
          <button type="button" onClick={() => setStep((current) => current - 1)} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
            Back
          </button>
        ) : null}
        {step < 4 ? (
          <button
            type="button"
            onClick={goToNextStep}
            className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white"
            disabled={step === 1 && cart.length === 0}
            data-testid={testId(`checkout-step-${step}-next`)}
          >
            Next
          </button>
        ) : null}
        {step === 4 && !confirmation ? (
          <button type="button" onClick={() => void placeOrder()} className="btn-success rounded-full bg-emerald-600 px-4 py-2 font-medium text-white" disabled={submitting} data-testid={testId('place-order-button')}>
            {submitting ? 'Submitting...' : 'Place order'}
          </button>
        ) : null}
        {confirmation ? (
          <Link to="/orders" className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
            View orders
          </Link>
        ) : null}
      </div>
    </section>
  )
}

function AdminUnavailablePage() {
  return (
    <section className="rounded-[2rem] border border-stone-300 bg-white p-8 shadow-sm">
      <h1 className="text-3xl font-semibold">Admin tools moved to the desktop app</h1>
      <p className="mt-3 max-w-2xl text-slate-600">
        The standalone Electron app hosts the desktop-only admin shell. Use the Desktop tab in the desktop app window to manage users, break modes, runtime data, and server settings.
      </p>
    </section>
  )
}

function DesktopRoute() {
  if (!isDesktop) {
    return <AdminUnavailablePage />
  }

  return <DesktopAdminPage />
}

function DesktopAdminPage() {
  const initialWorkshopLastView = getStoredWorkshopLastView()
  const [tab, setTab] = useState<
    'dashboard' | 'catalog' | 'users' | 'break-modes' | 'scenarios' | 'tracing' | 'postman' | 'workshops' | 'data-folder' | 'server'
  >('workshops')
  const [selectedWorkshopSlug, setSelectedWorkshopSlug] = useState(initialWorkshopLastView?.workshopSlug ?? defaultWorkshopSlug)
  const [selectedWorkshopPartSlug, setSelectedWorkshopPartSlug] = useState(initialWorkshopLastView?.partSlug ?? workshopEntries[0]?.parts[0]?.slug ?? 'overview')
  const [workshopResetVersion, setWorkshopResetVersion] = useState(0)
  const [workshopProgress, setWorkshopProgress] = useState<Record<string, number>>(() => getStoredWorkshopProgress())
  const [readWorkshopParts, setReadWorkshopParts] = useState<Record<string, boolean>>(() => getStoredWorkshopReadParts())
  const [workshopQuizProgress, setWorkshopQuizProgress] = useState<Record<string, boolean>>(() => getStoredWorkshopQuizProgress())
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
  const groupedWorkshops = useMemo(
    () =>
      workshopEntries.reduce<Record<string, typeof workshopEntries>>((groups, workshop) => {
        groups[workshop.category] = [...(groups[workshop.category] ?? []), workshop]
        return groups
      }, {}),
    [],
  )
  const workshopContentRef = useRef<HTMLDivElement | null>(null)

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
  }, [selectedWorkshop?.slug, selectedWorkshopPart?.slug])

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

  function handleWorkshopContentScroll() {
    checkWorkshopPartCompletion()
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
    setQuizSelections({})
    setQuizFeedback({})
    setSelectedWorkshopSlug(defaultWorkshopSlug)
    setSelectedWorkshopPartSlug(workshopEntries[0]?.parts[0]?.slug ?? 'overview')
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
    '/desktop': 'Desktop admin shell for runtime controls.',
    '/reset': 'Clears local browser state for a fresh run.',
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold">Testbed Admin</h1>
            <p className="mt-2 text-slate-600">Manage runtime JSON state, localhost server settings, and QA test data without using the CLI.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => void loadDesktopData()} className="rounded-full bg-stone-200 px-4 py-2 font-medium text-slate-700">
              Refresh data
            </button>
            {context?.serverUrl ? (
              <a href={context.serverUrl} target="_blank" rel="noreferrer" className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
                Open web app
              </a>
            ) : null}
          </div>
        </div>
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          ['workshops', 'Workshops'],
          ['dashboard', 'Dashboard'],
          ['catalog', 'Products & Orders'],
          ['users', 'Users'],
          ['break-modes', 'Break Modes'],
          ['scenarios', 'Scenarios & Faults'],
          ['tracing', 'Tracing'],
          ['postman', 'Postman'],
          ['data-folder', 'Data Folder'],
          ['server', 'Server'],
        ].map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value as typeof tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${tab === value ? 'bg-slate-900 text-white' : 'bg-stone-200 text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' ? (
        <div className="grid gap-4 xl:grid-cols-2">
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
            <h2 className="text-2xl font-semibold">Routes</h2>
            <div className="mt-4 space-y-2">
              {demoConfig.routes.map((route) => (
                <div key={route.path} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold leading-tight">{route.label}</p>
                      <div className="mt-1 grid grid-cols-[4.75rem_minmax(0,1fr)] items-center gap-x-3 text-xs text-slate-600">
                        <p className="font-mono">{route.path}</p>
                        <p className="truncate">{compactRouteDescriptions[route.path] ?? route.description}</p>
                      </div>
                    </div>
                    <span className="text-[10px] uppercase tracking-[0.2em] text-slate-500">{route.access}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-semibold">Runtime controls</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <dt className="text-xs text-slate-600">Active preset</dt>
                <dd className="font-mono text-xs text-slate-900">{testControls.activePresetId ?? 'none'}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <dt className="text-xs text-slate-600">Preset modified</dt>
                <dd className="font-mono text-xs text-slate-900">{presetModified ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <dt className="text-xs text-slate-600">Tracing enabled</dt>
                <dd className="font-mono text-xs text-slate-900">{testControls.tracing.enabled ? 'Yes' : 'No'}</dd>
              </div>
              <div className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                <dt className="text-xs text-slate-600">Tracing max entries</dt>
                <dd className="font-mono text-xs text-slate-900">{testControls.tracing.maxEntries}</dd>
              </div>
            </dl>
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
                <input className={inputClass(Boolean(userErrors.password))} value={userForm.password} onChange={(event) => setUserForm((current) => ({ ...current, password: event.target.value }))} />
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

            <div className="mt-6 space-y-3">
              {traces.length === 0 ? (
                <p className="text-sm text-slate-600">No traces recorded yet.</p>
              ) : (
                traces.map((trace) => (
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
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-white p-4">
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Response</p>
                        <p className="mt-2 text-sm text-slate-700">Preset: {trace.presetId ?? 'none'}</p>
                        <pre className="mt-3 overflow-x-auto rounded-2xl bg-stone-50 p-3 text-xs text-slate-700">{trace.matchedFault ? JSON.stringify(trace.matchedFault, null, 2) : 'No fault applied'}</pre>
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
        <div className="grid gap-6 xl:h-[calc(100vh-15rem)] xl:grid-cols-[380px_minmax(0,1fr)]">
          <aside className="flex min-h-0 flex-col rounded-[2rem] border border-stone-300 bg-white p-5 shadow-sm">
            <div className="shrink-0">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Workshop Library</p>
              <h2 className="mt-3 text-3xl font-semibold">QA Learning Tracks</h2>
              <p className="mt-3 text-sm text-slate-600">
                Browse the embedded training guides while using the desktop app controls.
              </p>
            </div>

            <div className="mt-5 min-h-0 space-y-5 overflow-y-auto pr-1">
              {Object.entries(groupedWorkshops).map(([category, entries]) => (
                <section key={category}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{category}</h3>
                  <div className="mt-3 space-y-2">
                    {entries.map((workshop) => {
                      const isActive = workshop.slug === selectedWorkshop.slug
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
                          className={`block w-full rounded-[1.5rem] border px-4 py-3 text-left transition ${
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
                                Completed
                              </span>
                            ) : null}
                          </div>
                          <p
                            className={`mt-2 text-sm ${
                              isActive ? 'text-slate-200' : isLocked ? 'text-stone-500' : 'text-slate-600'
                            }`}
                          >
                            {isLocked
                              ? 'Complete Introduction to Testbed to unlock this workshop.'
                              : isCompleted
                                ? 'Completed.'
                                : workshop.summary}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 flex-col rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm lg:p-8">
            <div className="shrink-0 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
              <h2 className="text-4xl font-semibold tracking-tight text-slate-900">{selectedWorkshop.title}</h2>
            </div>

            <div className="mt-6 shrink-0 rounded-[1.5rem] border border-stone-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Part {selectedWorkshopPartIndex + 1} of {selectedWorkshop.parts.length}
                </p>
                <div className="grid w-full gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
                  <label className="block text-sm">
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
                    className="w-full rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedWorkshopPartIndex <= 0}
                  >
                    Previous Part
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedWorkshopPartSlug(
                        selectedWorkshop.parts[Math.min(selectedWorkshopPartIndex + 1, selectedWorkshop.parts.length - 1)]?.slug ?? selectedWorkshopPart.slug,
                      )
                    }
                    className="w-full rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
                    disabled={
                      selectedWorkshopPartIndex >= selectedWorkshop.parts.length - 1 ||
                      selectedWorkshopPartIndex + 1 > effectiveUnlockedWorkshopPartIndex
                    }
                  >
                    Next Part
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={workshopContentRef}
              onScroll={handleWorkshopContentScroll}
              className="mt-6 min-h-0 overflow-y-auto pr-2"
            >
              <MarkdownDocument markdown={selectedWorkshopPart.markdown} />
              {selectedWorkshopPart.quiz ? (() => {
                const quiz = selectedWorkshopPart.quiz

                return (
                <section className="mt-8 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">Knowledge Check</p>
                  <h3 className="mt-3 text-xl font-semibold text-slate-900">{quiz.question}</h3>
                  <div className="mt-4 space-y-3">
                    {quiz.options.map((option) => (
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
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-300"
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

      {tab === 'data-folder' ? (
        <div className="grid gap-6">
          <section className="rounded-[2rem] border border-stone-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold">Data Folder</h2>
            <p className="mt-2 text-slate-600">Runtime JSON files are stored outside the app bundle in a user-selected folder.</p>
            <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 font-mono text-sm text-slate-700">
              {context?.dataDirectory ?? 'No folder selected'}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
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
              Workshop completion, read-state, and quiz gate progress are stored locally in the desktop app.
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
  )
}

function ResetPage() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  useEffect(() => {
    logout()
    resetDemoState()
    navigate('/', { replace: true })
  }, [logout, navigate])

  return <section className="rounded-[2rem] border border-stone-300 bg-white p-8">Resetting browser state...</section>
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

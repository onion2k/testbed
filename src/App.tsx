import { useEffect, useMemo, useState } from 'react'
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
import { AdminUnavailablePage, DesktopAdminPage, DesktopRoute } from './components/desktop-admin-page'
import { HomePage } from './components/home-page'
import { ResetPage } from './components/reset-page'
import { ThemeToggle } from './components/theme-toggle'
import { useThemeMode } from './hooks/use-theme-mode'
import { breakModes, contentLabels, demoConfig, loadRuntimeConfig } from './lib/demo-config'
import {
  calculateSubtotal,
  fetchOrders,
  fetchProducts,
  submitOrder,
} from './lib/demo-api'
import { inputClass } from './lib/app-ui'
import { qaClass, testId } from './lib/selectors'
import { getStoredCart, setStoredCart } from './lib/storage'
import { calculateCheckoutTotals, calculateDisplayedSubtotal, currency } from './lib/formatting'
import { validateLoginForm, validatePaymentForm, validateShippingForm } from './lib/validation'
import type { CartItem, Order, PaymentDetails, Product, Role, ShippingDetails } from './types'

function canAccessRole(userRole: Role, requiredRole: Role) {
  if (requiredRole === 'customer') {
    return userRole === 'customer' || userRole === 'vip'
  }

  return userRole === requiredRole
}

const isDesktop = Boolean(window.desktopBridge?.isDesktop)
function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [, setRuntimeVersion] = useState(0)
  const { theme, toggleTheme } = useThemeMode()
  const navLinks = [
    ['/', 'Home'],
    ['/shop', 'Shop'],
    ['/vip', 'VIP'],
    ['/orders', 'Orders'],
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
      <div className="h-screen overflow-hidden bg-stone-100 text-slate-900">
        <main className="flex h-full min-h-0 w-full p-3 sm:p-4 lg:p-6">
          <Routes>
            <Route
              path="/desktop"
              element={
                <DesktopRoute theme={theme} onToggleTheme={toggleTheme}>
                  <DesktopAdminPage theme={theme} onToggleTheme={toggleTheme} />
                </DesktopRoute>
              }
            />
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
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
              <div className="flex flex-wrap items-center gap-3 whitespace-nowrap">
                <span>Not signed in</span>
                <Link
                  to="/login"
                  className="btn-primary rounded-full bg-slate-900 px-3 py-1.5 font-medium text-white"
                  data-testid={testId('login-button')}
                >
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-6 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route
            path="/orders"
            element={
              <ProtectedRoute>
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
          <Route
            path="/desktop"
            element={
              <DesktopRoute>
                <DesktopAdminPage theme={theme} onToggleTheme={toggleTheme} />
              </DesktopRoute>
            }
          />
          <Route path="/reset" element={<ResetPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="site-footer border-t border-stone-300 bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-slate-600 lg:flex-row lg:items-center lg:justify-between">
          <p>Testbed is a practice environment for learning QA testing and test automation.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link to="/" className="site-footer-link font-medium text-slate-700 hover:text-slate-900">
              Home
            </Link>
            <Link to="/shop" className="site-footer-link font-medium text-slate-700 hover:text-slate-900">
              Shop
            </Link>
            <Link to="/orders" className="site-footer-link font-medium text-slate-700 hover:text-slate-900">
              Orders
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProtectedRoute({ children, role }: { children: ReactNode; role?: Role }) {
  const { user } = useAuth()
  const location = useLocation()

  const bypass = role === 'vip' && breakModes.bypassVipGuard

  if (bypass) {
    return <>{children}</>
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (role && !canAccessRole(user.role, role)) {
    return (
      <section className="panel-accent panel-accent-rose rounded-[1.25rem] p-8">
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
    <section className="panel-accent panel-accent-sky mx-auto max-w-xl rounded-[1.25rem] p-8">
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

  useEffect(() => {
    setCart((current) => {
      const nextCart: CartItem[] = []

      for (const item of current) {
        const product = products.find((candidate) => candidate.id === item.productId)
        if (!product) continue

        const quantity = Math.min(item.quantity, Math.max(product.stock, 0))
        if (quantity > 0) {
          nextCart.push({
            ...item,
            quantity,
          })
        }
      }

      return nextCart
    })
  }, [products])

  function addToCart(productId: string) {
    setCart((current) => {
      const product = products.find((candidate) => candidate.id === productId)
      if (!product || product.stock <= 0) {
        return current
      }

      const match = current.find((item) => item.productId === productId)
      if (match) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
            : item,
        )
      }
      return [...current, { productId, quantity: 1 }]
    })
  }

  function updateQuantity(productId: string, quantity: number) {
    setCart((current) => {
      const product = products.find((candidate) => candidate.id === productId)
      const maxQuantity = Math.max(product?.stock ?? 0, 0)

      return current
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(Math.max(quantity, 0), maxQuantity) }
            : item,
        )
        .filter((item) => item.quantity > 0)
    })
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
    <aside className="panel-accent panel-accent-emerald rounded-[1.25rem] p-6">
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
    return <section className="panel-accent panel-accent-sky rounded-[1.25rem] p-8">Loading products...</section>
  }

  if (error) {
    return (
      <section className="panel-accent panel-accent-rose rounded-[1.25rem] p-8">
        <h1 className="text-3xl font-semibold">Products unavailable</h1>
        <p className="mt-3 text-slate-700">{error}</p>
        <button type="button" onClick={onRetry} className="btn-danger mt-4 rounded-full bg-rose-700 px-4 py-2 font-medium text-white">
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className={`panel-accent rounded-[1.25rem] p-6 ${title === contentLabels.vipTitle ? 'panel-accent-violet' : 'panel-accent-amber'}`}>
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
              className={`overflow-hidden rounded-[1rem] border border-stone-200 bg-stone-50 ${qaClass('qa-product-card')}`}
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
                    disabled={breakModes.disableAddToCart || product.stock <= 0}
                    onClick={() => onAddToCart(product.id)}
                    className="btn-primary whitespace-nowrap rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-stone-400"
                    data-testid={testId(`add-to-cart-${product.id}`)}
                    aria-label={`${contentLabels.addToCart} ${product.name}`}
                  >
                    {product.stock <= 0 ? 'Out of stock' : contentLabels.addToCart}
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
    return <section className="panel-accent panel-accent-sky rounded-[1.25rem] p-8">Loading orders...</section>
  }

  if (error) {
    return (
      <section className="panel-accent panel-accent-rose rounded-[1.25rem] p-8">
        <h1 className="text-3xl font-semibold">Order history unavailable</h1>
        <p className="mt-3 text-slate-700">{error}</p>
      </section>
    )
  }

  return (
    <section className="panel-accent panel-accent-cyan rounded-[1.25rem] p-6">
      <h1 className="text-3xl font-semibold">Order history</h1>
      <p className="mt-2 text-slate-600">Orders persist in the selected runtime data folder until reset.</p>
      <div className="mt-6 space-y-4">
        {orders.length === 0 ? (
          <p className="text-sm text-slate-600">No orders have been created yet.</p>
        ) : (
          orders.map((order) => (
            <article key={order.id} className="rounded-[1rem] border border-stone-200 bg-stone-50 p-5" data-testid={testId(`order-${order.id}`)}>
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
    if (!user) {
      setError('Sign in before placing the order so it can be saved to an account.')
      return
    }

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
    return <section className="panel-accent panel-accent-sky rounded-[1.25rem] p-8">Loading checkout...</section>
  }

  return (
    <section className="panel-accent panel-accent-amber rounded-[1.25rem] p-6">
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
            <div className="rounded-[1rem] border border-stone-200 bg-stone-50 p-6">
              <p className="text-slate-600">Your basket is empty.</p>
              <button type="button" onClick={() => navigate('/shop')} className="btn-primary mt-4 rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
                Go to shop
              </button>
            </div>
          ) : (
            cart.map((item) => {
              const product = products.find((candidate) => candidate.id === item.productId)
              return (
                <div key={item.productId} className="rounded-[1rem] border border-stone-200 bg-stone-50 p-5">
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
          <div className="flex items-center justify-between rounded-[1rem] border border-stone-200 bg-stone-50 p-5">
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
        <div className="mt-6 rounded-[1rem] border border-stone-200 bg-stone-50 p-6">
          {confirmation ? (
            <>
              <h2 className="text-2xl font-semibold">Order confirmed</h2>
              <p className="mt-2 text-slate-600">Reference: {confirmation.id}</p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold">Review order</h2>
              {!user ? (
                <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  You can work through checkout without signing in. To place the order and review it later in order history, sign in first.
                </div>
              ) : null}
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
          user ? (
            <button type="button" onClick={() => void placeOrder()} className="btn-success rounded-full bg-emerald-600 px-4 py-2 font-medium text-white" disabled={submitting} data-testid={testId('place-order-button')}>
              {submitting ? 'Submitting...' : 'Place order'}
            </button>
          ) : (
            <Link to="/login" state={{ from: { pathname: '/checkout' } }} className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
              Login to place order
            </Link>
          )
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

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  )
}

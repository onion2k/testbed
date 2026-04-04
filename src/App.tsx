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
import { breakModes, contentLabels, demoConfig, demoUsers } from './lib/demo-config'
import {
  calculateSubtotal,
  createUser,
  deleteUser,
  fetchAdminSnapshot,
  fetchOrders,
  fetchProducts,
  refreshDesktopContext,
  resetBreakModes,
  resetRuntimeData,
  saveBreakModes,
  submitOrder,
  updateProduct,
  updateUser,
} from './lib/demo-api'
import { qaClass, testId } from './lib/selectors'
import { getStoredCart, resetDemoState, setStoredCart } from './lib/storage'
import type {
  AdminSnapshot,
  BreakModes,
  CartItem,
  DemoUser,
  DesktopContext,
  Order,
  PaymentDetails,
  Product,
  Role,
  ShippingDetails,
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

const isDesktop = Boolean(window.desktopBridge?.isDesktop)

function AppShell() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navLinks = [
    ['/', 'Home'],
    ['/shop', 'Shop'],
    ['/vip', 'VIP'],
    ['/orders', 'Orders'],
    ['/login', user ? 'Switch user' : 'Login'],
  ]

  if (isDesktop && location.pathname === '/desktop') {
    return (
      <div className="min-h-screen bg-stone-100 text-slate-900">
        <main className="mx-auto max-w-7xl px-6 py-8">
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

  const bypass =
    (role === 'vip' && breakModes.bypassVipGuard) ||
    (role === 'admin' && breakModes.bypassAdminGuard)

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
        <span className="font-semibold">{currency(subtotal)}</span>
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
  const displayedTotal = breakModes.brokenCheckoutTotal ? Math.max(subtotal - 7, 0) : subtotal + 12

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
            <span className="font-semibold">{currency(subtotal)}</span>
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
                  <dd>{currency(subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-slate-600">Shipping</dt>
                  <dd>{breakModes.brokenCheckoutTotal ? currency(-7) : currency(12)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-stone-200 pt-3 font-semibold">
                  <dt>Total</dt>
                  <dd>{currency(displayedTotal)}</dd>
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
  const [tab, setTab] = useState<'dashboard' | 'catalog' | 'users' | 'break-modes' | 'data-folder' | 'server'>('dashboard')
  const [overview, setOverview] = useState<AdminSnapshot | null>(null)
  const [context, setContext] = useState<DesktopContext | null>(null)
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

  async function loadDesktopData(options?: { silent?: boolean }) {
    if (!options?.silent) {
      setLoading(true)
    }

    try {
      const [nextOverview, nextContext] = await Promise.all([
        fetchAdminSnapshot(),
        window.desktopBridge?.getContext() ?? Promise.resolve(null),
      ])
      setOverview(nextOverview)
      setContext(nextContext)
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
    const pollId = window.setInterval(() => {
      void loadDesktopData({ silent: true })
    }, 3000)

    return () => window.clearInterval(pollId)
  }, [])

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
      await loadDesktopData()
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Failed to save break modes.')
    } finally {
      setSavingBreakModes(false)
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
    await loadDesktopData()
  }

  async function handleResetBreakModes() {
    await resetBreakModes()
    await loadDesktopData()
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

  if (!overview) return null

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
          {context?.serverUrl ? (
            <a href={context.serverUrl} target="_blank" rel="noreferrer" className="btn-primary rounded-full bg-slate-900 px-4 py-2 font-medium text-white">
              Open web app
            </a>
          ) : null}
        </div>
        {error ? <p className="mt-4 text-sm text-rose-700">{error}</p> : null}
      </section>

      <div className="flex flex-wrap gap-2">
        {[
          ['dashboard', 'Dashboard'],
          ['catalog', 'Products & Orders'],
          ['users', 'Users'],
          ['break-modes', 'Break Modes'],
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
                ['Server port', String(context?.port ?? 'n/a')],
                ['Fallback port', context?.usedFallbackPort ? 'Yes' : 'No'],
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
            <h2 className="text-2xl font-semibold">Break modes</h2>
            <dl className="mt-4 space-y-2 text-sm">
              {Object.entries(overview.breakModes).map(([key, value]) => (
                <div key={key} className="flex items-start justify-between gap-3 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                  <dt className="text-xs text-slate-600">{key}</dt>
                  <dd className="font-mono text-xs text-slate-900 text-right">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </dd>
                </div>
              ))}
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
              ['highLatency', 'High latency'],
              ['selectorsChange', 'Selectors change'],
              ['contentChange', 'Content change'],
              ['disableAddToCart', 'Disable add to cart'],
              ['brokenCheckoutTotal', 'Broken checkout total'],
              ['bypassVipGuard', 'Bypass VIP guard'],
              ['bypassAdminGuard', 'Bypass admin guard'],
              ['emptyProductList', 'Empty product list'],
            ] as const).map(([key, label]) => (
              <label key={key} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <span>{label}</span>
                <input
                  type="checkbox"
                  checked={overview.breakModes[key]}
                  onChange={(event) => void handleBreakModeChange({ ...overview.breakModes, [key]: event.target.checked })}
                  disabled={savingBreakModes}
                />
              </label>
            ))}
            {(['products', 'orders', 'admin'] as const).map((scope) => (
              <label key={scope} className="flex items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <span>API failure: {scope}</span>
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
                />
              </label>
            ))}
          </div>
        </section>
      ) : null}

      {tab === 'data-folder' ? (
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

import type {
  AdminSnapshot,
  BreakModes,
  CartItem,
  DemoUser,
  EndpointFaultConfig,
  EndpointKey,
  Order,
  PaymentDetails,
  Product,
  RequestTraceEntry,
  ScenarioPreset,
  ShippingDetails,
  TestControlsConfig,
  TestTracingConfig,
} from '../types'

async function readJsonSafely<T>(response: Response): Promise<T> {
  const text = await response.text()

  if (!text.trim()) {
    throw new Error('Response body was empty.')
  }

  try {
    return JSON.parse(text) as T
  } catch {
    throw new Error('Response was not valid JSON.')
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await readJsonSafely<T & { error?: string }>(response)) as T & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.')
  }

  return payload
}

async function getAdminAuthorizationHeaders() {
  const context = await window.desktopBridge?.getContext()

  if (!context?.adminApiToken) {
    throw new Error('Admin API token is unavailable.')
  }

  return {
    Authorization: `Bearer ${context.adminApiToken}`,
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export function calculateSubtotal(items: CartItem[], products: Product[]) {
  return items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return total + (product?.price ?? 0) * item.quantity
  }, 0)
}

export async function fetchProducts() {
  const response = await fetch('/api/shop/products')
  const payload = await parseResponse<{ products: Product[] }>(response)

  if (!Array.isArray(payload.products)) {
    throw new Error('Products payload was not in the expected format.')
  }

  return payload.products
}

export async function fetchOrders() {
  const response = await fetch('/api/orders')
  const payload = await parseResponse<{ orders: Order[] }>(response)

  if (!Array.isArray(payload.orders)) {
    throw new Error('Orders payload was not in the expected format.')
  }

  return payload.orders
}

export async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
  const response = await fetch('/api/admin/overview', {
    headers: await getAdminAuthorizationHeaders(),
  })
  return parseResponse<AdminSnapshot>(response)
}

export async function fetchTestControlsConfig() {
  const response = await fetch('/api/test-controls/config')
  return parseResponse<TestControlsConfig>(response)
}

export async function updateTestControlsConfig(input: {
  breakModes?: BreakModes
  faults?: Partial<Record<EndpointKey, EndpointFaultConfig>>
  tracing?: Partial<TestTracingConfig>
}) {
  const response = await fetch('/api/test-controls/config', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })

  return parseResponse<TestControlsConfig>(response)
}

export async function fetchScenarioPresets() {
  const response = await fetch('/api/test-controls/presets')
  const payload = await parseResponse<{ presets: ScenarioPreset[] }>(response)
  return payload.presets
}

export async function applyScenarioPreset(presetId: string) {
  const response = await fetch(`/api/test-controls/presets/${encodeURIComponent(presetId)}/apply`, {
    method: 'POST',
  })

  return parseResponse<TestControlsConfig>(response)
}

export async function updateTracingConfig(tracing: Partial<TestTracingConfig>) {
  const response = await fetch('/api/test-controls/tracing', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ tracing }),
  })

  return parseResponse<TestControlsConfig>(response)
}

export async function fetchRequestTraces() {
  const response = await fetch('/api/test-controls/traces')
  const payload = await parseResponse<{ traces: RequestTraceEntry[] }>(response)
  return payload.traces
}

export async function clearRequestTraces() {
  const response = await fetch('/api/test-controls/traces', {
    method: 'DELETE',
  })

  return parseResponse<{ ok: boolean }>(response)
}

export async function updateProduct(productId: string, product: Partial<Product>) {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAdminAuthorizationHeaders()),
    },
    body: JSON.stringify({ product }),
  })
  return parseResponse<{ product: Product | null }>(response)
}

export async function fetchPostmanCollection() {
  const response = await fetch('/api/postman/collection')
  return parseResponse<Record<string, unknown>>(response)
}

export async function fetchPostmanEnvironment() {
  const response = await fetch('/api/postman/environment')
  return parseResponse<Record<string, unknown>>(response)
}

export async function submitOrder(input: {
  username: string
  userRole: Order['userRole']
  items: CartItem[]
  products: Product[]
  shipping: ShippingDetails
  payment: PaymentDetails
}) {
  const response = await fetch('/api/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  })
  const payload = await parseResponse<{ order: Order }>(response)

  if (!payload.order || typeof payload.order !== 'object') {
    throw new Error('Order payload was not in the expected format.')
  }

  return payload.order
}

export async function saveBreakModes(breakModes: BreakModes) {
  const response = await fetch('/api/admin/break-modes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAdminAuthorizationHeaders()),
    },
    body: JSON.stringify({ breakModes }),
  })

  return parseResponse<{ breakModes: BreakModes }>(response)
}

export async function resetBreakModes() {
  const response = await fetch('/api/test-controls/reset', {
    method: 'POST',
  })

  return parseResponse<{ breakModes: BreakModes }>(response)
}

export async function resetRuntimeData() {
  const response = await fetch('/api/admin/reset-runtime', {
    method: 'POST',
    headers: await getAdminAuthorizationHeaders(),
  })

  return parseResponse<{ ok: boolean }>(response)
}

export async function createUser(user: DemoUser) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAdminAuthorizationHeaders()),
    },
    body: JSON.stringify({ user }),
  })

  return parseResponse<{ users: DemoUser[] }>(response)
}

export async function updateUser(username: string, user: Partial<DemoUser>) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...(await getAdminAuthorizationHeaders()),
    },
    body: JSON.stringify({ user }),
  })

  return parseResponse<{ users: DemoUser[] }>(response)
}

export async function deleteUser(username: string) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
    headers: await getAdminAuthorizationHeaders(),
  })

  return parseResponse<{ users: DemoUser[] }>(response)
}

export async function refreshDesktopContext() {
  await sleep(150)
  return window.desktopBridge?.getContext() ?? null
}

export async function loginWithRuntime(username: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  const payload = await readJsonSafely<{ error?: string; user?: { username: string; role: string; displayName: string } }>(response)

  if (!response.ok || !payload.user || typeof payload.user !== 'object') {
    throw new Error(payload.error ?? 'Invalid username or password.')
  }

  return payload.user
}

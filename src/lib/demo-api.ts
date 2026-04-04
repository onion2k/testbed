import type {
  AdminSnapshot,
  BreakModes,
  CartItem,
  DemoUser,
  Order,
  PaymentDetails,
  Product,
  ShippingDetails,
} from '../types'

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as T & { error?: string }

  if (!response.ok) {
    throw new Error(payload.error ?? 'Request failed.')
  }

  return payload
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
  return payload.products
}

export async function fetchOrders() {
  const response = await fetch('/api/orders')
  const payload = await parseResponse<{ orders: Order[] }>(response)
  return payload.orders
}

export async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
  const response = await fetch('/api/admin/overview')
  const payload = await parseResponse<AdminSnapshot>(response)
  return payload
}

export async function updateProduct(productId: string, product: Partial<Product>) {
  const response = await fetch(`/api/admin/products/${productId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product }),
  })
  return parseResponse<{ product: Product | null }>(response)
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
  return payload.order
}

export async function saveBreakModes(breakModes: BreakModes) {
  const response = await fetch('/api/admin/break-modes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
  })

  return parseResponse<{ ok: boolean }>(response)
}

export async function createUser(user: DemoUser) {
  const response = await fetch('/api/admin/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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
    },
    body: JSON.stringify({ user }),
  })

  return parseResponse<{ users: DemoUser[] }>(response)
}

export async function deleteUser(username: string) {
  const response = await fetch(`/api/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  })

  return parseResponse<{ users: DemoUser[] }>(response)
}

export async function refreshDesktopContext() {
  await sleep(150)
  return window.desktopBridge?.getContext() ?? null
}

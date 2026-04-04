import type { CartItem, Order, ProductOverride, SessionUser } from '../types'

const SESSION_KEY = 'demo-session'
const CART_KEY = 'demo-cart'
const ORDERS_KEY = 'demo-orders'
const PRODUCT_OVERRIDES_KEY = 'demo-product-overrides'

function safeRead<T>(key: string, fallback: T): T {
  const value = window.localStorage.getItem(key)

  if (!value) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function safeWrite<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getStoredSession() {
  return safeRead<SessionUser | null>(SESSION_KEY, null)
}

export function setStoredSession(user: SessionUser | null) {
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY)
    return
  }

  safeWrite(SESSION_KEY, user)
}

export function getStoredCart() {
  return safeRead<CartItem[]>(CART_KEY, [])
}

export function setStoredCart(cart: CartItem[]) {
  safeWrite(CART_KEY, cart)
}

export function getStoredOrders() {
  return safeRead<Order[]>(ORDERS_KEY, [])
}

export function setStoredOrders(orders: Order[]) {
  safeWrite(ORDERS_KEY, orders)
}

export function getStoredProductOverrides() {
  return safeRead<Record<string, ProductOverride>>(PRODUCT_OVERRIDES_KEY, {})
}

export function setStoredProductOverrides(overrides: Record<string, ProductOverride>) {
  safeWrite(PRODUCT_OVERRIDES_KEY, overrides)
}

export function resetDemoState() {
  window.localStorage.removeItem(SESSION_KEY)
  window.localStorage.removeItem(CART_KEY)
  window.localStorage.removeItem(ORDERS_KEY)
  window.localStorage.removeItem(PRODUCT_OVERRIDES_KEY)
}

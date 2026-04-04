import { baseProducts, breakModes, demoConfig, demoUsers } from './demo-config'
import {
  getStoredOrders,
  getStoredProductOverrides,
  setStoredOrders,
  setStoredProductOverrides,
} from './storage'
import type {
  AdminSnapshot,
  CartItem,
  Order,
  PaymentDetails,
  Product,
  ProductOverride,
  ShippingDetails,
} from '../types'

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

async function simulateLatency() {
  await sleep(breakModes.highLatency ? 1800 : 180)
}

function shouldFail(scope: 'products' | 'orders' | 'admin') {
  return breakModes.apiFailures[scope]
}

function mergeProductOverrides(product: Product, overrides: Record<string, ProductOverride>) {
  const override = overrides[product.id]

  if (!override) {
    return product
  }

  return {
    ...product,
    stock: override.stock ?? product.stock,
    hidden: override.hidden ?? false,
  }
}

export async function fetchProducts() {
  await simulateLatency()

  if (shouldFail('products')) {
    throw new Error('Product service did not return data.')
  }

  if (breakModes.emptyProductList) {
    return []
  }

  const overrides = getStoredProductOverrides()

  return baseProducts
    .map((product) => mergeProductOverrides(product, overrides))
    .filter((product) => !overrides[product.id]?.hidden)
}

export async function fetchOrders() {
  await simulateLatency()

  if (shouldFail('orders')) {
    throw new Error('Orders service did not return data.')
  }

  return getStoredOrders()
}

export async function fetchAdminSnapshot(): Promise<AdminSnapshot> {
  await simulateLatency()

  if (shouldFail('admin')) {
    throw new Error('Admin service did not return data.')
  }

  const overrides = getStoredProductOverrides()

  return {
    users: demoUsers,
    products: baseProducts.map((product) => mergeProductOverrides(product, overrides)),
    orders: getStoredOrders(),
    breakModes: demoConfig.breakModes,
  }
}

export async function updateProductOverride(productId: string, override: ProductOverride) {
  await simulateLatency()

  const current = getStoredProductOverrides()
  current[productId] = { ...current[productId], ...override }
  setStoredProductOverrides(current)
}

export function calculateSubtotal(items: CartItem[], products: Product[]) {
  return items.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.productId)
    return total + (product?.price ?? 0) * item.quantity
  }, 0)
}

export async function submitOrder(input: {
  username: string
  userRole: Order['userRole']
  items: CartItem[]
  products: Product[]
  shipping: ShippingDetails
  payment: PaymentDetails
}) {
  await simulateLatency()

  if (shouldFail('orders')) {
    throw new Error('Checkout request failed before order creation.')
  }

  const subtotal = calculateSubtotal(input.items, input.products)
  const total = breakModes.brokenCheckoutTotal ? Math.max(subtotal - 7, 0) : subtotal + 12

  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    createdAt: new Date().toISOString(),
    userRole: input.userRole,
    username: input.username,
    items: input.items,
    shipping: input.shipping,
    payment: {
      cardName: input.payment.cardName,
      cardLast4: input.payment.cardNumber.slice(-4),
    },
    subtotal,
    total,
  }

  const existingOrders = getStoredOrders()
  setStoredOrders([newOrder, ...existingOrders])

  return newOrder
}

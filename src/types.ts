export type Role = 'customer' | 'vip' | 'admin'

export interface DemoUser {
  username: string
  password: string
  role: Role
  displayName: string
}

export interface DemoRoute {
  path: string
  label: string
  access: string
  description: string
}

export interface BreakModes {
  apiFailures: {
    products: boolean
    orders: boolean
    admin: boolean
  }
  highLatency: boolean
  selectorsChange: boolean
  contentChange: boolean
  disableAddToCart: boolean
  brokenCheckoutTotal: boolean
  bypassVipGuard: boolean
  bypassAdminGuard: boolean
  emptyProductList: boolean
}

export interface DemoConfig {
  appName: string
  routes: DemoRoute[]
  breakModes: BreakModes
}

export interface Product {
  id: string
  name: string
  category: string
  description: string
  price: number
  vipOnly?: boolean
  stock: number
  hidden?: boolean
  image: string
}

export interface ProductOverride {
  hidden?: boolean
  stock?: number
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface ShippingDetails {
  fullName: string
  email: string
  address1: string
  city: string
  postcode: string
  country: string
}

export interface PaymentDetails {
  cardName: string
  cardNumber: string
  expiry: string
  cvv: string
}

export interface Order {
  id: string
  createdAt: string
  userRole: Role
  username: string
  items: CartItem[]
  shipping: ShippingDetails
  payment: {
    cardName: string
    cardLast4: string
  }
  subtotal: number
  total: number
}

export interface AdminSnapshot {
  users: DemoUser[]
  products: Product[]
  orders: Order[]
  breakModes: BreakModes
}

export interface SessionUser {
  username: string
  role: Role
  displayName: string
}

export interface RuntimeBootstrap {
  appName: string
  routes: DemoRoute[]
  breakModes: BreakModes
  users: DemoUser[]
}

export interface DesktopContext {
  serverUrl: string | null
  port: number | null
  usedFallbackPort: boolean
  dataDirectory: string | null
}

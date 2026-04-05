export type Role = 'customer' | 'vip' | 'admin'
export type FaultResponseMode =
  | 'http-error'
  | 'malformed-json'
  | 'missing-fields'
  | 'wrong-types'
  | 'empty-body'
  | 'stale-success'

export type EndpointKey =
  | 'auth.login'
  | 'runtime.bootstrap'
  | 'shop.products'
  | 'orders.list'
  | 'orders.create'
  | 'admin.overview'
  | 'admin.users.list'
  | 'admin.users.create'
  | 'admin.users.update'
  | 'admin.users.delete'
  | 'admin.products.update'
  | 'admin.resetRuntime'
  | 'desktop.context'

export interface EndpointFaultConfig {
  enabled: boolean
  status: 200 | 400 | 401 | 403 | 404 | 409 | 422 | 500 | 503
  mode: FaultResponseMode
  latencyMs: number | null
  message: string | null
}

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
  }
  highLatency: boolean
  selectorsChange: boolean
  contentChange: boolean
  disableAddToCart: boolean
  brokenCheckoutTotal: boolean
  bypassVipGuard: boolean
  emptyProductList: boolean
}

export interface ScenarioPreset {
  id: string
  label: string
  description: string
  breakModes: BreakModes
  faults: Record<EndpointKey, EndpointFaultConfig>
}

export interface TestTracingConfig {
  enabled: boolean
  maxEntries: number
}

export interface TestControlsConfig {
  activePresetId: string | null
  breakModes: BreakModes
  faults: Record<EndpointKey, EndpointFaultConfig>
  tracing: TestTracingConfig
}

export interface RequestTraceEntry {
  id: string
  timestamp: string
  method: string
  pathname: string
  endpointKey: EndpointKey
  requestHeaders: Record<string, string>
  requestBody: string | null
  responseStatus: number
  responseMode: 'normal' | FaultResponseMode
  latencyMs: number
  presetId: string | null
  matchedFault: {
    enabled: boolean
    mode: FaultResponseMode
    status: number
    message: string | null
    fallbackUsed?: boolean
  } | null
  correlationId: string
}

export interface PostmanCollectionSummary {
  collectionUrl: string
  environmentUrl: string
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
  adminApiToken: string | null
}

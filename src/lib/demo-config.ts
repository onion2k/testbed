import appConfigJson from '../config/app-config.json'
import usersJson from '../config/users.json'
import productsJson from '../data/products.json'
import type { BreakModes, DemoConfig, DemoUser, Product } from '../types'

const defaultDemoConfig = appConfigJson as DemoConfig

export let demoConfig = structuredClone(defaultDemoConfig)
export const demoUsers = usersJson.users as DemoUser[]
export const baseProducts = productsJson.products as Product[]

export let contentLabels = buildContentLabels(demoConfig.breakModes)

export let breakModes = demoConfig.breakModes as BreakModes

function buildContentLabels(nextBreakModes: BreakModes) {
  return {
    shopTitle: nextBreakModes.contentChange ? 'Browse Inventory' : 'Shop the catalog',
    vipTitle: nextBreakModes.contentChange ? 'Private Access Lounge' : 'VIP-only collection',
    checkoutTitle: nextBreakModes.contentChange ? 'Finalize your order' : 'Checkout journey',
    addToCart: nextBreakModes.contentChange ? 'Queue item' : 'Add to basket',
    basketTitle: nextBreakModes.contentChange ? 'Current Selection' : 'Basket summary',
  }
}

export function setRuntimeBreakModes(nextBreakModes: BreakModes) {
  demoConfig = {
    ...demoConfig,
    breakModes: structuredClone(nextBreakModes),
  }
  breakModes = demoConfig.breakModes
  contentLabels = buildContentLabels(breakModes)
}

export async function loadRuntimeConfig() {
  try {
    const response = await fetch('/api/test-controls/state')

    if (!response.ok) {
      throw new Error(`Failed to load runtime config: ${response.status}`)
    }

    const payload = (await response.json()) as { breakModes?: BreakModes }

    if (payload.breakModes) {
      setRuntimeBreakModes(payload.breakModes)
    }
  } catch {
    setRuntimeBreakModes(defaultDemoConfig.breakModes)
  }
}

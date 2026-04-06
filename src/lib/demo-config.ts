import appConfigJson from '../config/app-config.json'
import usersJson from '../config/users.json'
import type { BreakModes, DemoConfig, DemoUser, RuntimeBootstrap } from '../types'

const defaultDemoConfig = appConfigJson as DemoConfig

export let demoConfig = structuredClone(defaultDemoConfig)
export let demoUsers = usersJson.users as DemoUser[]

export let contentLabels = buildContentLabels(demoConfig.breakModes)

export let breakModes = demoConfig.breakModes as BreakModes

function buildContentLabels(nextBreakModes: BreakModes) {
  return {
    shopTitle: nextBreakModes.contentChange ? 'Browse Inventory' : 'Shop the catalog',
    vipTitle: nextBreakModes.contentChange ? 'Private Access Lounge' : 'VIP-only collection',
    checkoutTitle: nextBreakModes.contentChange ? 'Finalize your order' : 'Checkout journey',
    addToCart: nextBreakModes.contentChange ? 'Buy' : 'Add to basket',
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

export function setRuntimeBootstrap(bootstrap: RuntimeBootstrap) {
  demoConfig = {
    appName: bootstrap.appName,
    routes: bootstrap.routes,
    breakModes: structuredClone(bootstrap.breakModes),
  }
  demoUsers = bootstrap.users
  breakModes = demoConfig.breakModes
  contentLabels = buildContentLabels(breakModes)
}

export async function loadRuntimeConfig() {
  try {
    const response = await fetch('/api/runtime/bootstrap')

    if (!response.ok) {
      throw new Error(`Failed to load runtime config: ${response.status}`)
    }

    setRuntimeBootstrap((await response.json()) as RuntimeBootstrap)
  } catch {
    setRuntimeBreakModes(defaultDemoConfig.breakModes)
  }
}

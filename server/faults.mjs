export function buildBackwardCompatibleFault(endpointKey, breakModes) {
  if (breakModes.apiFailures.products && endpointKey === 'shop.products') {
    return { enabled: true, status: 503, mode: 'http-error', latencyMs: null, message: 'Product service did not return data.' }
  }

  if (breakModes.apiFailures.orders && ['orders.list', 'orders.create'].includes(endpointKey)) {
    return { enabled: true, status: 503, mode: 'http-error', latencyMs: null, message: 'Order service request failed.' }
  }

  return null
}

export function mutatePayloadForFault(endpointKey, payload, mode) {
  if (mode === 'missing-fields') {
    const next = structuredClone(payload)

    if (endpointKey === 'shop.products') delete next.products
    if (endpointKey === 'orders.list') delete next.orders
    if (endpointKey === 'orders.create') delete next.order
    if (endpointKey === 'auth.login') delete next.user
    if (endpointKey === 'admin.overview') delete next.users
    if (endpointKey === 'runtime.bootstrap') delete next.routes
    if (endpointKey === 'desktop.context') delete next.desktop

    return next
  }

  if (mode === 'wrong-types') {
    const next = structuredClone(payload)

    if (endpointKey === 'shop.products') next.products = 'not-an-array'
    if (endpointKey === 'orders.list') next.orders = 'broken'
    if (endpointKey === 'orders.create') next.order = 123
    if (endpointKey === 'auth.login') next.user = 'invalid-user'
    if (endpointKey === 'admin.overview') next.users = true
    if (endpointKey === 'runtime.bootstrap') next.routes = 'broken'
    if (endpointKey === 'desktop.context') next.desktop = 'invalid'

    return next
  }

  return payload
}

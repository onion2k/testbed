function createMatcher(method, pathTemplate, endpointKey, group, requestExample, responseExample) {
  const matcher =
    pathTemplate.includes(':')
      ? new RegExp(`^${pathTemplate.replace(/:[^/]+/g, '([^/]+)')}$`)
      : null

  return {
    method,
    pathTemplate,
    endpointKey,
    group,
    requestExample,
    responseExample,
    match(pathname) {
      if (!matcher) {
        return pathname === pathTemplate ? {} : null
      }

      const result = pathname.match(matcher)
      if (!result) {
        return null
      }

      const keys = [...pathTemplate.matchAll(/:([^/]+)/g)].map((match) => match[1])
      return Object.fromEntries(keys.map((key, index) => [key, decodeURIComponent(result[index + 1])]))
    },
  }
}

export function createRouteRegistry() {
  return [
    createMatcher('GET', '/api/runtime/bootstrap', 'runtime.bootstrap', 'Runtime', null, {
      appName: 'Testbed',
      routes: [],
      breakModes: {},
      users: [],
    }),
    createMatcher('POST', '/api/auth/login', 'auth.login', 'Auth', {
      username: 'customer@example.com',
      password: 'password123',
    }, {
      user: {
        username: 'customer@example.com',
        role: 'customer',
        displayName: 'Casey Customer',
      },
    }),
    createMatcher('GET', '/api/shop/products', 'shop.products', 'Shop', null, { products: [] }),
    createMatcher('GET', '/api/orders', 'orders.list', 'Orders', null, { orders: [] }),
    createMatcher('POST', '/api/orders', 'orders.create', 'Orders', {
      username: 'customer@example.com',
      userRole: 'customer',
      items: [{ productId: 'wireless-headset', quantity: 1 }],
      shipping: {
        fullName: 'Casey Customer',
        email: 'customer@example.com',
        address1: '1 Example Street',
        city: 'London',
        postcode: 'E1 1AA',
        country: 'United Kingdom',
      },
      payment: {
        cardName: 'Casey Customer',
        cardNumber: '4242424242424242',
        expiry: '12/29',
        cvv: '123',
      },
    }, {
      order: {
        id: 'ORD-1',
        createdAt: new Date(0).toISOString(),
      },
    }),
    createMatcher('GET', '/api/admin/overview', 'admin.overview', 'Admin', null, {
      users: [],
      products: [],
      orders: [],
      breakModes: {},
    }),
    createMatcher('GET', '/api/admin/users', 'admin.users.list', 'Admin', null, { users: [] }),
    createMatcher('POST', '/api/admin/users', 'admin.users.create', 'Admin', {
      user: {
        username: 'new-user@example.com',
        password: 'password123',
        displayName: 'New User',
        role: 'customer',
      },
    }, {
      users: [],
    }),
    createMatcher('PUT', '/api/admin/users/:username', 'admin.users.update', 'Admin', {
      user: {
        displayName: 'Updated User',
      },
    }, {
      users: [],
    }),
    createMatcher('DELETE', '/api/admin/users/:username', 'admin.users.delete', 'Admin', null, {
      users: [],
    }),
    createMatcher('PATCH', '/api/admin/products/:id', 'admin.products.update', 'Admin', {
      product: {
        stock: 3,
      },
    }, {
      product: null,
    }),
    createMatcher('POST', '/api/admin/reset-runtime', 'admin.resetRuntime', 'Admin', null, {
      ok: true,
    }),
    createMatcher('GET', '/api/desktop/context', 'desktop.context', 'Admin', null, {
      desktop: {
        serverUrl: 'http://127.0.0.1:5175',
        port: 5175,
        usedFallbackPort: false,
        dataDirectory: '/tmp/testbed',
      },
    }),
  ]
}

export function findRoute(registry, method, pathname) {
  for (const route of registry) {
    if (route.method !== method) continue
    const params = route.match(pathname)
    if (params) {
      return { route, params }
    }
  }

  return null
}

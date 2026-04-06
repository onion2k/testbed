import { traceHeaderName } from './http-helpers.mjs'

export function createPostmanCollection(serverUrl, registry) {
  const folders = new Map()

  for (const route of registry) {
    if (!folders.has(route.group)) {
      folders.set(route.group, [])
    }

    const requestHeaders = route.group === 'Admin'
      ? [
          {
            key: 'Authorization',
            value: 'Bearer {{adminApiToken}}',
          },
        ]
      : []

    folders.get(route.group).push({
      name: `${route.method} ${route.pathTemplate}`,
      request: {
        method: route.method,
        header: requestHeaders,
        description:
          route.group === 'Admin'
            ? 'This admin route requires Authorization: Bearer {{adminApiToken}}.'
            : undefined,
        url: {
          raw: `{{baseUrl}}${route.pathTemplate}`,
          host: ['{{baseUrl}}'],
          path: route.pathTemplate.replace(/^\//, '').split('/'),
        },
        body:
          route.requestExample === null
            ? undefined
            : {
                mode: 'raw',
                raw: JSON.stringify(route.requestExample, null, 2),
                options: {
                  raw: {
                    language: 'json',
                  },
                },
              },
      },
      response: route.responseExample
        ? [
            {
              name: 'Example response',
              status: 'OK',
              code: 200,
              body: JSON.stringify(route.responseExample, null, 2),
            },
          ]
        : [],
    })
  }

  folders.set('Test Controls', [
    {
      name: 'GET /api/test-controls/config',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/test-controls/config',
          host: ['{{baseUrl}}'],
          path: ['api', 'test-controls', 'config'],
        },
      },
      response: [],
    },
    {
      name: 'POST /api/test-controls/presets/baseline/apply',
      request: {
        method: 'POST',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/test-controls/presets/baseline/apply',
          host: ['{{baseUrl}}'],
          path: ['api', 'test-controls', 'presets', 'baseline', 'apply'],
        },
      },
      response: [],
    },
  ])

  folders.set('Postman', [
    {
      name: 'GET /api/postman/collection',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/postman/collection',
          host: ['{{baseUrl}}'],
          path: ['api', 'postman', 'collection'],
        },
      },
      response: [],
    },
    {
      name: 'GET /api/postman/environment',
      request: {
        method: 'GET',
        header: [],
        url: {
          raw: '{{baseUrl}}/api/postman/environment',
          host: ['{{baseUrl}}'],
          path: ['api', 'postman', 'environment'],
        },
      },
      response: [],
    },
  ])

  folders.set('Admin Auth Examples', [
    {
      name: 'GET /api/admin/overview with token',
      request: {
        method: 'GET',
        header: [
          {
            key: 'Authorization',
            value: 'Bearer {{adminApiToken}}',
          },
        ],
        description: 'Expected to succeed when the admin Bearer token is present.',
        url: {
          raw: '{{baseUrl}}/api/admin/overview',
          host: ['{{baseUrl}}'],
          path: ['api', 'admin', 'overview'],
        },
      },
      response: [],
    },
    {
      name: 'GET /api/admin/overview without token',
      request: {
        method: 'GET',
        header: [],
        description: 'Expected to return 401 because the admin Bearer token is missing.',
        url: {
          raw: '{{baseUrl}}/api/admin/overview',
          host: ['{{baseUrl}}'],
          path: ['api', 'admin', 'overview'],
        },
      },
      response: [
        {
          name: 'Unauthorized response',
          status: 'Unauthorized',
          code: 401,
          body: JSON.stringify({ error: 'Admin API token is required for this route.' }, null, 2),
        },
      ],
    },
  ])

  return {
    info: {
      name: 'Testbed Local API',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
      description: `Generated from the live Testbed server at ${serverUrl}. Observe ${traceHeaderName} in responses for correlation.`,
    },
    variable: [
      {
        key: 'baseUrl',
        value: serverUrl,
      },
    ],
    item: [...folders.entries()].map(([name, item]) => ({ name, item })),
  }
}

export function createPostmanEnvironment(serverUrl, store, adminApiToken) {
  const users = store.readUsers()
  const userByRole = Object.fromEntries(users.map((user) => [user.role, user]))

  return {
    name: 'Testbed Local Environment',
    values: [
      { key: 'baseUrl', value: serverUrl, enabled: true },
      { key: 'adminApiToken', value: adminApiToken, enabled: true },
      { key: 'customerUsername', value: userByRole.customer?.username ?? '', enabled: true },
      { key: 'customerPassword', value: userByRole.customer?.password ?? '', enabled: true },
      { key: 'vipUsername', value: userByRole.vip?.username ?? '', enabled: true },
      { key: 'vipPassword', value: userByRole.vip?.password ?? '', enabled: true },
      { key: 'adminUsername', value: userByRole.admin?.username ?? '', enabled: true },
      { key: 'adminPassword', value: userByRole.admin?.password ?? '', enabled: true },
    ],
  }
}

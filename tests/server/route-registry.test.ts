import { createRouteRegistry, findRoute } from '../../server/route-registry.mjs'
import { createPostmanCollection } from '../../server/postman.mjs'

describe('route registry', () => {
  it('finds registered routes and params', () => {
    const registry = createRouteRegistry()
    const match = findRoute(registry, 'PATCH', '/api/admin/products/wireless-headset')

    expect(match?.route.endpointKey).toBe('admin.products.update')
    expect(match?.params.id).toBe('wireless-headset')
  })

  it('feeds Postman generation with admin auth headers', () => {
    const collection = createPostmanCollection('http://127.0.0.1:5175', createRouteRegistry())
    const adminFolder = collection.item.find((entry) => entry.name === 'Admin')
    const overviewRequest = adminFolder?.item.find((entry) => entry.name === 'GET /api/admin/overview')

    expect(overviewRequest?.request.header).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          key: 'Authorization',
          value: 'Bearer {{adminApiToken}}',
        }),
      ]),
    )
  })
})

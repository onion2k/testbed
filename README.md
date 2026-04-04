# AI Testbed Commerce

Single-page Vite app for exercising AI-generated end-to-end tests against a controlled set of routes, roles, selectors, and intentional failure modes.

## Stack

- React 19
- TypeScript
- Tailwind CSS 4
- Vite app scaffold
- `rolldown-vite` for dev/build/preview commands

## Run

```bash
npm install
npm run dev
```

## Demo users

All credentials live in [src/config/users.json](/Users/christopherneale/projects/testbed/src/config/users.json).

- `customer@example.com` / `password123`
- `vip@example.com` / `password123`
- `admin@example.com` / `password123`

Role access:

- `customer` can access shop, checkout, and orders
- `vip` can access shop, checkout, orders, and the VIP area
- `admin` can access only the admin area

## Routes

The home page lists these when the app starts.

- `/` home route with route directory, credentials, and break-mode summary
- `/login` username/password login
- `/shop` customer or VIP storefront
- `/checkout` customer or VIP multi-step checkout
- `/orders` customer or VIP order history
- `/vip` VIP-only catalog area
- `/admin` admin-only tools
- `/reset` clears local demo state and redirects home

## Reset behavior

Visit `/reset` to clear:

- signed-in session
- basket contents
- order history
- admin product overrides

This gives you a clean state for a new test run without restarting the app.

## Config files

- [src/config/users.json](/Users/christopherneale/projects/testbed/src/config/users.json): login credentials and roles
- [src/config/app-config.json](/Users/christopherneale/projects/testbed/src/config/app-config.json): route metadata and break toggles
- [src/data/products.json](/Users/christopherneale/projects/testbed/src/data/products.json): seeded catalog items

## Break toggles

Defaults live in [src/config/app-config.json](/Users/christopherneale/projects/testbed/src/config/app-config.json), but the running app now reads mutable break-mode state from the test control API.

Available toggles:

- `apiFailures.products`: product/catalog fetch fails
- `apiFailures.orders`: order history and checkout submission fail
- `apiFailures.admin`: admin dashboard data fetch fails
- `highLatency`: simulated latency increases to make async handling visible
- `selectorsChange`: `data-testid` values and CSS hook classes drift
- `contentChange`: key labels and headings change
- `disableAddToCart`: add-to-basket buttons are disabled
- `brokenCheckoutTotal`: checkout total is intentionally incorrect
- `bypassVipGuard`: VIP route becomes accessible without the VIP role
- `bypassAdminGuard`: admin route becomes accessible without the admin role
- `emptyProductList`: catalog returns zero products

## Test control API

The app exposes a same-origin API so tests can set break modes before the browser session starts.

- `GET /api/test-controls/state`: read current break-mode state
- `POST /api/test-controls/break-modes`: merge a partial break-mode update into current state
- `POST /api/test-controls/reset`: reset break modes back to defaults from config

Example:

```bash
curl -X POST http://127.0.0.1:5175/api/test-controls/break-modes \
  -H 'Content-Type: application/json' \
  -d '{"breakModes":{"highLatency":true,"apiFailures":{"products":true}}}'
```

Reset:

```bash
curl -X POST http://127.0.0.1:5175/api/test-controls/reset
```

The runtime state is persisted in `.testbed-runtime/break-modes.json`, so the selected break modes survive reloads until reset.

## Admin tools

The admin route includes:

- product stock adjustments
- product visibility toggles
- user list
- order list
- current break-mode config viewer

## E2E locator surface

The app intentionally exposes multiple selector styles:

- semantic buttons, headings, forms, and navigation for ARIA/role-based tests
- `data-testid` attributes for stable test-id-based tests
- CSS hook classes such as `qa-nav-link`, `qa-product-card`, `qa-basket-item`

When `selectorsChange` is enabled, both the `data-testid` values and CSS hooks shift so test generators can validate selector resilience.

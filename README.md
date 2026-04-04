# Testbed

Standalone QA testbed built with React, TypeScript, Tailwind, a local JSON-backed HTTP server, and an Electron wrapper.

## Modes

- `npm run dev`: starts the standalone localhost server in development mode and serves the web UI plus APIs
- `npm run preview`: serves the built web app and APIs from the standalone server
- `npm run dev:desktop`: launches the Electron desktop app shell
- `npm run dist:desktop`: builds the web assets and packages the Electron app

## Architecture

- `server/`: standalone localhost server for the web UI and runtime APIs
- `electron/`: desktop shell that chooses a data folder, starts the server, and opens a BrowserWindow
- `src/`: React frontend used by both browser sessions and the Electron window

The server binds to loopback and is intended to be reachable from:

- an external browser
- an E2E test runner
- the Electron desktop app window

## Runtime Data

Source JSON under `src/config` and `src/data` is treated as immutable defaults.

Runtime JSON is created in a writable data directory:

- `users.json`
- `break-modes.json`
- `products.json`
- `orders.json`
- `app-state.json`

Standalone server mode uses `.testbed-runtime/standalone` by default.

The Electron app prompts for a user-chosen data folder on first run and stores that choice in the Electron user-data area.

## Public APIs

Runtime/bootstrap:

- `GET /api/runtime/bootstrap`
- `POST /api/auth/login`

Test controls:

- `GET /api/test-controls/state`
- `POST /api/test-controls/break-modes`
- `POST /api/test-controls/reset`

Shop/orders:

- `GET /api/shop/products`
- `GET /api/orders`
- `POST /api/orders`

Admin/runtime management:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:username`
- `DELETE /api/admin/users/:username`
- `POST /api/admin/break-modes`
- `PATCH /api/admin/products/:id`
- `POST /api/admin/reset-runtime`

## Browser UI

The served browser app keeps the existing QA surface:

- login
- shop
- checkout
- orders
- VIP area
- route directory
- selector/test-id coverage
- break-mode-driven failures

The browser-facing `/admin` route now points users to the desktop-only admin shell.

## Desktop UI

The Electron window opens `/desktop` and exposes a desktop-only admin shell with:

- dashboard summary
- user CRUD
- break-mode toggles
- product visibility/stock controls
- order inspection
- chosen data-folder controls
- server URL / port visibility

## Notes

- Browser-local session and cart state are still cleared by `/reset`
- Runtime JSON state is reset through desktop admin actions or the test-control/admin APIs
- Packaging config is defined in `package.json` under `build`

## Workshop

- [Manual QA to Automation Workshop](./docs/manual-qa-to-automation-workshop.md)
- [Shift-Left Test Planning Workshop](./docs/shift-left-test-planning-workshop.md)
- [Bug Investigation Workshop](./docs/bug-investigation-workshop.md)
- [Negative Testing Workshop](./docs/negative-testing-workshop.md)
- [Flaky Test Reduction Workshop](./docs/flaky-test-reduction-workshop.md)
- [Test Case Design Workshop](./docs/test-case-design-workshop.md)
- [Selectors and Testability Workshop](./docs/selectors-and-testability-workshop.md)
- [Regression Strategy Workshop](./docs/regression-strategy-workshop.md)
- [Risk-Based Testing Workshop](./docs/risk-based-testing-workshop.md)
- [API Contract Testing Workshop](./docs/api-contract-testing-workshop.md)
- [Exploratory Testing to Automation Workshop](./docs/exploratory-testing-to-automation-workshop.md)
- [Accessibility Testing Workshop](./docs/accessibility-testing-workshop.md)
- [Test Data Management Workshop](./docs/test-data-management-workshop.md)
- [Release Readiness Workshop](./docs/release-readiness-workshop.md)

# Testbed

Testbed is a local QA learning environment built with React, TypeScript, Electron, and a JSON-backed HTTP server. It is designed to help manual testers move into automation by giving them a realistic website to test, a desktop learning shell, controllable failure modes, generated Postman assets, and a growing library of workshops and articles.

## What Lives Where

The product has three main parts. The browser app is the system under test. The desktop app is the training and control surface. The local server provides both the runtime APIs used by the website and the admin/test-control APIs used by the desktop shell.

- `src/`: React frontend shared by the browser app and Electron window
- `server/`: local HTTP server, runtime JSON handling, API routes, faults, traces, and Postman generation
- `electron/`: desktop shell that selects a data folder, starts the server, and opens the desktop route
- `docs/`: workshops, articles, and contributor documentation

## Running the App

- `npm run dev`: start the standalone localhost server and serve the website plus APIs
- `npm run dev:desktop`: launch the Electron desktop app
- `npm run build`: type-check and build the frontend
- `npm run preview`: serve the built app through the standalone server
- `npm run dist:desktop`: package the Electron app

## Testing

- `npm test`: run the Vitest suite
- `npm run test:watch`: run Vitest in watch mode
- `npm run test:coverage`: run Vitest with coverage output
- `npm run test:e2e`: run Playwright end-to-end smoke tests

The automated test strategy is layered:

- unit tests for parsing, validation, formatting, and route helpers
- component tests for shared UI such as markdown rendering
- server integration tests for health and API behavior
- Playwright smoke coverage for the learner-facing website

## Architecture Summary

The browser app and desktop app share one React codebase. The browser route set focuses on the shopping experience used for testing practice. The `/desktop` route exposes a training-focused shell for workshops, articles, traces, presets, Postman assets, and runtime controls.

The server owns the runtime truth. Immutable defaults live in `src/config` and `src/data`, while mutable runtime JSON is created in a writable data folder. The server also generates admin auth tokens, request traces, and Postman collections from shared route metadata.

More detailed architecture notes live in:

- [Architecture Guide](./docs/architecture.md)
- [UI and Theming Guide](./docs/ui-theming.md)
- [Testing Guide](./docs/testing.md)
- [Content Authoring Guide](./docs/content-authoring.md)

## Runtime Data

Runtime JSON is created outside the bundle so the app can be reset, mutated, and reused safely:

- `users.json`
- `break-modes.json`
- `products.json`
- `orders.json`
- `app-state.json`
- `test-controls.json`

Standalone mode uses `.testbed-runtime/standalone` by default. The Electron app prompts for a writable data folder on first run and reuses it later.

## Public APIs

Website/runtime APIs:

- `GET /api/health`
- `GET /api/runtime/bootstrap`
- `POST /api/auth/login`
- `GET /api/shop/products`
- `GET /api/orders`
- `POST /api/orders`

Test-control APIs:

- `GET /api/test-controls/state`
- `POST /api/test-controls/break-modes`
- `POST /api/test-controls/reset`
- `GET /api/test-controls/config`
- `POST /api/test-controls/config`
- `GET /api/test-controls/presets`
- `POST /api/test-controls/presets/:presetId/apply`
- `POST /api/test-controls/tracing`
- `GET /api/test-controls/traces`
- `DELETE /api/test-controls/traces`

Admin APIs:

- `GET /api/admin/overview`
- `GET /api/admin/users`
- `POST /api/admin/users`
- `PUT /api/admin/users/:username`
- `DELETE /api/admin/users/:username`
- `POST /api/admin/break-modes`
- `PATCH /api/admin/products/:id`
- `POST /api/admin/reset-runtime`

Admin APIs require `Authorization: Bearer <token>`. The desktop app sends this automatically. The Postman desktop tab exposes the generated token for learning purposes.

## Learning Content

Testbed includes two embedded content types:

- workshops: longer, guided learning tracks with gated progress and quizzes
- articles: shorter supporting reads that deepen tester judgement and automation thinking

Contributor guidance for adding new content lives in [Content Authoring Guide](./docs/content-authoring.md).

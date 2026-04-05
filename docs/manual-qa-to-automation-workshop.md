# Manual QA to Automation Workshop

This workshop uses Testbed as a safe place to move from manual testing into automation.

It is written for testers who already understand:

- browser-based end-to-end testing concepts
- API testing concepts
- shift-left thinking

It assumes you want to practise turning test ideas into:

- repeatable Playwright tests
- repeatable Postman requests and collections
- structured defect investigations

## Learning Goals

By the end of this workshop, you should be able to:

- start the app in browser mode and desktop mode
- explore the user journeys manually
- use scenario presets and endpoint faults to create controlled failures
- capture a first Playwright flow with Codegen
- refine Codegen output into maintainable tests
- test the runtime APIs with Postman
- connect UI failures to API-level evidence

## Prerequisites

Install dependencies:

```bash
npm install
```

Start the browser app:

```bash
npm run dev
```

Start the desktop admin shell in a second terminal:

```bash
npm run dev:desktop
```

Recommended local tools:

- Node.js
- Playwright installed locally or available via `npx`
- Postman desktop app

## What the App Gives You

Testbed has three main learning surfaces:

1. Browser app
   Routes for login, shop, checkout, orders, VIP, and reset.
2. Desktop admin shell
   Runtime controls, scenario presets, fault injection, trace viewing, and Postman asset download.
3. Local API
   Runtime, auth, shop, orders, admin, and test-control endpoints.

The browser app is the thing you test.
The desktop app is the thing you use to create known conditions for testing.
The API is the thing you inspect and automate directly.

## Part 1: Start with Manual Exploration

Before you automate anything, explore the app like a manual tester.

```quiz
id: manual-exploration-purpose
question: Why should a tester explore the app manually before recording a first automated flow?
passCondition: all
options:
  - id: understand-behavior
    label: To understand the user journey, assertions, and dependencies before automating it
    correct: true
  - id: avoid-api
    label: To avoid looking at any API behavior until the end of the workshop
    correct: false
  - id: skip-notes
    label: To reduce the need for notes or observations during testing
    correct: false
```

### 1. Open the app

Open the local browser URL shown by the server, usually:

```text
http://127.0.0.1:5175
```

Explore these routes:

- `/`
- `/login`
- `/shop`
- `/checkout`
- `/orders`
- `/vip`
- `/reset`

### 2. Use the seeded users

Default credentials:

- `customer@example.com` / `password123`
- `vip@example.com` / `password123`
- `admin@example.com` / `password123`

Manual exercise:

1. Sign in as customer.
2. Add a product to the basket.
3. Walk through checkout.
4. Confirm the order appears in order history.
5. Sign out and sign in as VIP.
6. Confirm VIP-only content is visible.

### 3. Record observations like a tester

As you explore, write down:

- critical paths
- important assertions
- data dependencies
- selectors or visible labels that look stable
- places where the UI depends on API data

Example notes:

- “A customer can buy a visible product and see the order in `/orders`.”
- “The basket state persists between pages.”
- “The app exposes useful `data-testid` values.”
- “Checkout depends on `GET /api/shop/products` and `POST /api/orders`.”

That note-taking step is the bridge from manual QA to automation.

## Part 2: Learn the Desktop Admin Shell

The desktop app is your training control panel.

Open the `Desktop` route inside the Electron app. The most useful tabs for workshop practice are:

- `Dashboard`
- `Break Modes`
- `Scenarios & Faults`
- `Tracing`
- `Postman`

### 1. Scenario Presets

Use `Scenarios & Faults` to apply a known state.

Suggested presets:

- `baseline`
- `auth-expired`
- `inventory-empty`
- `orders-api-422`
- `admin-slow`
- `schema-corruption-products`

Workshop exercise:

1. Apply `baseline`.
2. Test the shop manually.
3. Apply `inventory-empty`.
4. Refresh the shop page and note what changed.
5. Apply `schema-corruption-products`.
6. Refresh the shop page and note the error message.

What you are learning:

- how to control preconditions
- how to isolate a failure
- how to build reproducible tests

### 2. Fault Matrix

Each endpoint can be faulted independently.

You can change:

- enabled
- HTTP status
- fault mode
- latency
- message

Useful fault modes:

- `http-error`
- `malformed-json`
- `missing-fields`
- `wrong-types`
- `empty-body`
- `stale-success`

Workshop exercise:

1. Enable a fault for `orders.create`.
2. Set status to `422`.
3. Set mode to `http-error`.
4. Try placing an order through the UI.
5. Observe the user-facing error.

This teaches the difference between:

- a test that only proves the happy path
- a test that proves the app handles expected failure conditions

### 3. Tracing

Use the `Tracing` tab while you interact with the browser app.

Look for:

- endpoint key
- pathname
- response status
- fault mode
- latency
- correlation ID

Workshop exercise:

1. Turn tracing on.
2. Visit `/shop`.
3. Add a product and complete checkout.
4. Open the trace entries.
5. Match the UI action to the underlying API calls.

This is important because strong automation engineers debug with evidence, not guesswork.

### 4. Postman Assets

Use the `Postman` tab to:

- download a generated Postman collection
- download a generated Postman environment
- copy the base URL

These files let you move quickly from exploratory API testing into repeatable collections.

## Part 3: First Automation with Playwright Codegen

Playwright Codegen is a good starting point for manual testers because it converts interactions into a first draft of code.

```quiz
id: codegen-cleanup-purpose
question: After using Playwright Codegen, what is the most important next step?
passCondition: all
options:
  - id: refine
    label: Refine the generated code into stable selectors, explicit setup, and meaningful assertions
    correct: true
  - id: freeze
    label: Keep the generated output unchanged so the recording stays identical
    correct: false
  - id: remove-assertions
    label: Remove assertions so the test only proves the clicks were recorded
    correct: false
```

### 1. Launch Codegen

From the project root, run:

```bash
npx playwright codegen http://127.0.0.1:5175
```

If your server is on a different port, use the URL shown in the app or desktop shell.

### 2. Record a simple happy-path flow

Recommended first flow:

1. Open `/login`
2. Sign in as `customer@example.com`
3. Open `/shop`
4. Add one product to the basket
5. Continue to checkout
6. Complete shipping
7. Complete payment
8. Place the order
9. Open `/orders`
10. Confirm the order is visible

### 3. Save the generated code

Codegen will produce a starting point, but it is not the finished test.

Your job is to improve it.

### 4. Refine the generated test

When you convert Codegen output into a real test, improve these areas:

- replace brittle selectors with stable ones
- remove unnecessary clicks or waits
- use meaningful assertions
- keep test setup explicit
- avoid depending on whatever data was left behind from a previous run

Prefer selectors like:

- roles
- labels
- `data-testid`

Avoid depending only on:

- layout position
- visible text that could change
- long CSS chains

### 5. Example Playwright test shape

This is the kind of structure you want after cleanup:

```ts
import { test, expect } from '@playwright/test'

test('customer can place an order', async ({ page }) => {
  await page.goto('http://127.0.0.1:5175/login')

  await page.getByTestId('login-username').fill('customer@example.com')
  await page.getByTestId('login-password').fill('password123')
  await page.getByTestId('login-submit').click()

  await page.goto('http://127.0.0.1:5175/shop')
  await page.getByTestId('add-to-cart-wireless-headset').click()
  await page.getByTestId('basket-checkout-link').click()

  await page.getByLabel('Full name').fill('Casey Customer')
  await page.getByLabel('Email').fill('customer@example.com')
  await page.getByLabel('Address line 1').fill('1 Example Street')
  await page.getByLabel('City').fill('London')
  await page.getByLabel('Postcode').fill('E1 1AA')
  await page.getByLabel('Country').fill('United Kingdom')
  await page.getByRole('button', { name: /continue/i }).click()

  await page.getByLabel('Name on card').fill('Casey Customer')
  await page.getByLabel('Card number').fill('4242424242424242')
  await page.getByLabel('Expiry').fill('12/29')
  await page.getByLabel('CVV').fill('123')
  await page.getByRole('button', { name: /continue/i }).click()
  await page.getByRole('button', { name: /place order/i }).click()

  await page.goto('http://127.0.0.1:5175/orders')
  await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible()
})
```

Treat that as a model, not a copy-paste guarantee. Use the real selectors the app exposes.

## Part 4: Use Scenario Presets with Playwright

Once you can record one happy path, start controlling the environment before the UI test runs.

### 1. Apply a preset before the test

This is a simple approach:

```ts
import { test, expect, request } from '@playwright/test'

test.beforeEach(async ({ request }) => {
  await request.post('http://127.0.0.1:5175/api/test-controls/presets/baseline/apply')
})
```

This is better than manually clicking around in the desktop app before every run.

### 2. Example negative-path test

```ts
import { test, expect } from '@playwright/test'

test('shop shows a readable error when the catalog payload is corrupt', async ({ page, request }) => {
  await request.post('http://127.0.0.1:5175/api/test-controls/presets/schema-corruption-products/apply')
  await page.goto('http://127.0.0.1:5175/shop')

  await expect(page.getByText(/response was not valid json/i)).toBeVisible()
})
```

This is where automation starts to look like professional QA engineering:

- setup is controlled
- the failure is intentional
- the assertion is meaningful

### 3. Good workshop progression for Playwright

Write tests in this order:

1. login happy path
2. customer purchase happy path
3. VIP access check
4. inventory empty scenario
5. invalid order scenario
6. malformed products payload scenario
7. slow admin scenario

## Part 5: Use Postman to Test the API

Manual testers often start UI-first. This step teaches you to validate the system below the UI.

### 1. Import the generated assets

From the desktop app:

1. Open `Postman`
2. Download the collection
3. Download the environment

In Postman:

1. Import the collection JSON
2. Import the environment JSON
3. Select the imported environment

### 2. Explore the main API groups

Important collections should include:

- Runtime
- Auth
- Shop
- Orders
- Admin
- Test Controls
- Postman

### 3. Core requests to run first

Run these in order:

1. `GET /api/runtime/bootstrap`
2. `POST /api/auth/login`
3. `GET /api/shop/products`
4. `GET /api/orders`
5. `POST /api/test-controls/presets/baseline/apply`
6. `GET /api/test-controls/config`
7. `GET /api/test-controls/traces`

As you run them, inspect:

- status code
- response shape
- response time
- error messages
- `x-testbed-correlation-id` header

### 4. Create negative API checks

Use presets or direct test-control changes to force failures.

Recommended exercises:

1. Apply `orders-api-422`
2. Send `POST /api/orders`
3. Confirm the response is `422`
4. Check the message
5. Open `GET /api/test-controls/traces`
6. Match the failed request to its trace entry

Then try:

1. Apply `schema-corruption-products`
2. Run `GET /api/shop/products`
3. Observe how Postman handles malformed JSON

This teaches an important lesson:

UI failures often begin as API failures.

### 5. Add basic Postman tests

For each request, start adding assertions in Postman.

Example checks:

```js
pm.test('status is 200', function () {
  pm.response.to.have.status(200)
})

pm.test('correlation header exists', function () {
  pm.expect(pm.response.headers.get('x-testbed-correlation-id')).to.exist
})
```

For a normal products response:

```js
pm.test('products array exists', function () {
  const json = pm.response.json()
  pm.expect(json.products).to.be.an('array')
})
```

For a forced validation error:

```js
pm.test('status is 422', function () {
  pm.response.to.have.status(422)
})
```

## Part 6: Connect Manual, UI, and API Testing

This is the most important part of the workshop.

For each defect or scenario, practise answering all three questions:

1. What would a manual tester see?
2. What would a Playwright test assert?
3. What would a Postman test verify?

Example:

Scenario: `orders-api-422`

- Manual tester sees: checkout fails with a readable error
- Playwright test asserts: error message is visible and order is not confirmed
- Postman test verifies: `POST /api/orders` returns `422` with expected error structure

That is how you build shift-left habits.

## Part 7: Suggested Workshop Agenda

### Session 1: Explore and understand

- start browser app and desktop app
- walk core routes manually
- review seeded users
- use one preset and one fault
- inspect traces

### Session 2: First Playwright automation

- run Playwright Codegen
- record login and purchase flow
- refactor selectors
- add assertions
- run the test repeatedly

### Session 3: Negative-path automation

- use presets for controlled failure setup
- automate empty inventory and invalid order scenarios
- compare UI behavior under each failure

### Session 4: API testing with Postman

- import generated collection and environment
- run happy-path API requests
- run negative-path API requests
- add Postman tests
- compare results with trace entries

## Part 8: Good Habits to Build

As you use this app, focus on these habits:

- automate only after you understand the behavior
- keep environment setup explicit
- use stable selectors
- assert outcomes, not just clicks
- test both happy paths and failure paths
- use traces and correlation IDs when debugging
- connect browser failures back to API evidence

## Part 9: Common Mistakes

Avoid these:

- recording Codegen output and treating it as complete
- using hard-coded waits instead of real assertions
- skipping reset or preset setup between tests
- relying on text-only selectors when `data-testid` already exists
- testing only what the UI shows without validating the API behavior underneath

## Part 10: Practice Challenges

Try these on your own:

1. Write a Playwright test that verifies a customer cannot complete checkout when `orders-api-422` is active.
2. Write a Playwright test that verifies the shop handles `schema-corruption-products` gracefully.
3. Write a Postman test that checks every successful API response includes `x-testbed-correlation-id`.
4. Use the trace viewer to explain exactly which request failed during a broken checkout.
5. Apply `inventory-empty` and decide whether the UI behavior is acceptable from a product perspective.

## Quick Reference

Start browser app:

```bash
npm run dev
```

Start desktop app:

```bash
npm run dev:desktop
```

Open Playwright Codegen:

```bash
npx playwright codegen http://127.0.0.1:5175
```

Useful endpoints:

- `GET /api/runtime/bootstrap`
- `POST /api/auth/login`
- `GET /api/shop/products`
- `GET /api/orders`
- `POST /api/orders`
- `GET /api/test-controls/config`
- `GET /api/test-controls/presets`
- `POST /api/test-controls/presets/:presetId/apply`
- `GET /api/test-controls/traces`
- `GET /api/postman/collection`
- `GET /api/postman/environment`

Recommended first preset:

- `baseline`

Recommended first negative preset:

- `orders-api-422`

Recommended first resilience preset:

- `schema-corruption-products`

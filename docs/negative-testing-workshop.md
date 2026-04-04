# Negative Testing Workshop

This workshop teaches testers how to design and execute failure-focused testing instead of stopping at happy paths.

It uses Testbed to practise:

- invalid states
- broken dependencies
- bad responses
- empty data
- resilience and recovery behavior

## Learning Goals

By the end of this workshop, you should be able to:

- explain the purpose of negative testing
- identify high-value failure scenarios
- use presets and endpoint faults to create those scenarios
- decide what the system should do under failure
- design UI and API checks for non-happy paths

## Why Negative Testing Matters

Happy-path testing answers:

- “Does it work when everything is valid?”

Negative testing answers:

- “What happens when something goes wrong?”

Strong products need both.

Examples of useful negative checks:

- invalid credentials
- empty product list
- order creation failure
- malformed API payload
- missing required fields
- wrong data types
- slow service

## Part 1: Start with Failure Categories

Use these failure categories:

- validation failure
- unavailable service
- malformed response
- missing data
- wrong data type
- latency and timeout
- stale or inconsistent state
- unauthorized access

### Workshop exercise

Map Testbed examples to each category:

- validation failure: `orders-api-422`
- malformed response: `schema-corruption-products`
- missing data: `inventory-empty`
- unauthorized access: `auth-expired`
- latency: `admin-slow`

This helps you stop thinking only in terms of screens and start thinking in terms of failure classes.

## Part 2: Decide Expected Behavior

A negative test is only strong if you know what “good failure handling” looks like.

For each scenario, ask:

- should the user see an error message
- should the page stay usable
- should a retry be possible
- should existing data remain visible
- should the operation stop cleanly

### Example

Scenario: products API returns malformed JSON

Good outcome:

- page does not crash
- user sees a readable error
- no fake success state is shown

Bad outcome:

- blank screen
- endless spinner
- broken layout with no explanation

### Workshop exercise

Choose three negative scenarios and write the expected behavior before you run them.

## Part 3: Use Presets First

Presets are the quickest way to create repeatable negative states.

Recommended presets:

- `auth-expired`
- `inventory-empty`
- `orders-api-422`
- `admin-slow`
- `schema-corruption-products`

### Workshop exercise

For each preset:

1. apply it
2. perform the affected user flow
3. record what the user sees
4. decide whether the app behavior is acceptable

Ask:

- is the failure visible
- is the message understandable
- does the system recover
- does the failure stay contained

## Part 4: Go Deeper with the Fault Matrix

Presets are useful, but the fault matrix lets you create targeted negative conditions.

You can vary:

- endpoint
- status code
- response mode
- latency
- message

### Good workshop progression

Start simple:

- `http-error`

Then move to resilience-oriented failures:

- `malformed-json`
- `missing-fields`
- `wrong-types`
- `empty-body`
- `stale-success`

### Workshop exercise

Create these tests manually:

1. `shop.products` with `503` and `http-error`
2. `shop.products` with `200` and `malformed-json`
3. `orders.create` with `422` and `http-error`
4. `admin.overview` with extra latency

Compare the user experience in each case.

## Part 5: Negative UI Testing Ideas

When testing the browser app, focus on:

- readable error states
- no unexpected crashes
- correct blocked actions
- no false success
- preserved user context where appropriate

### Example checks

For `inventory-empty`:

- products page should show empty state
- basket should not claim products exist

For `orders-api-422`:

- checkout should fail clearly
- order confirmation should not appear
- order should not be visible in history as successful

For `auth-expired`:

- login should reject credentials
- protected routes should not silently grant access

## Part 6: Negative API Testing Ideas

Negative API testing is often faster and more precise than UI-only failure testing.

Use Postman or direct HTTP clients to verify:

- status codes
- error messages
- schema behavior
- malformed bodies
- correlation headers

### Workshop exercise

Run these API checks:

1. apply `orders-api-422`
2. send `POST /api/orders`
3. verify `422`
4. inspect the returned error
5. inspect the trace entry

Then:

1. apply `schema-corruption-products`
2. run `GET /api/shop/products`
3. inspect what Postman receives

This shows why API-level negative testing helps explain UI behavior.

## Part 7: Design Better Negative Test Cases

Weak negative tests:

- “Try bad input.”
- “See what happens.”

Stronger negative tests:

- “With `orders.create` forced to return `422`, checkout should show a readable error and should not create a visible order.”
- “With malformed JSON returned by `shop.products`, the page should render an error state instead of a blank screen.”

### Test case template

```text
Scenario:

Setup:

Action:

Expected UI result:

Expected API result:

Expected trace evidence:
```

## Part 8: Use Tracing as Evidence

Negative testing should not stop at visual symptoms.

Use the trace viewer to answer:

- which request failed
- how it failed
- whether a fault was injected
- whether the UI matched the real backend response

### Workshop exercise

Run a negative scenario and document:

- what the user saw
- what the API returned
- which trace entry proves it

That gives you a complete failure story.

## Part 9: Common Negative Testing Gaps

Avoid these:

- testing only one error code
- assuming all failures behave the same
- checking only the UI text without checking the API cause
- missing the difference between empty data and broken data
- failing to verify that success is not shown accidentally

Examples:

- empty product list is not the same as products API failure
- malformed JSON is not the same as `503`
- slow service is not the same as unavailable service

## Part 10: Practice Matrix

Use this matrix to plan negative coverage:

| Area | Failure | Setup | Expected result |
|---|---|---|---|
| Login | unauthorized | `auth-expired` | login blocked with readable message |
| Shop | empty data | `inventory-empty` | empty state shown |
| Shop | corrupt data | `schema-corruption-products` | readable error, no crash |
| Checkout | validation failure | `orders-api-422` | no success, clear error |
| Admin | latency | `admin-slow` | delayed but stable admin view |

## Part 11: Practice Challenges

1. Compare the behavior of `inventory-empty` versus a direct `503` on `shop.products`.
2. Compare malformed JSON versus missing fields on the same endpoint.
3. Design one Playwright test and one Postman test for the same negative scenario.
4. Decide which negative scenarios must run in regression and which are exploratory only.

## Part 12: Final Takeaway

Negative testing is not about trying random bad things.

It is about:

- choosing meaningful failure modes
- predicting correct failure behavior
- proving the app fails safely
- collecting evidence from both UI and API layers

That is how testers build confidence in resilience, not just functionality.

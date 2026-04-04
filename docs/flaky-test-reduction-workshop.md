# Flaky Test Reduction Workshop

This workshop teaches testers how to reduce instability in automated UI tests.

It uses Testbed to practise:

- identifying brittle tests
- replacing weak waits and selectors
- controlling test setup
- debugging nondeterministic failures
- building more reliable Playwright tests

## Learning Goals

By the end of this workshop, you should be able to:

- explain what makes a test flaky
- spot common instability patterns in UI automation
- improve selectors and assertions
- avoid weak timing-based tests
- use Testbed controls to make tests deterministic

## What Flaky Means

A flaky test is one that:

- passes sometimes
- fails sometimes
- without a meaningful product change

That makes it hard to trust.

Flaky tests waste time because teams stop believing failures.

## Common Causes of Flakiness

The most common causes are:

- weak selectors
- fixed sleeps
- shared or drifting test data
- hidden dependency on previous tests
- timing assumptions
- assertions that are too vague
- environment not being reset

Testbed is useful here because it gives you controlled state and visible failure conditions.

## Part 1: Weak vs Strong Selectors

Weak selectors depend on:

- text that changes easily
- element order
- layout structure
- broad CSS chains

Stronger selectors depend on:

- accessible roles
- labels
- `data-testid`

### Workshop exercise

Compare these styles:

- `page.locator('button').nth(3)`
- `page.getByText('Add to basket')`
- `page.getByTestId('add-to-cart-wireless-headset')`

Ask:

- which one is most stable
- which one breaks if text changes
- which one breaks if layout changes

In this app, `data-testid` and accessible locators are usually the best starting point.

## Part 2: Avoid Fixed Waits

A common beginner mistake is:

```ts
await page.waitForTimeout(2000)
```

That usually creates slow and flaky tests.

Prefer:

- waiting for visible elements
- waiting for a meaningful assertion
- waiting for a URL change
- waiting for response-driven UI state

### Workshop exercise

Use the `admin-slow` preset and compare:

- a test using fixed timeout
- a test waiting for a visible heading or state change

Ask:

- which one is more resilient
- which one is faster when the app is not slow

## Part 3: Control State Before the Test

Flaky tests often depend on leftover data.

Examples:

- an existing session
- basket items left over from a previous run
- runtime data changed by another test
- a fault or preset still active

### Better approach

Reset or configure the environment explicitly before each test.

Examples:

- apply `baseline`
- clear browser state
- use known seeded users

### Workshop exercise

Write a `beforeEach` step that:

1. applies `baseline`
2. clears browser state by visiting `/reset`
3. starts from `/login`

This reduces hidden coupling between tests.

## Part 4: Make Assertions Specific

Weak assertions:

- “page loaded”
- “button exists”
- “something contains text”

Stronger assertions:

- order confirmation is visible
- the expected error message appears
- order history contains the new order
- checkout does not succeed under `422`

### Workshop exercise

Take a Codegen-generated test and replace vague assertions with business-relevant ones.

Examples:

- instead of asserting that a page has any heading
- assert that the correct route or business outcome is present

## Part 5: Use Presets Instead of Complex UI Setup

If a test needs a failure condition, set it through the API or desktop controls rather than creating it manually through many UI steps.

Better:

- apply `orders-api-422`

Worse:

- click through multiple admin screens before every test run

This matters because long setup flows increase flakiness.

### Workshop exercise

Compare:

1. a negative test that configures state through test-control APIs
2. a negative test that uses a long UI setup path

Ask:

- which one is easier to debug
- which one is more repeatable
- which one is less likely to fail for unrelated reasons

## Part 6: Use Traces to Debug Flaky Failures

When a test fails unexpectedly, do not guess.

Inspect:

- trace viewer
- response status
- correlation ID
- active preset
- endpoint fault state

### Workshop exercise

Create a test that sometimes fails because you intentionally left state uncontrolled.

Then debug it by checking:

- whether the wrong preset was active
- whether old order data changed the expected outcome
- whether the wrong user session was still present

This teaches that many flaky tests are setup bugs, not product bugs.

## Part 7: Separate Product Bugs from Test Bugs

A flaky test is not automatically proof of a flaky product.

Ask:

- does the failure reproduce manually
- does the API evidence show the same problem
- did the test use weak synchronization
- did the environment drift between runs

### Example

If a checkout test fails only because the test clicked too soon during a slow response, that is likely a test design issue.

If checkout fails manually and the API trace confirms a broken response, that is likely a product issue.

### Workshop exercise

Take one unstable test idea and classify the likely failure source as:

- product bug
- test bug
- setup issue
- environment issue

## Part 8: Stable Test Design Rules

Use these rules:

- start from known state
- keep tests independent
- avoid fixed sleeps
- prefer stable selectors
- assert business outcomes
- keep setup short
- use API setup where possible
- make failure messages easy to interpret

## Part 9: Refactoring Exercise

Take a rough Codegen test and improve it.

### Before

Problems to look for:

- repeated navigation
- text-only selectors
- generic locators
- timing waits
- no reset/setup
- weak assertions

### After

Target improvements:

- baseline preset applied first
- explicit login helper or stable steps
- `data-testid` locators where useful
- assertions tied to business outcomes
- no arbitrary timeouts

## Part 10: Flake Hunt Challenges

Try these:

1. Write a checkout test that passes under `baseline` and stays stable across multiple runs.
2. Make it intentionally flaky by removing environment control.
3. Fix the flakiness by restoring setup discipline.
4. Create a test for `admin-slow` and prove it does not rely on hard-coded waits.
5. Use traces to explain one failure that looked random at first.

## Part 11: Red Flags in Test Reviews

When reviewing Playwright tests, watch for:

- `waitForTimeout`
- broad text selectors
- `.nth()` on unstable collections
- no reset/setup
- shared state between tests
- no negative-path assertions
- assertions that only prove navigation happened

If you see those patterns, the test may pass today and become noisy later.

## Part 12: Final Takeaway

Flaky tests are usually designed into the suite.

Reducing flakiness is mostly about:

- better setup
- better selectors
- better synchronization
- better assertions

Reliable tests are not just “more stable.”
They are easier to trust, easier to debug, and more useful to the team.

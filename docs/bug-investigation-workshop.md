# Bug Investigation Workshop

This workshop teaches testers how to investigate failures methodically instead of jumping to conclusions.

It uses Testbed to practise:

- reproducing issues consistently
- isolating the point of failure
- collecting useful evidence
- separating UI symptoms from API causes
- writing stronger defect reports

## Learning Goals

By the end of this workshop, you should be able to:

- reproduce a defect in a controlled way
- use presets and faults to narrow the problem
- inspect traces and correlation IDs
- decide whether a failure is UI, API, data, or test setup related
- write a bug report that developers can act on quickly

## Why Bug Investigation Matters

A weak investigation sounds like:

- “Checkout is broken.”
- “The page didn’t work.”
- “It failed sometimes.”

A strong investigation sounds like:

- “With the `orders-api-422` preset active, `POST /api/orders` returns `422` and the UI displays the server message correctly, so the backend failure is exposed but handled.”
- “With the `schema-corruption-products` preset active, `GET /api/shop/products` returns malformed JSON and the page renders an error instead of crashing.”
- “The issue appears only after product data is hidden and the basket still contains that product, suggesting stale UI state.”

The point is not just to find that something is wrong.
The point is to explain what is wrong, under what conditions, and where it likely lives.

## Investigation Workflow

Use this sequence every time:

1. define the symptom
2. reproduce it
3. control the state
4. narrow the scope
5. inspect the evidence
6. form a hypothesis
7. verify the hypothesis
8. write the finding clearly

## Part 1: Reproduce Intentionally

Before you debug anything, make sure you can reproduce it more than once.

### Workshop exercise

Use the desktop app and apply:

- `orders-api-422`

Then:

1. log in as `customer@example.com`
2. add a product to the basket
3. complete checkout
4. observe the failure
5. repeat the same steps

Ask:

- does it fail every time
- does it fail only in one route or step
- what exact message is shown
- what changed immediately before the failure

If you cannot reproduce a bug reliably, your next task is not diagnosis.
Your next task is improving reproduction.

## Part 2: Control the Conditions

Do not investigate in a drifting environment.

Use:

- presets
- fault matrix
- reset controls
- seeded users

### Workshop exercise

Compare these conditions:

1. `baseline`
2. `orders-api-422`
3. manual fault on `orders.create`

For each one, ask:

- what changed in the environment
- what stayed the same
- what does this tell me about the failure source

You are learning to remove noise from the investigation.

## Part 3: Follow the Request Path

Use the `Tracing` tab while reproducing the issue.

Look for:

- pathname
- endpoint key
- method
- response status
- response mode
- latency
- correlation ID
- fault metadata

### Workshop exercise

Trigger a checkout failure and then answer:

1. Which request failed?
2. What status did it return?
3. Was a fault injected?
4. Did the UI message match the backend message?
5. Was the problem present before the response reached the page?

This is the core habit:

- UI symptom first
- request evidence second
- diagnosis third

## Part 4: Separate Symptom from Cause

The visible problem is not always the real problem.

Examples:

- visible symptom: “Products unavailable”
- possible causes:
  - API returned `503`
  - API returned malformed JSON
  - API returned wrong shape
  - UI parsed the response incorrectly

### Workshop exercise

Run these scenarios one by one:

- `inventory-empty`
- `schema-corruption-products`
- manual `http-error` on `shop.products`

For each scenario, write:

- visible symptom
- likely cause
- confirmed cause

This teaches you to avoid assumptions.

## Part 5: Form and Test Hypotheses

After gathering evidence, write a hypothesis in one sentence.

Good example:

- “The UI is behaving correctly; the failure originates in `POST /api/orders` returning a forced validation error.”

Another good example:

- “The products page failure is caused by malformed JSON from the API rather than a normal HTTP error.”

Bad example:

- “React is broken.”

### Workshop exercise

Investigate one failure and write:

1. symptom
2. evidence
3. hypothesis
4. verification step

Template:

```text
Symptom:

Evidence:

Hypothesis:

Verification:
```

## Part 6: Decide Where the Bug Lives

Most failures in Testbed can be classified into one of these buckets:

- UI behavior bug
- API contract bug
- data/state bug
- environment/setup issue
- test bug

### Example classification

Scenario: `schema-corruption-products`

- if the API returns invalid JSON and the UI shows a readable error:
  this is not a UI bug, it is a controlled API failure handled correctly

- if the API returns invalid JSON and the UI crashes:
  this is a UI resilience bug

Scenario: `orders-api-422`

- if the API returns `422` and the UI shows the error:
  expected behavior under failure

- if the API returns `422` but the UI shows success:
  UI bug

### Workshop exercise

Take three failures and assign each to one category.
Explain why.

## Part 7: Write a Strong Bug Report

A strong bug report should include:

- concise title
- environment
- setup state or preset
- reproduction steps
- expected result
- actual result
- evidence
- likely impact

### Example bug report

```text
Title:
Shop page crashes when products API returns malformed JSON

Environment:
Local Testbed server, browser app, preset `schema-corruption-products`

Steps:
1. Apply preset `schema-corruption-products`
2. Open /shop
3. Wait for product data to load

Expected:
Page shows a readable error state

Actual:
Page becomes unusable and does not render a stable recovery message

Evidence:
- Trace entry for GET /api/shop/products shows malformed-json response mode
- Response cannot be parsed
- Correlation ID: <value>

Impact:
A corrupt backend payload can take down a key shopping route instead of failing gracefully
```

### Workshop exercise

Write a bug report for one of these:

- failed checkout under `orders-api-422`
- corrupt products response
- incorrect empty-state handling

## Part 8: Investigation Checklist

Use this checklist during practice:

- Can I reproduce it twice?
- Did I reset or control the environment first?
- Do I know which request is involved?
- Did I inspect the trace?
- Do I know whether the issue is expected under the active scenario?
- Have I separated symptom from cause?
- Can I explain the likely failure layer?
- Do I have enough evidence for a developer?

## Part 9: Practice Scenarios

### Scenario 1: Checkout fails

Use:

- preset `orders-api-422`

Investigate:

- what failed
- what request was involved
- whether the UI handled it acceptably

### Scenario 2: Shop page error

Use:

- preset `schema-corruption-products`

Investigate:

- whether the response is malformed or just unsuccessful
- whether the UI handles it gracefully

### Scenario 3: Slow admin

Use:

- preset `admin-slow`

Investigate:

- which request is slow
- whether the behavior is just latency or a true defect

## Part 10: Final Takeaway

Good investigation is structured.

The goal is not:

- to guess quickly

The goal is:

- to reproduce reliably
- gather useful evidence
- isolate the failure layer
- explain the issue clearly

That is what turns a tester into a strong debugging partner for engineering teams.

# Shift-Left Test Planning Workshop

This workshop teaches testers how to think earlier, ask better questions, and plan testing before execution starts.

It uses Testbed as a practical system for learning shift-left habits:

- understanding risks before writing tests
- mapping features to different test levels
- identifying what should be validated in UI, API, and lower layers
- turning requirements into a test approach

This is not a tool-first workshop.
It is a thinking-first workshop.

## Learning Goals

By the end of this workshop, you should be able to:

- describe shift-left in practical QA terms
- break a feature into risks, assumptions, and interfaces
- decide what to test manually, what to automate, and where
- write a lightweight test approach before execution starts
- use Testbed’s routes, APIs, and failure controls to design better coverage

## What Shift Left Means Here

Shift left does not just mean “write automation earlier.”

In this workshop, shift left means:

- review requirements before coding is finished
- identify risks before bugs appear
- ask for testability before execution starts
- push validation closer to where failures originate
- avoid relying only on late-stage end-to-end testing

A weak approach looks like this:

- wait for the full UI
- click around manually
- automate one happy path
- react to defects after they are found

A stronger shift-left approach looks like this:

- understand the feature first
- identify critical business rules
- identify dependencies and contracts
- plan coverage at multiple levels
- decide what must be true before the feature is “testable”

## The System Under Test

Use Testbed as the example product.

Its main surfaces are:

- browser routes
- local APIs
- desktop admin shell
- runtime data and test controls

Main user flows:

- login
- product browsing
- basket and checkout
- order history
- VIP access

Main technical dependencies:

- runtime bootstrap
- auth API
- products API
- orders API
- admin APIs
- test-control APIs

When planning tests, treat each of those as a possible failure point.

## Part 1: Start with Product Thinking

Before listing test cases, ask:

- what problem is this feature solving
- who uses it
- what happens if it fails
- what data drives it
- what other systems it depends on

### Workshop exercise

Take the checkout feature and answer:

1. Who is the user?
2. What is the user trying to achieve?
3. What would make the feature unacceptable?
4. What data is required?
5. Which APIs does it depend on?

Example answers:

- user: customer or VIP shopper
- goal: place an order successfully
- unacceptable failure: cannot complete purchase, wrong total, silent failure, missing order history
- required data: products, basket items, shipping details, payment details
- APIs: `GET /api/shop/products`, `POST /api/orders`, `GET /api/orders`

This is the beginning of a test approach.

## Part 2: Identify Risks Before Test Cases

Many testers jump straight to steps and expected results.
Shift-left planning starts with risk.

For each feature, ask:

- what is most likely to break
- what would hurt the user most
- what would hurt the business most
- what would be expensive to fix late

### Example: checkout risks

- incorrect order total
- order submission failure
- invalid validation messages
- basket state lost between pages
- successful API call but missing confirmation in UI
- order created but not visible in history

### Workshop exercise

Rate each risk as:

- high
- medium
- low

Then explain why.

Example:

- incorrect total: high, because money and trust are affected
- basket state lost: high, because purchase flow breaks
- button style regression: low, unless it affects usability or accessibility

Risk rating helps you decide what deserves deeper coverage.

## Part 3: Decide the Right Test Level

Not every rule should be proven with a full UI test.

Use this rule of thumb:

- UI tests prove the journey works for the user
- API tests prove contracts and data behavior
- lower-level tests prove logic in isolation
- manual exploratory testing proves unknowns and learning

### Example mapping

Feature: login

- UI test: user can sign in and reach the correct destination
- API test: `POST /api/auth/login` returns the correct structure and errors
- exploratory test: invalid user messaging is understandable

Feature: products page

- UI test: visible products render correctly
- API test: `GET /api/shop/products` returns the expected schema
- exploratory test: empty state and error state are understandable

Feature: checkout total

- UI test: shopper sees the expected total
- API test: order response contains the expected subtotal and total fields
- lower-level test: any pricing logic should be isolated if extracted

### Workshop exercise

Choose one feature and fill this table:

| Feature | UI test | API test | Exploratory test | Not worth UI coverage |
|---|---|---|---|---|
| Checkout | Order confirmation visible | Order response contract | Error messaging clarity | Every field formatting variation |

The goal is not to maximize UI automation.
The goal is to place checks where they are most valuable.

## Part 4: Ask Testability Questions Early

Shift-left testers ask for testability before implementation is “done.”

Useful questions:

- how can this feature be seeded into a known state
- how can failures be reproduced reliably
- are stable selectors available
- can APIs be called independently of the UI
- can we inspect traces or logs
- how do we reset data between runs

Testbed already gives you many of these answers:

- presets for known states
- fault injection for known failures
- tracing for request-level evidence
- generated Postman assets for API exploration
- reset controls for repeatability

### Workshop exercise

Take the products page and ask:

- what would make this feature hard to test if these controls did not exist
- which existing Testbed feature solves that problem

Example:

- problem: hard to recreate bad API responses
- solution: fault matrix

- problem: hard to repeat empty-state scenarios
- solution: `inventory-empty` preset

## Part 5: Plan Coverage Before Execution

A shift-left test plan does not need to be long.
It needs to be intentional.

Use this structure:

1. feature goal
2. key risks
3. dependencies
4. coverage by level
5. data/setup needs
6. non-happy-path scenarios
7. exit criteria

### Example lightweight test plan

Feature: order creation

- goal: customer can submit a valid order and later view it
- key risks: wrong total, failed submission, missing history, unreadable errors
- dependencies: products API, orders API, local session/cart state
- UI coverage: complete happy path and one failure path
- API coverage: order create success and validation-style failure
- setup: baseline preset, seeded customer, known product
- non-happy paths: `orders-api-422`, malformed products response
- exit criteria: happy path stable, failure states readable, traces confirm behavior

This is enough to guide strong execution.

## Part 6: Use Scenarios to Plan Negative Paths

Many teams under-plan failure coverage.

Testbed gives you named scenarios so you can design negative-path coverage earlier.

Useful scenarios:

- `baseline`
- `inventory-empty`
- `orders-api-422`
- `auth-expired`
- `admin-slow`
- `schema-corruption-products`

### Workshop exercise

For each preset, answer:

1. What user problem does this represent?
2. What should the UI do?
3. What should the API return?
4. What should a Playwright test assert?
5. What should a Postman test assert?

Example:

Preset: `schema-corruption-products`

- user problem: products cannot load correctly
- UI expectation: readable error state, no crash
- API behavior: invalid JSON or corrupted contract
- Playwright assertion: error text visible
- Postman assertion: response is malformed or unparseable

That exercise teaches design-level coverage thinking, not just execution.

## Part 7: Plan for Observability

A strong test strategy includes how you will investigate failures.

Before execution, decide:

- what evidence do we need if this fails
- where can we see request/response behavior
- how will we separate product defects from test defects
- what data proves the issue happened

In Testbed, your observability tools are:

- trace viewer
- correlation ID header
- desktop fault configuration
- visible runtime state

### Workshop exercise

Create an investigation plan for a failed checkout:

- what page evidence would you collect
- which API requests would you inspect
- what trace entry would matter most
- what would confirm this is a backend fault versus a UI fault

This is important because good test planning includes debugging strategy.

## Part 8: Build a Coverage Matrix

A coverage matrix keeps planning concrete.

Create one for a feature using these columns:

| Area | Risk | Level | Type | Priority | Notes |
|---|---|---|---|---|---|
| Login | invalid credentials | API + UI | negative | high | readable error required |
| Shop | empty catalog | UI + API | negative | medium | use `inventory-empty` |
| Checkout | wrong total | UI + API | negative | high | financial impact |
| Orders | history missing | UI + API | negative | high | persistence issue |

Rules:

- `Level` is where you will test it
- `Type` is happy, negative, resilience, exploratory, or regression
- `Priority` reflects risk, not convenience

This gives you a test approach you can explain to developers, product, and other testers.

## Part 9: Example Shift-Left Review Questions

Use these questions during backlog refinement, story review, or early feature walkthroughs.

### Product questions

- what is the most important user outcome
- what data states matter
- what happens when the dependency fails
- what does success look like

### QA questions

- what are the riskiest rules
- what must be tested before UI completion
- what can be verified at API level
- what needs stable setup

### Testability questions

- how do we seed the scenario
- how do we reset the scenario
- how do we force the failure
- how do we observe the failure
- how will automation identify elements reliably

### Exit questions

- what evidence will prove this feature is ready
- what regression areas are most exposed
- what is intentionally out of scope

## Part 10: Practice Exercise

Use this full exercise with the checkout flow.

### Step 1

Write a one-sentence feature goal.

Example:

“A signed-in customer can place an order for visible products and see that order in history.”

### Step 2

List five risks.

### Step 3

List the supporting APIs.

### Step 4

Choose which risks belong in:

- UI automation
- API automation
- exploratory testing

### Step 5

Choose which Testbed presets or faults will help you prove those risks.

### Step 6

Write a one-page test approach.

Use this template:

```text
Feature:

Goal:

Key risks:

Dependencies:

Setup:

UI coverage:

API coverage:

Exploratory coverage:

Negative-path scenarios:

Observability/debug plan:

Exit criteria:
```

## Part 11: What Good Looks Like

A good shift-left tester:

- challenges unclear requirements early
- identifies risks before building lots of tests
- asks where each rule should be validated
- plans setup and reset up front
- treats observability as part of test design
- uses UI tests carefully, not excessively

A weak plan usually shows these problems:

- too many end-to-end checks for low-value details
- no negative-path coverage
- no thought about data setup
- no thought about investigation
- test cases without risk context

## Part 12: Suggested Team Workshop Format

### Session 1: Feature breakdown

- pick one Testbed feature
- identify user goals, dependencies, and business risks

### Session 2: Coverage mapping

- decide what belongs in UI, API, and exploratory testing
- create a coverage matrix

### Session 3: Failure planning

- use presets and endpoint faults
- define expected behavior under failure

### Session 4: Execution handoff

- turn the plan into Playwright and Postman tasks
- compare actual execution with the planned strategy

## Part 13: Final Takeaway

Shift left is not a slogan.
It is a planning discipline.

The point is to ask earlier:

- what matters most
- what can fail
- where to test it
- how to make it observable
- how to make it repeatable

If a tester can do that well, the later automation work becomes much stronger and much less wasteful.

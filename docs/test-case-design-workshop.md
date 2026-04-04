# Test Case Design Workshop

This workshop teaches testers how to design strong test cases instead of writing long lists of repetitive checks.

It uses Testbed to practise:

- identifying what actually needs coverage
- reducing duplication
- designing high-value test scenarios
- applying classic test design techniques

## Learning Goals

By the end of this workshop, you should be able to:

- turn a feature into a small set of strong test ideas
- use equivalence partitioning
- use boundary value thinking
- use decision tables
- use state-transition thinking
- avoid bloated low-value test packs

## Why Test Case Design Matters

Weak test design often looks like:

- too many minor variations
- repeated checks for the same rule
- lots of steps but little insight
- no reason for why each case exists

Strong test design focuses on:

- different behavior classes
- high-value boundaries
- meaningful combinations
- user and business risk

## Part 1: Start with the Rule, Not the Screen

Before writing steps, identify the rule you are testing.

Example rules in Testbed:

- only valid users can log in
- customer or VIP users can access shop routes
- only VIP users can access VIP content unless bypass mode is enabled
- orders should be created only when checkout completes successfully
- products should render only when product data is valid and available

### Workshop exercise

Take the login page and write:

- one UI feature description
- the actual rules behind it

Example:

- feature: login form
- rules:
  - username must be present
  - username must be an email
  - password must be present
  - password must meet minimum length
  - valid credentials create a session
  - invalid credentials show an error

## Part 2: Use Equivalence Partitioning

Equivalence partitioning means grouping inputs that should behave the same way.

For login:

- valid email + valid password
- empty username
- invalid email format
- empty password
- too-short password
- valid format but wrong credentials

You do not need ten different invalid emails if they all prove the same rule.

### Workshop exercise

Create partitions for:

- login input
- shipping form
- payment form

Write only one or two strong cases per partition.

## Part 3: Use Boundary Value Thinking

Boundaries are common defect areas.

Examples in Testbed:

- password minimum length
- postcode minimum length
- card number exact length
- CVV valid lengths

### Workshop exercise

Pick one field and test:

- just below the boundary
- exactly on the boundary
- just above the boundary

Example:

Password minimum length is 6:

- 5 characters
- 6 characters
- 7 characters

That gives more value than random length variation.

## Part 4: Use Decision Tables

Decision tables help when multiple conditions combine into different outcomes.

Example: route access

Conditions:

- user logged in or not
- user role is customer, VIP, or admin
- bypass mode enabled or not

Possible outcomes:

- access granted
- redirected to login
- access denied

### Workshop exercise

Build a simple decision table for access to:

- `/shop`
- `/vip`

Then choose the smallest set of cases that proves the logic.

## Part 5: Use State-Transition Thinking

Some features behave differently depending on the current state.

Examples:

- empty basket -> populated basket
- checkout step 1 -> step 2 -> step 3 -> review
- unauthenticated -> authenticated
- no orders -> order created -> order history visible

### Workshop exercise

Map the checkout journey as states:

- empty basket
- basket ready
- shipping entered
- payment entered
- review ready
- order placed

Then ask:

- what transitions are valid
- what transitions should be blocked
- what negative cases matter most

This helps you design cases around behavior rather than page layout.

## Part 6: Remove Redundant Tests

A common design mistake is writing several cases that all prove the same rule.

Example:

- cannot continue with missing full name
- cannot continue with missing address
- cannot continue with missing city

Those may all be valid, but they may belong in:

- a focused form-validation set

You do not need to repeat the full checkout journey for every missing field.

### Workshop exercise

Review a rough test list and mark each case as:

- unique value
- redundant
- better suited to API level
- better suited to exploratory testing

## Part 7: Choose the Best Level for Each Case

Not every designed case belongs in Playwright.

Examples:

- login success: UI and API
- malformed product payload: UI and API
- every validation combination: probably better split across UI and lower-level checks

### Workshop exercise

For each designed case, choose:

- UI automation
- API automation
- exploratory/manual
- out of scope

This keeps your suite leaner and stronger.

## Part 8: Test Case Template

Use this format:

```text
Title:

Rule being tested:

Setup:

Input:

Action:

Expected result:

Level:

Priority:
```

This keeps the case focused on purpose, not just steps.

## Part 9: Practice Challenges

1. Design a compact login validation test pack.
2. Design a checkout validation pack using boundary analysis.
3. Design a VIP access pack using a decision table.
4. Design an order journey pack using state transitions.

## Part 10: Final Takeaway

Good test case design is about choosing the smallest set of cases that proves the most important behavior.

The goal is not more cases.
The goal is better coverage.

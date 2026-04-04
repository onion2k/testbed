# Regression Strategy Workshop

This workshop teaches testers how to choose what belongs in a regression pack instead of trying to rerun everything.

It uses Testbed to practise:

- choosing smoke coverage
- choosing critical-path coverage
- choosing deeper regression coverage
- balancing risk, speed, and maintenance

## Learning Goals

By the end of this workshop, you should be able to:

- explain the difference between smoke and regression coverage
- identify critical-path scenarios
- decide what should always run versus what should run less often
- avoid bloated regression packs
- justify your regression choices clearly

## Part 1: Not Everything Belongs in Smoke

Smoke tests answer:

- is the system alive
- are the most critical journeys still working

Regression tests answer:

- did existing behavior break in important ways

A smoke pack should be small.

A regression pack should be intentional.

## Part 2: Identify Critical Paths

In Testbed, critical paths include:

- login
- shop access
- add to basket
- checkout completion
- order history visibility

These are strong smoke candidates.

### Workshop exercise

Choose five scenarios that you would put in smoke and explain why.

## Part 3: Identify Important but Non-Smoke Coverage

Examples:

- empty product list handling
- invalid order behavior
- malformed payload resilience
- VIP access rules
- admin visibility and tracing tools

These may belong in deeper regression or targeted suites, not smoke.

### Workshop exercise

Classify scenarios as:

- smoke
- core regression
- targeted regression
- exploratory only

## Part 4: Balance Speed and Value

A weak regression pack:

- is large
- slow
- repetitive
- hard to trust

A stronger regression strategy:

- protects the highest risks
- keeps feedback fast where needed
- moves lower-value checks to lower levels or exploratory work

### Workshop exercise

Take ten candidate scenarios and cut them down to:

- 3 smoke
- 5 core regression
- 2 exploratory only

## Part 5: Use Risk and Change Impact

Good regression choices come from:

- business criticality
- technical fragility
- recent change impact
- defect history

### Example

If checkout code changed recently, checkout coverage should be prioritized.

If only admin diagnostics changed, not every shop-path UI test needs to run more often.

## Part 6: Build a Simple Regression Matrix

Use this structure:

| Scenario | Value | Frequency | Level |
|---|---|---|---|
| Login happy path | high | every run | UI + API |
| Checkout happy path | high | every run | UI |
| Orders API 422 | high | daily or pre-release | UI + API |
| Malformed products payload | medium | daily or targeted | UI + API |
| Admin slow response | medium | targeted | UI |

## Part 7: Practice Challenges

1. Create a smoke pack for Testbed.
2. Create a core regression pack.
3. Identify what should be API-only instead of UI regression.

## Part 8: Final Takeaway

Regression strategy is about confidence per minute.

The goal is not to rerun everything.
The goal is to protect the most important behavior with the right depth and cadence.

# Exploratory Testing to Automation Workshop

This workshop teaches testers how to turn exploratory findings into repeatable automated checks.

It uses Testbed to practise:

- exploring a feature manually
- recording useful observations
- identifying stable automation candidates
- choosing what should stay exploratory
- turning notes into Playwright and Postman coverage

## Learning Goals

By the end of this workshop, you should be able to:

- run a focused exploratory session
- capture notes that support automation later
- distinguish one-off discovery from repeatable checks
- convert findings into UI and API tests

## Part 1: Explore with a Mission

Exploratory testing works best with a clear charter.

Example charters:

- explore checkout error handling
- explore VIP access control
- explore product-loading behavior under failure

### Workshop exercise

Choose one charter and spend 15 minutes exploring.

Record:

- what you tried
- what you observed
- what surprised you
- what looked automatable

## Part 2: Capture Better Notes

Good notes include:

- scenario
- setup
- user action
- observed result
- possible assertion
- useful API dependency

### Example note

- scenario: product API malformed
- setup: `schema-corruption-products`
- action: open `/shop`
- observed result: readable error message
- automation candidate: assert error state is visible
- API dependency: `GET /api/shop/products`

## Part 3: Choose What to Automate

Automate findings that are:

- repeatable
- important
- stable enough
- worth keeping in regression

Keep exploratory when the value is:

- discovery
- creativity
- unusual combinations
- one-off investigation

## Part 4: Convert a Finding into a Test

Take an exploratory note and turn it into:

- setup
- action
- assertion

### Workshop exercise

Convert one note into:

- a Playwright test idea
- a Postman test idea

## Part 5: Final Takeaway

Exploratory testing and automation are not opposites.

Exploration finds the behavior worth protecting.
Automation protects it once you understand it.

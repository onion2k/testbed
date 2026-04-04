# Selectors and Testability Workshop

This workshop teaches testers how to choose stronger selectors and how to think about testability before writing automation.

It uses Testbed to practise:

- choosing robust Playwright locators
- identifying brittle locator patterns
- understanding what makes a UI testable
- asking for better hooks when needed

## Learning Goals

By the end of this workshop, you should be able to:

- explain why some selectors are brittle
- prefer roles, labels, and `data-testid` where appropriate
- recognise when text-based selection is too fragile
- describe what “good testability” looks like
- ask for better automation hooks in a useful way

## Part 1: What Makes a Selector Good

A good selector is:

- stable
- meaningful
- readable
- independent of layout details

A bad selector often depends on:

- visual order
- generic CSS chains
- changing marketing copy
- unrelated surrounding markup

## Part 2: Locator Preference Order

In this app, a practical preference order is:

1. accessible role and name
2. label-based locators
3. `data-testid`
4. text-only locators when the text is genuinely stable
5. CSS selectors only when necessary

### Workshop exercise

Compare these:

- `page.locator('.card button')`
- `page.getByText('Shop now')`
- `page.getByRole('button', { name: 'Shop now' })`
- `page.getByTestId('login-submit')`

Explain when each is acceptable and when it is risky.

## Part 3: Use What Testbed Already Exposes

Testbed intentionally provides:

- roles
- labels
- `data-testid`

That means you should not default to brittle CSS selectors.

### Workshop exercise

Find stable locators for:

- login username
- login password
- login submit
- add to cart
- basket checkout link

Write both:

- a weak locator
- a stronger replacement

## Part 4: Text Can Be Useful, But Be Careful

Visible text can be useful when:

- it is part of the product requirement
- it is stable
- the meaning is central

Visible text is risky when:

- content can change under content-change scenarios
- marketing copy is expected to evolve
- localisation is possible later

### Workshop exercise

Use a content-change scenario and identify which text-based selectors would become fragile.

This teaches an important lesson:

not all human-readable text is a good automation handle.

## Part 5: Testability Is More Than Selectors

A feature is more testable when it has:

- reliable setup
- stable state reset
- observable responses
- meaningful locators
- known data
- reproducible failures

Testbed already helps with:

- presets
- fault injection
- trace viewer
- generated API assets

### Workshop exercise

Choose one feature and answer:

- what makes it testable now
- what would make it hard to test if those controls were missing

## Part 6: Ask for Better Hooks the Right Way

When you need better testability, avoid vague requests like:

- “Can you make this easier to test?”

Ask specifically:

- can this button have a stable accessible name
- can this control expose a unique `data-testid`
- can this state be seeded without UI setup
- can this failure be reproduced through a control API

### Workshop exercise

Write three example requests to developers that improve testability without dictating implementation unnecessarily.

## Part 7: Selector Review Checklist

Before keeping a locator, ask:

- will this survive layout changes
- will this survive text changes
- is it tied to user meaning
- can another tester understand it quickly
- is there a better accessibility-based option

## Part 8: Practice Challenges

1. Refactor a Codegen flow to use better selectors.
2. Identify which locators would break under content-change conditions.
3. Propose one testability improvement for a difficult part of the UI.

## Part 9: Final Takeaway

Good selectors are a test design choice, not a technical afterthought.

Good testability is a product quality attribute.
If you think about both early, your automation gets simpler and more reliable.

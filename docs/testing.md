# Testing Guide

Testbed uses a layered automated testing strategy so the app can evolve without depending only on manual verification.

## Test Layers

Unit tests cover pure logic such as:

- workshop and quiz parsing
- formatting and pricing helpers
- validation helpers
- route registry behavior

Component tests cover shared UI that benefits from DOM-level confidence without a full browser journey, such as:

- markdown rendering
- hidden first-heading behavior for article content

Server integration tests cover HTTP-level behavior, including:

- health endpoint readiness
- route registry integration
- generated Postman behavior

Playwright smoke coverage protects the most important learner-facing website entry flow.

## Commands

- `npm test`
- `npm run test:watch`
- `npm run test:coverage`
- `npm run test:e2e`

## What Each Layer Should Prove

Use the lightest layer that gives convincing evidence.

- if the concern is parsing, formatting, validation, or payload shaping, write a unit test
- if the concern is how shared UI renders or reacts, write a component test
- if the concern is route behavior, auth, or server responses, write a server test
- if the concern is a real learner or shopper journey, write a Playwright test

Avoid using end-to-end tests to prove behavior that is easier to verify directly at the unit or server level.

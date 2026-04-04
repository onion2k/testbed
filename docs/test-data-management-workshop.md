# Test Data Management Workshop

This workshop teaches testers how to think about data as part of test design instead of as a background detail.

It uses Testbed to practise:

- seeded users and products
- runtime reset
- preset-driven state
- repeatable setup for manual and automated tests

## Learning Goals

By the end of this workshop, you should be able to:

- explain why uncontrolled data causes bad tests
- choose the right setup state for a scenario
- reset and reseed the app intentionally
- avoid cross-test contamination

## Part 1: Why Data Matters

Bad data management leads to:

- hidden dependencies
- flaky automation
- false failures
- hard-to-reproduce bugs

In Testbed, useful data controls include:

- seeded users
- runtime reset
- scenario presets
- product visibility and stock controls

## Part 2: Choose Data Intentionally

Before testing, decide:

- which user role you need
- which products must be visible
- whether prior orders should exist
- whether the environment should be baseline or faulted

### Workshop exercise

Design setup for:

- customer happy path
- VIP access test
- empty inventory test
- invalid order test

## Part 3: Reset Strategy

Use reset deliberately:

- `/reset` for browser-local state
- runtime reset for server-side data
- preset apply for known scenario setup

### Workshop exercise

Write a repeatable setup sequence for a Playwright test that must always start clean.

## Part 4: Final Takeaway

Good test data management is one of the foundations of reliable testing.

If state is uncontrolled, your conclusions will be weaker.

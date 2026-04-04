# Accessibility Testing Workshop

This workshop teaches testers how to include accessibility in their testing approach instead of treating it as a separate specialty.

It uses Testbed to practise:

- keyboard testing
- label and role awareness
- accessible locator thinking
- identifying accessibility risks that also affect automation

## Learning Goals

By the end of this workshop, you should be able to:

- explain why accessibility matters in QA
- run basic keyboard and form-label checks
- spot common accessibility issues
- understand how accessibility and testability reinforce each other

## Part 1: Why Accessibility Matters Here

Accessible apps are:

- easier to use
- easier to automate
- easier to reason about

The same things that help assistive technology often help automation too:

- labels
- roles
- meaningful names
- predictable focus

## Part 2: Basic Accessibility Checks

Start with:

- keyboard navigation
- visible focus
- form labels
- meaningful button names
- heading structure

### Workshop exercise

Using only the keyboard:

1. navigate to login
2. complete sign-in
3. navigate shop content
4. move through checkout fields

Record where the experience becomes confusing or blocked.

## Part 3: Accessibility and Automation

Good accessibility often leads to better locators.

Examples:

- `getByRole`
- `getByLabel`

If those are hard to use, it may indicate a testability and accessibility weakness.

## Part 4: Final Takeaway

Accessibility testing belongs inside mainstream QA.

It improves product quality and usually improves automation quality too.

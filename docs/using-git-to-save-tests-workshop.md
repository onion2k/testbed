# Using Git to Save Tests Workshop

This workshop teaches Git in a practical testing context.

It is not trying to turn you into a Git expert. It is trying to help you use version control confidently enough that your test work feels safe, reviewable, and shareable.

## Why Testers Need Git

As soon as you start writing automation, you are creating assets that behave a lot like code:

- Playwright tests
- Postman collections
- helper files
- notes and documentation

Those things need history. They need clear changes. They need a way to be shared with other people. That is what Git gives you.

## Think in Small Pieces of Work

One very helpful habit is to treat each piece of automation work as a small, focused change.

Instead of mixing many unrelated edits together, create a branch for one clear purpose. For example, maybe you are adding a checkout test, improving selectors, or saving API checks for an order failure.

That makes your work easier to review and much easier to understand later.

## Review Before You Save

Before committing, slow down and inspect what changed.

That habit sounds small, but it prevents many problems. It helps you catch unrelated edits, noisy file changes, or missing files before they become part of the history.

For testers moving into automation, this is often one of the most useful Git habits to learn early because it creates a clear connection between “what I intended to change” and “what I actually changed”.

## What This Looks Like in Testbed

In Testbed, a sensible Git workflow might involve creating a branch for one clear change, such as adding a checkout test, improving selectors, or saving Postman checks for an order failure. You make the change, review it, and then commit only what belongs to that task.

That keeps the history easier to understand and makes the automation work feel much more intentional.

## A Simple Example

Suppose you improved a flaky login test.

A healthy sequence would be:

1. create a focused branch
2. update the locator or setup
3. review the diff
4. commit with a message that explains the purpose

This is much easier to understand later than a large commit full of unrelated edits.

## Common Beginner Mistake

A common mistake is to treat Git like a backup button instead of a way to describe meaningful changes.

When commits become vague or overstuffed, the history becomes much less useful. Small, intentional changes are easier to review and easier to trust.

## What Good Looks Like

Good Git usage by testers usually looks calm and tidy. The branch has a clear purpose, the commit message explains the change, and the saved history tells a readable story of how the test work evolved.

## Final Thought

Git is not just for developers.

For testers, it is part of working professionally with automation. It helps you save progress safely, explain your changes clearly, and build a test suite that other people can trust.

## Further Reading

- Git documentation on branching and commits
- Team guidance on commit messages and pull requests
- Practical guides on reviewing diffs before saving changes

# Test Data Management Workshop

This workshop is about understanding that data is part of the test, not just background detail.

If the data is unclear, unstable, or contaminated by previous runs, the result becomes harder to trust. That is true for manual testing and even more true for automation.

## Why Data Problems Cause So Much Confusion

A surprising number of test failures are really data failures.

For example:

- the wrong user is logged in
- an old basket is still present
- a product has been hidden unexpectedly
- a scenario from a previous run is still active

When those things happen, it becomes much harder to tell whether the product is broken, the test is broken, or the setup is simply wrong.

## Use Data Intentionally

Before you test, decide what state you need.

In Testbed, that might mean:

- choosing the right seeded user
- applying a preset
- resetting browser state
- changing product visibility or stock

That deliberate setup work is not wasted effort. It is what makes the later result easier to trust.

## Why This Matters in Automation

Automation is especially sensitive to uncontrolled data because the test runner cannot use human judgement to notice that the environment feels “off”.

If the starting state is wrong, the test may still continue and fail in a confusing place. That is why good data habits are such an important part of learning automation well.

## What This Looks Like in Testbed

In Testbed, data management often means choosing the right seeded user, checking whether browser state should be cleared, and confirming that the runtime preset or break mode matches the scenario you want to test.

That may sound procedural, but it is actually part of the test design. The starting state shapes how trustworthy the result will be.

## A Simple Example

Suppose you want to test the customer checkout flow.

A thoughtful setup would include:

- using the customer user
- applying `baseline`
- clearing any old basket state
- making sure the product you need is visible and in stock

That setup reduces confusion later because the result is easier to interpret.

## Common Beginner Mistake

A common mistake is to treat data as background rather than part of the test.

That often leads to failures that look mysterious but are really caused by leftover state, the wrong account, or the wrong scenario.

## What Good Looks Like

Good data management means the tester can explain the starting state clearly and can recreate it without guesswork. That is a major part of what makes automation dependable.

## Final Thought

Good data management is one of the quiet foundations of reliable testing.

It may not look dramatic, but it makes almost everything else easier to reason about.

## Further Reading

- Team guidance on fixtures, presets, and test isolation if available
- Articles on test data strategy and environment control
- Documentation for any internal reset or seeding tools

# What To Do If a Test Fails Workshop

This workshop is about what happens after the red result appears.

That moment can feel stressful when you are new to automation, especially if you are worried that every failing test means you did something wrong. In practice, a failing test is simply a signal. Your job is to understand that signal properly.

## First, Slow Down

When a test fails, resist the urge to fix it immediately.

A lot of weak automation habits begin at this moment. People add a delay, loosen an assertion, or rerun until the problem disappears. That may get a green result, but it does not build trust.

A better first response is to ask:

- what failed
- where did it fail
- what was the expected behavior
- what evidence do I have

## Gather Evidence Before You Change Anything

Useful evidence might include:

- the failure message
- the last successful step
- a screenshot or trace
- the active preset or break mode
- the related API request or response

Testbed is especially good for this because the tracing tools and runtime controls help you understand what condition the system was in when the failure happened.

## Decide Whether the Product or the Test Is Wrong

This is one of the most important questions in automation.

Sometimes the test is correct and the product is broken.

Sometimes the product is fine and the test has become outdated.

Sometimes the test is weak because the setup is drifting or the selectors are fragile.

You do not need to know the answer instantly, but you should know that this distinction matters.

## Reproduce the Failure Intentionally

Try to reproduce the same failure again under controlled conditions.

If you can make it happen again, your understanding becomes much stronger. If you cannot, that tells you something too. It may be a timing problem, a state problem, or a flaky test rather than a clear regression.

## What This Looks Like in Testbed

Testbed makes this kind of thinking easier because you can use presets, break modes, and request traces to understand the failure more clearly.

If a checkout test fails, for example, you do not have to guess blindly. You can look at the current scenario, inspect the trace, and see whether the browser symptom matches an API failure, a data issue, or a brittle test.

That is one of the most useful ways for a manual tester to start thinking more like an automation engineer without losing their natural testing instincts.

## A Simple Example

Suppose a test expects an order to appear in history, but it does not.

A weak response would be to rerun the test repeatedly and hope the next attempt passes.

A stronger response would be:

1. check the active preset
2. reproduce the flow manually
3. inspect the related request in the trace view
4. decide whether the problem is the UI, the API, or the test logic

This gives you real evidence instead of just another rerun.

## Common Beginner Mistake

One common mistake is to treat every failing test as a test bug.

Sometimes that is true. But sometimes the test has found a genuine problem in the application. If you “fix” the test too quickly, you may hide the issue instead of learning from it.

## What Good Looks Like

Good failure handling means you can explain:

- what failed
- where it failed
- what was expected
- what evidence supports your conclusion
- what should happen next

That is useful whether the answer is “raise a bug” or “repair the automation”.

## Final Thought

When a test fails, your job is not to make the red line disappear as quickly as possible.

Your job is to restore confidence in what the test means. That usually begins with patience, evidence, and clear thinking.

## Further Reading

- Playwright trace viewer and debugging guidance
- Team guidance on triage and defect reporting
- Material on flaky tests versus genuine regressions

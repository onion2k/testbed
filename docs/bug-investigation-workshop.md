# Bug Investigation Workshop

This workshop teaches you how to investigate problems carefully instead of jumping straight to a conclusion.

That matters because finding a bug is only part of the job. A strong tester should also be able to explain what went wrong, when it happens, how often it happens, and what evidence supports the conclusion.

## Why This Skill Matters

A vague bug report sounds like this:

“Checkout is broken.”

That may be true, but it is not very useful. It does not tell the next person what conditions caused the issue, whether it is repeatable, or where the problem might live.

A stronger investigation sounds more like this:

“With the `orders-api-422` scenario active, placing an order returns a `422` response from `POST /api/orders`, and the browser shows the server error message without crashing.”

That is much more useful because it connects the symptom to a condition and to evidence.

## A Simple Investigation Workflow

When something looks wrong, use the same thought process each time:

First, describe the symptom.

Then reproduce it.

Then control the state.

Then inspect the evidence.

Then form a careful conclusion.

This sequence sounds simple, but it prevents a lot of weak testing habits.

## Part 1: Reproduce the Problem on Purpose

Before you start diagnosing, make sure the problem really happens more than once.

Use the desktop app and apply a scenario such as `orders-api-422`. Then carry out the checkout journey as a customer. Repeat the same steps more than once and pay attention to what stays consistent.

Ask yourself:

- does it fail every time
- does it fail at the same point
- is the user-facing message always the same
- does anything else in the app still work

If you cannot reproduce a problem consistently, your first job is to improve the reproduction, not to guess at the cause.

## Part 2: Remove Noise From the Environment

Bug investigation becomes much easier when the environment is controlled.

That is one reason Testbed is useful. You can reset state, apply a preset, and switch on a known failure mode. That removes a lot of uncertainty.

Try comparing the same journey under:

- `baseline`
- a named preset
- a manual fault configuration

The point is to learn what changed and what did not.

## Part 3: Use the Trace View

When you reproduce an issue, open the trace view in the desktop app.

This is where you can connect what you saw in the browser to what happened underneath. If the page shows an error, the trace may reveal whether the API returned a failure, returned malformed data, or was simply slow.

This is a very useful skill for manual testers moving into automation, because it teaches you to think beyond the visible page.

## Part 4: Decide Where the Problem Probably Lives

Once you have the evidence, ask a simple but important question:

Is this mainly a UI problem, an API problem, a data problem, or a setup problem?

Sometimes the browser symptom is only the surface. Sometimes the API is healthy and the UI is presenting it badly. Sometimes the browser is fine and the server is returning the wrong shape.

You do not always need to prove the final root cause yourself, but you should be able to narrow the problem to a useful area.

## Final Thought

A good investigation is calm, repeatable, and evidence-based.

The goal is not just to notice that something failed. The goal is to explain the failure clearly enough that another tester, developer, or automation engineer can trust what you found.

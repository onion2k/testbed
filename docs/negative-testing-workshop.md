# Negative Testing Workshop

This workshop is about testing what happens when things go wrong.

Many new automation testers begin with the happy path because it feels safe and easy to understand. That is a useful starting point, but it is not enough. Real systems fail in many different ways, and strong testers learn to explore those failures deliberately.

## What Negative Testing Really Means

Negative testing is not about being destructive for the sake of it.

It is about asking sensible questions such as:

- what happens if the service is unavailable
- what happens if the data is missing
- what happens if the response shape is wrong
- what happens if the user enters invalid data

Those questions are valuable because they tell you how resilient the system is.

## Why Testbed Helps Here

Testbed is especially useful for negative testing because it lets you trigger known failures in a controlled way. You do not need to hope that something breaks by accident. You can choose a preset or a fault mode and see how the app behaves.

That makes it a very good environment for learning how to test beyond the happy path.

## Part 1: Think in Failure Categories

One useful way to plan negative testing is to think in categories rather than screens.

For example, a failure might be:

- a validation problem
- a service outage
- malformed data
- missing data
- an authorization issue
- a timing issue

If you learn to think in those terms, you become much better at designing meaningful checks.

## Part 2: Decide What Good Failure Handling Looks Like

When the system fails, the tester still needs an expectation.

For example, if order creation fails, the app should not crash or silently lose the basket. If products fail to load, the app should show a useful error or empty state. If login is rejected, the user should understand what happened.

Negative testing is not just “make it fail”. It is “make it fail and see whether it fails well”.

## Part 3: Use Presets and Faults Deliberately

Try working with scenarios like:

- `auth-expired`
- `inventory-empty`
- `orders-api-422`
- `schema-corruption-products`

Do not turn on many things at once. Use one failure condition at a time so you can understand what effect it has.

As you test, ask:

- what changed in the system
- what stayed normal
- what the user can still do
- whether the failure is being handled clearly

## Part 4: Connect UI and API Thinking

One of the best habits you can build here is to connect the browser symptom to the API cause.

If the page shows an error, look at the request trace. If the service returned a malformed response, think about how the UI should present that. If the order API rejects a request, think about what message the browser should show and what should happen to the basket.

This is where manual testing starts to become better automation thinking.

## Final Thought

Happy-path testing tells you whether the system works when conditions are ideal.

Negative testing tells you whether the system stays understandable, safe, and usable when conditions are not ideal.

That is why it matters so much.

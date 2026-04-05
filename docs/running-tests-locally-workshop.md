# Running Tests Locally Workshop

This workshop teaches a very practical habit: before you think about CI, cloud browsers, or team-wide execution, make sure you can run your tests locally in a calm and repeatable way.

That habit sounds basic, but it is one of the strongest foundations in automation.

## Why Local Running Matters

When you run tests locally, you get faster feedback and easier debugging. You can change one thing, rerun quickly, and see what happened. That makes learning much easier, especially if you are moving into automation from a manual background.

If a test does not behave well locally, it is usually not ready for broader use.

## Part 1: Start the App in a Predictable Way

For most local practice, keep the setup simple.

Run:

```bash
npm install
npm run dev
```

If you want the desktop shell as well, start:

```bash
npm run dev:desktop
```

The goal is to remove confusion. You should know what is running, where it is running, and which part of the system you are testing.

## Part 2: Know What You Are Actually Testing

In Testbed, local testing might mean:

- using the browser app
- using the desktop shell
- calling the API directly

Those are related, but they are not the same thing.

A useful habit is to name the target clearly before you run anything. Are you checking a browser journey? An API response? A desktop control? That simple question makes the next steps much clearer.

## Part 3: Keep the Starting State Clean

Local tests are much easier to trust when they begin from a known state.

Use the tools Testbed gives you:

- reset the browser state
- apply a preset
- switch on one break mode at a time
- confirm what scenario is active

This helps you avoid the classic problem of debugging a test that was actually broken by leftover state.

## Part 4: Run Small Before You Run Big

When you are learning or debugging, it is usually better to run one test or one small group of tests than an entire large suite.

That gives you clearer feedback and makes the relationship between cause and effect easier to see.

As your confidence grows, you can widen the scope. But when something is unclear, smaller is usually better.

## What This Looks Like in Testbed

In Testbed, a healthy local workflow usually includes three things: starting the right app mode, choosing a known state, and running only the checks you actually want to learn from.

For example, you might start the browser app, open the desktop shell, apply the `baseline` scenario, and then run a single Playwright test against checkout. Or you might leave the browser aside for a moment and use Postman to check only the orders API. The important point is that you are choosing the scope on purpose.

That is a very useful habit for manual testers moving into automation because it stops the work feeling vague. You always know what you are trying to prove.

## A Simple Example

Imagine you are trying to debug a checkout test locally.

A calm sequence might look like this:

1. start the app
2. open the desktop app
3. confirm the active preset is `baseline`
4. clear browser state if needed
5. run the checkout test only
6. inspect the failure or success

This may sound almost too simple, but that is exactly the point. A reliable local process often feels simple because the confusion has been removed before the test begins.

## Common Beginner Mistake

A very common beginner mistake is to run too much at once.

If you start the app, leave old browser state in place, keep an old preset active, and then run a whole group of tests, the failure becomes much harder to understand. The result feels noisy because the setup is noisy.

The fix is usually not technical. It is about being more deliberate.

## What Good Looks Like

Good local execution feels predictable.

You know what is running. You know which state the app is in. You know which test you are running and why. If the test fails, you have a fair chance of understanding the reason without guessing wildly.

## Final Thought

Running tests locally is not the glamorous part of automation, but it is one of the most important.

It is where you build repeatability, confidence, and the habits that make later automation work much smoother.

## Further Reading

- Playwright documentation on running and debugging tests
- Postman documentation on environments and collections
- Any team guide you have for local setup, reset, or test isolation

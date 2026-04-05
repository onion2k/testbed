# Manual QA to Automation Workshop

This workshop is written for testers who are already comfortable testing manually and want a practical, low-pressure way to begin automating what they do.

If that sounds like you, this is the right place to start.

You do not need to know everything about Playwright, Postman, or frameworks before beginning. What you do need is the willingness to observe carefully, think clearly, and practise turning those observations into repeatable checks.

## What This Workshop Is Trying to Teach

Manual testing and automation are often spoken about as if they are completely different skills. In reality, good automation grows out of good manual testing.

When you test manually, you already do important work:

- you notice what matters in a journey
- you recognise what the user is trying to achieve
- you spot where the system depends on data or timing
- you form expectations about what should happen

Automation takes those same ideas and makes them repeatable.

By the end of this workshop, you should feel more confident about moving from “I can test this by hand” to “I can describe this flow clearly enough to automate it”.

## Getting Ready

Before you begin, make sure the app is running.

Install dependencies:

```bash
npm install
```

Start the browser app:

```bash
npm run dev
```

Start the desktop app in a second terminal:

```bash
npm run dev:desktop
```

If you have Postman installed and Playwright available locally, that will help later in the workshop, but you can still begin without them.

## Understand the Learning Surfaces

Testbed gives you three connected places to learn.

The browser app is the product under test. This is where you log in, browse products, use the basket, move through checkout, and view orders.

The desktop app is the part that helps you control the world around the product. It lets you apply presets, change break modes, inspect traces, and open workshops.

The API is the service layer underneath the browser app. Later on, you will use it to understand what the website depends on and to practise API-level testing.

## Part 1: Begin With Manual Exploration

Before you automate anything, explore the app like a thoughtful manual tester.

```quiz
id: manual-exploration-purpose
question: Why should a tester explore the app manually before recording a first automated flow?
passCondition: all
options:
  - id: understand-behavior
    label: To understand the user journey, assertions, and dependencies before automating it
    correct: true
  - id: avoid-api
    label: To avoid looking at any API behavior until the end of the workshop
    correct: false
  - id: skip-notes
    label: To reduce the need for notes or observations during testing
    correct: false
```

Open the app in your browser and visit the main routes:

- `/`
- `/login`
- `/shop`
- `/checkout`
- `/orders`
- `/vip`
- `/reset`

At this stage, do not worry about writing code. Just observe.

Ask yourself:

- what is the user trying to do here
- what would success look like
- what would clearly count as a failure
- what data seems to drive this page

## Part 2: Use the Seeded Users

Testbed comes with seeded users so you do not have to create test accounts before you can begin.

Use these credentials:

- `customer@example.com` / `password123`
- `vip@example.com` / `password123`
- `admin@example.com` / `password123`

Start with the customer user.

Sign in, add a product to the basket, and walk through checkout. Then open the orders page and confirm that the order appears there. After that, sign out and try the VIP user so you can see how the VIP area behaves.

The purpose of this is not just to “click around”. The purpose is to understand the main journeys well enough that you could later describe them to another tester or turn them into an automated script.

## Part 3: Write Down What You Notice

As you explore, record a few short notes.

Good notes usually mention:

- what the user is doing
- what the page depends on
- what you would want to assert
- what could go wrong

For example:

- “Customer can add a visible product and see it in the basket.”
- “Checkout depends on product data and order creation.”
- “Orders page should show the new order after successful checkout.”

These notes are the bridge between manual QA and automation. They turn vague understanding into something structured enough to automate.

## Part 4: Use the Desktop App to Control Conditions

Now move into the desktop app.

Open the sections for scenarios, faults, and tracing. Spend a few minutes becoming familiar with what each one does.

The most important idea here is that automation gets much easier when the system under test can be placed into a known state. That is why the desktop app matters so much. It gives you a controlled way to create the conditions you want to test.

Try these presets:

- `baseline`
- `inventory-empty`
- `schema-corruption-products`

Apply one preset at a time, then refresh the relevant browser page and observe what changes.

## Part 5: Use Tracing to Understand Cause and Effect

While you interact with the browser app, open the tracing tab in the desktop shell.

Watch which requests happen when you log in, browse products, or place an order. This is a very useful step for anyone moving into automation, because it teaches you that the browser journey is rarely “just a page”. It is usually the visible result of several requests and several pieces of data working together.

When you understand that relationship, your test design improves.

## Part 6: Record a First Flow With Playwright Codegen

Once you understand the flow manually, you are ready to record a first draft.

Use Playwright Codegen to capture a simple journey such as:

- log in
- add a product
- open checkout

Do not expect the generated output to be perfect. That is not the point.

The point is to create a starting draft that you can then review as a tester. Look at the locators it chose. Look at the assertions it did not include. Ask yourself whether the generated test really proves the behavior you care about.

## Part 7: Improve the Draft

Now refine the generated test.

Replace weak locators with stronger ones. Add a meaningful assertion. Remove anything that looks like noise.

A better automated test is usually:

- smaller
- clearer
- more intentional

It should read like a test of behavior, not just a recording of clicks.

## Part 8: Try the Same Thinking at API Level

The next step is to use Postman to inspect the API side of the same journey.

Look at:

- product retrieval
- order creation
- order history

The goal is not to abandon UI testing. The goal is to understand which parts of the flow can also be checked more directly through the API.

That is one of the first big mindset changes in automation: you stop thinking only in terms of screens and start thinking in terms of interfaces and dependencies.

## Final Thought

Moving from manual QA into automation is not about abandoning your existing skills. It is about making those skills more structured, more repeatable, and more scalable.

If you can already explore a system well, you already have the raw material. The rest is practice.

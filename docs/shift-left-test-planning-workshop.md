# Shift-Left Test Planning Workshop

This workshop is about thinking earlier.

Many testers are introduced to automation as if the main job is to write scripts after the feature is already finished. Shift-left thinking asks you to move earlier than that. Instead of waiting for a full UI and then reacting, you start by asking useful questions before execution begins.

This is not a tool-first workshop. It is a thinking workshop.

## What Shift Left Means in Real QA Work

Shift left does not simply mean “automate sooner”.

In practice, it means you start asking questions earlier, spotting risks earlier, and deciding sooner which parts of the system should be tested at which level.

A weak approach often looks like this:

The feature arrives. Someone clicks around. A few happy-path checks are written. Then bugs are discovered late and everyone scrambles.

A stronger approach looks different:

The tester understands the flow before it is complete, identifies important rules, thinks about the API as well as the UI, and asks what would make the feature easy or difficult to test. That is shift-left thinking.

## Use Testbed as the Example Product

Testbed is a useful product for learning this mindset because it has clear user flows and clear dependencies.

The main browser journeys are:

- login
- shop
- basket and checkout
- orders
- VIP access

The supporting technical pieces are:

- auth API
- products API
- orders API
- runtime state
- desktop controls

When you plan well, you stop seeing these as separate things. You start seeing them as parts of one testable system.

## Part 1: Start With the Goal of the Feature

Take checkout as an example.

Before writing test cases, ask:

- who is using this
- what are they trying to achieve
- what would make the feature unacceptable
- what data and services does it depend on

This gives you a much stronger foundation than jumping straight to step-by-step cases.

For checkout, the answers might be:

The user is a shopper who wants to place an order. The feature is unacceptable if the order cannot be placed, if the pricing is wrong, if the confirmation is unclear, or if the order does not appear later in history. The feature depends on product data, basket state, and order creation.

That short description already tells you a lot about what needs coverage.

## Part 2: Identify Risk Before Writing Cases

```quiz
id: risk-before-cases
question: Why is identifying risks before writing detailed test cases a strong shift-left practice?
passCondition: all
options:
  - id: focus
    label: It helps the tester choose the most important coverage before spending effort on detailed steps
    correct: true
  - id: avoid-testing
    label: It removes the need to test the feature later
    correct: false
  - id: delay
    label: It is mainly a way to delay execution until development is finished
    correct: false
```

Ask what matters most.

For checkout, the biggest risks might include:

- wrong prices
- failed order creation
- broken validation
- missing confirmation
- order not appearing in history

Once you can state those risks clearly, your planning becomes more focused and less mechanical.

## Part 3: Decide Which Level Fits Best

One of the most useful shift-left habits is deciding where a check belongs.

Some things are best proved through the UI because the visible user experience matters. Other things are better checked through the API because they are simpler, faster, or closer to the real source of failure.

For example:

- layout and user messages are naturally UI concerns
- response shape and error codes are often better checked at API level
- access rules may need both UI and API thinking

Good planning is not about pushing everything into one tool. It is about choosing the right layer for the right question.

## Part 4: Ask Better Testability Questions

Shift-left testers do not only ask “How will I test this?”

They also ask:

- how can I set this up quickly
- how can I reset it
- how will I know what failed
- what stable data or hooks will I need

Testbed is a good example of why that matters. The desktop app, presets, faults, and traces make testing easier because somebody thought about testability.

That is exactly the kind of thinking you want to practise.

## Part 5: Write a Lightweight Test Approach

Before execution begins, try writing a short test approach instead of a long case list.

For a feature such as checkout, that approach might say:

- cover the happy path through the UI
- cover order creation failures through API-aware negative testing
- verify pricing carefully because it is high business risk
- use preset and fault controls to reproduce failure states

This kind of short planning note is often more useful than a long spreadsheet of shallow cases.

## Final Thought

Shift-left planning makes your testing smarter before it makes it faster.

The real benefit is not that you start earlier for the sake of it. The real benefit is that you spend your effort where it will actually protect the product.

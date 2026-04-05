# Using AI to Generate Tests Workshop

This workshop is about using AI sensibly.

AI can be genuinely helpful when you are moving into automation, especially if you already know what a good test should prove but you are less confident about how to structure the code. It can help you create a first draft, suggest test ideas, and turn notes into something more organised.

At the same time, AI should not be treated as a source of truth.

## Where AI Helps Most

AI is usually most helpful when you already understand the feature and want help turning that understanding into a test draft.

For example, AI can help you:

- outline a Playwright test
- suggest Postman checks
- convert manual notes into structured test steps
- think of negative-path scenarios

That makes it a useful assistant, especially in the early stages of writing automation.

## Where AI Often Goes Wrong

AI can sound confident even when it is wrong.

It may invent selectors, assume flows that do not exist, overcomplicate the test, or add assertions that do not really prove anything.

That is why human review matters so much.

## Use Better Prompts

If you want better output, give better context.

Instead of asking for “a Playwright test for checkout”, give AI something more grounded:

- which route is involved
- which user is acting
- which scenario is active
- what result matters most

The clearer your prompt, the more useful the draft usually becomes.

## Review the Output Like a Tester

When AI gives you a draft, do not ask only whether it “looks technical”.

Ask:

- does it match the real journey
- are the locators believable
- are the assertions meaningful
- does it prove something important

This is where your manual QA experience is still the most valuable part of the process.

## Final Thought

AI can speed up the first draft, but it does not replace testing judgement.

Use it to save time, not to avoid thinking.

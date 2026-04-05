# Accessibility Testing Workshop

This workshop introduces accessibility as part of normal product quality, not as a separate specialty that only a few people need to think about.

That matters for two reasons.

First, accessibility affects real users directly. If someone cannot move through the page with a keyboard, cannot understand a button name, or loses track of focus during a journey, the product is harder to use.

Second, accessibility often overlaps with automation quality. The same things that help users, such as clear labels, meaningful button names, and consistent page structure, also make it easier to build reliable tests.

## Why Accessibility Belongs in Everyday QA

New testers sometimes hear accessibility described as something highly specialised. In reality, there are many basic accessibility checks that fit naturally into ordinary testing work.

For example, when you test a form manually, you can also ask:

- does each field have a clear label
- can I move through the form with the keyboard
- can I tell where focus is
- do the buttons have names that make sense

These are not exotic questions. They are practical quality questions.

## What to Look For in Testbed

Testbed is a good environment for practising accessibility thinking because it already exposes roles, labels, and test IDs in a deliberate way.

That means you can compare what is easy to use manually with what is easy to locate in automation.

A good first pass is to try the main user journeys with only the keyboard:

- open login
- move through the fields
- sign in
- navigate the shop
- move through checkout

As you do that, pay attention to whether the experience still feels understandable without relying on a mouse.

## Accessibility and Automation Support Each Other

One of the most useful lessons here is that poor accessibility often makes poor automation easier to spot.

If a form field has no label, it is harder for a screen reader user and also harder for a Playwright test using `getByLabel`.

If a button has an unclear name, it is harder for a human user and also harder for a test using `getByRole`.

That does not mean accessibility and automation are identical, but it does mean they often improve together.

## A Simple Example

A very approachable accessibility exercise is to use the login page without the mouse.

Move through the page using the keyboard only. Notice whether the focus indicator is visible. Notice whether the field labels are clear and whether the submit action is easy to understand. This one small exercise already teaches a lot about names, focus, and form usability.

## Common Beginner Mistake

A common mistake is to assume accessibility testing only begins when specialist tools or deep standards knowledge are involved.

Those things can become useful later, but a great deal of accessibility awareness starts with simple and practical questions about focus, names, labels, and keyboard movement.

## What Good Looks Like

Good accessibility-aware testing feels like normal thoughtful testing with a wider awareness of how different users move through the page. The tester notices whether the journey remains understandable and usable without relying on a mouse or perfect visual cues.

## Final Thought

Accessibility testing does not need to begin with complexity.

It can begin with thoughtful habits:

- check focus
- check labels
- check names
- check keyboard movement

Those simple checks often reveal problems that matter to users and help you become a better automation tester at the same time.

## Further Reading

- WCAG quick reference
- WAI-ARIA Authoring Practices
- Playwright guidance on role- and label-based locators

# Using Playwright Workshop

This workshop introduces Playwright in a practical way for testers who already understand user journeys and now want to automate them.

The aim here is not to make Playwright feel mysterious. It is simply a tool for telling the browser what to do and checking what happened.

## What Playwright Is Good At

Playwright is useful when you want to automate browser behavior such as:

- logging in
- opening a page
- filling in a form
- clicking through a journey
- checking what the user sees

That makes it a good fit for many of the main Testbed flows, especially login, basket, checkout, and orders.

## Think in Terms of User Behavior

One of the easiest mistakes to make in browser automation is to think only in terms of clicks and selectors.

A better habit is to think in terms of the user journey.

For example:

The customer signs in.

The customer adds a product to the basket.

The customer moves through checkout.

The customer sees the order in history.

Those are meaningful behaviors. Playwright is simply the tool you use to express them.

This is an important mental shift for manual testers. You are not abandoning your testing thinking. You are giving it a repeatable form.

## Use Strong Locators and Meaningful Assertions

The two biggest early skills in Playwright are:

- choosing good locators
- writing assertions that prove something useful

In Testbed, strong starting points are usually roles, labels, and stable `data-testid` values. And a strong assertion should prove something the user or business would care about, such as a visible subtotal, an error message, or an order in history.

## What This Looks Like in Testbed

In Testbed, a very reasonable first Playwright exercise is a customer login followed by a basket or checkout check. That is a strong learning flow because it includes navigation, interaction, and a result that is easy to understand.

It also mirrors what a manual tester already does. You are simply writing those steps in a form that the browser can repeat.

## A Simple Example

A good beginner flow might be:

1. open the login page
2. sign in as the customer user
3. add a product to the basket
4. open checkout
5. confirm the subtotal is shown

This is a good first example because it stays close to a real user journey while still being small enough to reason about clearly.

## Common Beginner Mistake

One common mistake is to treat Playwright like a recording tool instead of a testing tool.

That often leads to long scripts with many clicks but very little real proof. The test “does things”, but it does not clearly prove the behavior you actually care about.

## What Good Looks Like

Good beginner Playwright tests are usually:

- short
- readable
- tied to a real user goal
- supported by clear setup
- strengthened by one or two meaningful assertions

## Final Thought

Playwright becomes much easier to learn once you stop treating it as a bag of commands and start treating it as a way to describe a user journey clearly.

If you already know how to think like a tester, you already have the hardest part.

## Further Reading

- Playwright getting started guide
- Playwright locator and assertions documentation
- Team examples of simple, readable Playwright tests if available

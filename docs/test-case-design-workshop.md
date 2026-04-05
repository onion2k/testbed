# Test Case Design Workshop

This workshop is about turning a feature into a smaller set of stronger test ideas.

Many testers begin by trying to be thorough through volume. They write a long list of cases because that feels safe. The problem is that a long list can still be weak if it repeats the same idea many times without teaching you anything new.

Strong test case design is not mainly about quantity. It is about choosing cases that cover meaningfully different behavior.

## Start With the Rule, Not the Screen

A screen is only the visible surface of the feature.

Under that screen are rules.

For example, a login page is not just a form with two boxes. It is also a set of rules about:

- valid input
- invalid input
- missing input
- incorrect credentials
- successful session creation

When you identify the rules first, the cases become clearer and less repetitive.

## Why This Helps With Automation

This way of thinking becomes even more valuable when you automate, because automated suites become hard to maintain if they contain many similar checks that all prove the same rule.

A smaller number of thoughtful tests is often more powerful than a large number of repetitive ones.

## Use Simple Design Techniques

Even without formal language, you can start asking helpful questions such as:

- what are the clearly different kinds of input
- where are the boundaries
- what states can the feature move between
- which combinations actually change the behavior

Those questions naturally lead you toward stronger cases.

## What This Looks Like in Testbed

In Testbed, you can practise this by taking a simple feature such as login or checkout and asking what really needs to be proved. Instead of writing many similar cases, try grouping the behavior into categories that are meaningfully different.

That is the habit you want to build. You are not trying to write “more cases”. You are trying to write better cases.

## A Simple Example

Take the login feature.

Rather than listing dozens of tiny variations, you might identify a smaller set of important ideas:

- valid credentials
- missing username
- invalid email format
- missing password
- valid format but incorrect credentials

That is a much stronger starting point than repeating the same invalid idea in many slightly different forms.

## Common Beginner Mistake

A common mistake is to confuse long case lists with strong coverage.

Length can feel reassuring, but if many of the cases all prove the same rule, the extra volume is often not helping very much.

## What Good Looks Like

Good test case design usually feels deliberate. Each case exists because it covers a different rule, risk, boundary, or state. If you remove one of those cases, you lose something meaningful.

## Final Thought

Good test case design helps you spend your effort well.

It makes manual testing sharper and automation more meaningful, because each case exists to teach you something different about the feature.

## Further Reading

- Material on equivalence partitioning and boundary value analysis
- Team examples of strong test cases, if available
- Notes on translating manual test cases into automation candidates

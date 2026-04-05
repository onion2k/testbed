# What Is CI/CD Workshop

This workshop explains CI/CD in tester-friendly terms.

If those initials have ever sounded abstract or “developer-only”, this workshop is meant to make them easier to understand.

## What CI/CD Means for Testers

Continuous Integration and Continuous Delivery are really about building a repeatable path from change to confidence.

For testers, the most important idea is simple:

automated checks can run regularly and earlier, instead of only at the very end.

That changes how testing fits into delivery, because feedback becomes more continuous and more visible.

## Why This Matters

When tests run as part of a pipeline, issues can be found sooner. That means teams learn earlier when a change has created a problem.

This is one of the reasons automation matters so much. It gives teams a way to learn about quality continuously rather than only at release time.

## Where Testers Fit

Testers bring important judgement to CI/CD because not every test belongs in the same place.

Some checks should run quickly and often. Others are better suited to deeper stages or less frequent runs. Thinking about that is part of modern testing strategy, not just a delivery detail.

## What This Looks Like in Testbed

In a product like Testbed, different checks naturally fit different layers. A quick login smoke test may be a good candidate for frequent execution. A slower or more exploratory end-to-end flow may make more sense later in the pipeline or on a different schedule.

This is where testers add real value: not by saying “run everything everywhere”, but by helping the team choose the right confidence at the right time.

## A Simple Example

Imagine a team has:

- a fast login check
- a checkout happy path
- deeper negative-path coverage

It may make sense for the first check or two to run often, while the deeper tests run later or less frequently. That is not because the deeper tests are unimportant. It is because the feedback loop and the purpose are different.

## Common Beginner Mistake

One common mistake is to assume that every automated test should run in the earliest possible part of the pipeline.

That often makes feedback slower and noisier. A better habit is to ask what the test is really for and where it creates the most value.

## What Good Looks Like

Good CI/CD thinking means the tester can explain why a certain kind of check belongs where it does. The focus is not just on execution, but on useful and timely confidence.

## Final Thought

CI/CD is not just a delivery topic. It is also a testing topic, because it shapes when and how your automated checks create value.

## Further Reading

- Introductory CI/CD guides
- Internal team pipeline documentation if available
- Articles on pipeline staging and fast feedback

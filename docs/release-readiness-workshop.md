# Release Readiness Workshop

This workshop teaches testers how to decide whether the team has enough confidence to release.

It uses Testbed to practise:

- summarising coverage
- identifying remaining risk
- distinguishing blockers from known limitations
- making a release recommendation clearly

## Learning Goals

By the end of this workshop, you should be able to:

- summarise testing performed
- explain what risks remain
- identify what should block release
- communicate a release recommendation clearly

## Part 1: What Release Readiness Means

Release readiness is not:

- “all tests passed”

It is:

- enough confidence for the current level of risk

That means you should consider:

- feature coverage
- critical-path results
- unresolved high-severity defects
- residual risk
- known gaps

## Part 2: Use a Readiness Summary

Write a release summary with:

- what was tested
- what passed
- what failed
- what remains untested
- what risks remain
- recommendation

### Workshop exercise

Create a readiness summary for Testbed after testing:

- login
- checkout
- orders
- one negative scenario

## Part 3: Blockers vs Residual Risk

Not every issue should block release.

Examples of likely blockers:

- cannot complete checkout
- wrong total
- access control broken

Examples of possible residual risk:

- low-impact wording issue
- minor cosmetic inconsistency

### Workshop exercise

Sort findings into:

- release blocker
- acceptable risk
- follow-up item

## Part 4: Final Takeaway

Release readiness is a judgement backed by evidence.

A strong tester can explain:

- what was validated
- what is still risky
- whether release is advisable
- why

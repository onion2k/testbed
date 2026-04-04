# Risk-Based Testing Workshop

This workshop teaches testers how to prioritize testing based on impact and likelihood instead of treating every area as equally important.

It uses Testbed to practise:

- identifying business and technical risks
- ranking features by importance
- deciding where deeper testing effort belongs

## Learning Goals

By the end of this workshop, you should be able to:

- explain what risk-based testing is
- identify impact and likelihood for a feature
- rank areas by testing priority
- justify coverage decisions clearly

## Part 1: What Risk Means

In testing, risk is usually a combination of:

- impact if something fails
- likelihood of failure

High-impact examples in Testbed:

- wrong checkout total
- order not created
- access control failure

Lower-impact examples:

- minor content wording changes
- non-critical styling differences

## Part 2: Score Risks

Use a simple scale:

- impact: low, medium, high
- likelihood: low, medium, high

Then combine them into a priority.

### Workshop exercise

Score these areas:

- login
- shop
- checkout
- orders
- VIP access
- admin tooling

Explain why each received its score.

## Part 3: Translate Risk into Coverage

Higher-risk areas deserve:

- earlier testing
- deeper testing
- more stable automation
- stronger negative-path coverage

Lower-risk areas may deserve:

- lighter regression
- exploratory testing
- visual review only

### Workshop exercise

For each high-risk area, choose:

- one UI check
- one API check
- one negative scenario

## Part 4: Use Scenarios to Explore Risk

Presets and faults help you test risk directly.

Examples:

- `orders-api-422` for checkout resilience
- `auth-expired` for access risk
- `schema-corruption-products` for catalog resilience

### Workshop exercise

Pick one high-risk area and choose which scenario best exposes its weakness.

## Part 5: Communicate Risk Clearly

Risk-based testers should be able to explain:

- what matters most
- what was tested deeply
- what was tested lightly
- what remains as residual risk

### Example summary

- checkout tested deeply due to financial and business impact
- product content variations tested lightly because impact is lower
- malformed payload handling covered because backend contract failures would affect multiple journeys

## Part 6: Practice Challenges

1. Build a risk-ranked feature list for Testbed.
2. Design a high-risk regression pack.
3. Explain what you would not prioritise and why.

## Part 7: Final Takeaway

Risk-based testing is about using effort deliberately.

Not every feature deserves the same level of attention.
Strong testers can explain where they spent effort and why.

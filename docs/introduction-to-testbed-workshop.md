# Introduction to Testbed

This workshop is the starting point for anyone opening Testbed for the first time.

It explains:

- what Testbed is for
- how the browser app, desktop app, and APIs fit together
- how workshops are meant to be used
- how to move from learning to practice

## What Testbed Is

Testbed is a practice environment for testers.

It is designed to help manual QA testers learn automation and stronger testing habits by giving them:

- a website to test
- APIs to inspect directly
- a desktop admin shell to control state and failures
- guided workshops inside the desktop app

You are not here to test the workshop system itself.
You are here to use Testbed as a place to learn testing.

## The Three Main Surfaces

Testbed has three main surfaces:

1. Browser app
   This is the product under test.
2. Desktop app
   This is the control panel for scenarios, faults, traces, and workshops.
3. Local API
   This is the service layer you can inspect with Postman and automation.

The browser app is where user journeys happen.
The desktop app helps you create known conditions for those journeys.
The API helps you test behavior more directly and earlier.

## What You Can Practise

Inside Testbed, you can practise:

- manual exploratory testing
- test case design
- risk-based planning
- Playwright end-to-end automation
- Postman API testing
- shift-left thinking
- bug investigation
- negative testing
- regression strategy

The workshops are there to guide that progression.

## How To Use The Workshops

The workshop library is intended to be used in order when you are new.

A sensible path is:

1. Introduction to Testbed
2. Manual QA to Automation Workshop
3. Shift-Left Test Planning Workshop
4. Bug Investigation Workshop
5. Negative Testing Workshop

After that, move into the more specialized workshops based on what you want to learn next.

## How Progress Works

Workshop progress is tracked locally in the desktop app.

That includes:

- which workshop you last opened
- which section you last viewed
- which sections you have read
- which quiz gates you have passed

If you clear workshop progress in the `Data Folder` tab, you restart the workshop journey from the beginning.

## Suggested First Practice Session

For your first session:

1. Open the browser app.
2. Log in as the customer user.
3. Browse the shop.
4. Add one product to the basket.
5. Open the desktop app.
6. Find the `Scenarios & Faults` tab.
7. Apply `baseline`.
8. Open the `Tracing` tab and inspect requests after browsing again.

This gives you a quick understanding of what the environment can do.

## What Good Learning Looks Like

Use Testbed well by doing this:

- read the workshop section
- perform the related action in the app
- inspect what happened
- connect UI behavior to API behavior
- capture what you learned

Do not rush through the workshops as if they are just text.
They are most useful when you actively test alongside them.

## Where To Go Next

After this introduction, the best next workshop is:

- Manual QA to Automation Workshop

That workshop starts with exploratory testing and then moves into Playwright Codegen and Postman.

```quiz
id: testbed-starting-point
question: What is the best first workshop to take after this introduction if you want to move from manual QA into automation?
passCondition: all
options:
  - id: manual-to-automation
    label: Manual QA to Automation Workshop
    correct: true
  - id: release-readiness
    label: Release Readiness Workshop
    correct: false
  - id: regression-strategy
    label: Regression Strategy Workshop
    correct: false
```

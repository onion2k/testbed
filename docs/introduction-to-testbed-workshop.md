# Introduction to Testbed

Welcome to Testbed.

This workshop is the best place to begin if you are opening the app for the first time and you want to understand what it is for.

Testbed is not just a website. It is a practice environment designed to help manual QA testers move into automation step by step. It gives you a product to test, a desktop app to control the state of that product, and a local API that you can inspect directly. That combination makes it a safe place to practise skills that are often difficult to learn on a real production system.

## What You Are Looking At

When people first open Testbed, they sometimes wonder which part is the “real app”. The answer is simple:

The browser app is the thing you test.

The desktop app is the control panel you use to make testing easier. It lets you change data, apply known scenarios, inject failures, and read the workshops.

The API is the service layer underneath the browser app. It gives you another way to understand what is happening and another place to write checks.

That means Testbed helps you practise three connected ways of thinking:

- user-focused testing through the website
- system-focused testing through the API
- controlled setup through the desktop shell

## Why This Matters for Manual Testers

If you are coming from a manual QA background, you already have useful instincts. You know how to explore a flow, notice odd behavior, compare expected and actual results, and describe issues clearly. Automation does not replace those skills. It builds on them.

The goal of these workshops is not to turn you into a framework specialist overnight. The goal is to help you become more confident in turning good testing ideas into repeatable checks.

That is why Testbed exists.

## How to Use Testbed Well

The most effective way to use Testbed is to stay curious and work in small steps.

Read a workshop section, then try the related action in the app. If the workshop mentions login, log in. If it mentions a preset, apply it. If it talks about a failing API, open the trace view and look at the request. The more you connect the written guidance to something real in the app, the more useful the learning becomes.

Treat Testbed like a lab, not like a book.

## A Suggested First Session

For your first session, keep it simple.

Open the browser app and sign in as the customer user. Browse the shop, add one item to the basket, and open the checkout journey. Then open the desktop app and look at the workshop list, the scenarios, and the tracing tab. You do not need to understand everything immediately. The point is to get comfortable with the shape of the environment.

By the end of that short session, you should understand:

- where the user journeys live
- where the test controls live
- how the browser behavior and API behavior connect

## How Workshop Progress Works

The workshop reader remembers where you were. That means the app can reopen your last workshop and your last section. It also tracks which sections you have already read and, where used, which quiz gates you have passed.

This is there to support steady learning rather than speed-reading.

If you ever want to start again from the beginning, you can clear workshop progress from the desktop app.

## Your Best Next Step

After this introduction, the best next workshop is `Manual QA to Automation`.

That workshop starts from familiar manual testing behavior and gradually introduces automation ideas. It is the right place to begin if you are comfortable finding bugs manually but want help turning that skill into repeatable Playwright and Postman work.

```quiz
id: intro-next-step
question: What is the main purpose of Testbed for a manual QA tester?
passCondition: all
options:
  - id: practice-automation
    label: To practise moving from manual testing into more structured automation and API testing
    correct: true
  - id: replace-thinking
    label: To replace testing judgement with prewritten scripts
    correct: false
  - id: desktop-only
    label: To teach only how to use the desktop admin shell
    correct: false
```

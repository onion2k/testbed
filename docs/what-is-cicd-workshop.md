# What is CICD Workshop

This workshop explains the place of automated testing inside a wider delivery pipeline without assuming deep release-engineering experience. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of what continuous integration and continuous delivery mean in practice, and why automated checks gain value when they are part of a repeatable pipeline. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

What continuous integration and continuous delivery mean in practice, and why automated checks gain value when they are part of a repeatable pipeline matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore imagining how the same local tests you practise in Testbed would later run automatically after a change is pushed and reviewed. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: cicd-feedback-check
question: What is a useful way to think about CI/CD?
passCondition: all
options:
  - id: option-1
    label: As a feedback system that runs trusted checks early and repeatedly
    correct: true
  - id: option-2
    label: As a magical process that improves weak tests automatically
    correct: false
  - id: option-3
    label: As something testers do not need to understand
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine taking one stable local Playwright test and asking what it would need before a team could trust it inside a pipeline. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

Continuous integration and continuous delivery are easiest to understand when you think about them as feedback systems. A change is made, the system builds and tests it, and the team learns something quickly enough to act while the change is still fresh. The pipeline is therefore not just a place where automation lives. It is part of the quality conversation of the team. Fast, trustworthy feedback helps teams change the product more confidently. Slow or noisy feedback does the opposite.

For testers, the key lesson is that pipelines magnify both strengths and weaknesses. A strong local test becomes even more useful when it runs automatically on every change. A weak or flaky test becomes even more damaging when it slows or confuses the whole team. That is why CI/CD should be understood as part of test design, not as an afterthought applied only at the end.

## How To Practise This Well

A good exercise is to imagine what a local Testbed check would need before a team could trust it in shared execution. Does it have stable setup? Does it run quickly enough? Does it fail with useful output? Does it avoid environmental dependence? These questions help you connect individual test craft to the wider delivery system.

When you think this way, CI/CD becomes less mysterious. It is simply the place where good test design earns wider impact. The pipeline is only as helpful as the checks it contains.

```quiz
id: cicd-practice-check
question: Before putting a test into CI, what should you ask?
passCondition: all
options:
  - id: option-1
    label: Is the test stable, fast enough, and clear when it fails?
    correct: true
  - id: option-2
    label: Can I make the pipeline hide the failure output?
    correct: false
  - id: option-3
    label: Is local execution no longer necessary?
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is treating CI/CD as a magical system that will somehow improve weak tests instead of as a force multiplier for tests that are already worth running. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like seeing the pipeline as a structured place where fast feedback, stable environments, and useful reporting come together. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that what continuous integration and continuous delivery mean in practice, and why automated checks gain value when they are part of a repeatable pipeline is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with introductory CI/CD guides, your team’s pipeline documentation, and writing on keeping automated suites fast and trustworthy in shared execution. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: cicd-final-check
question: What does a healthy pipeline amplify?
passCondition: all
options:
  - id: option-1
    label: The value of already well-designed tests
    correct: true
  - id: option-2
    label: The usefulness of brittle and noisy suites
    correct: false
  - id: option-3
    label: The need to avoid local learning
    correct: false
```

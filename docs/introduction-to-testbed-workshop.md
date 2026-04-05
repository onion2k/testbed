# Introduction to Testbed

This opening workshop is about understanding the shape of the environment before you try to learn tools inside it. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of what Testbed is for and how the browser app, desktop shell, and API fit together. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

What Testbed is for and how the browser app, desktop shell, and API fit together matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore starting with the browser shop, then moving to the desktop shell to change state, and finally watching the API traces that explain what the browser just did. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: intro-surfaces-check
question: Which description best matches how Testbed is meant to be used?
passCondition: all
options:
  - id: option-1
    label: The browser, desktop app, and API should be understood as connected parts of one learning environment
    correct: true
  - id: option-2
    label: The browser app is the only part that matters for learning
    correct: false
  - id: option-3
    label: The desktop app exists mainly as decoration around the website
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine signing in as a customer, browsing products, opening the desktop shell, applying the baseline preset, and then watching the same journey appear as requests in the trace viewer. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

A useful way to think about Testbed is as a deliberately compressed version of the kinds of systems testers work with every day. The browser app gives you a customer-facing journey with state, navigation, and visible outcomes. The desktop shell gives you administrative control over the environment so you can restart, reconfigure, and inspect what would normally be hidden. The API exposes the service layer that the browser depends on. When you understand those three surfaces together, you stop treating a failure as only a screen problem. You begin to ask whether the visible symptom started with missing data, a slow response, a broken rule, or a client assumption that no longer matches reality.

That is why the early workshops keep returning to the relationship between journey, setup, and evidence. If a product list is empty, that may be a valid state, a data problem, or an API failure. If checkout totals look wrong, you may need to compare the screen with the returned order data. If a workshop asks you to use a preset, that is not a side task. It is teaching you that test setup is part of the work. Good automation almost always depends on controlling state deliberately rather than hoping the right state happens to exist when a script begins.

## How To Practise This Well

To practise this workshop well, avoid racing through every tab in one sitting. Instead, choose one tiny journey and view it through all three lenses. Start in the browser and note what the user sees. Then open the desktop shell and identify what you could change that would alter that experience. Finally, inspect the trace or the API response that explains the behavior you just observed. The goal is to feel the connection between the surfaces rather than to memorize every feature immediately.

You will know this introduction has done its job when later workshops feel less like separate topics and more like different ways of interrogating the same system. Playwright will feel like a way of expressing browser expectations. Postman will feel like a way of speaking to the service layer directly. Break modes will feel like controlled experiments. That mindset is the real starting point for the rest of the course.

```quiz
id: intro-practice-check
question: What is the best way to work through the Introduction to Testbed workshop?
passCondition: all
options:
  - id: option-1
    label: Read a section, try something in the app, then come back with a concrete question
    correct: true
  - id: option-2
    label: Memorize every control before touching the product
    correct: false
  - id: option-3
    label: Skip the app and treat the workshop as pure reference material
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is treating Testbed like a toy storefront instead of a controlled learning environment. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like moving calmly between the browser, the desktop shell, and the API evidence until the three surfaces feel like one connected system. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that what Testbed is for and how the browser app, desktop shell, and API fit together is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with the Playwright getting started guide, the Postman learning center, and any internal test strategy notes your own team already uses. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: intro-final-check
question: What is the main purpose of Testbed for a manual QA tester?
passCondition: all
options:
  - id: option-1
    label: To practise moving from manual testing into more structured automation and API testing
    correct: true
  - id: option-2
    label: To replace testing judgement with prewritten scripts
    correct: false
  - id: option-3
    label: To teach only how to use the desktop admin shell
    correct: false
```

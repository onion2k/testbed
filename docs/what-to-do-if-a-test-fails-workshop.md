# What to Do If a Test Fails Workshop

This workshop teaches a disciplined response to red tests so that failure becomes information instead of panic. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of how to inspect a failure, separate product issues from test issues, gather useful context, and choose the next action responsibly. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

How to inspect a failure, separate product issues from test issues, gather useful context, and choose the next action responsibly matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore using known break modes and traces to practise the thought process that should happen when a test starts failing unexpectedly. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: testfails-calm-check
question: What is the best first response to a failing test?
passCondition: all
options:
  - id: option-1
    label: Slow down enough to decide what class of problem you are looking at
    correct: true
  - id: option-2
    label: Rerun it repeatedly until it turns green
    correct: false
  - id: option-3
    label: Edit the test immediately without reviewing evidence
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine seeing a checkout assertion fail, confirming the setup, checking the trace, and deciding whether the product changed or the test has drifted. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

A failing test creates pressure because it interrupts momentum and suggests uncertainty. The healthiest response is to slow down just enough to understand what class of problem you are looking at. Is the environment wrong, the product broken, the expectation outdated, or the test itself weak? Those categories matter because each one leads to a different next action. The worst habit is to rerun blindly until the red result disappears or to patch the test before knowing which of those categories applies.

Testbed gives you a good practice ground for this because you can trigger known failures and compare them with healthy baseline behavior. That means you can rehearse the investigative thought process under lower pressure. The goal is to build a calm response pattern so that later, in a real team environment, a failing test feels like a solvable question rather than a personal threat.

## How To Practise This Well

A useful routine is to gather the same core evidence every time. Confirm the setup, confirm the exact assertion that failed, inspect any relevant trace or API response, and ask whether the product behavior still matches the original intent of the test. By repeating this method you reduce panic and improve the quality of your decisions.

You are getting better at this skill when a failed test makes you curious before it makes you reactive. Curiosity leads to diagnosis. Reactivity usually leads to churn.

Remember that some failures are setup or authorization problems rather than product regressions. If an API check suddenly starts returning `401`, the first question should not be, 'what has broken in the feature?' It may be, 'did this request need a token, and did the token change or disappear?' In Testbed, that is now especially relevant for admin routes in Postman. Treating auth failures as a distinct category will save you a lot of wasted debugging time.

```quiz
id: testfails-practice-check
question: Which evidence should a tester gather after a failure?
passCondition: all
options:
  - id: option-1
    label: The setup, the exact failed assertion, and any relevant trace or API context
    correct: true
  - id: option-2
    label: Only a rough memory of what happened
    correct: false
  - id: option-3
    label: Nothing until the test fails three more times
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is reacting emotionally to a failure by rerunning it repeatedly or patching it before understanding what the failure means. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like working through a repeatable checklist of setup, evidence, expectation, and likely ownership before touching the test code. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that how to inspect a failure, separate product issues from test issues, gather useful context, and choose the next action responsibly is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with test triage guides, Playwright debugging tools, and internal incident or defect-response practices if your team already has them. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: testfails-final-check
question: What does healthy failure handling build over time?
passCondition: all
options:
  - id: option-1
    label: A calm diagnostic habit that turns red tests into useful information
    correct: true
  - id: option-2
    label: A fear of changing tests or setups
    correct: false
  - id: option-3
    label: A preference for ignoring intermittent failures
    correct: false
```

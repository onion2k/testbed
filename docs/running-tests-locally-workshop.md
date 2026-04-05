# Running Tests Locally Workshop

This workshop helps new automation engineers feel comfortable with the ordinary everyday act of running tests on their own machine. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of how local execution supports learning, debugging, confidence, and rapid feedback before anything reaches a shared pipeline. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

How local execution supports learning, debugging, confidence, and rapid feedback before anything reaches a shared pipeline matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore starting the app, running a small Playwright flow locally, and using the immediate feedback loop to understand both the product and the test. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: local-feedback-check
question: Why is local execution so valuable for learners?
passCondition: all
options:
  - id: option-1
    label: It gives fast feedback while setup, behavior, and failures are still easy to inspect
    correct: true
  - id: option-2
    label: It is less useful than CI for understanding a new test
    correct: false
  - id: option-3
    label: It mainly exists to avoid reading test output
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine running one checkout test, watching it pass or fail, and then changing the setup to see how controlled state affects the result. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

Running tests locally is one of the fastest ways to build intuition because the feedback loop is immediate. You can change the setup, rerun a single check, inspect the failure, and try again within minutes. That pace is perfect for learning. Many new testers underestimate it because shared pipelines feel more official. In reality, most useful understanding begins before a change is ever pushed. Local execution is where you discover whether the test is readable, whether the environment is controlled enough, and whether the result tells a sensible story.

Testbed is designed to reward this habit. You can open the app, apply a scenario, run a targeted test, and see exactly how the browser, API, and stored state interact. That makes local work feel purposeful rather than like a prelude to the 'real' run. By the time you send a test to CI, you ideally already know what it proves and what kind of failure output it produces.

## How To Practise This Well

A strong local routine is to begin with the smallest useful run. Do not launch an entire suite just because you can. Start one test or one collection that exercises a specific behavior. Observe the result, then change one thing at a time. This teaches you far more than firing off a large run and hoping the output is easy to interpret.

The better you get at local execution, the more confident you become at debugging and refining automation. A local red result is not an interruption. It is an opportunity to understand the product and the test more deeply while the feedback is still fresh.

```quiz
id: local-practice-check
question: What is a strong local testing habit?
passCondition: all
options:
  - id: option-1
    label: Run the smallest useful check first and change one thing at a time
    correct: true
  - id: option-2
    label: Always launch the entire suite before understanding one test
    correct: false
  - id: option-3
    label: Avoid rerunning tests after changing setup
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is thinking local execution is a second-class step compared with CI, when in practice it is often the fastest place to learn and debug. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like using local runs to build understanding first and then promoting stable checks into wider shared execution. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that how local execution supports learning, debugging, confidence, and rapid feedback before anything reaches a shared pipeline is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with Playwright CLI documentation, terminal basics, and any internal setup guides your team already maintains for local development and test runs. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: local-final-check
question: What does good local execution help you build?
passCondition: all
options:
  - id: option-1
    label: Confidence in the product, the test, and the debugging process before CI runs
    correct: true
  - id: option-2
    label: A habit of ignoring shared pipelines
    correct: false
  - id: option-3
    label: A reason to avoid controlled setup
    correct: false
```

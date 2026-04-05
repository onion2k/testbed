# Exploratory Testing to Automation Workshop

This workshop shows how notes from exploration can become repeatable checks instead of disappearing after the session ends. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of how to capture useful observations during exploration and turn the best ones into automated coverage without losing the original testing intent. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

How to capture useful observations during exploration and turn the best ones into automated coverage without losing the original testing intent matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore exploring the shop, checkout, and break modes manually first and then choosing which discoveries deserve Playwright or Postman coverage. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: explore-value-check
question: What is the main relationship between exploratory testing and automation?
passCondition: all
options:
  - id: option-1
    label: Exploration finds valuable ideas and automation preserves the best of them
    correct: true
  - id: option-2
    label: Exploration should stop once automation starts
    correct: false
  - id: option-3
    label: Automation should replay the whole exploratory session exactly
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine finding that subtotal calculations deserve repeated checking and then turning that insight into a focused automated assertion rather than automating every click from the session. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

Exploratory testing and automation are sometimes presented as opposites, but they are much more useful when treated as partners. Exploration helps you discover where the product is surprising, fragile, or unclear. Automation helps you preserve the most valuable discoveries. The skill is learning what to carry over. Not every interesting observation should become a script. Some findings are best kept as future exploratory ideas. Others reveal a rule or risk that deserves a stable repeated check.

Testbed is a good training ground for this because the same journey can be explored, broken, and reset quickly. You can walk through a flow manually, notice that a total changes in an unexpected way, and then ask whether that should become a Playwright assertion, a Postman check, or a note for future investigation. That decision is one of the most important judgement calls in modern testing.

## How To Practise This Well

A simple discipline is to finish each exploratory session by asking which three observations were most valuable. For each one, decide whether it should remain exploratory, become an automated check, or lead to a bug report. This stops valuable learning from disappearing into vague memory. It also prevents the opposite mistake of trying to automate everything, including the wandering that made exploration useful in the first place.

The strongest outcome is usually a small number of automation ideas with clear reasons behind them. If you can say, 'this deserves automation because it is business critical, easy to set up, and likely to regress,' you are already thinking like an automation engineer without abandoning the exploratory mindset.

```quiz
id: explore-practice-check
question: How should you review an exploratory session before automating?
passCondition: all
options:
  - id: option-1
    label: Pick the observations that are important enough to become repeatable checks
    correct: true
  - id: option-2
    label: Automate every action you took, including dead ends
    correct: false
  - id: option-3
    label: Ignore your notes and start from scratch
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is trying to automate the entire exploratory session exactly as it happened, including the wandering and the dead ends. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like distilling exploration into a small set of high-value repeatable checks while keeping further exploration open for future sessions. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that how to capture useful observations during exploration and turn the best ones into automated coverage without losing the original testing intent is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with writing on exploratory charters, session notes, and examples of how experienced testers decide what should remain exploratory and what should become automated. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: explore-final-check
question: What is a good outcome from exploratory testing in Testbed?
passCondition: all
options:
  - id: option-1
    label: A small number of high-value automation ideas with clear reasons behind them
    correct: true
  - id: option-2
    label: A very long script that copies every click from the session
    correct: false
  - id: option-3
    label: No follow-up because exploration and automation are unrelated
    correct: false
```

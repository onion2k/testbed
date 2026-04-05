# Using AI to Generate Tests Workshop

This workshop shows how AI can speed up test creation without replacing the tester’s judgement about what a good test should do. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of how to use AI for drafts, variations, and refactoring prompts while still reviewing the result like a responsible tester. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

How to use AI for drafts, variations, and refactoring prompts while still reviewing the result like a responsible tester matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore using a known product surface and break modes to ask for test ideas or first drafts, then checking whether the generated test matches the real risks. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: ai-role-check
question: What is the healthiest role for AI in test generation?
passCondition: all
options:
  - id: option-1
    label: A fast collaborator that drafts ideas while the tester still judges quality
    correct: true
  - id: option-2
    label: A replacement for product understanding and review
    correct: false
  - id: option-3
    label: A way to skip learning selectors and assertions entirely
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine asking AI for a Playwright draft of a checkout test and then improving the assertions, setup, and selectors before trusting it. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

AI is most useful in testing when it accelerates thinking that is already headed in a good direction. It can draft a first test, suggest edge cases, or help refactor repetitive code. It is much less useful when it is asked to replace product understanding. A generated test may look convincing while still missing the real risk, over-asserting incidental detail, or relying on weak selectors. The tester’s job remains the same: decide what matters, review the result critically, and keep only the parts that survive that review.

Testbed is a good environment for this because the product surface is familiar and the break modes give you controlled variations. That makes it easier to compare an AI-generated suggestion with the real behavior of the system. If the generated test does not respond well to a known fault mode or misses the main business rule in a flow, you immediately learn something useful about the limits of the prompt or the draft.

## How To Practise This Well

A disciplined exercise is to ask AI for one small draft and then review it line by line. Which selector choices are too brittle? Which assertions are too shallow? Which setup assumptions are unstated? That review process is the real learning opportunity. The value is not only in obtaining code faster, but in sharpening your sense of what a good test looks like.

Used well, AI can lower the cost of getting started, but it does not lower the need for judgement. If anything, it raises that need because polished output can hide weak thinking. Keep that tension in mind and AI becomes a helpful assistant rather than a risky shortcut.

```quiz
id: ai-practice-check
question: How should a tester review AI-generated tests?
passCondition: all
options:
  - id: option-1
    label: Check selectors, assertions, setup, and whether the draft matches the real risk
    correct: true
  - id: option-2
    label: Trust the output if it looks polished
    correct: false
  - id: option-3
    label: Accept every generated suggestion to save time
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is assuming generated code is correct because it looks polished and therefore skipping the normal review process. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like treating AI as a fast collaborator that still needs clear prompts, careful review, and real product understanding. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that how to use AI for drafts, variations, and refactoring prompts while still reviewing the result like a responsible tester is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with guidance on prompt quality, secure use of AI in engineering teams, and examples of code review standards for generated test code. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: ai-final-check
question: Why can AI-generated automation still be risky?
passCondition: all
options:
  - id: option-1
    label: Because polished code can still hide weak assumptions and shallow checks
    correct: true
  - id: option-2
    label: Because AI can only generate UI text and never test code
    correct: false
  - id: option-3
    label: Because review becomes unnecessary once a prompt is detailed
    correct: false
```

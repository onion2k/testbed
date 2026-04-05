# Manual QA to Automation Workshop

This workshop is a bridge between familiar manual testing habits and the first practical steps into automation. The aim is to give a manual tester enough context to feel oriented rather than overwhelmed. A lot of people arrive in automation expecting a sharp break with their earlier skills. In practice, the transition works best when you can see how the habits you already trust connect to a more repeatable and more technical style of testing. This workshop takes that approach from the beginning by slowing down and making the reasoning visible.

As you read, keep in mind that the goal is not to turn you into a framework specialist in one sitting. The goal is to help you build a mental model of how strong manual testing instincts become strong automation instincts when you make them repeatable and observable. Once that mental model is steady, the tools become easier to learn because they have a clear purpose. The workshop is therefore written in plain technical language and assumes you are capable, curious, and ready to connect new techniques to the quality instincts you already use every day.

## Why This Matters

How strong manual testing instincts become strong automation instincts when you make them repeatable and observable matters because automation becomes expensive very quickly when it is built on vague thinking. A tester who understands the purpose of a check, the evidence it needs, and the risk it is trying to control will usually produce stronger automation than someone who starts with syntax and hopes the value will appear later. That is why this workshop spends time on explanation rather than only on instructions. The explanation is what lets you transfer the lesson to other products later.

For manual testers, this is often the moment when automation begins to feel more approachable. Instead of imagining that you must become a different kind of professional, you start to notice that the same activities already matter: noticing behavior, comparing it with an expectation, isolating variables, and deciding what evidence would convince another person. Automation adds structure, speed, and repeatability, but it does not remove the need for judgement. The best automation work still begins with clear thinking.

If you skip this foundation, you can still produce scripts, but those scripts will often be fragile or shallow. They may click through a journey without proving much, or they may fail for reasons that are hard to interpret. Spending time here makes the later hands-on work more productive because you understand what you are trying to achieve and what good evidence would look like when you get there.

## What This Looks Like in Testbed

In Testbed, you can explore starting with manual exploration of the shop and checkout journey, then turning the same observations into simple Playwright and Postman checks. That makes the lesson unusually practical because the environment is designed to let you move between visible behavior and the hidden state behind it. The browser experience gives you the product journey. The desktop shell gives you controlled setup and observation. The API gives you a direct view of the messages the browser depends on. Those three layers make abstract ideas much easier to understand.

A good rhythm while using the app is to read one section, try a small action, and then return to the workshop with a more concrete question in mind. For example, if a section talks about controlling data, apply a preset and watch how the visible experience changes. If a section talks about evidence, open the trace viewer and notice which request best explains what just happened on screen. That pattern turns reading into active learning rather than passive consumption.

Testbed is especially helpful for manual testers because it removes some of the chaos that exists in live production systems. You can reproduce the same state, trigger the same issue, and look at the same response more than once. That gives you space to practise the reasoning that sits behind automation. When you later work in a less controlled environment, you will already have a model for how to think about setup, observations, and proof.

```quiz
id: manual-bridge-check
question: What is the key bridge from manual QA into automation?
passCondition: all
options:
  - id: option-1
    label: Turning useful observations into repeatable checks with clear purpose
    correct: true
  - id: option-2
    label: Automating every path you explored manually as quickly as possible
    correct: false
  - id: option-3
    label: Avoiding manual exploration once tools are available
    correct: false
```

## A Simple Example

A simple way to make this workshop concrete is to imagine exploring a checkout flow manually, writing down what you actually care about, and then expressing those same expectations as repeatable checks. At first this may seem like a straightforward product task, but that simplicity is useful. It gives you a small, familiar surface to think with. The important question is not only whether the action succeeds. The important question is what you would want to know, what evidence you would keep, and which part of the system would be the clearest place to check it.

As you walk through that example, try to describe the behavior in plain language before you think about tools. What should the user see? What data must exist for the journey to work? Which response from the API would give the browser enough information to render the right result? If the behavior went wrong, what would count as a meaningful symptom rather than a cosmetic difference? Questions like those are the bridge between exploration and automation. They help you decide what matters enough to be turned into a repeatable check.

Once you have those answers, you can begin to see where different tools fit. A browser test may be the best place to prove that the user sees the right state. A Postman request may be the best place to confirm that a validation rule is enforced. A trace entry may be the clearest way to understand whether the browser problem began with a bad response or with an incorrect client assumption. The example becomes more powerful when you stop treating the tools as separate worlds and start using them to answer one shared testing question.

## Working Through the Topic

The biggest change for a manual tester is not learning to type code. It is learning to decide which parts of your thinking deserve to become repeatable assets. During a manual session you constantly notice things: a label that feels wrong, a calculation that looks suspicious, a flow that should probably reject a certain input, an error message that does not help. Some of those observations are one-off discoveries. Others reveal behavior that the team should check again and again. Automation begins when you can tell the difference and can explain why one observation is worth preserving as a script or collection.

That is why a healthy first automation habit is to write down the expectation in plain language before you write any tool syntax. If you cannot explain the check without code, the code is unlikely to be strong. In Testbed, a good first example is the basket and checkout journey. You already know how to test it manually. The automation step is to reduce that knowledge to a repeatable setup, a short sequence of actions, and a small number of assertions that capture what really matters rather than every tiny visual detail of the page.

It is also worth noticing that automation setup can include authentication details, not just user actions. When you move from browser testing into API work, you may need credentials, headers, or Bearer tokens before a request is even allowed. That is still testing, not administrative overhead. In Testbed, the admin API uses a Bearer token that you can copy from the desktop app into Postman. Learning to handle that kind of setup is part of becoming effective with automation because real systems often combine product behavior with access rules.

## How To Practise This Well

As you practise, try converting one manual note into three different forms. First write a sentence such as, 'A customer should see the correct subtotal after adding two items.' Then ask how you would prove that manually. After that ask how you would prove it with Playwright, and finally ask whether the API also exposes the data needed to confirm the same rule. This exercise teaches you that automation is not a separate idea from testing. It is a choice about how to preserve and replay useful expectations.

A good sign of progress is that your automated checks become smaller and more intentional. Beginners often expect their first scripts to cover an entire end-to-end story because that is what they did manually. More mature automation often checks a narrower slice of behavior, but checks it with more clarity. That is not a reduction in ambition. It is an improvement in design.

```quiz
id: manual-practice-check
question: When turning a manual note into automation, what should come first?
passCondition: all
options:
  - id: option-1
    label: Explain the behavior and expectation in plain language before writing tool syntax
    correct: true
  - id: option-2
    label: Choose the most advanced framework feature you can find
    correct: false
  - id: option-3
    label: Record the whole journey and keep every generated action
    correct: false
```

## Common Beginner Mistake

The most common beginner mistake in this area is assuming automation begins with code rather than with clear thinking about the user journey, the data, and the assertions that matter. The problem with that habit is not only that it leads to weaker tests. It also makes learning slower. When you misread the purpose of the activity, every tool feels more confusing because you are asking it to solve the wrong problem.

A second version of the same mistake is moving too quickly. New automation engineers often want the comfort of immediate output, so they run to code, copy examples, or record a flow before they have decided what they are trying to prove. The result can look busy and productive while still leaving the important thinking undone. It is much better to pause, name the behavior, name the risk, and then choose the smallest technique that will give you confidence.

When you notice yourself slipping into that pattern, a useful reset is to ask three questions in plain language. What am I trying to learn? What evidence would convince me? What is the simplest repeatable way to get that evidence? Those questions pull you back toward testing judgement and away from tool-driven confusion.

## What Good Looks Like

In this workshop, good practice looks like using manual exploration to discover important behavior first and only then choosing the lightest useful automation to cover it. It is usually calmer and more deliberate than beginners expect. You are not trying to cover everything at once. You are trying to choose the next most useful thing to understand, check, or improve.

When a tester is working well at this level, their notes and their automation choices start to align. The reason a check exists is clear. The setup supports the behavior being checked. The assertions reflect something meaningful. If the check fails, the failure tells a sensible story. That is the standard to aim for. Not cleverness, and not sheer quantity, but clarity that survives reruns, handovers, and future change.

You should also expect good practice to involve communication. Automation is easier to maintain when the people around you can understand what a test is proving and why it matters. That is true whether you are talking to another tester, a developer, or a product manager. Clear reasoning makes your work easier to trust.

## Final Thought

The central lesson of this workshop is that how strong manual testing instincts become strong automation instincts when you make them repeatable and observable is learnable when you break it into sensible questions and deliberate practice. You do not need to become an expert overnight. You do need to be patient enough to connect each new tool or technique back to a real testing purpose.

If you take that attitude into the rest of the workshop library, you will get more from Testbed. Use the environment to try things, to observe carefully, and to turn fuzzy instincts into clearer evidence. That is how manual testing experience grows into automation confidence without losing the judgement that made you effective in the first place.

## Further Reading

For further reading, spend time with Playwright best-practice guidance, Postman learning paths, and notes from senior testers on your own team about where automation adds the most value. Read slowly enough to connect the material back to what you just practised in Testbed. The goal is not to collect links. The goal is to compare different explanations until the ideas feel stable enough that you could explain them to another tester in your own words.

If you are learning with teammates, an even better next step is to talk through one real example together. Pick a small product behavior, discuss where you would test it, and compare how each person would collect evidence. Conversations like that turn the workshop from private reading into practical team learning.

```quiz
id: manual-final-check
question: Why should a tester explore the workflow manually before writing the first automated check?
passCondition: all
options:
  - id: option-1
    label: To understand the behavior, risks, and meaningful assertions before automating
    correct: true
  - id: option-2
    label: To avoid looking at the API entirely
    correct: false
  - id: option-3
    label: Because automation works best without notes or expectations
    correct: false
```

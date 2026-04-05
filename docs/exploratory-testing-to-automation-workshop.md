# Exploratory Testing to Automation Workshop

This workshop is about one of the most useful transitions a tester can learn: taking what you discover during exploration and turning it into repeatable automated coverage.

Exploration and automation are not opposites. In fact, they support each other very well. Exploration helps you understand what matters. Automation helps you protect it once you understand it.

## Start With a Clear Charter

Exploratory testing works best when you begin with a purpose.

That purpose does not need to be complicated. It can be something simple such as:

- explore checkout failure handling
- explore how VIP access works
- explore what happens when products do not load

The charter gives your session direction. Without it, you can easily end up clicking around without learning very much.

## Capture Better Notes

The key to turning exploration into automation is the quality of your notes.

A weak note might say:

“Shop seemed broken.”

A stronger note might say:

“With the malformed products scenario active, opening `/shop` shows a readable error instead of crashing.”

That stronger note already contains the beginning of a test idea:

- setup
- action
- expected result

## Decide What Should Be Automated

Not everything you discover in exploration needs to become an automated check.

Automate findings that are:

- important
- repeatable
- stable enough to keep over time

Keep some things exploratory when their value is mainly discovery, comparison, or creativity.

This is an important skill. Good automation does not try to freeze every interesting thing you ever noticed.

## Turn a Finding Into a Simple Test Idea

Once you have a useful note, break it into three parts:

- what state do I need
- what action should happen
- what result should I assert

For example:

State: malformed products response.

Action: open the shop page.

Expected result: the page shows a readable error instead of breaking.

That can later become a Playwright test, a Postman check, or both.

## Final Thought

Exploratory testing helps you find the behavior worth protecting.

Automation helps you protect it consistently.

The better you get at moving between those two modes, the stronger your testing becomes.

# Workshop Quiz Authoring

Workshop quizzes are written inline inside the markdown files so lesson content and learner gates stay together.

## Purpose

Quizzes in Testbed workshops should test the learner's understanding of testing concepts.

They should not test:

- product trivia
- memorisation of page wording
- website details that are irrelevant to the testing lesson

Good quiz prompts check things like:

- best test level
- strongest assertion
- best selector
- highest risk
- best debugging step
- best setup strategy

## Supported Format

Use a fenced `quiz` block inside a workshop part.

Example:

```md
```quiz
id: selector-priority-check
question: Which locator is usually the strongest starting point for UI automation in this app?
passCondition: all
options:
  - id: role
    label: An accessible role or label-based locator
    correct: true
  - id: nth
    label: The third button on the page
    correct: false
  - id: css
    label: A long CSS chain from the page container
    correct: false
```
```

## Rules

- one quiz block per section for v1
- one question per quiz for v1
- multiple choice only
- at least 2 options
- at least 1 correct option
- `passCondition` is currently `all`

## Authoring Guidance

Keep questions:

- short
- specific
- concept-focused
- tied to the learning objective of the section

Prefer:

- “Which assertion is strongest here?”
- “Which API check should be added first?”
- “What is the main shift-left benefit in this case?”

Avoid:

- “What color is the button?”
- “What is the first card title on the homepage?”
- “How many routes are listed on the home page?”

## Unlock Behavior

A learner can unlock the next section only when:

1. the current section has been read to the end
2. the quiz has been answered correctly, if a quiz exists

Quiz completion is stored locally in the desktop app.

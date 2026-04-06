# Content Authoring Guide

Testbed content is markdown-first. That keeps workshops and articles easy to update without burying the learning material inside React code.

## Content Types

Workshops are guided learning tracks broken into parts. They can include embedded quiz blocks that gate progression.

Articles are shorter supporting reads intended to deepen judgement and provide context around automation, API testing, and QA practice.

## Workshops

Workshop metadata is declared in `src/lib/workshops.ts`. Each workshop points at a markdown file under `docs/`.

Workshop parts are split automatically on `#` and `##` headings. Avoid using lower-level headings to imply a new gated part. If you want a new step in the reader, use a top-level or second-level heading.

Quiz blocks use fenced `quiz` code blocks and are parsed out of the markdown before rendering.

## Articles

Article metadata is declared in `src/lib/articles.ts`. Each article points at a markdown file under `docs/articles/`.

Articles are not split into gated parts. They are treated as continuous reading content and marked read when the learner reaches the end.

## Naming

- workshop files: `docs/<topic>-workshop.md`
- article files: `docs/articles/<topic>.md`
- slugs should stay stable once published because progress and last-view state are keyed from them

## Launch Targets

Workshops and articles can include an optional launch target in their metadata. Use this to connect the learner from content into:

- a website route such as `/shop`
- a desktop tab such as `postman` or `tracing`

Prefer launch targets only when they help the learner practise the concept immediately.

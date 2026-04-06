# UI and Theming Guide

Testbed uses a small shared visual language across the website and desktop shell. The goal is to keep the experience approachable, readable, and clearly interactive in both light and dark modes.

## Theme Rules

- theme state is stored locally and applied at the document level
- light and dark mode must both preserve readable contrast for default, selected, disabled, success, warning, and error states
- buttons, chips, cards, form controls, and reader panes should use shared visual conventions rather than one-off styling

## Interaction Rules

- controls should look clickable without needing hover
- hover and focus states should feel responsive but understated
- motion should reinforce feedback, not distract from the training content
- disabled buttons must remain readable while clearly inactive

## Current Shared Patterns

- pill-style navigation for top-level tab movement
- rounded surface cards for content and control panels
- stronger accent buttons for primary actions
- markdown readers with consistent type scale, spacing, and code/table treatment

## When Adding UI

Prefer reusing existing visual patterns before inventing a new treatment. If a new control needs a distinct pattern, document it here once it stabilizes. When changing theme-related colors, verify both the website and the desktop shell because they share many utility classes and overrides.

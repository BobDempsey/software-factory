# Make each stage skill work the card it is handed

Each stage skill works the card named to it, so two `/factory` subagents in one column cannot take the same card.

## WHAT THE USER SEES

NO USER-VISIBLE CHANGE on the board. `/factory` subagents see it: each works the card in its prompt, where today the skill text tells it to choose from the column.

## Summary

- Four skills gain one rule in step 1: `factory-refine`, `factory-create-spec`, `factory-build`, `factory-retro`.
- The rule accepts an issue number or a `PVTI_...` item id, the two forms `/factory` passes.
- ASSUMPTION: with no card named, selection stays as it is today.
- ASSUMPTION: a named card outside the skill's column ends the run in one line, with no fallback to another card.
- ASSUMPTION: a card named in the skill's arguments counts the same as one named in the prompt.
- ASSUMPTION: the skill stops after its named card instead of carrying on through the column.
- ASSUMPTION: `factory-needs-you`, `factory-refresh` and `/factory` stay unchanged.

## Acceptance criteria

- When a prompt or arguments name a card in the skill's column, the skill shall work that card and no other.
- When the named card is not in the skill's column, the skill shall say so in one line and stop.
- When no card is named, the skill shall choose from its column as it does today.
- When the named card is finished, the skill shall stop without starting another.

## Scope boundaries

In scope: the named-card rule in step 1 of the four stage skills.

NOT in scope: `/factory-refresh`'s `working` check (#33), `/factory-needs-you`, the `/factory` prompt, the one-retro limit, skill descriptions.

## Technical detail

Full spec: [spec.md](spec.md). Plan: [plan.md](plan.md). Tasks: [tasks.md](tasks.md). Skills load from master, so the first `/factory` pass with two cards in one column after the merge is the live test, and the PR reports that behaviour as unverified.

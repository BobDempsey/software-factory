---
name: factory-sync-issues
description: Admit approved work into the factory. Reads the Software Factory board, tidies every card sitting in Approved, checks each is one unit of work, and moves it to Spec. Use when the user says to sync the board, admit work, pick up approved issues, or run the factory intake.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-sync-issues

Admit what the human has approved, and nothing else.

This is piece one of the factory. It is deliberately narrow: it does not write specs, create branches, or touch code. It moves cards from **Approved** to **Spec** and makes sure each one is shaped correctly on the way through.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the board's columns change:

```bash
cat .factory/board.json
```

It holds the project number, owner, project id, the Status field id, and the option id for each column.

## What to do

### 1. Read the board

```bash
./scripts/board.sh list
```

That prints every card with its status, type, issue number, and labels.

Work only on cards whose status is **Approved**. Ignore every other column, including Needs approval. Cards there are proposals waiting on a human, and admitting one is the human's decision, never yours.

If Approved is empty, say so in one line and stop.

### 2. Tidy each Approved card

For each card, in order. Stop and ask rather than guessing on anything ambiguous.

**It must be a real issue.** A draft card cannot carry labels and cannot be referenced by a branch. Convert it:

```bash
./scripts/board.sh convert <ITEM_ID>
```

Report the issue number it becomes.

**It must carry the `factory` label.** Add it if missing:

```bash
gh issue edit <N> --add-label factory --remove-label "factory:triage"
```

Removing `factory:triage` matters: an issue carrying both reads as proposed and admitted at once.

**It must carry exactly one `deliverable:*` label.** Valid values are `skill`, `hook`, `workflow`, `doc`, `script`, `config`. If none is present, infer the likely one from the issue, then **ask the human to confirm before applying it**. If more than one is present, ask which to keep. Never pick silently; the label is how a card is read at a glance, and a wrong one is worse than a missing one.

**The body should carry a bold DELIVERABLE line** near the top, matching the label. Add it if missing.

### 3. Check it is one unit of work

One issue is one unit of work: implementable and testable on its own, finishable in a sitting rather than a fortnight.

Flag for splitting when the issue:

- names more than one deliverable, or wants two `deliverable:*` labels
- says "and also", "plus", "while we're at it", or lists unrelated acceptance criteria
- touches parts of the system that have nothing to do with each other
- cannot be described in one sentence without a conjunction

When it should be split, **do not split it yourself**. Leave the card in Approved, comment on the issue naming the pieces you would cut it into, and report it. Splitting is a scoping decision and belongs to the human.

### 4. Move it to Spec

Only when every check above passes:

```bash
./scripts/board.sh move <ITEM_ID> Spec
```

**Verify the move by reading the board again.** Replacing the board's Status options in the past has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

### 5. Report

One line per card, in this shape:

```
#12 Add the red-first replay check  ->  Spec            [deliverable:script]
#13 Rework the whole pipeline       ->  held in Approved, suggest splitting into 3
```

Then one line of totals. Nothing else. No preamble, no summary of what you are about to do, no restating these instructions.

## Rules

- **Only the human admits work.** You never move a card out of Needs approval, never apply the `factory` label to something that lacks it in that column, and never promote a proposal because it looks good.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.
- **Ask rather than guess** on the deliverable label and on anything that might need splitting.
- **The board is not the record.** It shows state. If a card and the issue disagree, the issue wins, and say so.
- **Do not go further than Spec.** Nothing builds specs yet. Leaving a card parked in Spec is the correct end state.

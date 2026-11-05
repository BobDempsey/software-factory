---
name: factory-start
description: Start a session on the board instead of the handoff. Reads the Software Factory board, reports where every card sits, then asks whether to start on the first card in Needs refinement. Use when the user says to start, start the factory, sync with the board, pick up where we left off, or run factory status at the beginning of a session.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-start

Open a session on the board. Read it, say where things stand in a few lines, then start work on the first card that is waiting.

This replaces reading `handoff.md` at the top of a session. The handoff is the cold-start brief for someone who has never seen the repo; this is for the normal case, where the board already says what is in flight.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the board's columns change:

```bash
cat .factory/board.json
```

## What to do

### 1. Read the board

```bash
./scripts/board.sh list
```

That is the whole context load. Do not read `handoff.md`, `docs/outline.md`, or `docs/progress.md` unless something below needs them, and do not read `Bob's Draft Notes` at all; it is private.

### 2. Report where things stand

One line per column that has cards, in board order, and nothing for the empty ones:

```
Needs refinement   2   #7 Add a cost guard, #9 Rework the triage labels
Ready for dev      1   #4 Split board.sh move and convert
Done               3
```

Keep the report under six lines. It is a starting point, not a review. The only thing you ask is the question in step 3.

### 3. Ask before picking up the first card

Name the first card in **Needs refinement** and ask whether to start on it. One question, nothing else, in this shape:

```
QUESTION

Start refining "<card title>"?
```

The human may want a different card, or a different column, or to do something else entirely. Asking costs one line and saves a whole refinement conversation aimed at the wrong card.

On a yes, refine it with the human, following `.claude/skills/factory-refine/SKILL.md` from its step 3 onward. The board read in step 1 already covers that skill's step 1.

Refinement is a conversation. Ask the questions whose answers change what gets built, capped at three and asked as one block, and stop there. Do not run ahead to a second card.

Every question carries your recommendation. The human should be able to answer a whole refinement with `y`, so a question without a recommendation is a question you have not finished thinking about.

```
QUESTION

<the question, one sentence>

RECOMMENDATION

<the answer you would pick, and why, one sentence>

Use this recommendation? (y/n)
```

Say no recommendation only when you genuinely have none, and say so in those words rather than hedging into one.


On anything else, do what they said instead.

### 4. When Needs refinement is empty

Say so in one line, name the first column that does have a card waiting on a command, and say which command that is. Then stop and let the human choose.

| Column with cards | The command that acts on it |
| --- | --- |
| Needs refinement | `/factory-refine` |
| Ready for spec | `/factory-create-spec` |
| Ready for dev | `/factory-build` |
| Needs retro | `/factory-retro` |

Columns waiting on a human (Needs you) are reported, never acted on. So is In review (PR), which waits on CodeRabbit.

If the whole board is quiet, say that in one line and stop. An empty board is a fine place to start a session.

## Rules

- **Do not read the handoff.** If the session turns out to need deep history, say so and let the human ask for it.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not count it.
- **Do not act on a human's column.** Needs refinement, Needs you wait on a person. In review (PR) waits on CodeRabbit.
- **Needs you is untouchable.** No command reads it, acts on it, or offers it. Only the human moves a card out, back to whatever its RETURN TO line names.
- **One card, and ask first.** Starting the session means starting one piece of work, with the human's yes, not surveying all of them.
- **No preamble.** The report is the first thing in the response.

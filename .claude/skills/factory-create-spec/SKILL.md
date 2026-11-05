---
name: factory-create-spec
description: Write the spec for an admitted card. Reads the Software Factory board, takes a card sitting in /factory-create-spec, writes spec.md and spec-brief.md for it, posts the brief on the issue for approval, and moves the card to /factory-build once the human approves. Use when the user says to spec a card, write the spec, run the spec step, or work the /factory-create-spec column.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-create-spec

Turn an admitted issue into a spec a builder can implement against, and a brief a human can approve in two minutes.

This runs after `/factory-refine`. It does not create branches, write code, or open PRs. It works on cards in **/factory-create-spec**, one at a time, and parks each specced card in **/factory-needs-you** with an ACTION line, and the human sends it on to **/factory-build** once every DECISIONS row is answered.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the board's columns change:

```bash
cat .factory/board.json
```

It holds the project number, owner, project id, and the Status field id. Column option ids are never stored; `scripts/board.sh` looks them up by name.

## What to do

### 1. Read the board

```bash
./scripts/board.sh list
```

Work only on cards whose status is **/factory-create-spec**. If that column is empty, say so in one line and stop.

### 2. Take one card at a time

Finish a card, report it, then move to the next. Never start the second card while the first is unresolved.

### 3. Read everything that constrains the card

Before writing a line of spec:

```bash
gh issue view <N>
```

Then read, in this order:

- `docs/outline.md` for the design the change has to fit.
- `docs/progress.md` for what already exists.
- `docs/solutions/` for learnings from earlier runs. Past traps belong in this spec, not rediscovered in the build.
- `AGENTS.md` for the conventions the implementation must follow.

If the issue contradicts any of these, say so and stop. The contradiction is the human's to resolve.

### 4. Write the spec

Write two files under `specs/<N>-<short-slug>/`, both generated in this one pass so they cannot drift apart:

- `spec.md` — the full technical spec the implementation is built against.
- `spec-brief.md` — the human review document.

`spec.md` covers the problem, the approach, every file touched, the data or config shape, the acceptance criteria in EARS form, and the rollback. It is written for the agent that builds, so it may be long.

`spec-brief.md` follows the structure in `docs/outline.md` under "The spec brief", widest to narrowest:

1. **The pitch.** One sentence, under 30 words. Two sentences means the card should have been split.
2. **WHAT THE USER SEES.** In those words, near the top. Plain language, observable from outside. If nothing is visible, write `NO USER-VISIBLE CHANGE` and name who or what does see it.
3. **Scannable bullets.** One line per claim, no wrapping, no nested paragraphs.
4. **Flags in caps**, inline: `CRITICAL`, `IRREVERSIBLE`, `SECURITY`, `BREAKING`, `ASSUMPTION`, `OPEN`.
5. **Acceptance criteria**, EARS form: when X, the system shall Y.
6. **Scope boundaries.** In scope, and explicitly NOT in scope. The second list matters more.
7. **Technical detail.** Everything the reader only wants on demand. Nothing above this line may depend on it.

Hard cap: the brief fits one screen down to the end of acceptance criteria. If it does not fit, the unit of work is too big; say so and hand the split back to the human.

**Flag rather than decide.** Every choice the issue did not make is an `ASSUMPTION` flag. You do not resolve your own assumptions. A brief with no flags on a non-trivial change means the spec work was shallow.

### 5. Point the issue at the brief

The brief lives in `specs/<N>-<slug>/spec-brief.md`, not in the issue body. An issue carrying a card
that touches a frontend and a backend would run to several screens, and the one thing the human has
to act on would be below the fold.

`docs/issue-body.md` is the shape. Keep the one-sentence summary the card already has, and set the
deliverable and spec line beneath it:

```markdown
**DELIVERABLE:** workflow · **Spec:** [specs/13-park-on-review/](../specs/13-park-on-review/)
```

```bash
gh issue edit <N> --body-file <assembled body>
```

Never paste the brief into the body, and never leave a `# SPEC` section behind.

### 5b. Write the DECISIONS table

Every flag in the brief gets a row, and the table goes under `## DECISIONS`, above the `## LOG`
section. It is the one thing the human edits, so nothing sits between it and the ACTION line but
the summary. This is the record of what the human decided, and `/factory-build` refuses to run while any row is unanswered.

```markdown
## DECISIONS

| # | Flag | Question | Answer |
| --- | --- | --- | --- |
| 1 | ASSUMPTION | Markdown template rather than a YAML issue form? | UNANSWERED |
| 2 | CRITICAL | Does the template apply the `factory` label on filing? | UNANSWERED |
```

Rules for the table:

- One row per `ASSUMPTION`, `OPEN`, `CRITICAL`, `IRREVERSIBLE`, `SECURITY`, and `BREAKING` flag in the brief. Nothing else.
- The flag word stays in capitals, so the rows that matter are visible while scanning.
- The question is answerable yes or no, or with one short phrase. A question needing a paragraph is two questions.
- Every Answer cell starts as the literal word `UNANSWERED`.
- You never write an answer yourself. The human edits the cell, or replies and you transcribe their words verbatim.
- Rows are never deleted. An answer replaces `UNANSWERED` in place, so the table stays the history of what was decided.

### 5c. Park it in /factory-needs-you

## Parking a card in /factory-needs-you

/factory-needs-you is the only column a human watches, so a card arriving there has to say what it wants without being opened twice. Put these two lines at the very top of the issue body, above everything else:

```markdown
**ACTION:** <what you need from the human, one sentence>
**RETURN TO:** <the column the card goes back to once they have done it>
```

Replace them rather than stacking them: a card that comes back a second time has one ACTION line, the current one. Then move the card:

```bash
./scripts/board.sh move <ITEM_ID> "/factory-needs-you"
```

For this card the two lines are always the same shape:

```markdown
**ACTION:** Answer the DECISIONS rows at the bottom of this issue. Each carries a recommendation, so `y` accepts them all.
**RETURN TO:** /factory-build
```

Stop there and ask the human to approve, and to answer the DECISIONS rows. Every row has to say something other than `UNANSWERED` before the card can move again.

### 5d. Write the log line

Add one line at the **top** of `## LOG`, creating the section if the issue has none. Newest first,
as `docs/issue-body.md` says:

```markdown
**/factory-create-spec** — spec written against `factory-reviewed.yml`, 1 row open.
```

Name what it produced: the file the spec is written against, and how many rows are open. Never
touch another command's line.

### 6. Move it to /factory-build

Only after the human has approved and every DECISIONS row is answered:

```bash
./scripts/board.sh move <ITEM_ID> "/factory-build"
```

**Verify the move by reading the board again.** Replacing the board's Status options in the past has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

### 7. Report

One line per card, in this shape:

```
#14 Add one human-scannable issue template  ->  /factory-build   specs/14-issue-template/
#15 Rework the whole intake flow            ->  /factory-needs-you, 3 OPEN flags
```

Then one line of totals. Nothing else. No preamble, no restating these instructions.

## Rules

- **The human approves the spec.** You never move a card to /factory-build on your own judgement.
- **Never resolve your own assumptions.** They go in the DECISIONS table as `UNANSWERED`, and you wait.
- **Never fill in a DECISIONS answer yourself.** Transcribe the human's words, or leave the row alone.
- **Never invent scope.** The spec implements what the issue says, plus whatever `docs/` requires of it. Nothing else.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.
- **The board is not the record.** It shows state. If a card and the issue disagree, the issue wins, and say so.
- **Do not go further than /factory-build.** Building is a separate piece, and it does not exist yet.

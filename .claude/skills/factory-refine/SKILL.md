---
name: factory-refine
description: Refine a rough card into something ready for development. Reads the Software Factory board, works through every card sitting in /factory-refine with the human, and moves each finished one to /factory-create-spec. Use when the user says to refine the board, work the refinement column, sharpen a draft, or get a card ready for spec.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-refine

Turn a rough note into one unit of work the human is willing to approve.

This runs after the human drags a card into /factory-refine. It does not write specs, create branches, or touch code. It works on cards in **/factory-refine**, one at a time, with the human in the loop, and moves each finished card to **/factory-create-spec**.

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

Work only on cards whose status is **/factory-refine**. If that column is empty, say so in one line and stop.

### 2. Take one card at a time

Refinement is a conversation, not a batch job. Finish a card, report it, then move to the next. Never run ahead to the second card while the first is unresolved.

### 3. Refine it with the human

Read the card. Then ask only the questions whose answers would change what gets built. Cap it at three at a time, and ask them as one block rather than one per turn.

Every question carries your recommendation. The human should be able to answer a whole refinement with `y`, so a question without a recommendation is a question you have not finished thinking about.

```
QUESTION

<the question, one sentence>

RECOMMENDATION

<the answer you would pick, and why, one sentence>

Use this recommendation? (y/n)
```

Say no recommendation only when you genuinely have none, and say so in those words rather than hedging into one.


A card is ready when all of these hold:

- **It names one deliverable.** One skill, one hook, one workflow, one doc, one script, or one config change.
- **It can be described in one sentence without a conjunction.** "And also" means two cards.
- **It says what done looks like.** A short acceptance line a human can check by reading or running something.
- **It names where the work lands.** A path, a column, or a command, not a feeling.

If the human's answers reveal two pieces of work, **do not split it yourself**. Say what the pieces are and let them decide. Splitting is a scoping decision and belongs to the human.

### 4. Write the refinement back

Once the shape is settled, rewrite the card so it reads cleanly to someone who was not in the conversation.

**If the card is still a draft note**, convert it so it can carry labels:

```bash
./scripts/board.sh convert <ITEM_ID>
```

Report the issue number it becomes.

**Give it a title that is one sentence.** No trailing colons, no ticket prefixes.

**Add a bold DELIVERABLE line near the top of the body**, matching the `deliverable:*` label you are about to apply.

**Apply exactly one `deliverable:*` label.** Valid values are `skill`, `hook`, `workflow`, `doc`, `script`, `config`. Infer the likely one, then **ask the human to confirm before applying it**:

```bash
gh issue edit <N> --add-label deliverable:<kind>
```

Never pick silently. A wrong label is worse than a missing one.

**Apply the `factory` label once the human has said the card is ready**, and drop `factory:triage` if it is there. An issue carrying both reads as proposed and admitted at once:

```bash
gh issue edit <N> --add-label factory --remove-label "factory:triage"
```

Refinement is the admission gate. There is no second pass behind it.

### 5. Move it to /factory-create-spec

Only when the human has said the card is ready:

```bash
./scripts/board.sh move <ITEM_ID> "/factory-create-spec"
```

**Verify the move by reading the board again.** Replacing the board's Status options in the past has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

### 6. Report

One line per card, in this shape:

```
#14 Add a margin to the sync button  ->  /factory-create-spec   [deliverable:config]
#15 Rework the whole intake flow     ->  held, suggest splitting into 3
```

Then one line of totals. Nothing else. No preamble, no restating these instructions.

## Rules

- **The human decides when a card is ready.** You never move a card to /factory-create-spec on your own judgement.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.
- **Never invent scope.** Refining sharpens what the card says. It does not add features, acceptance criteria, or constraints the human did not give you.
- **Ask rather than guess** on the deliverable label and on anything that might need splitting.
- **The board is not the record.** It shows state. If a card and the issue disagree, the issue wins, and say so.
- **Do not go further than /factory-create-spec.** Writing the spec is `/factory-create-spec`, which does not exist yet.

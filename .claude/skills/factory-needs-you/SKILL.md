---
name: factory-needs-you
description: Work the /factory-needs-you column one card at a time. Takes the first card parked in /factory-needs-you, says in one sentence what it is and exactly what it wants from you, takes your answer in chat, writes it into the issue verbatim, moves the card to the column its RETURN TO line names, and offers the next one. Use when the user says to clear /factory-needs-you, work their queue, answer the cards waiting on them, or asks what is blocking.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-needs-you

The one command the human runs on their own column.

Every other command treats **/factory-needs-you** as untouchable, because a card there is waiting on a
decision no agent may make. This is the exception, and it is an exception because the human invoked
it: it never runs from a loop, and `/factory-run` and `/factory-watch` still never offer it.

It answers one question per card: what do you want, and where does this go. Then it writes the
answer down in the human's own words and moves the card.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the
board's columns change:

```bash
cat .factory/board.json
```

## What to do

### 1. Take the first card in /factory-needs-you

```bash
./scripts/board.sh list
```

Work only cards whose status is **/factory-needs-you**, oldest first. If the column is empty, say so in one
line and stop:

```
nothing waiting on you.
```

### 2. Read the issue, not the card

```bash
gh issue view <N> --json title,body,labels
```

The card face is a summary. The issue holds the ACTION line, the RETURN TO line, any
RECOMMENDATION, and the `## DECISIONS` table if the spec step wrote one.

### 3. Put it to the human

Three parts, nothing else. No preamble, no restating the issue body, no board summary.

```
#14 Add a margin to the sync button
A spec is written and every file it touches is listed; it is waiting on two DECISIONS rows.

QUESTION

1. Markdown template rather than a YAML issue form?
2. Does the template apply the `factory` label on filing?

RECOMMENDATION

1. Markdown. 2. No, refinement applies it.

Use this recommendation? (y/n)
```

- **One sentence of summary.** What the card is and how far it got.
- **Then exactly what is wanted**, taken from the ACTION line or the unanswered DECISIONS rows. If
  the issue carries a RECOMMENDATION, repeat it so `y` is a complete answer.
- **Every unanswered row at once.** The human is sitting here; asking one row per turn is the thing
  this command exists to fix. A card with nine rows is nine numbered lines, not nine turns.

Some cards want an action rather than an answer, like merging a PR. Say so plainly, and treat
"done" as the answer.

### 4. Write the answer down, verbatim

**Transcribe. Never author.** The human's words go in as they said them. `y` means the
recommendation they just saw, so write the recommendation's text into the row, not the letter `y`.

For a DECISIONS table, replace `UNANSWERED` in each row and leave the rest of the table alone:

```bash
gh issue edit <N> --body-file <path>
```

For a card with no table, put the answer under the ACTION line as a bold **ANSWERED:** line, and
leave the ACTION line in place so the issue still reads as a record of what was asked.

If the human's answer changes what gets built rather than just confirming it, say so in one line
before writing it, and write what they said anyway. It is their call.

**Never leave a row that still says `UNANSWERED`.** If the human skips one, the card does not move:
say which row is open and go to the next card.

### 5. Move it where its RETURN TO line says

```bash
./scripts/board.sh move <ITEM_ID> "<the RETURN TO column>"
```

The issue names the column. Do not pick one yourself, and do not move a card whose RETURN TO line is
missing: say so and leave it parked.

**Verify the move by reading the board again.** Replacing the board's Status options in the past has
left API writes reporting success while the card rendered in the wrong column. If the read-back
disagrees, say so plainly and tell the human to drag the card, rather than retrying.

### 6. Offer the next one

One line, with the count:

```
#14 -> /factory-build. 2 cards left in /factory-needs-you, next is #15. (y/n)
```

`y` loads the next card at step 2. Anything else ends the command. When the column is empty:

```
#14 -> /factory-build. /factory-needs-you is clear.
```

## Rules

- **Transcribe, never author.** Writing down what the human said is not answering a DECISIONS row.
  Deciding one yourself is, and it is never allowed, not even for a row you are certain about.
- **One card at a time**, finished and moved before the next is loaded.
- **All of a card's questions in one block.** The human is in the room; use that.
- **The issue says where the card goes.** RETURN TO is the instruction. No RETURN TO, no move.
- **Never move a card the human did not answer.** A skipped row leaves the card parked.
- **Only the human runs this.** No loop invokes it, and no pass offers it.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything
  in it.
- **The board is not the record.** It shows state. If a card and the issue disagree, the issue wins,
  and say so.

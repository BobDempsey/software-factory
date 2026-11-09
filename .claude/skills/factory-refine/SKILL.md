---
name: factory-refine
description: Refine a rough card into something ready for spec. Reads the Software Factory board, takes a card sitting in /factory-refine, reads the repo to work out what the note is asking for, writes it out, converts and labels it, and either moves it to /factory-create-spec or parks it in /factory-needs-you with one question. Use when the user says to refine the board, work the refinement column, sharpen a draft, or get a card ready for spec.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit, Glob, Grep
---

# factory-refine

Turn a one-line note into one unit of work, without needing the human in the room.

This is the intake command and the admission gate. It works on cards in **/factory-refine**, one at
a time. A card arrives as whatever the human typed: half a sentence is normal. It leaves either in
**/factory-create-spec**, written out, converted and labeled, or in **/factory-needs-you** carrying the one
question that stopped it.

It does not write specs, create branches, or touch code.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the
board's columns change:

```bash
cat .factory/board.json
```

It holds the project number, owner, project id, and the Status field id. Column option ids are never
stored; `scripts/board.sh` looks them up by name.

## What to do

### 1. Read the board

```bash
./scripts/board.sh list
```

Work only on cards whose status is **/factory-refine**. If that column is empty, say so in one line
and stop. Take one card at a time: finish it, report it, then move to the next.

A card still sitting as a `DraftIssue` has no number, so its number column reads `-` and you name it
by its `PVTI_...` item id.

### 2. Read the repo before you read the note again

A one-liner names a thing and a change. Find the thing.

```bash
rg -n "<the noun from the note>" --glob '!node_modules'
```

Read what you find: the script, the skill, the workflow, the doc. For "change the watcher to 10
minutes", that is `scripts/watch.mjs`, and the answer is that the interval is a `--interval` flag
defaulting to 60 seconds with a floor of 15, so the note is asking for a different default.

If the note names nothing that exists, say so in the card rather than inventing a target. A note
pointing at nothing is still refinable; it just needs the human to say where it lands.

This step is why most cards never need to stop. Half of what looks like a question for the human is
answered by the repo.

### 3. Decide whether the card is ready

A card is ready when all of these hold:

- **It names one deliverable.** One skill, one hook, one workflow, one doc, one script, or one
  config change.
- **It can be described in one sentence without a conjunction.** "And also" means two cards.
- **It says what done looks like.** A short acceptance line a human can check by reading or running
  something.
- **It names where the work lands.** A path, a column, or a command, not a feeling.

Where the repo settles one of these, settle it and say in the card what you read. Where it does not,
that is a question for the human, and the card stops.

**Never invent scope.** Refining sharpens what the card says and adds what the repo says. It does
not add features, acceptance criteria or constraints the human did not give you.

**Never split a card yourself.** If the note holds two pieces of work, that is a reason to park it,
not a licence to decide. Splitting is a scoping decision and belongs to the human.

### 4. Write the refinement back

Rewrite the card so it reads cleanly to someone who was not there.

**Keep the original one-liner as the first line, verbatim, under `Note:`.** It is the human's own
words and the refinement is a reading of them.

**Give it a title that is one sentence.** No trailing colons, no ticket prefixes.

**Write the body in the shape `docs/issue-body.md` describes.** One sentence saying what the card
is, then the DELIVERABLE line. Three to six lines of detail at most: what exists today, named by
path, and what the note wants changed. The long version is the spec step's job, and a card that
needs more than a screen here is a card that should have been split.

**If the card is still a draft note**, convert it so it can carry labels:

```bash
./scripts/board.sh convert <ITEM_ID>
```

Report the issue number it becomes.

**Add a bold DELIVERABLE line near the top of the body**, matching the `deliverable:*` label.

**Apply exactly one `deliverable:*` label.** Valid values are `skill`, `hook`, `workflow`, `doc`,
`script`, `config`:

```bash
gh issue edit <N> --add-label deliverable:<kind>
```

Pick it from what the card produces. If two are genuinely arguable, that is a question, and the card
stops in /factory-needs-you rather than carrying a coin-flip label.

**Leave `agent-created` on the card** if it is there. It records who filed the card and stays for
the card's whole life.

Refinement is the admission gate. There is no second pass behind it.

**Write the log line.** One line at the top of `## LOG (newest first)`, creating the
section, or swapping in the marker for a bare `## LOG` in the same edit:

```markdown
**/factory-refine** — one unit of work, labeled `deliverable:workflow`.
```

### 5a. Ready: move it to /factory-create-spec

```bash
./scripts/board.sh move <ITEM_ID> "/factory-create-spec"
```

The spec step writes a DECISIONS table and parks it for approval, so a card you were nearly sure
about still reaches the human before anything gets built. That is the safety net that lets this
command run alone.

### 5b. Not ready: park it in /factory-needs-you

Put the question at the top of the issue body, above everything else, as two bold lines:

```
**ACTION:** <the one thing you need from the human, one sentence>
**RETURN TO:** /factory-refine
```

Carry a recommendation with it wherever you have one, so the human can answer with `y`:

```
**ACTION:** Is this one card or two? I read it as two: the retry and the timeout.
**RECOMMENDATION:** Two cards. Say `y` and I will file the second.
**RETURN TO:** /factory-refine
```

Then park it. `park` moves the card and gives it the `needs:decisions` label, so the card says what it
wants on its face:

```bash
./scripts/board.sh park <N> needs:decisions
```

One question per card. A card parked with three questions is a conversation the human has to hold in
their head, which is what this command exists to avoid. Ask the one that blocks the most.

### 6. Verify the move

**Read the board again.** Replacing the board's Status options in the past has left API writes
reporting success while the card rendered in the wrong column. If the read-back disagrees, say so
plainly and tell the human to drag the card, rather than retrying.

### 7. Report

One line per card:

```
#14 Add a margin to the sync button  ->  /factory-create-spec   [deliverable:config]
#15 Rework the whole intake flow     ->  /factory-needs-you: one card or three?
```

Then one line of totals. Nothing else. No preamble, no restating these instructions.

## Rules

- **Read the repo first.** Every question you can answer by reading is a question the human never
  sees.
- **Run alone.** The card either moves on or parks with one question. Do not hold a conversation
  mid-card and do not wait for an answer in the session.
- **Never invent scope**, and never split a card yourself. Park it instead.
- **One question per parked card**, with a recommendation wherever you have one.
- **Keep the human's words.** Their original line stays at the top, verbatim.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything
  in it.
- **The board is not the record.** It shows state. If a card and the issue disagree, the issue wins,
  and say so.
- **Do not go further than /factory-create-spec.** Writing the spec is someone else's job.

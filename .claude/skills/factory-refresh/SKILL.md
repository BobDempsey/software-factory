---
name: factory-refresh
description: Refresh the board and act on what changed. Reads the Software Factory board, diffs it against the snapshot from the last run, reports only what moved, and offers to run the command for any card that landed in an agent column. Use when the user says to refresh, check the board, see what changed, or asks what moved since last time.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Write, Edit
---

# factory-refresh

The refresh button for the board. Read it, say what moved since the last read, and offer to pick up anything a human has handed over.

`/factory` drives the board on a loop. This is for the middle of a session, after you have been dragging cards in the browser and want to know what changed.

## Board constants

Read these from `.factory/board.json` rather than hardcoding them, because they change when the board's columns change:

```bash
cat .factory/board.json
```

## The snapshot

`.factory/snapshot.json`, gitignored, holding the board exactly as it was at the end of the last run:

```json
{
  "takenAt": "2026-11-05T00:14:00Z",
  "cards": {
    "PVTI_xxx": { "status": "/factory-build", "number": 5, "title": "..." }
  }
}
```

It is local state, not a record. Deleting it is harmless: the next run reports nothing moved and writes a fresh one.

## What to do

### 1. Read the board

```bash
./scripts/board.sh list
```

This always reads live, so there is no stale-data case. The snapshot is only ever the thing being compared against.

### 2. Diff it against the snapshot

Read `.factory/snapshot.json`. If it does not exist, skip to step 5: there is nothing to compare, and this run just establishes the baseline.

Classify every difference:

- **Moved.** The card is in a different column than the snapshot says.
- **New.** The card is not in the snapshot at all.
- **Gone.** The snapshot has it and the board does not, so it was archived or deleted.

A card whose title changed but whose column did not is not a move. Do not report it.

### 3. Report only what changed

One line per change, nothing for cards that sat still:

```
#5 Move a card to /factory-retro   /factory-build -> @coderabbitai    by the agent
#7 Add a cost guard             /factory-needs-you -> /factory-build    by you
#9 Rework the triage labels     new in /factory-refine
#12 Split the review loop       /factory-refine -> /factory-create-spec    by you    held
```

A card whose line ends in `held` carries the `working` label, so a `/factory` subagent is already on it. Step 4 says how the refresh reads that.

If nothing moved, say "nothing moved" in one line and stop after writing the snapshot.

The last column says who moved it, which the direction tells you: a card that arrived in a human column got there from a command, and a card that arrived in an agent column got there from a drag.

### 4. Offer to pick up what was handed over

A card that **moved into an agent column** is work the human has just handed over. Those columns, and what runs on them:

| Column | Command |
| --- | --- |
| /factory-refine | `/factory-refine` |
| /factory-create-spec | `/factory-create-spec` |
| /factory-build | `/factory-build` |
| /factory-retro | `/factory-retro` |

Before offering anything, read which cards `/factory` already holds. A `/factory` subagent marks each card it works with the `working` label, and starting a second command on that card would put two actors on one issue:

```bash
gh issue list --label working --state open --json number
```

Do not take labels from `./scripts/board.sh list`. Its labels column reads `-` for every card today, so it would show every card as free.

A handed-over card whose issue number is in that list is held. Report its move in step 3 as usual, and never offer a command on it. A draft card has no issue and cannot carry the label, so treat it as free.

If that read fails, offer nothing this run and say so in one line: `could not read holds, offering nothing`.

Name the first handed-over card that is not held and ask, one question, nothing else:

```
QUESTION

Run /factory-build on #7 Add a cost guard?
```

If every handed-over card is held, ask nothing.

On a yes, run the same `gh issue list` read again first. If the card has gained `working` since the offer, do not run the command, and say in one line that the card is now held. Otherwise run it. On anything else, do what they said.

A card that moved into a human column (/factory-needs-you) is reported and never acted on, and neither is one in @coderabbitai, which waits on CodeRabbit.

A card that landed in **/factory-needs-you** is worth calling out in the report, because it got there by failing three review rounds and nothing will move it until the human does. So is a card that was already sitting in an agent column before this run: it did not move, so nobody handed it over, and picking it up would be reaching for work rather than responding to it.

If more than one card was handed over, say how many and offer the first one not held. One card at a time.

### 5. Write the snapshot

Always, and last, whether or not anything moved and whether or not the human said yes:

```json
{ "takenAt": "<ISO timestamp>", "cards": { ... } }
```

Write it from the board read in step 1, not from what you think the board should look like. If the human says yes in step 4 and a command then moves a card, that move shows up as a change on the next refresh, which is correct: it happened after this snapshot was taken.

## Rules

- **Report only what moved.** A list of everything is what `/factory` reports, not this.
- **Only a move into an agent column is an offer.** A card sitting still is not work being handed over.
- **A card labeled `working` is never offered.** A `/factory` subagent holds it. Only `/factory` adds or removes that label.
- **Never act on a human column.** /factory-needs-you waits on a person. @coderabbitai waits on CodeRabbit.
- **/factory-needs-you is untouchable.** No command reads it, acts on it, or offers it. The human moves a card out, back to whatever its RETURN TO line names, either by dragging it or by running `/factory-needs-you` themselves.
- **Always write the snapshot**, even on a run that reports nothing and even if the human says no.
- **Bob's Draft Notes is private.** Count moves in and out of it, since the board read already shows them, but never read a card's contents there.
- **No preamble.** The report is the first thing in the response.

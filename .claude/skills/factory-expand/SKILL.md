---
name: factory-expand
description: Turn a one-line note into a paragraph. Reads the Software Factory board, takes a card sitting in /factory-expand, researches what it is asking for, writes it out in a few lines, and moves it to /factory-refine. No conversation. Use when the user says to expand a note, flesh out a card, or work the /factory-expand column.
allowed-tools: Bash(gh:*), Bash(./scripts/board.sh:*), Read, Glob, Grep
---

# factory-expand

Turn "change the watcher to 10 minutes" into something a refinement conversation can start from.

This runs before `/factory-refine`. It does not ask questions, convert the card, apply labels, or decide scope. It works on cards in **/factory-expand**, one at a time.

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

Take the first card in **/factory-expand**. If that column is empty, say so in one line and stop.

### 2. Work out what the note is actually asking for

A one-liner names a thing and a change. Find the thing.

```bash
rg -n "<the noun from the note>" --glob '!node_modules'
```

Read what you find: the script, the skill, the workflow, the doc. For "change the watcher to 10 minutes", that is `scripts/watch.mjs`, and the answer is that the interval is a `--interval` flag defaulting to 60 seconds with a floor of 15, so the note is asking for a different default.

If the note names nothing that exists, say so in the expansion rather than inventing a target. A note pointing at nothing is still worth refining; it just needs the human to say where it lands.

### 3. Write it out

Rewrite the card body as a short paragraph plus a few bullets. Three to six lines total. It should answer, for someone who did not write the note:

- What exists today, named by path.
- What the note wants changed.
- Anything nearby that the change obviously touches.

Keep the original one-liner as the first line, verbatim, under **Note:**. It is the human's own words and the expansion is a reading of them, not a replacement.

**Do not decide anything.** No scope, no acceptance criteria, no approach, no deliverable label. Refinement does that, with the human. Expanding is reading the repo so that conversation does not have to start from zero.

If the note is ambiguous in a way the repo cannot settle, write the ambiguity down as a line starting `OPEN:`. Refinement will ask it.

### 4. Move it to /factory-refine

```bash
./scripts/board.sh move <ITEM_ID> "/factory-refine"
```

**Verify the move by reading the board again.** Replacing the board's Status options has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

### 5. Report

One line per card:

```
Change the watcher to 10 minutes  ->  /factory-refine   scripts/watch.mjs, 1 OPEN
```

Then one line of totals. Nothing else.

## Rules

- **Never ask the human anything.** This column exists so they can drop a line and walk away.
- **Never decide scope.** Expanding adds what the repo says, never what you would choose.
- **Never convert the card or label it.** That is refinement's job, after the human has seen it.
- **Keep the original line.** Their words stay at the top, verbatim.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.
- **Three to six lines.** A card that arrives at refinement as an essay is worse than the one-liner.

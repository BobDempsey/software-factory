---
name: factory-retro
description: Review a finished run and write down what it taught us. Reads the Software Factory board, takes a card sitting in Needs retro, reconstructs the run from the issue, spec, PR and commits, writes a file to docs/solutions/, and applies any rule change it earns. Use when the user says to run the retro, do the after-action review, close out a card, or work the Needs retro column.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(./scripts/board.sh:*), Read, Write, Edit, Glob, Grep
---

# factory-retro

Close out one finished run by writing down what it taught us, so the next run does not pay for the same lesson twice.

This is the last step. It does not touch product code, reopen the issue, or change the merged result. It works on cards in **Needs retro**, one at a time, and moves each one to **Done**.

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

Take the first card whose status is **Needs retro**. If that column is empty, say so in one line and stop.

### 2. Confirm the run actually finished

If any of these fails, say which one and stop. A retro on an unfinished run writes fiction.

- The issue is closed.
- Its PR is merged.
- `specs/<N>-<slug>/spec.md` exists.

```bash
gh issue view <N> --json state,closedAt,title
gh pr list --state merged --search "<N>"
```

### 3. Reconstruct the run

Read, in this order:

- The issue body: the original card text, the `# SPEC` brief, and the `## DECISIONS` table with its answers.
- `specs/<N>-<slug>/spec.md`, and what it said was out of scope.
- The merged PR: its body, its review comments, and what it said it could not verify.
- The commits on the branch.

```bash
gh pr view <PR> --json title,body,comments,files
git log --oneline master --grep "#<N>"
git diff <merge-base>..<merge-commit> --stat
```

Then compare what was spec'd against what shipped. The interesting part of a retro is always the gap: what the spec said, what the diff did, and which one was right.

### 4. Mine the transcript, do not ask

Do not ask the human what went wrong. By the time a card reaches this column they have moved on, often across several cards, and a question they cannot answer produces a worse retro than silence.

The friction is already on disk. Look for it:

- Commits that amend, revert, or fix the commit before them.
- A PR body's "not verified" section, and anything a review comment pushed back on.
- Files the diff touched that the spec never named, and spec'd files the diff never touched.
- `DECISIONS` answers that the diff then contradicted.
- Commands in the run that failed before they worked, where the branch or the issue records it.

If the repo shows no friction, the honest finding is that the run was clean. Write that.

### 5. Write the solution file

One file per run, at `docs/solutions/<N>-<slug>.md`. Create `docs/solutions/` if it does not exist.

```markdown
# <N>: <issue title>

Run closed <date>. Issue #<N>, PR #<PR>, spec `specs/<N>-<slug>/`.

## What shipped

<two or three lines: what changed, and what it does now>

## What it taught us

- <one lesson per bullet, each specific enough to act on>

## Traps

- <the thing that cost time, and the exact symptom that gives it away>

## Spec versus diff

<where the implementation diverged from the spec, and which one was right>

## Decisions revisited

<any DECISIONS answer the run proved wrong, or confirmed, with the evidence>
```

Rules for the file:

- A lesson is a trap to avoid, not a map to follow. "Do good work" is not a lesson.
- Write the symptom, not just the cause. The next agent meets the symptom first.
- If the run taught nothing, say so in one line and keep the file short. A padded retro is worse than a thin one, because it dilutes the directory that spec work reads back.
- No blame, and no praise. Both are noise to someone reading this in six months.

### 6. Apply the rule changes

A lesson that should bind every future run goes into `AGENTS.md`, and you apply it. Do not hand the human a proposal to rule on; by the time a card reaches this column they have moved on, and a proposal they skim is the same as no rule.

`AGENTS.md` sets the bar, and it is a real bar. A rule earns its place only when all three hold:

- **Non-obvious.** Something a competent agent would get wrong without being told.
- **Hit more than once**, or certain to hit again. One freak incident is a trap for `docs/solutions/`, not a rule.
- **Specific enough to act on.** It names the command, the path, or the symptom.

Most lessons fail that bar. The default is to write them in the solution file and add nothing to `AGENTS.md`. A retro that adds a rule every run is inflating the file, and `AGENTS.md` says rules are traps to avoid rather than maps to follow.

When a lesson does clear the bar, edit `AGENTS.md` in place under the right section, one line, in the voice of the lines around it. Then say in your report exactly what you added and which run first hit it, so the human can revert it in one edit if they disagree.

Add traps that do not clear the bar to the gotchas section of `handoff.md`, which is a living record rather than a rule file.

### 7. Move the card to Done

```bash
./scripts/board.sh move <ITEM_ID> "Done"
```

**Verify the move by reading the board again.** Replacing the board's Status options in the past has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

Done is the end of the line. Archiving a Done card is the human's gesture, not yours, and there is no hurry: a card sitting in Done costs nothing until the column gets noisy.

### 8. Report

One line per card, in this shape:

```
#2 Add one human-scannable issue template  ->  Done, docs/solutions/2-issue-template.md   3 lessons, 1 rule added
#5 Rework the intake flow                  ->  skipped, PR not merged
```

Then one line of totals, and the full text of anything you added to `AGENTS.md` so the human can revert it in one edit. Nothing else. No preamble, no restating these instructions.

## Rules

- **No finished run, no retro.** An open issue or unmerged PR stops the run.
- **Never invent a lesson.** If nothing was learned, the file says so.
- **Never ask the human what happened.** The evidence is in the repo, and they have moved on.
- **Apply the rule, do not propose it.** And hold the bar: most lessons belong in `docs/solutions/` or the handoff gotchas, not in `AGENTS.md`.
- **Never archive a card.** Moving it to Done is the end of your job.
- **Stuck is untouchable.** No command reads it, acts on it, or offers it. A card is there because three review rounds failed, and only the human decides what happens next.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.

---
name: factory-build
description: Build an approved card. Reads the Software Factory board, takes a card sitting in /factory-build, confirms it has an approved spec, implements it on a branch, and opens a PR. Use when the user says to build a card, start dev, implement the spec, or work the /factory-build column.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(./scripts/board.sh:*), Read, Write, Edit, Glob, Grep
---

# factory-build

Implement one approved spec, and stop at the PR.

This runs after `/factory-create-spec`. It works on cards in **/factory-build**, one at a time. It opens the PR, moves the card to **@coderabbitai**, and stops. It never merges or deploys.

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

Take the first card whose status is **/factory-build**. If that column is empty, say so in one line and stop.

### 2. Confirm it has a spec

Before touching code, all of these must hold. If any fails, say which one and park the card as step 9b says. Fixing it is a different command's job.

- The card is a real issue, not a draft.
- It carries the `factory` label and exactly one `deliverable:*` label.
- `specs/<N>-<slug>/spec.md` exists.
- The body links the spec directory, in the shape `docs/issue-body.md` describes. The brief itself
  lives in `specs/<N>-<slug>/spec-brief.md`, not in the issue.
- The body carries a `## DECISIONS` table, and **no row says `UNANSWERED`**. A flag the human never answered is not approval, however good the spec looks.

```bash
gh issue view <N>
ls specs/<N>-*/
```

### 3. Read the spec and the rules

Read `specs/<N>-<slug>/spec.md` end to end. Then `AGENTS.md` for the conventions, and `docs/solutions/` for traps that earlier runs already paid for.

The spec is the contract. Build what it says. If the spec is wrong or silent on something that matters, stop and say so rather than deciding it yourself; the point of the gate was that assumptions get answered before code exists.

### 4. Enter the card's worktree

Build in a git worktree, never in the main checkout. The human may have uncommitted edits there, and
anything staged in it would ride into the build.

Call Claude Code's `EnterWorktree` with `name: worktree-<N>`. It creates
`.claude/worktrees/worktree-<N>` on a new branch from `origin/master` and moves the session into
it. If `.claude/worktrees/worktree-<N>` already exists, because a review sent the card back, call
`EnterWorktree` with that `path` instead, and skip the rest of this step.

`EnterWorktree` names its branch `worktree-worktree-<N>`. Rename it, so the issue number is the
thread through branch, PR and spec directory, then bring the spec in. `/factory-create-spec` wrote
it into the main checkout, where it is still untracked:

```bash
git branch -m <N>-<slug>
cp -r <main checkout>/specs/<N>-<slug> specs/
```

Every command from here runs inside the worktree. Claude Code refuses `git -C` aimed back at the
main checkout from a worktree session, and refuses a shell command that mentions git in a form it
cannot check, so keep git commands plain and separate. Never build on `master`.

### 5. Implement

Work through the spec's file list. Match the surrounding code's conventions rather than importing your own.

Touch only what the spec's scope allows. The spec's NOT-in-scope list is binding: finding something else worth fixing is a note for the report, not a change in this branch.

### 6. Verify

Run what the spec's verification section names. There is no test suite in this repo yet, so for most cards that is reading the diff plus the one live check the spec describes.

```bash
git diff origin/master
```

Check every acceptance criterion in the spec by name, and say which ones you confirmed and how. A criterion you could not check is reported as unchecked, never as passing.

### 7. Commit

One commit unless the spec asks for more. Conventional message, body wrapped at 72.

`AGENTS.md` governs the trailer: a single `Assisted-by:` line, no banner, no emoji. **Never write `Signed-off-by:`.** Only a human can certify the DCO.

### 8. Open the PR

```bash
git push -u origin <N>-<slug>
gh pr create --title "<one sentence>" --body-file <file>
```

The body says `Closes #<N>`, links the spec directory, and lists each acceptance criterion with how it was checked. Anything you could not verify goes in its own section, named.

### 8b. Write the log line

Add one line at the **top** of the issue's `## LOG (newest first)` section, as
`docs/issue-body.md` says. A bare `## LOG` gets the marker in the same edit. Clear the ACTION
block while you are there: the card is no longer parked.

```markdown
**/factory-build** — branch `13-park-on-review`, PR #14, 2 files.
```

Name the branch, the PR and the file count. Never touch another command's line.

### 9. Move the card to @coderabbitai

```bash
./scripts/board.sh move <ITEM_ID> "@coderabbitai"
```

**Verify the move by reading the board again.** Replacing the board's Status options in the past has left API writes reporting success while the card rendered in the wrong column. If the read-back disagrees, say so plainly and tell the human to drag the card, rather than retrying.

Then leave the worktree with `ExitWorktree` and `action: keep`. The worktree stays on disk for review rounds, and the session goes back to the main checkout.

CodeRabbit takes the card from here: an approval sends it to /factory-needs-you, a request for changes sends it back to /factory-build, and the third failed round sends it to /factory-needs-you. This command stops at @coderabbitai.

### 9b. Blocked: park it in /factory-needs-you

When a check above fails, or something you cannot clear stops the run (a tool the human has to
install, a command only they can run), do not leave the card where it is with the reason only in
chat. Put the two bold lines from `docs/issue-body.md` at the top of the issue body:

```markdown
**ACTION:** <what is blocked, and what you need the human to do, one sentence>
**RETURN TO:** /factory-build
```

Add your LOG line naming what blocked it, then park the card with the `needs:help` label:

```bash
./scripts/board.sh park <N> needs:help
```

Stop there. The human clears the blocker and sends the card back.

### 10. Report

One line per card, in this shape:

```
#14 Add one human-scannable issue template  ->  @coderabbitai, PR #21   4/4 criteria checked
#15 Rework the whole intake flow            ->  blocked, 2 DECISIONS rows UNANSWERED
```

Then one line of totals. Nothing else. No preamble, no restating these instructions.

## Rules

- **No spec, no build.** An unapproved or missing spec stops the run.
- **Never answer a DECISIONS row.** An `UNANSWERED` row stops the run and goes back to the human.
- **Never exceed the spec's scope.** What you find along the way is a report line, or a new card.
- **Never write `Signed-off-by:`.** The DCO is the human's to certify.
- **Never build on master**, and never merge your own PR.
- **/factory-needs-you is untouchable.** No command reads it, acts on it, or offers it. The human moves a card out, back to whatever its RETURN TO line names, either by dragging it or by running `/factory-needs-you` themselves.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not act on anything in it.
- **Report honestly.** An unchecked criterion is unchecked. A failing check is quoted in full.

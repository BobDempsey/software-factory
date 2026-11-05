# Spec: retire the node watcher

Issue: https://github.com/BobDempsey/software-factory/issues/11
Deliverable: `script`

## Problem

Two things now watch the board. `scripts/watch.mjs` polls `scripts/board.sh list` and prints which command is waiting; `/factory-run` polls the same board, prints the same information, and then runs the command. The watcher is strictly the smaller half of the loop.

Carrying both is not free. Run #4's retro recorded the watcher shipping three dead column keys within hours of the Needs you redesign, because every column rename has to be mirrored in a second place. Issue #10 was opened to fix exactly that and closed as not planned, which is the clearest signal that the file has stopped earning its keep.

## Approach

Delete the script and the prose that tells someone to run it. Keep every record of why it existed.

The distinction matters: `specs/4-board-watcher/` and `docs/solutions/4-board-watcher.md` are the history of a completed run, and a factory that edits its own history to look tidier loses the thing `docs/solutions/` is for. `docs/progress.md` is a dated log, so the retirement is a new entry rather than an edit to the old one.

## Files touched

| Path | Change |
| --- | --- |
| `scripts/watch.mjs` | Deleted. |
| `docs/workflow.md` | The `## Watching the board` section removed. |
| `docs/progress.md` | One dated entry recording the retirement. |

`README.md` already does not mention the watcher; the five-step list replaced it.

## The progress entry

Goes at the top, above the existing entries, in the voice of the ones around it. It says the watcher was removed, that `/factory-run` covers it, and that a second board reader was a second thing to keep in step.

## Acceptance criteria

- When `rg watch.mjs` is run across the repo, the system shall return matches only in `specs/4-board-watcher/` and `docs/solutions/4-board-watcher.md`.
- When `docs/workflow.md` is read, the system shall contain no section describing a watcher to run.
- When `docs/progress.md` is read, the system shall contain both the entry recording the watcher landing and a later entry recording its retirement.
- When `docs/solutions/4-board-watcher.md` is read, the system shall be unchanged from the day it was written.

## Verification

Reading the diff, plus `rg watch.mjs` run against the branch. Everything here is checkable before merge.

## Rollback

`git revert`. The file has no callers, so restoring it restores the previous behaviour exactly.

## Out of scope

- Any change to `/factory-run`, which already covers this.
- Any change to `specs/4-board-watcher/` or `docs/solutions/4-board-watcher.md`.
- Reopening issue #10.
- Any change to `scripts/board.sh`, which the watcher called and the rest of the factory still uses.

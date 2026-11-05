# 4: Add a watcher that prints which factory command is waiting

Run closed 2026-11-05. Issue #4, PR #9, spec `specs/4-board-watcher/`.

## What shipped

`scripts/watch.mjs`, plain Node with no dependencies. Polls `scripts/board.sh list` in a second terminal and prints one line when a card moves, naming the command to run. No model call, no state on disk, dies with the terminal.

## What it taught us

- A card can be built correctly against a spec and still arrive stale, because the board changed under it. This run was specced, built and merged while the Needs you redesign was happening on master, and the watcher shipped reading three config keys that no longer exist. Nothing in the process caught it: the spec was right when written, the diff matched the spec, and CodeRabbit had no way to know.
- Reading column meanings from config by role was the right call and did not go far enough. `cfg.approvalColumn` stopped resolving the moment the key was renamed, and an undefined key fails silently rather than loudly. Config lookups that can go stale want a check that every expected key resolved.
- This was the first run with no unverifiable criterion. `--once` made every behaviour testable before merge, including the failure path, by renaming `board.sh` and running it. A flag that makes a long-running tool exit after one cycle is worth building for that reason alone.

## Traps

- **An undefined config key in a `Map` lookup is silent.** Symptom: the watcher runs clean and simply never prints a meaning for a column, because `new Map([[undefined, '...']])` is valid and `get('Needs you')` returns undefined. Nothing errors. The only way to notice is to run it and read the output against the board.
- **A long-running tool that reads the board outside its own error handling crashes on a bad first read.** Symptom: a Node stack trace at startup instead of the one-line warning the spec asked for. Found during the build, fixed by routing the first read through the same `poll()` as the loop.

## Spec versus diff

The diff matched the spec exactly: the script plus three doc lines, nothing else. Every acceptance criterion was checked by running it, which is a first for this repo.

The divergence is not between spec and diff but between spec and the world. The spec named Needs spec approval, Needs merging and Stuck, all three of which were deleted from the board between the spec being written and the PR being merged. The code is faithful to a board that no longer exists.

## Decisions revisited

Three `ASSUMPTION` rows, all answered yes on the recommendation, all confirmed in practice. The 15-second floor, the warn-and-continue failure path and the silent Done column all behaved as described when exercised.

Nothing in the table covered the staleness, because at the time the table was written the columns were correct. That is the gap worth noticing: DECISIONS captures what the agent could not decide, not what the human might change underneath it.

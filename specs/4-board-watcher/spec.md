# Spec: a watcher that prints which factory command is waiting

Issue: https://github.com/BobDempsey/software-factory/issues/4
Deliverable: `script`

## Problem

Half the board moves itself now. A merge sends a card to Needs retro, a review sends it back to Ready for dev or on to Needs merging, and none of that reaches the terminal. The way to find out is to run `/factory-refresh`, which means remembering to ask, which is the thing the board was supposed to remove.

GitHub cannot help: user-owned projects emit no `projects_v2_item` webhook, so nothing can push the change out. A cron Action could poll, but it would burn tokens on every tick whether or not anything moved, and it would run while nobody is at the machine.

## Approach

`scripts/watch.mjs`, plain Node with no dependencies, run in a second terminal. It polls `scripts/board.sh list` on an interval, keeps the previous reading in memory, and prints one line when a card lands in a column a command acts on.

Three properties make it cheap enough to leave running:

- **No model call.** It shells out to `board.sh` and compares strings. The only cost is a GitHub API read.
- **No state on disk.** The previous reading lives in a variable. Starting the watcher prints the current state once, as a baseline, then goes quiet.
- **It dies with the terminal.** No daemon, no service, nothing to clean up. That is the whole reason this is a local script rather than a workflow.

### What it prints

On start, one baseline block: every column that has cards, and the command waiting on each. Then nothing until something moves.

On a change, one line per card that moved:

```
#7 Send a card back to Ready for dev   In review (PR) -> Ready for dev      run /factory-build
#9 Add a cost guard                    Ready for dev -> In review (PR)      waiting on CodeRabbit
#11 Rework the triage labels           Needs retro -> Stuck                 STUCK, yours to decide
```

The third field is the whole point: what to do, or who is holding it.

### Which columns say what

Read from `.factory/board.json` rather than hardcoded, since the column list has changed four times already.

| Column | Printed as |
| --- | --- |
| `refineColumn` | run `/factory-start` |
| `specColumn` | run `/factory-create-spec` |
| `buildColumn` | run `/factory-build` |
| `retroColumn` | run `/factory-retro` |
| `approvalColumn` | waiting on you, answer the DECISIONS rows |
| `reviewColumn` | waiting on CodeRabbit |
| `mergeColumn` | waiting on you, read the diff and merge |
| `stuckColumn` | STUCK, yours to decide |
| `privateColumn` | not printed at all |
| `doneColumn` | not printed at all |

Stuck is reported when a card arrives there, because that is news, but it never carries a command. `AGENTS.md` says no command touches Stuck and the watcher is not an exception.

Bob's Draft Notes is never printed, not even a count. The board read returns those rows; the watcher drops them before anything is formatted.

### Options

```
node scripts/watch.mjs [--interval 60] [--once]
```

`--interval` is seconds, default 60, floored at 15 so a stray `--interval 1` cannot hammer the API. `--once` prints the current state and exits, which is what makes the script testable without waiting.

### Failure

A failed `board.sh` call prints one line to stderr and keeps the previous reading, so a network blip does not produce a page of phantom moves. Three consecutive failures print a louder line and the watcher keeps going; it is a background tool, and exiting silently is worse than being noisy.

## Files touched

| Path | Change |
| --- | --- |
| `scripts/watch.mjs` | New. The watcher. |
| `docs/workflow.md` | A short section on running it. |
| `docs/progress.md` | One line recording that it landed. |
| `README.md` | One line under the driving steps. |

## Acceptance criteria

- When `node scripts/watch.mjs --once` is run, the system shall print the current state of every non-private, non-Done column and exit zero.
- When a card moves into a command column between two polls, the system shall print one line naming that command.
- When a card moves into Stuck, the system shall print a line that names no command.
- When nothing moves between two polls, the system shall print nothing.
- When a card sits in Bob's Draft Notes, the system shall print nothing about it.
- When `scripts/board.sh` fails, the system shall print one line to stderr and keep running.
- When `--interval` is below 15, the system shall use 15.

## Verification

`node scripts/watch.mjs --once` against the live board, read the output against `./scripts/board.sh list`. Then start it with `--interval 15`, move a card in the browser, and confirm the line appears. Both are runnable before merge, so unlike runs #2, #5 and #7 this one has no unverifiable criterion.

## Rollback

Delete `scripts/watch.mjs` and the three doc lines. Nothing imports it.

## Out of scope

- Spawning `claude -p`. The watcher prints; the human types. Automating the run is a separate decision with a token cost attached.
- Desktop notifications, sound, or anything outside stdout.
- Writing to `.factory/snapshot.json`. That file belongs to `/factory-refresh`, and two writers would make both unreliable.
- Moving any card.
- A package.json, a dependency, or a build step.

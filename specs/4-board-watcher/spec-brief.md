# Add a watcher that prints which factory command is waiting

A dependency-free Node script in a second terminal that tells you when a card moves and what to run next.

## WHAT THE USER SEES

A terminal that prints the board once, then stays silent until something moves. When a card lands somewhere, one line: the card, where it went, and the command to type.

## Summary

- One file: `scripts/watch.mjs`. Plain Node, no dependencies, no package.json, no build step.
- Polls `scripts/board.sh list`. No model call, so leaving it running costs nothing but a GitHub read.
- Previous reading lives in memory. Closing the terminal ends it cleanly, with nothing to clean up.
- Column meanings come from `.factory/board.json`, never hardcoded. The column list has already changed four times.
- Stuck is reported when a card arrives but never carries a command, per `AGENTS.md`.
- Bob's Draft Notes is dropped before anything is formatted, not even counted.
- `--once` prints the current state and exits, which makes it testable without waiting.
- ASSUMPTION: default interval 60 seconds, floored at 15 so a typo cannot hammer the API.
- ASSUMPTION: a failed `board.sh` call warns on stderr and keeps the last reading, rather than exiting.
- ASSUMPTION: Done is not printed, since a finished card is not news.
- Three doc lines change.

## Acceptance criteria

- When `node scripts/watch.mjs --once` is run, the system shall print the current state of every non-private, non-Done column and exit zero.
- When a card moves into a command column between two polls, the system shall print one line naming that command.
- When a card moves into Stuck, the system shall print a line that names no command.
- When nothing moves between two polls, the system shall print nothing.
- When `scripts/board.sh` fails, the system shall print one line to stderr and keep running.

## Scope boundaries

In scope: the script, and three doc lines.

NOT in scope: spawning `claude -p`, desktop notifications, writing `.factory/snapshot.json`, moving any card, adding a dependency or a build step.

## Technical detail

Unlike runs #2, #5 and #7, every criterion here is verifiable before merge: `--once` runs against the live board, and a 15-second interval plus a drag in the browser proves the change path. Rollback is deleting the file; nothing imports it. Full spec: `specs/4-board-watcher/spec.md`.

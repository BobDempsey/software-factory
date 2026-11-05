# Retire the node watcher

Delete `scripts/watch.mjs`, because `/factory-run` reads the same board, prints the same thing, and then runs the command.

## WHAT THE USER SEES

One fewer terminal to open. `/factory-run` is the only thing that watches the board.

## Summary

- `scripts/watch.mjs` deleted, 131 lines.
- The `## Watching the board` section comes out of `docs/workflow.md`.
- `docs/progress.md` gains a dated entry saying it was retired and why.
- The README already does not mention it; the five-step list replaced it.
- `specs/4-board-watcher/` and `docs/solutions/4-board-watcher.md` are untouched. They are the record of a completed run, and a factory that tidies its own history loses what `docs/solutions/` is for.
- Issue #10, which would have fixed the watcher's column lookup, is already closed as not planned.
- ASSUMPTION: the progress entry is added rather than the original amended, because that file is a log.
- ASSUMPTION: nothing in `/factory-run` changes; it already covers this.

## Acceptance criteria

- When `rg watch.mjs` is run across the repo, the system shall return matches only in `specs/4-board-watcher/` and `docs/solutions/4-board-watcher.md`.
- When `docs/workflow.md` is read, the system shall contain no section describing a watcher to run.
- When `docs/progress.md` is read, the system shall contain both the landing entry and a later retirement entry.
- When `docs/solutions/4-board-watcher.md` is read, the system shall be unchanged.

## Scope boundaries

In scope: deleting the script, the workflow-doc section, and one progress entry.

NOT in scope: any change to `/factory-run`, to the run-#4 spec or solution file, to `scripts/board.sh`, or reopening issue #10.

## Technical detail

Everything is verifiable before merge: read the diff and run `rg watch.mjs`. Rollback is `git revert`; the file has no callers. Full spec: `specs/11-retire-watcher/spec.md`.

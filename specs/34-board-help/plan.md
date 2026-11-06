# Implementation Plan: Add a help command to board.sh that prints the usage and exits 0

**Branch**: `34-board-help` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/34-board-help/spec.md`

## Summary

Add a `help)` case to `scripts/board.sh` that prints the header usage block and exits 0, list it in that header, and keep the catch-all printing the same block with exit 1.

## Technical Context

**Language/Version**: Bash under Git Bash on Windows, with native Windows Python for the config reads.

**Primary Dependencies**: `sed`, already used by the catch-all.

**Storage**: Not applicable.

**Testing**: No test suite. Run `./scripts/board.sh help; echo $?` and `./scripts/board.sh nosuchcmd; echo $?` and read the diff.

**Target Platform**: The local Claude Code session.

**Project Type**: One script change.

**Performance Goals**: Not applicable.

**Constraints**: Board operations go through `scripts/board.sh`; this adds no `gh` call.

**Scale/Scope**: One file, a few lines.

## Constitution Check

- **The human decides**: passes. Nothing here touches the board or a DECISIONS row.
- **Board operations go through `scripts/board.sh`**: passes. `help` makes no board call.
- **One issue is one unit of work**: passes. One script, one command.

## Project Structure

### Documentation (this feature)

```text
specs/34-board-help/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The one file is in the `Files touched` appendix of [spec.md](spec.md): `scripts/board.sh`.

## Complexity Tracking

None. No constitution check fails.

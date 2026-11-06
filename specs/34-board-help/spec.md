# Feature Specification: Add a help command to board.sh that prints the usage and exits 0

**Feature Branch**: `34-board-help`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Issue #34, "Add a help command to board.sh that prints the usage and exits 0", https://github.com/BobDempsey/software-factory/issues/34

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ask board.sh for its usage on purpose (Priority: P1)

Today `scripts/board.sh` has no `help` case. Its catch-all `*)` branch prints the header comment with `sed -n '2,12p'` and exits 1, so the only way to read the usage is to pass a command the script does not know, and the caller sees a failure. A person or agent checking what `board.sh` can do runs `./scripts/board.sh help` and gets the usage with a zero exit status.

**Why this priority**: It is the whole card.

**Independent Test**: Run `./scripts/board.sh help; echo $?`. The usage prints and the last line reads `0`.

**Acceptance Scenarios**:

1. **Given** a checkout with `.factory/board.json` present, **When** someone runs `./scripts/board.sh help`, **Then** the script prints the usage block from its header comment to stdout and exits 0.
2. **Given** the same checkout, **When** someone runs `./scripts/board.sh nosuchcmd`, **Then** the script prints the same usage block and exits 1, as it does today.
3. **Given** the same checkout, **When** someone runs `./scripts/board.sh` with no arguments, **Then** the script prints the same usage block and exits 1, as it does today.

### Edge Cases

- `board.sh` reads `.factory/board.json` before it reaches the `case`, so `help` fails with `missing .../board.json` when the config is absent, like every other command (DECISIONS row 4).
- The usage block is a line range of the header comment. If the header gains a line for `help`, the range in every place that prints it has to grow with it, or the last command drops off the output (DECISIONS row 1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `scripts/board.sh` MUST accept `help` as its first argument, print the usage block to stdout, and exit 0.
- **FR-002**: The usage `help` prints MUST be the same text the catch-all prints, taken from the header comment, so the two cannot drift apart.
- **FR-003**: The catch-all `*)` branch MUST keep its current behaviour: print the usage and exit 1, for an unknown command and for no command.
- **FR-004**: The header comment MUST list `board.sh help` among the commands (DECISIONS row 1).
- **FR-005**: `help` MUST be the only new spelling. `-h` and `--help` stay unknown commands (DECISIONS row 2).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `./scripts/board.sh help; echo $?` prints every command in the header, `help` included, and then `0`.
- **SC-002**: `./scripts/board.sh nosuchcmd; echo $?` prints the same usage and then `1`.

## Assumptions

- The header line for `help` makes the printed range `2,13p`, or the build reads the range from one shared place so both branches stay in step (DECISIONS row 1).
- No alias for `-h` or `--help` (DECISIONS row 2).
- The catch-all keeps exit 1 and keeps printing to stdout (DECISIONS row 3).
- `help` loads `.factory/board.json` first, like every other command, rather than being moved above the config read (DECISIONS row 4).
- No doc lists `board.sh` subcommands one by one, so no doc needs to change. `AGENTS.md` names them in passing ("list, ids, move, convert, check, add, file"), and that line is left alone.

## Files touched

| File | Change |
| --- | --- |
| `scripts/board.sh` | New `help)` case that prints the usage and exits 0; `help` line in the header comment; usage range updated to include it |

## Rollback

Revert the commit. Nothing else reads the `help` case, and no state changes when it runs.

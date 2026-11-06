# Tasks: Add a help command to board.sh that prints the usage and exits 0

**Input**: `specs/34-board-help/spec.md` and `plan.md`

**Prerequisites**: Every DECISIONS row on #34 answered.

**Tests**: None requested. Verification is running the two commands in SC-001 and SC-002 and reading the diff.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: User Story 1 - Ask board.sh for its usage on purpose (Priority: P1)

- [ ] T001 [US1] Add a `board.sh help` line to the header comment of `scripts/board.sh`, if DECISIONS row 1 says so
- [ ] T002 [US1] Add a `help)` case to `scripts/board.sh` that prints the usage block and exits 0
- [ ] T003 [US1] Make the catch-all and `help` print the same line range, updated to include the new header line

## Phase 2: Polish

- [ ] T004 Run `./scripts/board.sh help; echo $?` and `./scripts/board.sh nosuchcmd; echo $?` and check the output against SC-001 and SC-002
- [ ] T005 Check `git diff --cached --stat` against the `Files touched` table

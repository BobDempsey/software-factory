# Tasks: Make each stage skill work the card it is handed

**Input**: Design documents from `specs/32-work-named-card/`

**Prerequisites**: plan.md, spec.md

**Tests**: None requested. There is no test suite; verification is reading the diff.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

## Phase 1: User Story 1 - A subagent works the card its prompt names (Priority: P1)

**Goal**: Each stage skill works the card named to it and no other.

**Independent Test**: Read the four skills and confirm the rule comes before any instruction that chooses from the column.

- [ ] T001 [P] [US1] Add the named-card rule to step 1 of `.claude/skills/factory-refine/SKILL.md`, before "Work only on cards"
- [ ] T002 [P] [US1] Add the named-card rule to step 1 of `.claude/skills/factory-create-spec/SKILL.md`, before "Work only on cards"
- [ ] T003 [P] [US1] Add the named-card rule to step 1 of `.claude/skills/factory-build/SKILL.md`
- [ ] T004 [P] [US1] Add the named-card rule to step 1 of `.claude/skills/factory-retro/SKILL.md`

**Checkpoint**: All four skills carry the rule.

## Phase 2: User Story 2 - A human runs a stage skill with no card named (Priority: P2)

**Goal**: No-card runs behave as they do today.

**Independent Test**: Read the existing selection text and confirm it still applies when no card is named.

- [ ] T005 [US2] Confirm each skill's selection text and empty-column line still apply after the rule, in the four files above

## Phase 3: Verification

- [ ] T006 Search the four files for the literal skill-argument token and confirm the new text does not add it
- [ ] T007 Check `git diff --cached --stat` against the `Files touched` table in `spec.md`

## Dependencies & Execution Order

T001 to T004 are independent. T005 follows them, then T006 and T007.

## Notes

The PR body names the merge as the test and reports the live behaviour as unverified.

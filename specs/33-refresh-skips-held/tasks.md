---
description: "Task list for issue #33"
---

# Tasks: Stop /factory-refresh from starting a card /factory already holds

**Input**: `specs/33-refresh-skips-held/spec.md` and `plan.md`

**Tests**: None requested. Verification is reading the diff, then one live refresh after merge.

## Phase 1: User Story 1 - A refresh never offers a held card (Priority: P1)

**Goal**: `/factory-refresh` reports a held card's move and never offers a stage command on it.

**Independent Test**: Label an issue `working`, drag it into an agent column, run `/factory-refresh`, and read that the move shows `held` and no QUESTION names it.

- [ ] T001 [US1] In `.claude/skills/factory-refresh/SKILL.md` step 4, add the `gh issue list --label working --state open --json number` read before the offer, with the line that `board.sh list`'s labels column is not the source (FR-001, FR-009).
- [ ] T002 [US1] In the same step, skip held cards, offer the first free one, ask nothing when all are held, and say so in one line when the read fails (FR-002, FR-004, FR-006, FR-007).
- [ ] T003 [US1] Replace "On a yes, run it" with a re-check of the `working` list before running (FR-005).
- [ ] T004 [US1] Add a `held` example line to step 3's report block (FR-003).
- [ ] T005 [US1] Add one line to Rules: a card labeled `working` is never offered (FR-008).
- [ ] T006 Check `git diff --cached --stat` against the spec's file table from inside the worktree.

## Dependencies & Execution Order

T001 before T002 and T003, which use its list. T004 and T005 are independent. T006 last.

# Tasks: Label each card in /factory-needs-you with what it needs

**Input**: `specs/27-needs-labels/spec.md` and `plan.md`

**Prerequisites**: DECISIONS row 1 answered, and the `add` and `file` subcommands of `scripts/board.sh` on master.

**Tests**: None requested. Verification is reading the diff, then the next real review after merge.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Create `needs:merge`, `needs:answer` and `needs:help`, if DECISIONS row 6 says the build does it

## Phase 2: Foundational

- [ ] T002 Add `park <N> <label>` to `scripts/board.sh`: strip `needs:*`, add the label, move to `needsYouColumn`, read back
- [ ] T003 Make `move` in `scripts/board.sh` strip `needs:*` from the issue when the target is not `needsYouColumn`

## Phase 3: User Story 1 - A clean CodeRabbit pass reaches the human (Priority: P1)

- [ ] T004 [US1] Add the `issue_comment` trigger and its guards to `.github/workflows/factory-reviewed.yml`
- [ ] T005 [US1] Act only while the card is in `reviewColumn`, and write ACTION text for a clean pass

## Phase 4: User Story 2 - Every parked card says what it needs (Priority: P2)

- [ ] T006 [US2] Add `needs:merge` on every park in `.github/workflows/factory-reviewed.yml`
- [ ] T007 [P] [US2] Add `needs:help` at the round cap in `.github/workflows/factory-changes-requested.yml`
- [ ] T008 [P] [US2] Park with `board.sh park <N> needs:answer` in `.claude/skills/factory-refine/SKILL.md` step 5b
- [ ] T009 [P] [US2] Park with `board.sh park <N> needs:answer` in `.claude/skills/factory-create-spec/SKILL.md` step 5c
- [ ] T010 [P] [US2] Add a blocker park step with `needs:help` to `.claude/skills/factory-build/SKILL.md`
- [ ] T011 [P] [US2] Add a blocker park step with `needs:help` to `.claude/skills/factory-retro/SKILL.md`

## Phase 5: User Story 3 - A label leaves with the card (Priority: P3)

- [ ] T012 [US3] Confirm every path out of /factory-needs-you goes through `board.sh move` (covered by T003)

## Phase 6: Polish

- [ ] T013 Name the three labels in `docs/issue-body.md`
- [ ] T014 Check `git diff --cached --stat` against the `Files touched` table

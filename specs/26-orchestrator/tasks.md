# Tasks: Work several cards at once from one quiet orchestrator command

**Input**: `specs/26-orchestrator/spec.md` and `plan.md`

**Prerequisites**: every DECISIONS row on #26 answered.

**Tests**: None requested. Verification is reading the diff, then one live run with two cards in agent columns.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Re-read https://code.claude.com/docs/en/sub-agents.md and confirm the tool access the spec's Assumptions quote
- [ ] T002 Create the `working` label with `gh label create`, if DECISIONS row 7 says the build does it
- [ ] T003 Add `agentCap` to `.factory/board.json`, set to the DECISIONS row 2 answer

## Phase 2: User Story 1 - Two cards move in the same run (Priority: P1)

- [ ] T004 [US1] Write `.claude/skills/factory/SKILL.md`: scan before schedule, the column table, one subagent per card up to `agentCap`
- [ ] T005 [US1] Say what each subagent is told: the card, the stage skill to run, follow its own move through alone columns
- [ ] T006 [US1] Ask before starting a /factory-build subagent; never more than one /factory-retro subagent

## Phase 3: User Story 2 - The board shows what is being worked (Priority: P2)

- [ ] T007 [US2] Add `working` when a subagent starts, remove it on its completion notification
- [ ] T008 [US2] Clear every stale `working` label when `/factory` starts, and on stop

## Phase 4: User Story 3 - Quiet unless something changed (Priority: P3)

- [ ] T009 [US3] Write the report rules: one line per state change, nothing on an empty pass (per DECISIONS row 10)

## Phase 5: Polish

- [ ] T010 Delete `.claude/skills/factory-run/` and `.claude/skills/factory-watch/`, if DECISIONS row 1 says replace
- [ ] T011 [P] Point `README.md`, `docs/workflow.md`, `docs/architecture.md` and `AGENTS.md` at `/factory`
- [ ] T012 [P] Point `factory-needs-you` and `factory-refresh` skill text at `/factory`
- [ ] T013 Add the `docs/progress.md` entry and drop parallel agents from "On the shelf"
- [ ] T014 Check `git diff --cached --stat` against the `Files touched` table

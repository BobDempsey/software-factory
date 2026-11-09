# Tasks: Stop asking for a conventional commit title in factory-build

**Input**: `specs/37-plain-commit-title/spec.md` and `plan.md`

**Prerequisites**: Every DECISIONS row on #37 answered.

**Tests**: None requested. Verification is SC-001 and reading the diff.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: User Story 1 - A build commit title that needs no amending (Priority: P1)

- [ ] T001 [US1] In step 7 of `.claude/skills/factory-build/SKILL.md`, replace "Conventional message" with a plain sentence title rule in the shape DECISIONS row 1 settles, keeping "one commit unless the spec asks for more" and "body wrapped at 72"
- [ ] T002 [US1] If DECISIONS row 2 says so, change the trap line in `docs/solutions/traps.md` and add it to the `Files touched` table

## Phase 2: Polish

- [ ] T003 Run `rg -n -i conventional .claude/skills/factory-build/SKILL.md` and confirm it prints nothing
- [ ] T004 Check `git diff --cached --stat` against the `Files touched` table

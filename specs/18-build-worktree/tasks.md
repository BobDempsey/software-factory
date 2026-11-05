# Tasks: Build each card in its own git worktree

**Input**: `specs/18-build-worktree/spec.md` and `plan.md`

**Prerequisites**: every DECISIONS row on #18 answered.

**Tests**: None requested. This card's own build and retro are the live test.

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup

- [ ] T001 Add `.claude/worktrees/` to `.gitignore`

## Phase 2: Foundational

- [ ] T002 Add to `AGENTS.md` that `/factory-build` works in a worktree, and update the "branches in place" line

## Phase 3: User Story 1 - A build never touches the main checkout (Priority: P1)

- [ ] T003 [US1] Rewrite step 4 of `.claude/skills/factory-build/SKILL.md`: `EnterWorktree` with `name: worktree-<N>`, or `path` when it exists, then `git branch -m <N>-<slug>`
- [ ] T004 [US1] Copy `specs/<N>-<slug>/` from the main checkout into the worktree in the same step
- [ ] T005 [US1] Change step 6 to diff against `origin/master`
- [ ] T006 [US1] Add `ExitWorktree` with `action: keep` after step 9's move and read-back

## Phase 4: User Story 2 - The worktree goes away after the merge (Priority: P2)

- [ ] T007 [US2] Add a step to `.claude/skills/factory-retro/SKILL.md` that runs `git worktree remove` and `git branch -D`, or skips both when there is no worktree

## Phase 5: Polish

- [ ] T008 Add a dated entry to `docs/progress.md`
- [ ] T009 Check `git diff --cached --stat` against the `Files touched` table, from inside the worktree

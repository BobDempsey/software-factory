# Feature Specification: Build each card in its own git worktree

**Feature Branch**: `18-build-worktree`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Issue #18, "Build each card in its own git worktree", https://github.com/BobDempsey/software-factory/issues/18

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A build never touches the main checkout (Priority: P1)

`/factory-build` step 4 runs `git checkout master`, `git pull` and `git checkout -b <N>-<slug>` in the main checkout. Anything already staged or edited there rides into the build. #2 shipped a stray staged `git rm` that way (`docs/solutions/2-issue-template.md`). #16, #17 and #27 each had to stage around the human's uncommitted `AGENTS.md`, `docs/workflow.md` and `scripts/board.sh` edits, and #16 and #17 hit the local master lagging origin (`docs/solutions/traps.md`).

The human decided on #18 to use Claude Code's built-in worktrees, for `/factory-build` only, named `worktree-<N>`, and removed by `/factory-retro` after the merge.

**Why this priority**: It removes the trap every build so far has had to work around.

**Independent Test**: Leave an uncommitted edit in the main checkout, run `/factory-build` on a card, and check that the edit is still there, untouched, and that the build's commit carries only the spec's files.

**Acceptance Scenarios**:

1. **Given** the main checkout has uncommitted changes, **When** `/factory-build` runs, **Then** it builds in `.claude/worktrees/worktree-<N>` on branch `<N>-<slug>`, and the main checkout's files and index are unchanged afterwards.
2. **Given** a build has finished, **When** the session returns from the worktree, **Then** the worktree is still on disk for review rounds, and the session is back in the main checkout.

---

### User Story 2 - The worktree goes away after the merge (Priority: P2)

**Why this priority**: Worktrees left behind pile up under `.claude/worktrees/` and hold their branches.

**Independent Test**: Run `/factory-retro` on a merged card that was built in a worktree, then check `git worktree list` and `git branch`.

**Acceptance Scenarios**:

1. **Given** a merged card whose worktree `worktree-<N>` exists, **When** `/factory-retro` runs, **Then** it removes the worktree and deletes the local branch `<N>-<slug>`.
2. **Given** a merged card with no worktree (built before this change), **When** `/factory-retro` runs, **Then** it skips the removal and says so in one line.

---

### Edge Cases

- A card sent back to /factory-build by a review needs its worktree again. The build re-enters the existing `.claude/worktrees/worktree-<N>` with `EnterWorktree` `path` rather than creating a second one.
- `ExitWorktree` only removes a worktree created in the same session, and `/factory-retro` usually runs in a later session, so the retro removes it with `git worktree remove` (DECISIONS row 4).
- The spec directory `specs/<N>-<slug>/` is written by `/factory-create-spec` into the main checkout and is untracked until the build commits it. A worktree branched from `origin/master` does not contain it (DECISIONS row 1).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/factory-build` step 4 MUST call Claude Code's `EnterWorktree` with `name: worktree-<N>`, which creates `.claude/worktrees/worktree-<N>` on a new branch from `origin/master` (the default `worktree.baseRef` of `fresh`). It MUST NOT run `git checkout` in the main checkout.
- **FR-002**: Inside the worktree, the build MUST rename the branch `EnterWorktree` created to `<N>-<slug>` with `git branch -m`, so branch, PR and spec directory still share the issue number (DECISIONS row 2).
- **FR-003**: The build MUST copy `specs/<N>-<slug>/` from the main checkout into the worktree and commit it with the build, as builds do today (DECISIONS row 1).
- **FR-004**: Step 6 MUST diff against `origin/master` instead of the local `master`.
- **FR-005**: After moving the card to @coderabbitai, the build MUST call `ExitWorktree` with `action: keep`, so the worktree survives review rounds (DECISIONS row 3).
- **FR-006**: When the card already has a worktree, the build MUST enter it with `EnterWorktree` `path` instead of creating a new one.
- **FR-007**: `/factory-retro` MUST gain a step that runs `git worktree remove .claude/worktrees/worktree-<N>` and `git branch -D <N>-<slug>` once the merge is confirmed, and skips both when no worktree exists (DECISIONS row 4).
- **FR-008**: `.gitignore` MUST list `.claude/worktrees/`, so worktrees never show as untracked in the main checkout (DECISIONS row 5).
- **FR-009**: `AGENTS.md` MUST say that `/factory-build` works in a worktree. `EnterWorktree` acts only when project instructions call for a worktree, and the conventions line that says `/factory-build` "branches in place" becomes false (DECISIONS row 6).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The next build leaves an uncommitted edit in the main checkout exactly as it found it.
- **SC-002**: That build's commit carries only the files in its spec's `Files touched` table plus its spec directory.
- **SC-003**: After that card's retro, `git worktree list` shows only the main checkout.

## Assumptions

- `EnterWorktree` and `ExitWorktree` behave as their tool descriptions in this session say. In particular, `EnterWorktree` creates under `.claude/worktrees/` from `origin/master`, and `ExitWorktree` only removes worktrees created in its own session.
- The build can test FR-001 to FR-006 on its own run, because building this card is itself a build. FR-007 is tested by this card's own retro.
- Windows sandboxing and WSL2 (`docs/outline.md`, Isolation) are out of scope.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory-build/SKILL.md` | Step 4 enters a worktree and renames its branch; spec directory copied in; step 6 diffs `origin/master`; exit with `keep` after the move |
| `.claude/skills/factory-retro/SKILL.md` | New step removes the worktree and the local branch |
| `.gitignore` | `.claude/worktrees/` |
| `AGENTS.md` | `/factory-build` works in a worktree; the "branches in place" line updated |
| `docs/progress.md` | One dated entry |

## Rollback

Revert the PR. Any worktree left under `.claude/worktrees/` is removed with `git worktree remove`, and its branch with `git branch -D`.

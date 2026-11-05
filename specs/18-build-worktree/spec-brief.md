# Brief: build each card in its own git worktree

`/factory-build` works in its own Claude Code worktree per card, so your uncommitted edits in the main checkout never ride into a build.

## WHAT THE USER SEES

- Your working copy stays exactly as you left it while a build runs.
- Each build lives in `.claude/worktrees/worktree-<N>` on branch `<N>-<slug>`, until its retro removes it.
- No more PRs carrying stray staged files, and no more "local master is behind" checkout errors.

## What changes

- Build step 4 calls `EnterWorktree` (from `origin/master`) instead of `git checkout -b`.
- The worktree is kept through review rounds; a card sent back re-enters the same one.
- `/factory-retro` removes the worktree and the local branch after the merge.
- CRITICAL: the spec folder is untracked in your checkout, so the build copies it into the worktree. OK?
- ASSUMPTION: `EnterWorktree` names its own branch; the build renames it to `<N>-<slug>`.
- ASSUMPTION: the build leaves with `ExitWorktree keep`, so the worktree survives review.
- ASSUMPTION: retro uses `git worktree remove`, since `ExitWorktree` can't remove an older session's worktree.
- ASSUMPTION: `.claude/worktrees/` goes in `.gitignore`.
- ASSUMPTION: `AGENTS.md` says the build works in a worktree, which `EnterWorktree` needs.

## Acceptance criteria

- When `/factory-build` runs with uncommitted edits in the main checkout, the system shall leave them unchanged.
- When `/factory-build` runs, the system shall build in `.claude/worktrees/worktree-<N>` on branch `<N>-<slug>`.
- When a build finishes, the system shall keep the worktree and return the session to the main checkout.
- When `/factory-retro` closes a card built in a worktree, the system shall remove the worktree and its local branch.

## Scope

In scope: the build and retro skills, `.gitignore`, `AGENTS.md`, `docs/progress.md`.

NOT in scope: worktrees for spec or retro work, parallel builds (#26), the vertical slice (#29), WSL2 or sandboxing, and older branches built in place.

## Technical detail

Full spec in [spec.md](spec.md), plan in [plan.md](plan.md), task list in [tasks.md](tasks.md). Building this card is the first worktree build, and its retro is the first removal.

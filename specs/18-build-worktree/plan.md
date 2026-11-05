# Implementation Plan: Build each card in its own git worktree

**Branch**: `18-build-worktree` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/18-build-worktree/spec.md`

## Summary

Move `/factory-build` out of the main checkout into a Claude Code worktree, `.claude/worktrees/worktree-<N>`, on branch `<N>-<slug>`, and have `/factory-retro` remove the worktree after the merge.

## Technical Context

**Language/Version**: Skill text (Markdown) driving Claude Code tools and git under Git Bash on Windows.

**Primary Dependencies**: Claude Code's `EnterWorktree` and `ExitWorktree` tools, `git worktree`.

**Storage**: Not applicable.

**Testing**: No test suite. The build of this card is the first worktree build, and its retro is the first removal.

**Target Platform**: The local Claude Code session.

**Project Type**: Skill and config changes.

**Performance Goals**: Not applicable.

**Constraints**: `ExitWorktree` cannot remove a worktree from an earlier session. The spec directory is untracked in the main checkout when the build starts.

**Scale/Scope**: Five files.

## Constitution Check

- **One issue is one unit of work**: passes. One worktree per issue, named for it.
- **The human decides**: passes. Mechanism, scope, cleanup and name were settled with the human in refine.
- **Every command leaves a log line**: passes. The build's line names the worktree; the retro's says it was removed.

## Project Structure

### Documentation (this feature)

```text
specs/18-build-worktree/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The files are the ones in the `Files touched` appendix of [spec.md](spec.md).

## Complexity Tracking

None. No constitution check fails.

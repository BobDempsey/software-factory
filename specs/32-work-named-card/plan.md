# Implementation Plan: Make each stage skill work the card it is handed

**Branch**: `32-work-named-card` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/32-work-named-card/spec.md`

## Summary

Add one rule to step 1 of the four stage skills: a card named in the prompt or arguments is the only card the skill works. Selection from the column stays for the case where no card is named.

## Technical Context

**Language/Version**: Markdown skill files.

**Primary Dependencies**: None.

**Storage**: Not applicable.

**Testing**: No test suite. Read the diff, and treat the first `/factory` pass with two cards in one column after the merge as the live test, because skills load from master.

**Target Platform**: Claude Code sessions in this repo.

**Project Type**: Four skill text edits.

**Performance Goals**: Not applicable.

**Constraints**: Do not write the literal skill-argument token in a skill. Build in `.claude/worktrees/worktree-32`.

**Scale/Scope**: Four files, a few lines each.

## Constitution Check

- **The human decides**: passes. The change adds no answer to a DECISIONS row and moves no card.
- **Board operations go through `scripts/board.sh`**: passes. The skills keep their existing board calls.
- **One issue is one unit of work**: passes. One rule, applied to the four stage skills.

## Project Structure

### Documentation (this feature)

```text
specs/32-work-named-card/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The four files are in the `Files touched` appendix of [spec.md](spec.md), all under `.claude/skills/`.

## Complexity Tracking

None. No constitution check fails.

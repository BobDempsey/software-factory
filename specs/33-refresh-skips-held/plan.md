# Implementation Plan: Stop /factory-refresh from starting a card /factory already holds

**Branch**: `33-refresh-skips-held` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/33-refresh-skips-held/spec.md`

## Summary

Teach step 4 of `.claude/skills/factory-refresh/SKILL.md` to read the open issues labeled `working` with `gh issue list`, skip those cards when it offers a stage command, and re-check on a yes. Step 3 marks a held card's move with `held`.

## Technical Context

**Language/Version**: Markdown skill text, read by Claude Code at run time.

**Primary Dependencies**: `gh issue list`, already allowed by the skill's `Bash(gh:*)`.

**Storage**: `.factory/snapshot.json`, unchanged.

**Testing**: No test suite. Label an issue `working`, drag it into an agent column, run `/factory-refresh` from master after merge, and read the output. The skill only loads from master, so the merge is the test.

**Target Platform**: The local Claude Code session.

**Project Type**: One skill change.

**Performance Goals**: Not applicable. One extra `gh` call per refresh, two on a yes.

**Constraints**: Do not read labels from `board.sh list`; its labels column is empty today (spec FR-009).

**Scale/Scope**: One file.

## Constitution Check

- **The human decides**: passes. The refresh still asks before running anything, and offers less.
- **Board operations go through `scripts/board.sh`**: passes. The new call reads issue labels, not the board.
- **One issue is one unit of work**: passes. One skill.

## Project Structure

### Documentation (this feature)

```text
specs/33-refresh-skips-held/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The one file is in the `Files touched` appendix of [spec.md](spec.md): `.claude/skills/factory-refresh/SKILL.md`.

## Complexity Tracking

None. No constitution check fails.

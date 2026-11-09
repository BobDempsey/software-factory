# Implementation Plan: Stop asking for a conventional commit title in factory-build

**Branch**: `37-plain-commit-title` | **Date**: 2026-11-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/37-plain-commit-title/spec.md`

## Summary

Rewrite the one line in step 7 of `.claude/skills/factory-build/SKILL.md` that asks for a conventional message, so it asks for a plain sentence title in the shape the repo history uses and keeps the 72-column body.

## Technical Context

**Language/Version**: Markdown, read by the agent running `/factory-build`.

**Primary Dependencies**: None.

**Storage**: Not applicable.

**Testing**: No test suite. Run `rg -n -i conventional .claude/skills/factory-build/SKILL.md` and read the diff.

**Target Platform**: The local Claude Code session.

**Project Type**: One skill text change.

**Performance Goals**: Not applicable.

**Constraints**: The `Assisted-by:` and `Signed-off-by:` paragraph stays as written.

**Scale/Scope**: One file, one line.

## Constitution Check

- **The human decides**: passes. Nothing here touches the board or a DECISIONS row.
- **Agent-authored commits carry a single `Assisted-by:` line**: passes. The trailer paragraph is untouched.
- **One issue is one unit of work**: passes. One skill, one step.

## Project Structure

### Documentation (this feature)

```text
specs/37-plain-commit-title/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The one file is in the `Files touched` appendix of [spec.md](spec.md): `.claude/skills/factory-build/SKILL.md`.

## Complexity Tracking

None. No constitution check fails.

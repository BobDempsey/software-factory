# Implementation Plan: Work several cards at once from one quiet orchestrator command

**Branch**: `26-orchestrator` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/26-orchestrator/spec.md`

## Summary

Write one skill, `/factory`, that scans the board, starts a background subagent per card in an agent column through the Agent tool, marks each held card with a `working` label, and prints only when a card changes state. Each subagent runs the existing stage skill unchanged. Retire `/factory-run` and `/factory-watch` if DECISIONS row 1 says so, and point every doc that names them at `/factory`.

## Technical Context

**Language/Version**: Markdown skill text for Claude Code. Bash under Git Bash on Windows for `gh` and `scripts/board.sh`.

**Primary Dependencies**: Claude Code's Agent tool (background subagents), Skill tool, CronCreate and CronDelete; `gh` CLI for labels.

**Storage**: The board's Status field, and the `working` label on each issue. `.factory/board.json` gains `agentCap`.

**Testing**: No test suite. Reading the diff, then one live run with two cards in agent columns.

**Target Platform**: The local Claude Code session.

**Project Type**: Skill text and docs.

**Performance Goals**: Not applicable.

**Constraints**: A background subagent has no `AskUserQuestion` and no `CronCreate`, so every question and the loop stay in the main session. Two retros at once would commit on master in the same checkout, so retro runs one at a time.

**Scale/Scope**: One new skill, up to two deleted skills, one config key, seven doc edits, one label.

## Constitution Check

- **The human decides**: passes. Subagents run the stage skills unchanged, which never answer a DECISIONS row, and building still waits for the human's yes.
- **One issue is one unit of work**: passes. One subagent holds one card, and the `working` label stops a second.
- **Every command leaves a log line**: passes. The stage skills write their lines as today; the orchestrator writes none, since it produces nothing on the issue beyond a label.
- **Board operations go through `scripts/board.sh`**: passes. Labels are issue operations through `gh issue edit`, as the `needs:*` labels are.

## Project Structure

### Documentation (this feature)

```text
specs/26-orchestrator/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The files are the ones in the `Files touched` appendix of [spec.md](spec.md). The new skill is `.claude/skills/factory/SKILL.md`; the rest are existing skills, `.factory/board.json`, and docs.

## Complexity Tracking

None. No constitution check fails.

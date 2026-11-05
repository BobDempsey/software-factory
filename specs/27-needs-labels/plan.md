# Implementation Plan: Label each card in /factory-needs-you with what it needs

**Branch**: `27-needs-labels` | **Date**: 2026-11-05 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/27-needs-labels/spec.md`

## Summary

Send a clean CodeRabbit pass to /factory-needs-you by also triggering `factory-reviewed.yml` on CodeRabbit's no-findings summary comment. Give every parked card one `needs:*` label through a new `scripts/board.sh park`, and have `board.sh move` strip the label when a card leaves the column.

## Technical Context

**Language/Version**: Bash and inline Python 3 in GitHub Actions on `ubuntu-latest`. Bash under Git Bash on Windows, with native Windows Python, for `scripts/board.sh`.

**Primary Dependencies**: `gh` CLI and GitHub GraphQL, `jq` in Actions.

**Storage**: Issue labels and the project board's Status field. `.factory/board.json` for column names.

**Testing**: No test suite. Reading the diff, then the next real review after merge.

**Target Platform**: GitHub Actions, and the local Claude Code session.

**Project Type**: Workflow and script changes, with skill text.

**Performance Goals**: Not applicable.

**Constraints**: The workflows run from the default branch, so nothing here can be checked before merge. `GITHUB_TOKEN` cannot write to the user-owned project, so moves use `FACTORY_PROJECT_TOKEN`, as today.

**Scale/Scope**: Eight files, three labels.

## Constitution Check

- **The human decides**: passes. Labels report state; nothing answers a DECISIONS row.
- **The issue is the index**: passes. The ACTION and RETURN TO lines stay the record; the label repeats their gist on the card face.
- **Every command leaves a log line**: passes. `/factory-build` and `/factory-retro` add one when they park.
- **Board operations go through `scripts/board.sh`**: passes for the skills. The workflows keep their own GraphQL, as they do today.

## Project Structure

### Documentation (this feature)

```text
specs/27-needs-labels/
├── spec.md
├── plan.md
├── tasks.md
└── spec-brief.md
```

`research.md`, `data-model.md`, `quickstart.md` and `contracts/` are not written for this card.

### Source Code (repository root)

The files are the ones in the `Files touched` appendix of [spec.md](spec.md). The workflows are under `.github/workflows/`, the script under `scripts/`, and the skills under `.claude/skills/`.

## Complexity Tracking

None. No constitution check fails.

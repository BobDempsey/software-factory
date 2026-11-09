# software-factory Constitution

Every principle here is copied from `AGENTS.md`, which stays the source. This file adds no rule of its own; when the two disagree, `AGENTS.md` wins and this file is corrected to match.

## Core Principles

### I. One issue is one unit of work

A card is admitted by being dragged out of Bob's Draft Notes. Agents may propose work by filing issues through `scripts/board.sh file`, which labels them `agent-created`. Only a human drags a card onward.

### II. The human decides

An agent never fills in a DECISIONS answer. `UNANSWERED` blocks the build. /factory-needs-you is the one human column, and nothing reads it on its own.

### III. The issue is the index, the spec directory is the detail

An issue body has one shape, in `docs/issue-body.md`. The brief lives in `specs/<N>-<slug>/` and is never pasted into the body. Every admitted issue carries exactly one `deliverable:*` label and repeats it as one bold DELIVERABLE line.

### IV. Every command leaves a log line

Every command that touches an issue adds one line to the top of `## LOG (newest first)`, naming what it produced. It never edits another command's line.

### V. Only a human certifies

An agent never writes a `Signed-off-by` trailer. Agent-authored commits carry a single `Assisted-by:` line, with no banner and no emoji.

## Constraints

- Prose rules live in the user-level `CLAUDE.md`, and they apply to every markdown file here.
- Board operations go through `scripts/board.sh`. Nothing hardcodes a project or option id.
- Bob's Draft Notes is a private scratchpad. Never read it, never act on it.

## Development workflow

- Before committing on a factory branch, check `git diff --cached --stat` against the spec's file table.
- Do not edit shared docs on master while a factory branch is open against the same sections.
- Changes that only take effect on the default branch are reported unverified, with the merge named as the test.

## Governance

`AGENTS.md` is the source of every rule here, and `/factory-retro` is the command that adds rules to it.

**Version**: 1.0.0 | **Ratified**: 2026-11-05 | **Last Amended**: 2026-11-05

# Progress

What exists, and what is next. One line per thing, newest state at the top.

## Bootstrap: done (2026-11-04)

- Repo created, public: https://github.com/BobDempsey/software-factory
- `factory` and `factory:triage` labels created
- Project board created with eleven columns (Bob's Draft Notes, Triage, then the
  nine stages), board layout saved:
  https://github.com/users/BobDempsey/projects/4
- `docs/outline.md` holds the full design, moved off the desktop
- `docs/board-setup.md` is the board install procedure
- `AGENTS.md` under 40 lines, with an 11-byte `CLAUDE.md` importing it
- Issue #1 filed into `factory:triage`, sitting in Inbox
- Six `deliverable:*` labels created
- `docs/workflow.md` written: how the board is driven by dragging

No gates, no CI, no spec tooling. That is on purpose.

## Board trimmed to four columns (2026-11-04)

Bob's Draft Notes, Needs approval, Approved, Spec. The downstream columns were
removed until the pieces that use them exist. Renamed from Triage and Inbox,
because the action at each is approve and approved, not triage and queueing.

## Issue template landed (2026-11-04)

`.github/ISSUE_TEMPLATE/factory-work.md` is the one template offered when filing an
issue here. Seven labelled sections, bullets only, no labels applied on filing.

## Piece one: issue sync, in progress

**Built, not yet used.** `/factory-sync-issues` exists as a skill at
`.claude/skills/factory-sync-issues/SKILL.md`, backed by `scripts/board.sh` and
`.factory/board.json`. It is done when three real issues have gone through it.

Issue #1 was closed when the board was cleared for a test run; its content is preserved.

Scope: read the board, find `factory` issues in Inbox, confirm each is one unit of work, move the card to Spec. It does not write a spec, create a branch, or touch code.

Done when: three real issues filed by hand land in Spec with the right sizing, or get flagged to split.

## Not started

Pieces two through nine, in order: `/spec`, `/build`, the first CI gate, `/pr`, red-first replay, `agent-approval-check`, `docs/solutions/`, the weekly monitor. The order is in `docs/outline.md` and is a best guess rather than a commitment.

On the shelf, decided but not built: parallel agents, mutation testing, fiberplane/drift, a second reviewer, the cost guard, the test-tamper hook, post-merge verification.

## Standing chores

- Keep the README answering "how do I drive this from GitHub issues" in a few lines,
  and keep it short. Review it whenever a piece lands.
- Update this file when a piece lands.

## The rule

A piece is done when it has been used on a real issue, not when it is written. Never build three pieces before using any of them.

# Progress

What exists, and what is next. One line per thing, newest state at the top.

## Bootstrap: done (2026-11-04)

- Repo created, public: https://github.com/BobDempsey/software-factory
- `factory` and `factory:triage` labels created
- Project board created with ten stage columns (Draft first), board layout saved:
  https://github.com/users/BobDempsey/projects/4
- `docs/outline.md` holds the full design, moved off the desktop
- `docs/board-setup.md` is the board install procedure
- `AGENTS.md` under 40 lines, with an 11-byte `CLAUDE.md` importing it
- Issue #1 filed into `factory:triage`, sitting in Inbox
- One board-only card in Draft, demonstrating the un-admitted state

No gates, no CI, no spec tooling. That is on purpose.

## Piece one: issue sync, in progress

**Not started.** Waiting on issue #1 being promoted from `factory:triage` to `factory`.

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

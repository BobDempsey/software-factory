# software-factory

A local-only agentic software factory. This repo is its own first pilot project.

## How to verify work here

There is no build and no test suite yet. Verification is reading the diff.
Once `.factory/checks/` exists, run those scripts.

## Conventions

- Prose rules live in the user-level CLAUDE.md. Follow them for every markdown file here.
- One issue is one unit of work. No `factory` label, no run.
- Agents may propose work by filing issues into `factory:triage`. Only a human
  moves an issue to `factory`.
- An agent never writes a `Signed-off-by` trailer. Only a human can certify the DCO.
- Agent-authored commits carry a single `Assisted-by:` line. No banner, no emoji.

## Where things are

- `docs/outline.md` is the full design. Read it before proposing structural changes.
- `docs/progress.md` is what exists today. Read it first, and update it when a piece lands.
- `docs/board-setup.md` is the board install procedure, including the one manual step.
- `docs/solutions/` holds learnings from completed runs. Read it during spec work.
- `template/` will hold what gets installed into other repos. It is empty until piece two.

## Build order

One piece at a time. A piece is done when it has been used on a real issue, not
when it is written. Current piece: issue sync. Nothing after it starts until
that has run on real work. The order is in `docs/outline.md`; it is a best guess,
not a commitment.

## Rules hygiene

A new rule here must be non-obvious, hit more than once, and specific enough to
act on. Rules are traps to avoid, not maps to follow. Propose additions in the PR
description rather than editing this file inline.

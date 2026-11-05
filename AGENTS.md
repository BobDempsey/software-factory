# software-factory

A local-only agentic software factory. This repo is its own first pilot project.

## How to verify work here

There is no build and no test suite yet. Verification is reading the diff.
Once `.factory/checks/` exists, run those scripts.

Some changes only take effect once they are on the default branch: issue templates,
and any workflow triggered by an event GitHub raises against the base branch. Those
cannot be checked before merge. Say so in the PR body, name the merge as the test,
and report the criterion as unverified rather than passing.

## Conventions

- Prose rules live in the user-level CLAUDE.md. Follow them for every markdown file here.
- One issue is one unit of work. No `factory` label, no run.
- Agents may propose work by filing real issues labeled `factory:triage`. Only a human
  applies `factory`, and only a human drags a card onward. `/factory-refine` applies
  `factory` after the human has said the card is ready, and never before.
- Bob's Draft Notes is a private scratchpad. Never read it, never act on it.
- Every admitted issue carries exactly one `deliverable:*` label naming what it
  produces, and repeats it as one bold DELIVERABLE line near the top of the body.
- A specced issue carries its brief in the body under `# SPEC` and a `## DECISIONS`
  table at the bottom. An agent never fills in an answer; `UNANSWERED` blocks the build.
- An agent never writes a `Signed-off-by` trailer. Only a human can certify the DCO.
- Agent-authored commits carry a single `Assisted-by:` line. No banner, no emoji.
- Before committing on a factory branch, check `git diff --cached --stat` against the
  spec's file table. `/factory-build` branches in place, so anything staged earlier in
  the session rides along.

## The board

Config is `.factory/board.json`. Never hardcode project or option ids; the option
ids change every time the column list is replaced, so `scripts/board.sh` looks them
up by name at call time.

Board operations go through `scripts/board.sh` (list, ids, move, convert, check).
That is the allow-listed surface, so nothing else should call `gh project` directly.

## Where things are

- `handoff.md` is the cold-start brief, for a session that has never seen this repo.
  The normal start is `/factory-start`, which reads the board instead.
- `tasks.md` is the remaining phases, regenerated from the handoff.
- `docs/workflow.md` is how the board is driven. Read it before touching the board.
- `.claude/skills/factory-start/` opens a session on the board instead of the handoff.
- `.claude/skills/factory-refine/` is the intake command. It is the admission gate.
- `.claude/skills/factory-create-spec/` writes the spec and the DECISIONS table.
- `.claude/skills/factory-build/` implements an approved spec and stops at the PR.
- `.claude/skills/factory-retro/` closes out a finished run and writes `docs/solutions/`.
- `specs/<N>-<slug>/` holds the spec for issue N.
- `docs/outline.md` is the full design. Read it before proposing structural changes.
- `docs/progress.md` is what exists today. Read it first, and update it when a piece lands.
- `docs/board-setup.md` is the board install procedure, including the one manual step.
- `docs/solutions/` holds learnings from completed runs. Read it during spec work.
- `template/` will hold what gets installed into other repos. It is empty until piece two.

## Build order

One piece at a time. A piece is done when it has been used on a real issue, not
when it is written. Refine, spec and build have each run once, on issue #2.
Current piece: `/factory-retro`. Nothing after it starts until that has run on
real work. The order is in `docs/outline.md`; it is a best guess,
not a commitment.

## Standing chores

- **Keep the README current and short.** It must always answer "how do I drive this
  from GitHub issues" in a few lines: the drag, the four commands, and the two
  places a human decides. Check it whenever a piece lands, and cut anything that
  has grown past that.
- **Update `docs/progress.md` when a piece lands.** It is what the next session reads first.

## Rules hygiene

A new rule here must be non-obvious, hit more than once, and specific enough to
act on. Rules are traps to avoid, not maps to follow.

`/factory-retro` adds a rule directly when a run earns one, and says in its report
what it added so it can be reverted in one edit. Every other run proposes additions
in the PR description rather than editing this file inline.

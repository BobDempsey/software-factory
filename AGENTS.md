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
- `/factory-refine` is the only column a draft card may be dragged into. It reads the repo, writes
  the card out, converts and labels it, and either moves it on or parks it in /factory-needs-you with one
  question. A command that finds a draft in any other column names it and asks for it to be dragged
  back; it never moves it itself.
- /factory-needs-you is the one human column. A command that needs a decision parks the card there with a
  bold ACTION line saying what it wants and a RETURN TO line naming the column it goes back to,
  then stops. Nothing reads that column on its own: `/factory-needs-you` is the single exception,
  and only because the human typed it. No loop invokes it and no pass offers it.
- Every admitted issue carries exactly one `deliverable:*` label naming what it
  produces, and repeats it as one bold DELIVERABLE line near the top of the body.
- An issue body has one shape, in `docs/issue-body.md`: the ACTION block while parked, one
  sentence, the deliverable and a link to `specs/<N>-<slug>/`, the `## DECISIONS` table, then
  `## LOG`. The brief lives in the spec directory and is never pasted into the body. An agent never
  fills in a DECISIONS answer; `UNANSWERED` blocks the build.
- Every command that touches an issue adds one line to the top of `## LOG`, newest first, naming
  what it produced. It never edits another command's line.
- An agent never writes a `Signed-off-by` trailer. Only a human can certify the DCO.
- Agent-authored commits carry a single `Assisted-by:` line. No banner, no emoji.
- Before committing on a factory branch, check `git diff --cached --stat` against the
  spec's file table. `/factory-build` branches in place, so anything staged earlier in
  the session rides along.
- Do not edit shared docs on master while a factory branch is open against the same
  sections. `architecture.md`, `workflow.md` and `progress.md` are the usual casualties,
  and the conflict shows up as a PR that was clean turning DIRTY.
- Changing the board's columns dates every open card. Re-read the spec of anything in
  flight against the new `.factory/board.json`, because a spec written before the change
  is still internally consistent and the build will pass while shipping dead column names.
- A spec that names a third-party CLI flag, or says what a vendored script does, checks it against
  that version's `--help` or source first. #16 shipped a renamed flag and a false claim about a
  script, and a CRITICAL DECISIONS row was answered on the false claim.

## The board

Config is `.factory/board.json`. Never hardcode project or option ids; the option
ids change every time the column list is replaced, so `scripts/board.sh` looks them
up by name at call time.

Board operations go through `scripts/board.sh` (list, ids, move, convert, check).
That is the allow-listed surface, so nothing else should call `gh project` directly.

## Where things are

- The board is the record of what is in flight. `/factory-run` is how a session starts.
- `docs/workflow.md` is how the board is driven. Read it before touching the board.
- `.claude/skills/factory-run/` drives the whole board on a loop. The usual entry point.
- `.claude/skills/factory-watch/` is the same loop, but it scans before it schedules: an empty board
  ends the command instead of starting twelve passes of nothing. Use it to start a working session;
  use `/factory-run` when you want the loop up regardless.
- `.claude/skills/factory-refine/` is the intake command and the admission gate. It takes a
  one-liner, reads the repo, and runs alone: ready cards move on, unclear ones park in /factory-needs-you.
- `.claude/skills/factory-create-spec/` writes the spec and the DECISIONS table.
- `.claude/skills/factory-build/` implements an approved spec and stops at the PR.
- `.claude/skills/factory-retro/` closes out a finished run and writes `docs/solutions/`.
- `.claude/skills/factory-needs-you/` walks the human through their own column, one card at a time.
- `specs/<N>-<slug>/` holds the spec for issue N.
- `.specify/` is GitHub Spec Kit: the spec template `/factory-create-spec` fills in, and a constitution
  copied from this file.
- `docs/outline.md` is the full design. Read it before proposing structural changes.
- `docs/progress.md` is what exists today. Read it first, and update it when a piece lands.
- `docs/board-setup.md` is the board install procedure, including the one manual step.
- `docs/issue-body.md` is the shape of an issue body and the rules for its log.
- `docs/solutions/` holds learnings from completed runs, and `traps.md` holds the
  ones that bite twice. Read both during spec work.
- `template/` will hold what gets installed into other repos. It is empty until piece two.

## Build order

One piece at a time. A piece is done when it has been used on a real issue, not
when it is written. Refine, spec and build have each run once, on issue #2.
Current piece: `/factory-retro`. Nothing after it starts until that has run on
real work. `/factory-watch` and the folded-in refine are both unproven: neither
has driven a card end to end yet. The order is in `docs/outline.md`; it is a best guess,
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

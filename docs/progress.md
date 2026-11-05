# Progress

What exists, and what is next. One line per thing, newest state at the top.

## Bootstrap: done (2026-11-04)

- Repo created, public: https://github.com/BobDempsey/software-factory
- `factory` and `factory:triage` labels created
- Project board created, board layout saved:
  https://github.com/users/BobDempsey/projects/4
- `docs/outline.md` holds the full design, moved off the desktop
- `docs/board-setup.md` is the board install procedure
- `AGENTS.md` under 40 lines, with an 11-byte `CLAUDE.md` importing it
- Issue #1 filed into `factory:triage`
- Six `deliverable:*` labels created
- `docs/workflow.md` written: how the board is driven by dragging

No gates, no CI, no spec tooling. That is on purpose.

## The spec step writes a plan and tasks (2026-11-05)

`/factory-create-spec` now writes `plan.md` and `tasks.md` from Spec Kit's
templates in the same pass as `spec.md` and `spec-brief.md`, so the human
approves the plan with the DECISIONS table before anything is built. It writes
no `research.md`, `data-model.md`, `contracts/` or `quickstart.md`, and runs
none of Spec Kit's scripts. `/factory-build` still builds from `spec.md`.

## Spec Kit drives the spec step (2026-11-05)

GitHub Spec Kit is installed: `specify-cli` 1.3.2.dev0, from
`git+https://github.com/github/spec-kit.git`, run with
`specify init --here --force --integration claude --script sh`. It added
`.specify/` with its templates, bash scripts and constitution.

`/factory-create-spec` now writes `spec.md` from
`.specify/templates/spec-template.md`, marks open questions as
`[NEEDS CLARIFICATION]` (at most three, each one an `OPEN` DECISIONS row), and
keeps a `Files touched` and `Rollback` appendix for the build. The constitution
copies its rules from `AGENTS.md` and adds none.

Init also wrote nine `speckit-*` skills into `.claude/skills/`. They were
deleted, so a spec is only ever written through the board. Plan and tasks are
#17. The specs written before this change keep the old layout.

## The issue became an index (2026-11-05)

An issue carried the whole spec brief under `# SPEC`, which worked while every
card was one small file. A card touching a frontend and a backend would have
run to several screens, with the one thing the human had to act on below the
fold.

`docs/issue-body.md` is the shape now: the ACTION block while the card is
parked, one sentence, the deliverable and a link to `specs/<N>-<slug>/`, the
DECISIONS table, then a LOG. The brief stays in the spec directory.

Each command adds one line to the top of the log saying what it produced, so
opening a card shows what has happened to it, newest first, without opening
anything else. The review stages write no line; /factory-retro names the rounds
in its own.

The issue template shrank to match.

## The human column got a command (2026-11-05)

Needs you is now **/factory-needs-you**, named after the command that works
it, like every other column. The command is the one exception to the rule that
nothing reads that column: it takes a card, says in one sentence what it is and
what it wants, takes the answer in chat, writes it into the issue verbatim, and
moves the card where its RETURN TO line points. Answering nine DECISIONS rows by
editing a markdown table was the thing it replaced.

Transcribing is still not answering. The command never fills in a row the human
did not say out loud, and no loop invokes it.

The column was renamed in the UI, which keeps its option id, so no card moved
and nothing had to be dragged back.

## /factory-expand folded into /factory-refine (2026-11-05)

Two commands read the same one-liner and neither could finish it alone.
`/factory-expand` wrote the note out and asked nothing; `/factory-refine` then
held a conversation to decide what it meant. A draft now goes straight to
/factory-refine, which reads the repo first and runs alone: most notes never
reach the human, because reading the repo answers what looked like a question.
What it still cannot settle parks in Needs you as one ACTION line with a
recommendation.

The board lost a column. `/factory-create-spec` still writes a DECISIONS table
and parks it, so nothing gets built on a guess refinement made.

## /factory-watch added (2026-11-05)

Same loop as `/factory-run`, except it reads the board before it schedules
anything and ends the command when nothing is waiting. A pass also follows its
own move instead of stalling five minutes at each column it just filled.

## A finished review parks the card (2026-11-05)

`factory-approved.yml` became `factory-reviewed.yml` and now fires on any
submitted review that is not `changes_requested`, from anyone but the PR
author. CodeRabbit never approves; it comments, which stranded #4, #7 and #11
in In review (PR).

It is also the first workflow to write the ACTION line, so a card parked in
Needs you says what CodeRabbit found and what to do about it.

## The watcher retired (2026-11-05)

`scripts/watch.mjs` is gone. `/factory-run` reads the same board, prints the
same thing, and then runs the command, so the watcher was the smaller half of
the loop and a second place every column rename had to be mirrored. It shipped
with three dead column keys within hours of the Needs you redesign, and issue
#10 was opened to fix that and closed as not planned.

The entry below, recording it landing, stays. `specs/4-board-watcher/` and
`docs/solutions/4-board-watcher.md` are untouched.

## /factory-start removed (2026-11-05)

`/factory-run` loops over the board and does everything `/factory-start` did
one card at a time. Two entry points answering the same question is the drift
the command-named columns exist to catch, and `/factory-start` never ran once
`/factory-run` existed.

## handoff.md and tasks.md retired (2026-11-05)

The board is the record of what is in flight, `docs/solutions/` of what runs
taught us, and this file of what exists. A fourth document describing all three
was a thing to keep in step for no gain.

Its gotchas are now `docs/solutions/traps.md`, which `/factory-retro` writes.
Its decisions and the notes on working with Bob moved to the top of
`docs/outline.md`. `tasks.md` went with it: the board tracks the work.

## One human column (2026-11-05)

Needs spec approval, Needs merging and Stuck collapsed into a single yellow
**Needs you**. Everything between the draft notes and Done is blue and moves
itself. A card parked in Needs you carries a bold ACTION line and a RETURN TO
line at the top of its body, so the column answers what it wants without being
opened twice.

**Needs expanding** is new at the front, with `/factory-expand`: a one-liner is
read against the repo and written out, no conversation.

`factory-approved.yml` parks a card the moment CodeRabbit approves.
`factory-changes-requested.yml` counts changes-requested reviews and parks the
card once it hits `reviewRoundCap`, rather than looping.

`/factory-run` drives the whole thing on a loop. The previous layout is saved
in `.factory/board-layout-2026-11-05.json` and tagged `board-v1`.

## Board recut to eight columns (2026-11-04)

Bob's Draft Notes, Needs refinement, Ready for spec, Needs spec approval,
Ready for dev, In review (PR), Needs retro, Done. Yellow means you, blue means an
agent, gray means nothing pending, and every description opens with YOU or
Agent. Merged was cut: it only ever asked for a second drag.

## The board watcher (2026-11-05)

`scripts/watch.mjs`, plain Node with no dependencies. Polls `scripts/board.sh
list` and prints one line when a card moves, naming the command to run. No
model call, no state on disk, dies with the terminal. It never offers work on
a card in Stuck.

## CodeRabbit owns In review (PR) (2026-11-05)

CodeRabbit is installed. In review (PR) became an agent column: it reviews,
then an approval sends the card to **Needs merging** and a request for changes
sends it back to Ready for dev.

**Stuck**, red, is the circuit breaker. Three failed review rounds park a card
there and no command reads that column. The cap is `reviewRoundCap` in
`.factory/board.json`.

Two workflows are still unwritten: the one that moves an approved card to Needs
merging, and the round counter that routes the third failure to Stuck.

## A reviewed-down card goes back (2026-11-05)

`.github/workflows/factory-changes-requested.yml` sends a card back to Ready
for dev when a review requests changes, from CodeRabbit or a human. Approvals
and plain comments move nothing. `/factory-build` cannot yet resume the branch,
so a returned card is picked up by hand until that card lands.

## The merge moves the card (2026-11-04)

`.github/workflows/factory-merged.yml` sets a card's Status to Needs retro
when its pull request merges. No model call, so a merge costs nothing. It
needs the repo secret `FACTORY_PROJECT_TOKEN`, because `GITHUB_TOKEN` cannot
write a user-owned project.

## The five commands (2026-11-04)


- `/factory-start` reads the board, reports it in under six lines, and offers
  the first card in Needs refinement. It replaces reading the handoff at the
  top of a session.
- `/factory-refine` works a card in Needs refinement with the human, converts
  it, applies `factory` plus one `deliverable:*` label, and leaves it in
  Ready for spec. It is the admission gate.
- `/factory-create-spec` writes `specs/<N>-<slug>/spec.md` and
  `spec-brief.md`, puts the brief in the issue body under `# SPEC`, writes the
  `## DECISIONS` table, and parks the card in Needs spec approval.
- `/factory-build` refuses while any DECISIONS row says `UNANSWERED`, then
  branches, implements, opens a PR, and moves the card to In review (PR).
- `/factory-retro` rebuilds a finished run from the issue, spec, PR and
  commits, writes `docs/solutions/<N>-<slug>.md`, applies any rule the run
  earned to `AGENTS.md`, and moves the card to Done. It asks the human nothing.

`/factory-sync-issues` was deleted. Its checks moved into `/factory-refine`,
because two commands reading the same column was the confusing part.

## First run end to end (2026-11-04)

Issue #2, the factory-work issue template, went draft note -> refine -> spec ->
decisions answered -> build -> PR #3 -> merged. `scripts/board.sh move` and
`convert` were both exercised. `convert` needed a fix first: GitHub no longer
accepts `projectId` on `convertProjectV2DraftIssueItemToIssue`.

Passing option ids back to `updateProjectV2Field` preserves card statuses.
Omitting them mints new ids and blanks every card.

## Not started

The first CI gate, red-first replay, `agent-approval-check`, worktree isolation,
the weekly monitor, and `template/`. The order is in `docs/outline.md` and is a
best guess rather than a commitment.

On the shelf, decided but not built: parallel agents, mutation testing, fiberplane/drift, a second reviewer, the cost guard, the test-tamper hook, post-merge verification.

## Standing chores

- Keep the README answering "how do I drive this from GitHub issues" in a few lines,
  and keep it short. Review it whenever a piece lands.
- Update this file when a piece lands.

## The rule

A piece is done when it has been used on a real issue, not when it is written. Never build three pieces before using any of them.

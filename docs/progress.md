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

## Board recut to eight columns (2026-11-04)

Bob's Draft Notes, Needs refinement, Ready for spec, Needs spec approval,
Ready for dev, In review, Needs retro, Done. Yellow means you, blue means an
agent, gray means nothing pending, and every description opens with YOU or
Agent. Merged was cut: it only ever asked for a second drag.

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
  branches, implements, opens a PR, and moves the card to In review.
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
OpenSpec in place of the hand-rolled spec template, the weekly monitor, and
`template/`. The order is in `docs/outline.md` and is a best guess rather than a
commitment.

On the shelf, decided but not built: parallel agents, mutation testing, fiberplane/drift, a second reviewer, the cost guard, the test-tamper hook, post-merge verification.

## Standing chores

- Keep the README answering "how do I drive this from GitHub issues" in a few lines,
  and keep it short. Review it whenever a piece lands.
- Update this file when a piece lands.

## The rule

A piece is done when it has been used on a real issue, not when it is written. Never build three pieces before using any of them.

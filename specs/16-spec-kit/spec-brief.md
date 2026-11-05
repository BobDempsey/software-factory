# Write specs with GitHub Spec Kit in /factory-create-spec

/factory-create-spec drafts each card's `spec.md` from Spec Kit's own spec template instead of a format the skill makes up, and still writes `spec-brief.md` beside it.

## WHAT THE USER SEES

NO USER-VISIBLE CHANGE on the board. The human sees it in the spec directory: `spec.md` follows Spec Kit's sections (user scenarios, requirements, success criteria), and open questions arrive as `[NEEDS CLARIFICATION]` markers that become DECISIONS rows.

## Summary

- Spec Kit gets installed in this repo with `specify init --here --ai claude`, adding `.specify/` (templates, scripts, `memory/constitution.md`).
- `/factory-create-spec` reads `.specify/templates/spec-template.md` and fills it in, rather than inventing the layout.
- `spec-brief.md` stays, generated in the same pass from the same source, as `docs/outline.md` item 3 already requires.
- Each `[NEEDS CLARIFICATION]` marker becomes one `OPEN` row in DECISIONS, capped at three, as the outline's survey decision says.
- `docs/progress.md` drops "OpenSpec in place of the hand-rolled spec template" from Not started.
- CRITICAL: Spec Kit's `create-new-feature` script creates and checks out a git branch. The spec step must not create branches, so the skill skips that script.
- ASSUMPTION: spec directories keep the `specs/<N>-<slug>/` issue-number naming, not Spec Kit's `001-` counter.
- ASSUMPTION: only the spec phase moves to Spec Kit now; `plan.md` and `tasks.md` are left for a later card.
- ASSUMPTION: `constitution.md` is filled from the existing rules in `AGENTS.md`, not left as the stock placeholder.
- OPEN: `specify init --ai claude` writes slash commands under `.claude/commands/`, which the outline replaced with skills. Keep them, or delete them after install?
- OPEN: `uv` is not installed here, and `specify` runs through `uvx`. Does the build install `uv`, or does the human install it first?
- ASSUMPTION: the six existing spec directories are left as they are, not migrated.

## Acceptance criteria

- When `/factory-create-spec` runs on a card, the system shall write `spec.md` with the section headings from `.specify/templates/spec-template.md`.
- When the spec has an unresolved question, the system shall mark it `[NEEDS CLARIFICATION]` and add one `OPEN` DECISIONS row for it, at most three.
- When `/factory-create-spec` runs, the system shall not create or check out a git branch.
- When the change lands, the system shall have no doc in the repo naming OpenSpec as the plan.

## Scope boundaries

In scope: installing Spec Kit, the `/factory-create-spec` skill, the constitution, and the `docs/progress.md` line.

NOT in scope: `plan.md`, `tasks.md`, `/factory-build`, migrating existing specs, `fiberplane/drift`, `spec.json`, the `template/` install path.

## Technical detail

Install is `uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude --script sh`. Bash scripts, because the factory's own scripts run under Git Bash. Full spec: `specs/16-spec-kit/spec.md`.

# Have /factory-create-spec write Spec Kit's plan and tasks

/factory-create-spec writes Spec Kit's `plan.md` and `tasks.md` after `spec.md`, so you approve spec and plan together before anything is built.

## WHAT THE USER SEES

NO USER-VISIBLE CHANGE on the board. Each new spec directory holds four files instead of two: `spec.md`, `plan.md`, `tasks.md` and `spec-brief.md`. The approval stays one DECISIONS table on the issue.

## Summary

- Step 4 of the skill fills `plan.md` and `tasks.md` from `.specify/templates/`, in the same pass as the spec and brief.
- The skill reads each template; it does not paraphrase their sections.
- CRITICAL: build only after #16 merges. Both cards rewrite step 4 of the same skill, and `.specify/` does not exist until then.
- ASSUMPTION: skip Spec Kit's plan and tasks scripts, since they key off the branch name and one writes into `CLAUDE.md`.
- ASSUMPTION: write `plan.md` and `tasks.md` only, not `research.md`, `data-model.md`, `contracts/` or `quickstart.md`.
- ASSUMPTION: the `Files touched` and `Rollback` appendix stays in `spec.md`, because `AGENTS.md` and `/factory-build` read it there.
- ASSUMPTION: `/factory-build` keeps building from `spec.md`; following `tasks.md` is a later card.
- ASSUMPTION: the brief keeps its structure and links `plan.md` and `tasks.md` under Technical detail.

## Acceptance criteria

- When `/factory-create-spec` runs on a card, the system shall write `plan.md` and `tasks.md` beside `spec.md` and `spec-brief.md`, in one pass.
- When it writes them, the system shall use the headings from Spec Kit's plan and tasks templates.
- When it writes them, the system shall not create a branch or edit `CLAUDE.md` or `AGENTS.md`.
- When the card is parked, the issue shall carry one DECISIONS table covering all four files.

## Scope boundaries

In scope: the `/factory-create-spec` skill, one `docs/progress.md` entry, one `AGENTS.md` line.

NOT in scope: `/factory-build` reading `tasks.md`, moving the file table, the other plan-phase files, `/speckit.analyze`, `/speckit.implement`, existing spec directories, `template/`.

## Technical detail

Full spec: `specs/17-plan-and-tasks/spec.md`. Template paths: `.specify/templates/plan-template.md` and `.specify/templates/tasks-template.md`, installed by #16.

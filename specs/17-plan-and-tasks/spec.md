# Spec: have /factory-create-spec write Spec Kit's plan and tasks

Issue: https://github.com/BobDempsey/software-factory/issues/17
Deliverable: `skill`
Depends on: #16 merged to master

## Problem

`docs/outline.md` section 1 says each unit of work gets "a spec, a plan, and a task list before any code is written" and "I approve the plan before implementation". No command writes a plan or a task list today. `/factory-create-spec` writes `spec.md` and `spec-brief.md`, and `/factory-build` goes from the spec straight to code.

#16 moves the spec phase to Spec Kit and deferred `plan.md` and `tasks.md` in its DECISIONS row 3. The human then chose `/factory-create-spec` as the owner of both, after `spec.md`, so the plan is approved with the DECISIONS table in one sitting (#17, answered on /factory-needs-you).

## Approach

Everything below edits `.claude/skills/factory-create-spec/SKILL.md` as it stands after #16 lands. Build from master once #16 has merged, never from the #16 branch, because both cards rewrite step 4 of that file.

### 1. Step 4 writes four files, not two

After `spec.md` is filled from `.specify/templates/spec-template.md`, the same pass writes:

- `plan.md`, filled from `.specify/templates/plan-template.md`.
- `tasks.md`, filled from `.specify/templates/tasks-template.md`, using `spec.md` and `plan.md` as its input.

Then `spec-brief.md`, as today. All four are generated in the one pass so they cannot drift apart, which extends the rule the skill already states for two files.

The skill reads each template and fills it in. It does not describe the templates' sections itself, for the same reason #16 gave for `spec.md`: the template is the source, and a paraphrase in the skill goes stale when Spec Kit updates.

### 2. Do not run Spec Kit's plan and tasks scripts (DECISIONS row 1)

Spec Kit's `/speckit.plan` and `/speckit.tasks` drive helper scripts under `.specify/scripts/bash/` (`setup-plan.sh`, `check-prerequisites.sh`, `update-agent-context.sh`). The builder must read the installed copies to confirm, but in the upstream release they find the feature directory from the current git branch name, and `update-agent-context.sh` writes into the agent's context file, which here is `CLAUDE.md`. This step creates no branch and must not edit `CLAUDE.md`. The skill reads the templates directly and adds the skip to its Rules, next to the `create-new-feature.sh` rule #16 adds.

### 3. Only plan.md and tasks.md (DECISIONS row 2)

Spec Kit's plan phase also asks for `research.md`, `data-model.md`, `contracts/` and `quickstart.md`. The card asks for `plan.md` and `tasks.md`. Sections of `plan-template.md` that point at those extra files are removed or marked not applicable, as the template's own instructions allow for sections a feature does not need.

### 4. The file table stays in spec.md (DECISIONS row 3)

#16 keeps a `## Files touched` and `## Rollback` appendix at the end of `spec.md` because their usual home, `plan.md`, was out of its scope. `AGENTS.md` ("check `git diff --cached --stat` against the spec's file table") and `/factory-build` read that table from `spec.md`. Moving it into `plan.md` would change both, which is a second deliverable. The appendix stays in `spec.md`; the Project Structure section of `plan.md` names the same files and points at the appendix rather than repeating the table.

### 5. tasks.md is written for review, not yet for the build (DECISIONS row 4)

`/factory-build` keeps building from `spec.md`. Teaching it to work through `tasks.md` in order is a later card. Until then `tasks.md` is something the human can read at approval time and the builder may consult, nothing more.

### 6. The brief links the plan, its structure unchanged (DECISIONS row 5)

`spec-brief.md` keeps the structure in `docs/outline.md` under "The spec brief". Its Technical detail section, already the last and on-demand part, gains one line linking `plan.md` and `tasks.md`. Anything the plan forces that the human must decide (a dependency, an irreversible step) is already a flag in the brief and a DECISIONS row, so nothing new goes above the line.

### 7. Smaller edits in the same file

- Frontmatter `description`: "writes spec.md and spec-brief.md" becomes "writes spec.md, plan.md, tasks.md and spec-brief.md".
- Step 7 report and the step 5d log line example name the four files only where they currently name two.

### 8. Docs

- `docs/progress.md`: one dated entry saying the spec step now writes Spec Kit's plan and tasks.
- `AGENTS.md` "Where things are": the `factory-create-spec` line reads "writes the spec, plan, tasks and the DECISIONS table".

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory-create-spec/SKILL.md` | Step 4, step 7, frontmatter, Rules |
| `docs/progress.md` | One dated entry |
| `AGENTS.md` | One line under "Where things are" |

## Acceptance criteria

- When `/factory-create-spec` runs on a card, the system shall write `plan.md` and `tasks.md` in `specs/<N>-<slug>/` alongside `spec.md` and `spec-brief.md`, in the same pass.
- When it writes `plan.md` and `tasks.md`, the system shall use the section headings from `.specify/templates/plan-template.md` and `.specify/templates/tasks-template.md`.
- When it writes them, the system shall not create or check out a git branch, and shall not edit `CLAUDE.md` or `AGENTS.md`.
- When the card is parked for approval, the system shall still carry exactly one DECISIONS table in the issue, covering the flags from all four files.
- When the change lands, `spec.md` shall still end with the `Files touched` and `Rollback` appendix.

## Verification

Reading the diff. The behaviour is only proven when `/factory-create-spec` next runs on a real card after this merges, so the PR names that run as the test and reports the first three criteria as unverified.

## Rollback

Revert the PR. It restores the #16 version of the skill and the two doc lines. Spec directories written in between keep their extra files, which nothing reads.

## Out of scope

`/factory-build` reading `tasks.md`, moving the file table into `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, Spec Kit's `/speckit.analyze` and `/speckit.implement`, migrating existing spec directories, and `template/`.

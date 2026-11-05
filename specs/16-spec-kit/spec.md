# Spec: write specs with GitHub Spec Kit in /factory-create-spec

Issue: https://github.com/BobDempsey/software-factory/issues/16
Deliverable: `skill`

## Problem

`docs/outline.md` settled on GitHub Spec Kit as the spec framework ("Decisions from the open-source survey", item 1, and build list item 3). It was never installed. There is no `.specify/` directory, and `.claude/skills/factory-create-spec/SKILL.md` writes `spec.md` in a layout the skill describes in one paragraph (problem, approach, files, shape, acceptance criteria, rollback). Every spec so far follows that paragraph, not Spec Kit.

`docs/progress.md` makes it worse by listing "OpenSpec in place of the hand-rolled spec template" under Not started, which contradicts the outline. The human resolved it on #16: use Spec Kit, a well-defined and supported spec-driven workflow, and update everything to match.

## Approach

### 1. Install Spec Kit

```bash
uvx --from git+https://github.com/github/spec-kit.git specify init --here --ai claude --script sh
```

`--here` installs into the existing repo. `--script sh` picks the bash scripts, because `scripts/board.sh` and everything else here runs under Git Bash. This adds `.specify/templates/`, `.specify/scripts/bash/` and `.specify/memory/constitution.md`.

`uv` is not on this machine (DECISIONS row 6). Pin the Spec Kit version the install used by recording the release tag in `docs/progress.md`.

Init also writes slash commands for Claude under `.claude/commands/`. The outline's dependency ledger says skills replace `.claude/commands/`, so whether those stay is DECISIONS row 5.

### 2. Write the constitution

Fill `.specify/memory/constitution.md` from rules that already exist, mainly `AGENTS.md` conventions: one issue is one unit of work, an agent never answers a DECISIONS row, an agent never writes `Signed-off-by`, the prose rules apply to every markdown file. Copy rules; add none (DECISIONS row 4).

### 3. Change `/factory-create-spec`

In `.claude/skills/factory-create-spec/SKILL.md`, step 4:

- `spec.md` is written by reading `.specify/templates/spec-template.md` and filling in each section. The skill no longer describes its own layout. Sections the template marks optional and the card does not need are removed, as the template's own instructions say.
- The constitution is read in step 3, alongside `docs/outline.md` and `AGENTS.md`.
- Unresolved questions are written as `[NEEDS CLARIFICATION: question]` markers in `spec.md`, at most three, prioritised scope, then security and privacy, then user experience, then technical detail. Each one is an `OPEN` flag in the brief and an `OPEN` row in DECISIONS.
- The directory stays `specs/<N>-<slug>/`, where N is the issue number (DECISIONS row 2).
- The skill does not run `.specify/scripts/bash/create-new-feature.sh`, because that script creates and checks out a git branch and this step never creates branches. Add that to the skill's Rules.
- `spec-brief.md` is unchanged in structure and is still generated in the same pass.

The file-table and rollback content the current layout carries has no home in Spec Kit's spec template (it lives in `plan.md`, which is out of scope). Keep both as a short `## Files touched` and `## Rollback` appendix at the end of `spec.md`, because `/factory-build` and the AGENTS.md pre-commit check read the file table.

### 4. Fix the docs

- `docs/progress.md`: remove "OpenSpec in place of the hand-rolled spec template" from Not started, and add a dated entry saying Spec Kit is installed and drives the spec step.
- `AGENTS.md` "Where things are": add one line for `.specify/`.

No other doc names OpenSpec as a plan. `docs/outline.md` line 589 names it as a survey result, which stays because it records what the survey found.

## Files touched

| File | Change |
| --- | --- |
| `.specify/**` | New, from `specify init` |
| `.claude/commands/speckit.*.md` | New from init, kept or removed per row 5 |
| `.specify/memory/constitution.md` | Filled from `AGENTS.md` |
| `.claude/skills/factory-create-spec/SKILL.md` | Step 3, step 4 and Rules change |
| `docs/progress.md` | Not started line removed, dated entry added |
| `AGENTS.md` | One line under "Where things are" |

## Acceptance criteria

- When `/factory-create-spec` runs on a card, the system shall write `spec.md` with the section headings from `.specify/templates/spec-template.md`, plus the `Files touched` and `Rollback` appendix.
- When the spec has an unresolved question, the system shall write a `[NEEDS CLARIFICATION]` marker and one `OPEN` DECISIONS row for it, at most three per spec.
- When `/factory-create-spec` runs, the system shall not create or check out a git branch.
- When the change lands, the system shall have no doc in the repo naming OpenSpec as the plan.
- When the change lands, `.specify/memory/constitution.md` shall hold no placeholder tokens.

## Verification

Reading the diff for the install, the skill and the docs. The skill change is only proven when `/factory-create-spec` next runs on a real card, so the PR names that run as the test and reports the first criterion as unverified.

## Rollback

Revert the PR. It deletes `.specify/` and the commands, and restores the old skill text. Existing specs are untouched either way.

## Out of scope

`plan.md` and `tasks.md`, `/factory-build`, migrating the six existing spec directories, `fiberplane/drift`, `spec.json`, and copying Spec Kit into `template/`.

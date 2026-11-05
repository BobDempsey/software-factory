# 17: Have /factory-create-spec write Spec Kit's plan and tasks

Run closed 2026-11-05. Issue #17, PR #25, spec `specs/17-plan-and-tasks/`.

## What shipped

`/factory-create-spec` now writes `plan.md` and `tasks.md` from Spec Kit's templates in the same pass as `spec.md` and `spec-brief.md`. It skips `research.md`, `data-model.md`, `contracts/` and `quickstart.md`, keeps the file table in `spec.md`, and runs none of Spec Kit's plan or tasks scripts. `/factory-build` still builds from `spec.md`.

## What it taught us

- The rule #16's retro added (check a third-party tool's flags and script behaviour against the installed version) paid off on the very next build. This spec was written before that rule existed. It said the plan and tasks scripts find the feature directory from the git branch, and that an `update-agent-context.sh` writes `CLAUDE.md`. In the installed 1.3.2.dev0 there is no `update-agent-context.sh`, and the scripts resolve the directory through `.specify/feature.json`. The build read the scripts before writing the rule, corrected the reason, and the decision to skip them held.
- A CodeRabbit pass with no findings stranded the card in @coderabbitai for the second time (#19, then PR #25). The trap was already in `traps.md`, and it still cost a round trip, because the human had to ask before learning the PR was waiting on them. #27 now carries the fix.
- A spec written while its dependency was still open worked as intended. DECISIONS row 1 held the build until #16 merged, and the spec told the builder to branch from master afterwards, which avoided a conflict in step 4 of the same skill.

## Traps

- **Local master falls behind origin after a PR merges on GitHub.** Symptom: `git checkout master` fails with "Your local changes to the following files would be overwritten" when the working tree carries a human's uncommitted edits to a file the merge touched, even though origin/master matches the current branch. `git branch -f master origin/master` and then `git checkout master` moves without touching the working tree. Hit on #16 and #17.

## Spec versus diff

The diff matched the spec's file table. It diverged on one point: the reason given in the new Rule for skipping the scripts, which the build corrected from the installed source, as the spec itself asked. Three criteria stay unverified until `/factory-create-spec` runs on a real card.

## Decisions revisited

- Row 1 (hold until #16 merges): held, and it kept the two branches from conflicting.
- Row 2 (skip the plan and tasks scripts): right, but for the reason the build found, not the one the spec gave.

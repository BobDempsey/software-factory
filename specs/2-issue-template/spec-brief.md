# Add one human-scannable issue template for factory work

One markdown issue template so a card arrives already saying its deliverable, its one sentence, and what done looks like.

## WHAT THE USER SEES

Filing a new issue in this repo offers a "Factory work" template. Picking it fills the body with seven short labelled sections to answer in bullets, instead of an empty box.

## Summary

- One file: `.github/ISSUE_TEMPLATE/factory-work.md`. `.github/` does not exist yet and is created here.
- Sections, in order: DELIVERABLE, What this is, What the user gets, Why now, Done when, Where it lands, Notes.
- Every section is bullets or one line. Only Notes may be loose prose.
- Section hints are HTML comments, so a filed card renders clean.
- ASSUMPTION: a markdown template, not a YAML issue form. A form renders worse and is harder to edit in place.
- ASSUMPTION: the template applies no labels, since `AGENTS.md` says only a human applies `factory`.
- ASSUMPTION: "What the user gets" allows `NO USER-VISIBLE CHANGE` plus who does see it, matching the spec brief rule.
- ASSUMPTION: `.github/ISSUE_TEMPLATE/config.yml` is out of scope, so blank issues stay enabled.
- ASSUMPTION: nothing is written to `template/`, which stays empty until piece two.
- One line added to `docs/progress.md`.

## Acceptance criteria

- When a contributor opens "New issue" in this repo, the system shall offer a template named "Factory work".
- When that template is chosen, the system shall pre-fill the body with the seven sections above in that order.
- When the filed issue renders, the system shall show no HTML comment hints.
- When the template is filed without edits, the system shall apply no labels to the issue.

## Scope boundaries

In scope: one markdown template, and the progress line recording it.

NOT in scope: per-type templates, YAML issue forms, anything under `template/`, `config.yml`, changes to `/factory-refine`, any CI check that the template was filled in.

## Technical detail

Front matter is the four GitHub keys (`name`, `about`, `title`, `labels`, `assignees`) with `labels` deliberately empty. Verification is reading the diff, then opening the new-issue page once to confirm the chooser shows "Factory work" with the sections pre-filled. Rollback is deleting the file and the progress line; nothing depends on it. Full spec: `specs/2-issue-template/spec.md`.

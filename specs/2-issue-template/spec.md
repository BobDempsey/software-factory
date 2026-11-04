# Spec: one human-scannable issue template for factory work

Issue: https://github.com/BobDempsey/software-factory/issues/2
Deliverable: `config`

## Problem

Issues reach this repo as free prose. A card filed by hand says what Bob was thinking at the time, in whatever shape the moment produced, and `/factory-refine` then spends a conversation recovering the four things every card has to say: one deliverable, one sentence, what done looks like, where the work lands. The template moves that structure to the point of filing, so refinement sharpens wording instead of extracting facts.

## Approach

One markdown issue template at `.github/ISSUE_TEMPLATE/factory-work.md`, built from short labelled sections, each answered in bullets.

Markdown rather than a YAML issue form. A form validates fields and renders the result as a flat block of headings, which reads worse than the source. A markdown template is editable in place, survives being pasted between issues, and matches `deliverable:*` labels already being applied by hand. `docs/outline.md` reserves `template/.factory/templates/issue-forms/` for what gets installed into product repos later; this template is for this repo and does not go there yet.

The template does not pre-apply the `factory` label. `AGENTS.md` is explicit that only a human applies it, and a template that stamps it on every filed issue would make admission automatic.

## Files touched

| Path | Change |
| --- | --- |
| `.github/ISSUE_TEMPLATE/factory-work.md` | New. The template. |
| `docs/progress.md` | One line recording that the template landed. |

`.github/` does not exist in this repo yet, so the directory is created by this change.

## The template

YAML front matter, which GitHub requires on a markdown template:

```yaml
---
name: Factory work
about: One unit of work for the factory
title: ""
labels: ""
assignees: ""
---
```

`labels` stays empty on purpose. See the approach note above.

Body sections, in this order:

**DELIVERABLE** — one bold line naming what this produces: skill, hook, workflow, doc, script, or config. `AGENTS.md` requires this line near the top of every admitted issue, and requires it to match the single `deliverable:*` label.

**What this is** — one sentence, no conjunction. A sentence needing "and also" is two cards.

**What the user gets** — what somebody using the thing can expect once it ships. Written from outside the system. `NO USER-VISIBLE CHANGE` is a valid answer, followed by who or what does see it.

**Why now** — one or two bullets. The reason this is worth doing, not a restatement of what it is.

**Done when** — bullets a human can check by reading a file or running a command. No feelings, no "works well".

**Where it lands** — the path, column, or command the work touches.

**Notes** — optional. Anything that does not fit above. Explicitly the only section allowed to be loose.

Each section carries a one-line HTML-comment hint showing the shape expected. Comments do not render in the filed issue, so a filled-in card stays clean.

## Acceptance criteria

- When a contributor opens "New issue" in this repo, the system shall offer a template named "Factory work".
- When that template is chosen, the system shall pre-fill the body with the seven sections above in that order.
- When the filed issue renders, the system shall show no HTML comment hints.
- When the template is filed without edits, the system shall apply no labels to the issue.
- When a reader skims the filed issue, the system shall present every section as bullets or a single line, with no paragraph longer than one sentence.

## Verification

Reading the diff is the check, per `AGENTS.md`. Then one live confirmation: open the new-issue page for this repo and confirm "Factory work" appears in the chooser with the sections pre-filled. The confirming issue is closed without being filed if possible, or filed and closed immediately.

## Rollback

Delete `.github/ISSUE_TEMPLATE/factory-work.md` and revert the `docs/progress.md` line. Nothing depends on the file, and removing it returns the repo to free-prose filing.

## Out of scope

- A set of per-type templates (bug, feature, chore). The issue says one template.
- YAML issue forms, and anything under `template/`.
- `.github/ISSUE_TEMPLATE/config.yml`, which would control blank issues and contact links.
- Changing `/factory-refine` to assume the template was used.
- Any CI check that the template was filled in.

# Mark the LOG heading as newest first

Every issue's log heading reads `## LOG (newest first)`, so the order is visible once, beside the log, without opening a doc.

## WHAT THE USER SEES

On any issue a command has written to since this lands, the log heading reads `## LOG (newest first)`. The lines under it are unchanged.

## Summary

- `docs/issue-body.md` shows the marked heading in both examples and says the heading carries the order.
- `/factory-refine` and `/factory-create-spec` create the section with the marked heading.
- `/factory-build` and `/factory-retro` refer to the marked heading when they add their line.
- ASSUMPTION: the marker is the heading text `## LOG (newest first)`, not a note under it.
- ASSUMPTION: a command that finds an old bare `## LOG` upgrades it when it next writes; no sweep of existing issues.
- ASSUMPTION: the issue template stays without a log section, since commands create it.
- ASSUMPTION: the card keeps `deliverable:doc`, though four skill files get a one-line heading change.

## Acceptance criteria

- When a command creates the log section, the system shall write `## LOG (newest first)`.
- When a command writes to an issue with a bare `## LOG`, the system shall replace it with the marked heading in the same edit.
- When the change lands, `docs/issue-body.md` shall show the marked heading in both examples.

## Scope boundaries

In scope: `docs/issue-body.md` and the heading text in the refine, create-spec, build and retro skills.

NOT in scope: closed issues, timestamps on log lines, the issue template, the `## DECISIONS` heading, dash style inside log lines.

## Technical detail

Full spec: `specs/19-log-order/spec.md`. `factory-create-spec/SKILL.md` is also edited by #16 and #17, in different steps.

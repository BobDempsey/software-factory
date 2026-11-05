# Spec: mark the LOG heading as newest first

Issue: https://github.com/BobDempsey/software-factory/issues/19
Deliverable: `doc`

## Problem

`docs/issue-body.md` says the log is newest first, but a person reading an issue sees a bare `## LOG` heading and cannot tell which end is the latest without opening that doc. The human asked for the order to be marked once, beside the heading: "we don't need to repeatedly note it, but it should be marked next tothe log or something" (#19, answered on /factory-needs-you).

## Approach

### 1. The heading

The section heading becomes:

```markdown
## LOG (newest first)
```

The marker sits in the heading itself, so it appears exactly once per issue and costs no extra line (DECISIONS row 1).

### 2. `docs/issue-body.md`

Both example blocks (the full shape and the log example) use the new heading. Item 5 of the top-to-bottom list names it. The Rules list under "The log" gains one line: the heading carries the order, so log lines never repeat it.

### 3. The skills that write the heading

Two skills create the section when an issue has none: `.claude/skills/factory-refine/SKILL.md` (step 4, "Write the log line") and `.claude/skills/factory-create-spec/SKILL.md` (step 5d). Each names the new heading text where it says "creating the section".

`.claude/skills/factory-build/SKILL.md` and `.claude/skills/factory-retro/SKILL.md` only add to an existing section. Their references change from `## LOG` to `## LOG (newest first)` so the text a builder searches for matches what is on the issue. `factory-create-spec` step 5b ("above the `## LOG` section") changes the same way.

### 4. Issues that already have a bare heading (DECISIONS row 2)

Open issues keep `## LOG` until a command next writes to them. A command adding a log line treats `## LOG` and `## LOG (newest first)` as the same section, and when it finds the bare heading it replaces it with the marked one in the same edit. Nobody sweeps closed issues.

### 5. The issue template (DECISIONS row 3)

`.github/ISSUE_TEMPLATE/factory-work.md` has no `## LOG` section, because no command has run when a human files the issue. It stays that way; the first command to touch the card creates the marked heading.

### 6. The label (DECISIONS row 4)

Four of the five files touched are skills, but each change is one line of heading text inside them, driven by the doc. The card keeps `deliverable:doc`.

### Merge order

`factory-create-spec/SKILL.md` is also edited by #16 and #17 (steps 3, 4 and Rules). This card touches steps 5b and 5d only, so the hunks do not overlap, but build from current master and re-read those two steps if either has merged first.

## Files touched

| File | Change |
| --- | --- |
| `docs/issue-body.md` | Both examples, item 5, one Rules line |
| `.claude/skills/factory-refine/SKILL.md` | Heading text in step 4 |
| `.claude/skills/factory-create-spec/SKILL.md` | Heading text in steps 5b and 5d |
| `.claude/skills/factory-build/SKILL.md` | Heading text in the log step |
| `.claude/skills/factory-retro/SKILL.md` | Heading text in the log step |

## Acceptance criteria

- When a command creates the log section on an issue, the system shall write the heading `## LOG (newest first)`.
- When a command adds a log line to an issue whose heading is the bare `## LOG`, the system shall add the line under it and replace the heading with `## LOG (newest first)` in the same edit.
- When the change lands, `docs/issue-body.md` shall show `## LOG (newest first)` in both example blocks.
- When the change lands, no log line in any skill example shall restate the order.

## Verification

Reading the diff. The heading only appears on a real issue when a command next writes a log line after merge, so the PR names that run as the test and reports the first two criteria as unverified.

## Rollback

Revert the PR. Issues written in between keep the marked heading, which the old skill text still finds by its `## LOG` prefix.

## Out of scope

Rewriting headings on closed issues, timestamps on log lines, the issue template, the `## DECISIONS` heading, and the dash style inside log lines.

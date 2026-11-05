# What an issue body looks like

One shape, written by every command that touches an issue. A person opening a card should see what
it is and what it wants from them without scrolling, and find the long version by following a link.

The issue is the index. The spec directory is the detail.

## The shape

```markdown
**ACTION:** Answer the DECISIONS rows below. Each carries a recommendation, so `y` accepts them all.
**RETURN TO:** /factory-build

Park a card in /factory-needs-you when CodeRabbit finishes reviewing it.

**DELIVERABLE:** workflow · **Spec:** [specs/13-park-on-review/](../specs/13-park-on-review/)

## DECISIONS

| # | Flag | Question | Answer |
| --- | --- | --- | --- |
| 1 | ASSUMPTION | Fire on any review that is not a request for changes? | UNANSWERED |

## LOG

**/factory-create-spec** — spec written against `factory-reviewed.yml`, 1 row open.
**/factory-refine** — one unit of work, labeled `deliverable:workflow`.
```

Top to bottom:

1. **The ACTION block**, and only while the card is parked. Two bold lines, nothing above them. The
   command that parks the card writes them; the command that takes the card away deletes them.
   A card that comes back a second time has one ACTION line, the current one, not a stack.
2. **One sentence** saying what the card is. The human's own words wherever they still fit.
3. **The DELIVERABLE and the spec link**, on one line. The link is the whole of the detail: the
   brief, the file table, the acceptance criteria, the rollback.
4. **`## DECISIONS`**, once the spec step has written it. This is the one thing the human edits, so
   it sits above the log rather than below it.
5. **`## LOG`**, last.

Nothing else. No `# SPEC` section, no brief pasted into the body, no restated acceptance criteria.
A card carrying frontend work and backend work is still one short issue and one long spec.

## The log

One line per command that has run, **newest first**, so the last thing that happened reads at the
top of the section and the card's history reads downward.

```markdown
## LOG

**/factory-retro** — `docs/solutions/13-park-on-review.md`, one rule added to AGENTS.md.
**/factory-build** — branch `13-park-on-review`, PR #14, 2 files.
**/factory-create-spec** — spec written against `factory-reviewed.yml`, 1 row open.
**/factory-refine** — one unit of work, labeled `deliverable:workflow`.
```

Rules:

- **One line, one command.** The command name in bold, an em-less dash, then what it produced:
  a path, a branch, a PR number, a count. Not a narration of how it went.
- **A stage that has not run has no line.** The log is what happened, not a checklist of what will.
- **Append, never rewrite.** A command edits its own line only to correct it, and never touches
  another command's.
- **Names, not prose.** Someone scanning the log should be able to open everything it mentions.

The review stages write ACTION lines but no log line: `factory-reviewed.yml` and
`factory-changes-requested.yml` run on GitHub without the repo in hand. `/factory-retro` names the
review rounds in its line instead.

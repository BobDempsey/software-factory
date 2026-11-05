# Brief: label each card in /factory-needs-you with what it needs

Every card waiting on you carries one `needs:*` label saying what it wants, and a clean CodeRabbit pass reaches you instead of stalling.

## WHAT THE USER SEES

- Each card in /factory-needs-you shows `needs:merge`, `needs:answer` or `needs:help` on its face.
- A PR CodeRabbit passes clean lands in /factory-needs-you with `needs:merge`, without you asking.
- The label disappears when a command moves the card on.

## What changes

- `factory-reviewed.yml` also fires on CodeRabbit's "No actionable comments were generated" comment.
- New `board.sh park <N> <label>` moves a card and labels it in one step.
- `board.sh move` strips `needs:*` whenever a card leaves /factory-needs-you.
- Refine and spec park with `needs:answer`. Build and retro gain a blocker park with `needs:help` (from #21).
- CRITICAL: `board.sh` `add` and `file` are uncommitted in your working tree. Commit them to master first?
- ASSUMPTION: names `needs:merge`, `needs:answer`, `needs:help`, coloured green, yellow and red.
- ASSUMPTION: the clean pass is detected by matching that comment text from `coderabbitai[bot]`.
- ASSUMPTION: the workflows label with `gh issue edit` themselves, not through `board.sh`.
- ASSUMPTION: a card you drag out by hand keeps its label until the next `board.sh move`.
- OPEN: does the build create the three labels with `gh label create`, or do you?

## Acceptance criteria

- When CodeRabbit posts or edits its no-findings comment on a PR whose card is in @coderabbitai, the system shall park the card with `needs:merge`.
- When any command or workflow parks a card, the system shall leave it carrying exactly one `needs:*` label.
- When `board.sh move` sends a card anywhere but /factory-needs-you, the system shall remove its `needs:*` labels.
- When build or retro hits a blocker it cannot clear, the system shall park the card with `needs:help` and a RETURN TO line.

## Scope

In scope: the two review workflows, `board.sh`, the four agent skills, `docs/issue-body.md`.

NOT in scope: the `---` line the review workflow writes under ACTION, the orchestrator (#26), the `working` label (#24), labels on cards outside /factory-needs-you, and changing CodeRabbit's settings.

## Technical detail

Full spec in [spec.md](spec.md), plan in [plan.md](plan.md), task list in [tasks.md](tasks.md). The workflow changes only run from master, so the merge is the test.

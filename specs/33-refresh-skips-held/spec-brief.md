# Stop /factory-refresh from starting a card /factory already holds

`/factory-refresh` stops offering a stage command on any card labeled `working`, so it never starts a second actor on a card a `/factory` subagent holds.

## WHAT THE USER SEES

A refresh still lists every move. A held card's line ends in `held`, and the QUESTION names the first handed-over card that is not held, or is absent when all of them are.

## Summary

- Step 4 of `.claude/skills/factory-refresh/SKILL.md` reads the open issues labeled `working` before it offers anything.
- A held card is reported and never offered. The next free handed-over card is offered instead.
- On a yes, the refresh re-checks the label and refuses if the card became held in between.
- If the label read fails, the refresh offers nothing and says why.
- ASSUMPTION: holds come from `gh issue list --label working`, not `board.sh list`, whose labels column reads `-` for every card today.
- ASSUMPTION: the yes re-check is in scope. The note asks only for the offer to skip held cards.
- ASSUMPTION: a draft card has no label, so the refresh treats it as free, though `/factory` may hold it by item id.
- ASSUMPTION: the empty labels column in `board.sh list` stays broken here. It also blinds `/factory`'s own hold check (`factory/SKILL.md` step 1), so it wants its own card.

## Acceptance criteria

- When a card that moved into an agent column carries `working`, the system shall report the move marked `held` and shall not offer its command.
- When the first handed-over card is held and a later one is not, the system shall offer the later one.
- When every handed-over card is held, the system shall ask no question and shall still write the snapshot.
- When the human says yes and the card has gained `working` since the offer, the system shall not run the command.
- When the `working` read fails, the system shall offer nothing and say so in one line.

## Scope boundaries

In scope: step 3's example, step 4 and the Rules section of `.claude/skills/factory-refresh/SKILL.md`.

NOT in scope: fixing `scripts/board.sh list`'s labels column, the 30-item limit (#44), `/factory`'s own hold check, the refresh adding or removing `working`, sweeping stale labels, holding drafts.

## Technical detail

Full spec: [spec.md](spec.md). Plan: [plan.md](plan.md). Tasks: [tasks.md](tasks.md). One file. `scripts/board.sh` reads `content.labels`, but `gh project item-list --format json` returns `labels` on the item itself, so its fifth column is always `-`. `gh issue list --label working --state open --json number` is the call `/factory` already makes in its stale-label sweep. The skill loads from master, so the merge is the live test.

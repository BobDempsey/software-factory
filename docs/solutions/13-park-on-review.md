# 13: Park a card in Needs you when CodeRabbit finishes reviewing

Run closed 2026-11-05. Issue #13, PR #14, spec `specs/13-park-on-review/`.

## What shipped

`factory-approved.yml` became `factory-reviewed.yml`. It fires on any submitted review that is not `changes_requested`, from anyone but the PR author, moves the card to Needs you, and prepends an ACTION line naming the review state and comment count plus a RETURN TO line read from `board.json`.

It is the first workflow to write an ACTION line, which is what makes Needs you answer itself.

## What it taught us

- We built a gate around a signal we had never actually received. `factory-approved.yml` waited for `review.state == 'approved'`, and CodeRabbit has never once submitted an approval on this repo. Three runs stalled before anyone looked at what the webhook really sends. Check the event you get, not the event the docs imply.
- Naming a workflow after the state it waits for is a trap when that state turns out to be wrong. `factory-approved` firing on a comment would have been a lie in the filename, which is why the rename came with the guard change rather than after it.
- Two workflows reading the same event want to partition it explicitly. `factory-changes-requested.yml` takes one state and `factory-reviewed.yml` takes everything else, so no review falls through both and none is handled twice. Written as a pair they are easy to check; written separately they drift.

## Traps

- **A heredoc at column 0 inside a YAML `run: |` block makes the workflow unparseable.** Symptom: the run appears in `gh run list` as a failure whose name is the workflow's file path rather than its `name:`, with no jobs and `log not found`. Indent every heredoc line to the block's indent; YAML strips the common prefix, so bash still sees the terminator at column 0.
- **A workflow's own PR cannot test it, and the board rename proved why that matters twice.** `/factory-retro` was renamed on master while this branch was open, and the branch hardcoded the old name in its RETURN TO line. Reading `retroColumn` from `board.json` at run time was the fix, and it is the general answer: a workflow should name no column it could read.

## Spec versus diff

The diff matched the spec, plus two commits the spec did not anticipate: reading the retro column from config after the rename, and the indentation fix. Both were corrections to this change rather than new scope, so neither needed a card.

The spec's prediction held exactly. It said the live paths could not be verified before merge and named the next review as the test, which is what the PR body reported.

## Decisions revisited

Four rows, one `CRITICAL` and three `ASSUMPTION`, all answered yes on the recommendation.

Row 4, rejecting a CodeRabbit setting that would make it approve, is the one worth revisiting if a second reviewer is ever added. The reasoning was that it moves the factory's wiring into a vendor dashboard, and that still holds.

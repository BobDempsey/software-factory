# Park a card in Needs you when CodeRabbit finishes reviewing

CodeRabbit never approves, it comments, so clean PRs never reach Needs you. React to any review that is not a request for changes.

## WHAT THE USER SEES

A PR CodeRabbit has finished with shows up in Needs you, and its first line says what CodeRabbit found: the review state, the comment count, and a link to the PR.

## Summary

- `factory-approved.yml` becomes `factory-reviewed.yml`. The old name would be a lie once the guard widens.
- Fires on any submitted review that is not `changes_requested`, from anyone except the PR author.
- The two review workflows now partition every submitted review, so no state falls through both.
- Prepends `**ACTION:**` and `**RETURN TO:** Needs retro` to the issue body, stripping any pair already there.
- The ACTION line names the literal review state, because approved and finished-with-comments are different decisions.
- CRITICAL: three runs have already stalled on this. #4, #7 and #11 all sat in In review (PR) until merged by hand.
- ASSUMPTION: a review by the PR author is ignored, so commenting on your own work does not park the card.
- ASSUMPTION: `edited` and `dismissed` review events do nothing; only `submitted` counts.
- ASSUMPTION: configuring CodeRabbit to approve is rejected, because it moves the factory's wiring into a vendor dashboard.
- Three doc files change.

## Acceptance criteria

- When a `commented` review is submitted by someone other than the pull request author, the system shall move the card to Needs you.
- When an `approved` review is submitted, the system shall move the card to Needs you.
- When a `changes_requested` review is submitted, the system shall skip and let `factory-changes-requested.yml` act.
- When the card is parked, the system shall prepend an ACTION line naming the review state and comment count, and a RETURN TO line reading Needs retro.
- When a card is parked a second time, the system shall leave exactly one ACTION line.

## Scope boundaries

In scope: the renamed workflow, the widened guard, the ACTION line, and three doc updates.

NOT in scope: `factory-changes-requested.yml` and its round cap, `.coderabbit.yaml`, auto-merge, ACTION lines from any other workflow.

## Technical detail

The guard is three conditions: `action == 'submitted'`, `state != 'changes_requested'`, and reviewer is not the PR author. The ACTION line is a read-modify-write on the issue body that strips an existing pair first. The live path cannot be tested on its own PR, because `pull_request_review` runs the base branch's copy; the test is the next PR CodeRabbit reviews after merge. Full spec: `specs/13-park-on-review/spec.md`.

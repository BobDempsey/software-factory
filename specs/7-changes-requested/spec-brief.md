# Send a card back to Ready for dev when a review requests changes

One workflow so In review (PR) means waiting on a first read, never waiting on a fix.

## WHAT THE USER SEES

CodeRabbit requests changes on a PR and the card moves itself back to Ready for dev. An approval or a plain comment leaves it where it is.

## Summary

- One file: `.github/workflows/factory-changes-requested.yml`, on `pull_request_review`, guarded by `review.state == 'changes_requested'`.
- A near copy of `factory-merged.yml` on purpose: same lookup, same read-back, same PAT, different column.
- Any reviewer counts. The card follows the PR's state, not who typed it.
- `commented` and `approved` reviews do nothing. CodeRabbit comments on almost every PR.
- Reads `buildColumn` from `.factory/board.json`, resolves the option id by name.
- No model call, so a review costs nothing.
- ASSUMPTION: a card already in Ready for dev is left alone and the run succeeds.
- ASSUMPTION: a PR closing no issue comments and fails, matching `factory-merged.yml`.
- ASSUMPTION: a dismissed review does nothing, so clearing a review does not re-trap the card.
- CRITICAL: until the paired resume card lands, `/factory-build` cannot act on a returned card. It always branches from master, so a returned card has to be picked up by hand.
- Three doc lines change, plus a return edge in the architecture diagram.

## Acceptance criteria

- When a `changes_requested` review is submitted on a pull request closing issue N, the system shall set card N's Status to Ready for dev.
- When a review is submitted with state `approved` or `commented`, the system shall do nothing.
- When the card is already in Ready for dev, the system shall leave it there and succeed.
- When the pull request closes no issue, the system shall comment on the pull request and fail the run.

## Scope boundaries

In scope: the workflow, three doc lines, and the return edge on the diagram.

NOT in scope: the `/factory-build` resume path, reacting to approvals or comments, `.coderabbit.yaml`, any change to `factory-merged.yml` or `scripts/board.sh`.

## Technical detail

`github.event.review.state` arrives lowercase in the webhook payload, unlike the GraphQL enum, so the guard compares against `'changes_requested'`. Verification needs a live run and cannot happen on this PR, because `pull_request_review` runs the base branch's copy of the workflow; the test is the next PR that gets changes requested. Rollback is deleting the file. Full spec: `specs/7-changes-requested/spec.md`.

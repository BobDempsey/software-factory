# Spec: send a card back to Ready for dev when a review requests changes

Issue: https://github.com/BobDempsey/software-factory/issues/7
Deliverable: `workflow`

## Problem

CodeRabbit is installed and reviews every PR. When it or a human requests changes, the PR goes red and the card does not move. In review (PR) then means two different things at once: waiting on a first read, and waiting on a fix. The one column that is supposed to answer "is anything blocking me" stops answering it.

The merge path already has this solved. `factory-merged.yml` moves a card out of In review (PR) when the PR merges. This is the other exit from the same column.

## Approach

One workflow at `.github/workflows/factory-changes-requested.yml`, triggered on `pull_request_review`, with a job guarded by `if: github.event.review.state == 'changes_requested'`.

It is deliberately a near copy of `factory-merged.yml`: same issue lookup, same option-id-by-name resolution, same read-back, same PAT. Two workflows that do the same thing to different columns should look the same, so a reader who has understood one has understood both.

### Why only `changes_requested`

`pull_request_review` fires for `submitted`, `edited` and `dismissed`, and a submitted review can be `approved`, `commented` or `changes_requested`. CodeRabbit leaves a `commented` review on almost every PR, so reacting to comments would move the card on every run and the signal would be worthless. An approval is the PR working as intended and needs no move. Only `changes_requested` says the branch is not done.

### Why any reviewer counts

The card follows the state of the PR, not who typed it. A human requesting changes on their own factory PR means the same thing CodeRabbit does: go back and fix it. Filtering by author would mean the board disagreed with the PR depending on who looked at it.

### Idempotence

A second `changes_requested` review on a card already in Ready for dev is a no-op that still succeeds. The read-back confirms the column either way.

### When the PR closes no issue

Same as `factory-merged.yml`: comment on the PR and exit nonzero. A factory PR always closes an issue, so a PR that does not is already outside the system and the comment is the only thing that will say so.

## Files touched

| Path | Change |
| --- | --- |
| `.github/workflows/factory-changes-requested.yml` | New. The workflow. |
| `docs/architecture.md` | A return edge from In review (PR) to Ready for dev. |
| `docs/workflow.md` | The In review (PR) section gains the second exit. |
| `docs/progress.md` | One line recording that it landed. |

## Shape of the workflow

```yaml
name: factory-changes-requested
on:
  pull_request_review:
permissions:
  pull-requests: write
jobs:
  move-card:
    if: github.event.review.state == 'changes_requested'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Move the card back to Ready for dev
        env:
          GH_TOKEN: ${{ secrets.FACTORY_PROJECT_TOKEN }}
          PR: ${{ github.event.pull_request.number }}
        run: ...
```

`buildColumn` in `.factory/board.json` is the target, read at run time rather than written into the YAML.

Note on the event: `github.event.review.state` arrives lowercase in the webhook payload, unlike the GraphQL enum. Comparing against `'changes_requested'` is correct; `'CHANGES_REQUESTED'` would never match.

## Acceptance criteria

- When a review with state `changes_requested` is submitted on a pull request closing issue N, the system shall set card N's Status to Ready for dev.
- When a review is submitted with state `approved` or `commented`, the system shall do nothing.
- When the card is already in Ready for dev, the system shall leave it there and succeed.
- When the pull request closes no issue, the system shall comment on the pull request and fail the run.
- When the Ready for dev option id has changed, the system shall still find the column by its name.

## Verification

Reading the diff, then one live run. `pull_request_review` runs the base branch's copy of the workflow, so this cannot fire for its own PR; it has to merge first, and the check is the next PR that gets changes requested. Record the criterion as unverified in the PR body and name that as the test, per `AGENTS.md`.

## Rollback

Delete the file. The card then stays in In review (PR) after a changes-requested review, which is today's behaviour.

## Out of scope

- Teaching `/factory-build` to resume an existing branch. That is the paired card, and until it lands a returned card has to be picked up by hand.
- Moving a card on approval, on a plain review comment, or on a dismissed review.
- Any CodeRabbit configuration, including `.coderabbit.yaml`.
- Any change to `factory-merged.yml` or `scripts/board.sh`.

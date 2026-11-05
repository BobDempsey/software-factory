# Spec: move a card to Needs retro when its pull request merges

Issue: https://github.com/BobDempsey/software-factory/issues/5
Deliverable: `workflow`

## Problem

`/factory-build` leaves a card in In review and stops. The PR then gets read and merged in the browser, and the card stays where it is until somebody remembers to drag it. That drag carries no judgement: the merge already happened, and the next step is fixed. It is a manual step that exists only because nothing was listening.

A merge is an event GitHub already emits, so the move can be free.

## Approach

One workflow at `.github/workflows/factory-merged.yml`, triggered on `pull_request: closed`, with a job guarded by `if: github.event.pull_request.merged == true`.

The job does three things: find the issue the PR closed, resolve the Needs retro option id by name, and set that card's Status. It calls the GraphQL API directly through `gh`, with no model call anywhere in it, so a merge costs nothing.

Resolving the option id by name at run time rather than hardcoding it follows the rule `scripts/board.sh` already enforces. Replacing the board's Status options mints new ids, and a workflow holding a stale id would fail silently.

### Finding the issue

`closingIssuesReferences` on the PR is the right source. It is what GitHub itself uses to decide which issues a merge closes, so it matches the `Closes #N` the PR body carries, and it also catches an issue linked through the Development sidebar.

```graphql
query($owner:String!, $repo:String!, $pr:Int!) {
  repository(owner:$owner, name:$repo) {
    pullRequest(number:$pr) {
      closingIssuesReferences(first:10) {
        nodes { number projectItems(first:10) { nodes { id project { number } } } }
      }
    }
  }
}
```

Taking `projectItems` from the issue in the same query avoids a second round trip and avoids paging the project.

### Authentication

`GITHUB_TOKEN` cannot write to a user-owned project, so the job uses a PAT stored as the repo secret `FACTORY_PROJECT_TOKEN`, with the `project` and `repo` scopes. The human creates it; the workflow only reads it.

### When the PR closes no issue

The job comments on the PR and exits nonzero:

> No linked issue, so no card was moved. If this change belongs to a factory card, move it to Needs retro by hand.

A loud failure is correct here. By the time this runs the merge has already happened, so there is nothing to block; the only useful thing left is to make sure the escape is visible.

## Files touched

| Path | Change |
| --- | --- |
| `.github/workflows/factory-merged.yml` | New. The workflow. |
| `docs/workflow.md` | The In review row stops saying the human drags the card on. |
| `docs/progress.md` | One line recording that the workflow landed. |
| `docs/board-setup.md` | One line naming the `FACTORY_PROJECT_TOKEN` secret as part of setup. |

## Shape of the workflow

```yaml
name: factory-merged
on:
  pull_request:
    types: [closed]
permissions:
  pull-requests: write
jobs:
  move-card:
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Move the card to Needs retro
        env:
          GH_TOKEN: ${{ secrets.FACTORY_PROJECT_TOKEN }}
          PR: ${{ github.event.pull_request.number }}
        run: ...
```

The step body resolves the project item, resolves the option id by name, calls `updateProjectV2ItemFieldValue`, and reads the value back to confirm.

Project number, project id and Status field id come from `.factory/board.json`, read in the step rather than duplicated into the YAML. That is why the job checks out the repo.

## Acceptance criteria

- When a pull request closing issue N is merged, the system shall set card N's Status to Needs retro without any human action.
- When a pull request is closed without being merged, the system shall do nothing.
- When a merged pull request closes no issue, the system shall comment on the pull request and fail the run.
- When the Needs retro option id has changed, the system shall still find the column by its name.
- When the card is already in Needs retro, the system shall leave it there and succeed.

## Verification

Reading the diff, then one live run: merge a real PR that says `Closes #N` and confirm the card lands in Needs retro. The workflow cannot be confirmed before it is on the default branch, because `pull_request: closed` runs from the base branch's copy of the file. Same trap as the issue template in run #2.

## Rollback

Delete `.github/workflows/factory-merged.yml`. The card then stays in In review after a merge, which is where it sits today, so nothing breaks.

## Out of scope

- Blocking a pull request that names no issue. That is enforcement at PR-open time and belongs on its own card.
- Moving a card on any other event: PR opened, review requested, issue closed by hand.
- Running `/factory-retro` itself. The workflow positions the card; a human still runs the command.
- Any change to `scripts/board.sh`.
- Creating the PAT. The human does that, once.

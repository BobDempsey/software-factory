# Move a card to Needs retro when its pull request merges

One workflow so merging a PR moves its card for you, instead of leaving a drag that carries no decision.

## WHAT THE USER SEES

You merge a PR in the browser and the card moves itself from In review to Needs retro. If the PR names no issue, you get a red check and a comment on the PR saying no card was moved.

## Summary

- One file: `.github/workflows/factory-merged.yml`, on `pull_request: closed`, guarded by `merged == true`.
- Finds the issue through `closingIssuesReferences`, which catches both `Closes #N` and a sidebar link.
- Resolves the Needs retro option id by name at run time, never hardcoded.
- Reads project ids from `.factory/board.json`, so the job checks out the repo.
- No model call anywhere, so a merge costs nothing.
- SECURITY: needs a PAT with `project` and `repo` scopes as the repo secret `FACTORY_PROJECT_TOKEN`. `GITHUB_TOKEN` cannot write a user-owned project.
- ASSUMPTION: the secret is named `FACTORY_PROJECT_TOKEN`.
- ASSUMPTION: a merged PR naming no issue comments and fails the run, rather than passing quietly.
- ASSUMPTION: a card already in Needs retro is left alone and the run succeeds.
- ASSUMPTION: blocking a PR that names no issue is a separate card, not part of this one.
- Three doc lines change: `docs/workflow.md`, `docs/progress.md`, `docs/board-setup.md`.

## Acceptance criteria

- When a pull request closing issue N is merged, the system shall set card N's Status to Needs retro without any human action.
- When a pull request is closed without being merged, the system shall do nothing.
- When a merged pull request closes no issue, the system shall comment on the pull request and fail the run.
- When the Needs retro option id has changed, the system shall still find the column by its name.

## Scope boundaries

In scope: the workflow, and the three doc lines that stop telling you to drag the card.

NOT in scope: blocking a PR that names no issue, reacting to any other event, running `/factory-retro` itself, changes to `scripts/board.sh`, creating the PAT.

## Technical detail

The step resolves the project item from the issue in the same GraphQL query that finds the issue, then calls `updateProjectV2ItemFieldValue` and reads the value back. Verification needs a live merge, because `pull_request: closed` runs from the base branch's copy of the workflow, so this cannot be confirmed until it is on master. Rollback is deleting the file; the card then stays in In review, which is today's behaviour. Full spec: `specs/5-merged-to-retro/spec.md`.

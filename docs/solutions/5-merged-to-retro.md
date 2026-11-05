# 5: Move a card to Needs retro when its pull request merges

Run closed 2026-11-05. Issue #5, PR #6, spec `specs/5-merged-to-retro/`.

## What shipped

`.github/workflows/factory-merged.yml`. Merging a PR that closes a factory issue now sets that card's Status to Needs retro, with no model call and no drag. It reads the project ids out of `.factory/board.json`, resolves the column id by name, and reads the value back before declaring success.

## What it taught us

- A workflow that acts on merge can test itself by merging. PR #6 shipped with its only real acceptance criterion unverified, and the merge of that same PR was the test: the run went green in 17 seconds and the card moved. Writing the PR body to say so turned an untestable change into a change with one honest, scheduled check.
- `closingIssuesReferences` plus `projectItems` in one GraphQL query gets from a PR to its card without paging the project. Worth reusing for anything else that has to find a card from a PR.
- A manual step that carries no decision is a bug in the board, not a chore. In review had the human doing real work and then dragging the card anyway. Merged, one column later, had the human doing nothing but dragging, which is why it was cut in the same session.

## Traps

- **`GITHUB_TOKEN` cannot write a user-owned project.** Symptom: the mutation returns a permissions error despite `permissions:` looking generous, because the project lives on the account rather than the repo. A classic PAT with `repo` and `project` scopes in a repo secret is the fix. Fine-grained tokens do not cover user-owned projects cleanly.
- **`pull_request: closed` runs the base branch's copy of the workflow.** A workflow on a feature branch does not fire for its own PR until it is on master. Same shape as run #2, where the issue template could not appear in the new-issue chooser until merge. Both times the plan had to be "merging is the test", recorded in the PR body.

## Spec versus diff

The diff matched the spec exactly: six files, all named in the spec's file table, nothing else. The spec's NOT-in-scope list held, including the tempting one, blocking a PR that names no issue, which stayed a separate card.

The `/factory-build` run was clean. No amended commits, no reverts, no review pushback.

One process note: unrelated session work was sitting uncommitted on master when the build started. It was committed separately first, so the build commit stayed to the spec's files. The rule added after run #2 is what caught it, which is the first evidence that rule earns its place.

## Decisions revisited

Five rows, one `SECURITY` and four `ASSUMPTION`, all answered yes on the recommendation. The run confirmed the SECURITY row: the PAT was required exactly as described, and the workflow authenticated on its first live run.

Nothing was contradicted. The three error-path assumptions, failing loudly on a PR with no issue, succeeding on a card already in Needs retro, and leaving the PR-open gate to another card, were all read in the diff rather than executed, so they remain unproven in practice.

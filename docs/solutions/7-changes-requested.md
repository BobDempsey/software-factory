# 7: Send a card back to Ready for dev when a review requests changes

Run closed 2026-11-05. Issue #7, PR #8, spec `specs/7-changes-requested/`.

## What shipped

`.github/workflows/factory-changes-requested.yml`. A `changes_requested` review on a factory PR now sends its card back to Ready for dev, from CodeRabbit or a human. Approvals and plain comments move nothing.

## What it taught us

- A second workflow written as a near copy of the first was the right call. `factory-merged.yml` and `factory-changes-requested.yml` differ in two lines of substance, the trigger guard and which column key they read, and the rest is identical. Reading the second one costs nothing once you have read the first.
- The run surfaced a design hole the card did not name. In review (PR) was still coloured as a human column while CodeRabbit was doing the first read, which meant the board claimed something was blocking the human when nothing was. That became the Needs merging column, the Stuck circuit breaker, and a separate commit on master, mid-run.
- CodeRabbit's default behaviour is a `COMMENTED` review, not an approval. That matters for anything built on top of it: a PR it is happy with carries no approval, so a workflow waiting for `approved` will wait forever unless CodeRabbit is configured to request changes or approve.

## Traps

- **Changing docs on master while a branch is open conflicts on exactly the sections the branch touched.** Symptom: `mergeable: CONFLICTING`, `mergeStateStatus: DIRTY` on a PR that was clean an hour ago, with the conflicts in the doc files rather than the code. The fix here was `git checkout --theirs` on all three docs, then folding the branch's one new fact back in by hand. The cause is worth naming: a run that rewrites shared docs should finish before the next one starts editing the same sections.
- **`gh pr view --json mergeable` lags a push by a few seconds.** It returned `CONFLICTING` immediately after the resolving push and `MERGEABLE` moments later. Re-read before concluding the resolution failed.

## Spec versus diff

The diff matched the spec: the workflow plus three doc lines, nothing else. The spec's NOT-in-scope list held, including the resume path, which stayed a separate card.

One divergence, and the spec was right. The spec's verification section said the live path could not be tested on its own PR, because `pull_request_review` runs the base branch's copy. That is exactly what happened: the run shows `factory-changes-requested` firing on PR #8 and being skipped, since CodeRabbit left a `COMMENTED` review rather than requesting changes. The guard was proven; the move was not.

## Decisions revisited

Four rows, one `CRITICAL` and three `ASSUMPTION`, all answered yes on the recommendation.

The CRITICAL row asked whether to ship before `/factory-build` could resume a branch. Shipping first was right: the workflow is live and the board is honest, and no card has needed the resume path yet.

The three error-path assumptions remain unproven. None of them executed, because the only review in this run was a `commented` one that the guard correctly skipped.

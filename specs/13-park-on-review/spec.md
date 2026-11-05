# Spec: park a card in Needs you when CodeRabbit finishes reviewing

Issue: https://github.com/BobDempsey/software-factory/issues/13
Deliverable: `workflow`

## Problem

`factory-approved.yml` waits for `review.state == 'approved'`. CodeRabbit has never submitted one on this repo. Across runs #4, #7 and #11 it finished every review with a `commented` state, which means a clean PR sits in In review (PR) with nothing to move it and the human has to notice by hand. That is the exact failure the one-column board was built to remove.

Second problem, smaller and worse: nothing writes the ACTION line. The whole premise of Needs you is that a card there says what it wants without being opened twice, and today only `/factory-create-spec` honours that. A workflow parking a card leaves it silent.

## Approach

Rename the file to `factory-reviewed.yml` and widen the guard to any submitted review that is not `changes_requested`.

The rename matters. A workflow called `factory-approved` that fires on a comment is a lie in the filename, and the next person to read the board's wiring will trust the name over the guard.

### The guard

```yaml
if: >-
  github.event.action == 'submitted' &&
  github.event.review.state != 'changes_requested' &&
  github.event.review.user.login != github.event.pull_request.user.login
```

Three parts, each earning its place:

- `action == 'submitted'` excludes `edited` and `dismissed`. Editing a review is not finishing one.
- `state != 'changes_requested'` is the inversion. `factory-changes-requested.yml` owns that state and sends the card back to Ready for dev; this workflow takes everything else.
- The author check stops a self-comment on your own PR from parking the card. You commenting on your own work is not a review finishing.

Together the two review workflows now partition every submitted review, which is the property worth having: no review state falls through both.

### The ACTION line

The job prepends two lines to the issue body, above everything else:

```markdown
**ACTION:** CodeRabbit finished with <state> and <n> comment(s). Read the diff and merge PR #<PR>.
**RETURN TO:** Needs retro
```

`<state>` is the literal review state, lowercase as the webhook sends it. Approved and commented are different signals and the merge decision depends on which it was, so the line names it rather than flattening both to "ready".

`<n>` is the review comment count on the PR, from `.review_comments`. A review that finished with eleven comments reads differently from one with none.

Writing it is a read-modify-write on the issue body. Any existing ACTION and RETURN TO pair is stripped first, so a card that passes through twice carries one pair, the current one.

### Why not configure CodeRabbit to approve

Possible, and rejected. It puts the factory's wiring in a vendor dashboard instead of the repo, and it breaks the moment a second reviewer is added. Reading the state we actually receive is the honest version.

## Files touched

| Path | Change |
| --- | --- |
| `.github/workflows/factory-approved.yml` | Deleted. |
| `.github/workflows/factory-reviewed.yml` | New. The widened guard plus the ACTION line. |
| `docs/architecture.md` | The approval edge relabelled, and the writes table updated. |
| `docs/workflow.md` | The In review (PR) section says what finishing means. |
| `docs/progress.md` | One dated entry. |

## Acceptance criteria

- When a review with state `commented` is submitted by someone other than the pull request author, the system shall move the card to Needs you.
- When a review with state `approved` is submitted, the system shall move the card to Needs you.
- When a review with state `changes_requested` is submitted, the system shall leave this workflow skipped and let `factory-changes-requested.yml` act.
- When a review is submitted by the pull request author, the system shall do nothing.
- When the card is parked, the system shall prepend an ACTION line naming the review state and the comment count, and a RETURN TO line reading Needs retro.
- When a card is parked a second time, the system shall leave exactly one ACTION line in the body.

## Verification

Reading the diff, then one live run. `pull_request_review` runs the base branch's copy of the workflow, so this cannot fire for its own PR; the test is the next PR CodeRabbit reviews after merge. Record it unverified in the PR body, as `AGENTS.md` requires.

The idempotence criterion can be checked before merge by running the strip-and-prepend against a body that already has a pair.

## Rollback

`git revert`. The card then stays in In review (PR) after a review, which is today's behaviour.

## Out of scope

- Any change to `factory-changes-requested.yml`, including its round cap.
- `.coderabbit.yaml`, or any CodeRabbit setting.
- Auto-merge.
- Making the other workflows write ACTION lines. `factory-changes-requested.yml` parks a card on the third round and should gain one too, but that is its own card.

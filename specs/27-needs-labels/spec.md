# Feature Specification: Label each card in /factory-needs-you with what it needs

**Feature Branch**: `27-needs-labels`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Issue #27, "Label each card in /factory-needs-you with what it needs", https://github.com/BobDempsey/software-factory/issues/27

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A clean CodeRabbit pass reaches the human (Priority: P1)

When CodeRabbit finds nothing to fix, it submits no review. It only edits its summary comment on the PR to read "No actionable comments were generated in the recent review". `.github/workflows/factory-reviewed.yml` listens for `pull_request_review` only, so the card stays in @coderabbitai and the human has to ask why. This happened on #19 (PR #22) and #17 (PR #25), and `docs/solutions/traps.md` records it.

**Why this priority**: Every clean PR hits this, and it is the most common outcome.

**Independent Test**: Open a factory PR that CodeRabbit passes clean. Its card moves to /factory-needs-you with an ACTION line asking for the merge and the `needs:merge` label.

**Acceptance Scenarios**:

1. **Given** a card in @coderabbitai whose PR closes it, **When** `coderabbitai[bot]` creates or edits a PR comment containing "No actionable comments were generated", **Then** the card moves to /factory-needs-you, its issue gets the ACTION and RETURN TO lines, and the issue carries `needs:merge`.
2. **Given** a card already moved out of @coderabbitai, **When** CodeRabbit edits the same summary comment again, **Then** nothing changes.

---

### User Story 2 - Every parked card says what it needs on its face (Priority: P2)

The human scans /factory-needs-you with the Labels field on. Each card carries exactly one `needs:*` label:

- `needs:merge`: CodeRabbit has finished and the PR waits for the human to merge it.
- `needs:answer`: DECISIONS rows or a refine question wait on the human.
- `needs:help`: three review rounds failed, or a command hit a blocker it cannot clear.

**Why this priority**: The column only works if a card can be read without opening it.

**Independent Test**: Park one card through each path and check its labels on the board.

**Acceptance Scenarios**:

1. **Given** `/factory-refine` or `/factory-create-spec` parks a card, **Then** the issue carries `needs:answer`.
2. **Given** `factory-reviewed.yml` parks a card after a `commented` review or a clean pass, **Then** the issue carries `needs:merge`.
3. **Given** `factory-changes-requested.yml` parks a card at the review round cap, **Then** the issue carries `needs:help`.
4. **Given** `/factory-build` or `/factory-retro` hits a blocker it cannot clear, **Then** it writes the ACTION and RETURN TO lines, adds its LOG line, and parks the card with `needs:help`. RETURN TO names the column the card came from. This is the part folded in from #21.

---

### User Story 3 - A label leaves with the card (Priority: P3)

A `needs:*` label is only true while the card sits in /factory-needs-you.

**Why this priority**: A stale label reads as a request that was never answered.

**Independent Test**: Move a parked card out through `/factory-needs-you` and check that its label is gone.

**Acceptance Scenarios**:

1. **Given** a card carrying a `needs:*` label, **When** `scripts/board.sh move` sends it to any column other than /factory-needs-you, **Then** every `needs:*` label is removed from its issue.

---

### Edge Cases

- A card the human drags out by hand keeps its label, because a user-owned project raises no event an Action can catch. The next `board.sh move` on that card removes it (DECISIONS row 5).
- CodeRabbit edits its summary comment several times per review. Only the edit that contains the no-findings text, while the card is still in @coderabbitai, moves it.
- A PR that closes no card on the project gets the same "no linked issue" comment `factory-reviewed.yml` already writes.
- Parking a card that already carries a different `needs:*` label replaces it, so a card never carries two.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `factory-reviewed.yml` MUST also trigger on `issue_comment` (`created`, `edited`) when the comment is on a pull request, its author is `coderabbitai[bot]`, and its body contains "No actionable comments were generated".
- **FR-002**: On that trigger, the workflow MUST act only when the card is in the `reviewColumn` from `.factory/board.json`, then park it exactly as it does after a `commented` review, with ACTION text saying CodeRabbit found nothing to fix.
- **FR-003**: Every path in `factory-reviewed.yml` that parks a card MUST add `needs:merge` and remove any other `needs:*` label.
- **FR-004**: `factory-changes-requested.yml` MUST add `needs:help` when it parks a card at `reviewRoundCap`.
- **FR-005**: `scripts/board.sh` MUST gain `park <N> <label>`, which removes any `needs:*` label from issue N, adds `<label>`, and moves N's card to the `needsYouColumn`, reading the result back as `move` does.
- **FR-006**: `scripts/board.sh move` MUST remove every `needs:*` label from the card's issue when the target column is not the `needsYouColumn`.
- **FR-007**: `/factory-refine` (step 5b) and `/factory-create-spec` (step 5c) MUST park through `board.sh park <N> needs:answer` instead of `board.sh move`.
- **FR-008**: `/factory-build` and `/factory-retro` MUST gain a park step for a blocker they cannot clear, using `board.sh park <N> needs:help`, the ACTION and RETURN TO lines from `docs/issue-body.md`, and a LOG line.
- **FR-009**: `docs/issue-body.md` MUST say that a parked card carries exactly one `needs:*` label, and name the three.
- **FR-010**: The three labels MUST exist in the repo before the workflows run. [NEEDS CLARIFICATION: does the build create them with `gh label create`, which changes repo state outside the diff, or does the human?]

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The next PR that CodeRabbit passes clean puts its card in /factory-needs-you with `needs:merge`, with no human step in between.
- **SC-002**: Every card in /factory-needs-you carries exactly one `needs:*` label.
- **SC-003**: No card outside /factory-needs-you carries a `needs:*` label after a command has moved it.

## Assumptions

- The no-findings text is stable enough to match on. It was the same on PR #22 and PR #25 (DECISIONS row 3).
- The workflows apply labels with `gh issue edit` in their own steps rather than calling `scripts/board.sh`, which is written for Git Bash on Windows (DECISIONS row 4).
- `issue_comment` and `pull_request_review` workflows run from the default branch, so FR-001 to FR-004 cannot be checked before merge. `AGENTS.md` says to report them unverified and name the merge as the test.
- `scripts/board.sh` on master lacks the `add` and `file` subcommands that the working tree has uncommitted. They must land first, or this build conflicts with them (DECISIONS row 1).

## Files touched

| File | Change |
| --- | --- |
| `.github/workflows/factory-reviewed.yml` | `issue_comment` trigger for the clean pass, `needs:merge` on every park |
| `.github/workflows/factory-changes-requested.yml` | `needs:help` when parking at the round cap |
| `scripts/board.sh` | New `park <N> <label>`; `move` strips `needs:*` outside /factory-needs-you |
| `.claude/skills/factory-refine/SKILL.md` | Step 5b parks with `needs:answer` |
| `.claude/skills/factory-create-spec/SKILL.md` | Step 5c parks with `needs:answer` |
| `.claude/skills/factory-build/SKILL.md` | New park step for blockers, `needs:help` |
| `.claude/skills/factory-retro/SKILL.md` | New park step for blockers, `needs:help` |
| `docs/issue-body.md` | One parked card, one `needs:*` label, and the three names |

## Rollback

Revert the PR. Delete the three labels with `gh label delete`, or leave them: nothing reads a label the workflows no longer write. Cards parked in between keep their label until a human removes it.

# 27: Label each card in /factory-needs-you with what it needs

Run closed 2026-11-05. Issue #27, PR #28, spec `specs/27-needs-labels/`.

## What shipped

Every card parked in /factory-needs-you now carries one `needs:*` label: `needs:merge`, `needs:answer` or `needs:help`. `factory-reviewed.yml` also runs on CodeRabbit's "No actionable comments were generated" summary comment, so a clean pass reaches the column. `scripts/board.sh park` moves a card and labels it, and `board.sh move` strips the label when the card leaves. Build and retro gained a blocked step that parks with `needs:help`, folded in from #21.

## What it taught us

- A `pull_request_review` workflow runs the PR's own copy of the workflow, not master's. The review run on PR #28 executed commit `81bfba9` from the branch, and it applied `needs:merge` to #27 before the merge. The PR body said both workflows could only be tested after merge, which was wrong for this one. `AGENTS.md` already limits the rule to events "GitHub raises against the base branch"; `issue_comment` is one of those, `pull_request_review` is not. The clean-pass path is still untested, because it rides on `issue_comment`.
- The PR merged with four CodeRabbit findings unaddressed, one of them rated Major. The review landed four minutes before the merge. None of them broke this run, but all four are real:
  - **Major:** when a PR closes two issues and only the second has a card, the workflows label the first issue and park the second card.
  - Both workflows and `board.sh` split label names on whitespace, so a label with a space in its name would not be removed.
  - `factory-changes-requested.yml` leaves a stale `needs:*` label when it sends a card back to build below the round cap.
  - `/factory-build` step 2 now says to park a failed check, but a draft card has no issue number to park. A draft is not a blocker. It goes back to /factory-refine by name, as `AGENTS.md` says.
- `factory-merged.yml` moves the card with its own GraphQL, not through `board.sh move`, so it does not strip `needs:merge`. #27 sat in /factory-retro still labeled `needs:merge` until the retro moved it to Done.
- Testing `board.sh park` on the card being built was cheap and conclusive: park, park again with a different label, then move back, all in three commands, with nothing left behind.

## Traps

- **`$ARGUMENTS` in a skill body is replaced by the skill's argument when the skill runs.** Symptom: `/factory-create-spec 27` showed the instruction as "never a leftover `27`". #16 introduced the text. Write the token some other way, such as "the template's arguments placeholder".
- **Git Bash `grep` reports no carriage returns in a CRLF file that native Windows Python sees.** Symptom: an edit script asserts its pattern is missing although `grep` shows the line plainly. Check line endings from Python, which is what does the editing.
- **A heredoc with a `\` line continuation inside a Python triple-quoted string loses the backslash.** Symptom: the edited shell script has two commands joined on one line with a run of spaces. Write the replacement with `chr(92)` and `chr(10)`, or use the editor.

## Spec versus diff

The diff matched the spec's file table and created the three labels as DECISIONS row 6 said. The spec, like the PR body, assumed neither workflow could be checked before merge, and the review path proved that wrong. The spec did not cover `factory-merged.yml`, which is where the stale label in /factory-retro comes from.

## Decisions revisited

- Row 1 (commit `board.sh` `add` and `file` first): right. The build branched from a clean master with no conflict.
- Row 4 (workflows label with `gh issue edit` themselves): held, but it copied the label-removal loop into three places, and CodeRabbit's word-splitting and wrong-issue findings now apply to all three.
- Row 6 (the build creates the labels): held. The live test of `park` needed them to exist before merge.

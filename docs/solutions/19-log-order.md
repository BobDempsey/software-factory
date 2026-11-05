# 19: Mark the LOG heading as newest first

Run closed 2026-11-05. Issue #19, PR #22, spec `specs/19-log-order/`.

## What shipped

The log heading on every issue is now `## LOG (newest first)`. `docs/issue-body.md` uses it in both examples and gains a rule saying the heading carries the order, so no log line repeats it. The four skills that write a log line name the new heading, and each tells a command that finds an old bare `## LOG` to swap in the marked one in the same edit.

## What it taught us

- When CodeRabbit finds nothing, it submits no review at all. It edits its summary comment to say "No actionable comments were generated in the recent review" and stops. `factory-reviewed.yml` listens for `pull_request_review`, so a clean PR never fires it and the card sits in @coderabbitai until a human notices. The workflow handles the comment-only review it was built for, but it misses the most common outcome, a PR with nothing to fix.
- The pre-commit check in `AGENTS.md` (`git diff --cached --stat` against the spec's file table) earned its place on this run. The build branched in place from `board-file`, which carried three unrelated modified files, and staging by path from the file table kept them out of the commit. `gh pr create` still warned about uncommitted changes, which is expected and harmless.

## Traps

- **A clean CodeRabbit pass leaves the card stuck in @coderabbitai.** Symptom: the PR has a CodeRabbit comment reading "No actionable comments were generated", `gh pr view --json reviews` returns an empty list, and `gh run list --workflow factory-reviewed.yml` shows no run for the PR. Moving the card on needs a trigger on CodeRabbit's issue comment, or a human drag.

## Spec versus diff

The file table said each skill got a one-line heading change. The diff also added a clause to each skill about upgrading a bare `## LOG`, because the spec's own approach (section 4) and its second acceptance criterion required that behaviour of every command that writes a line. The approach was right and the file table undersold it. The build also dropped "newest first" from the prose in the build and retro skills, since the heading now says it.

Two criteria were reported unverified, as the spec predicted, because they only show on a real issue after merge. The build's own log line on #19 was the first write under the new heading, though it was written by the old skill text.

## Decisions revisited

All four rows were `ASSUMPTION`, answered yes. Row 2 (upgrade bare headings when next written, no sweep) held: #19 itself was upgraded by its build log line. Row 4 (keep `deliverable:doc` though four skills changed) caused no confusion in build or review.

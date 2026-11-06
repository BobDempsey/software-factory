# 34: Add a help command to board.sh that prints the usage and exits 0

Run closed 2026-11-06. Issue #34, PR #35, spec `specs/34-board-help/`.

## What shipped

`./scripts/board.sh help` prints the header usage and exits 0. The header lists `help`, and both the `help` case and the catch-all print lines 2 to 13. An unknown command or no command still prints the usage and exits 1. This was the first card the `/factory` orchestrator walked end to end in step mode.

## What it taught us

- `EnterWorktree` does not work from a `/factory` background subagent. Creating one fails with "cannot create a worktree from a subagent with a cwd override", and switching into one made by `git worktree add` fails with "the current working directory ... is the repository root, not an isolated worktree". The build fell back to `git worktree add -b 34-board-help .claude/worktrees/worktree-34 origin/master` and absolute paths. Every orchestrated build will hit this, so it went into `AGENTS.md`.
- `git worktree add -b <branch> <path> origin/master` sets the new branch to track `origin/master`. Unset it before `git push -u`, or the branch reads as tracking master until the push.
- The clean-pass path from #27 fired for the first time. CodeRabbit's "No actionable comments were generated" comment ran `factory-reviewed.yml` on `issue_comment` and parked the card with `needs:merge`. #27 left that path untested.
- `factory-merged.yml` moved the card to /factory-retro and left both the `needs:merge` label and the ACTION block asking for the merge. #27 recorded the stale label; this run shows the ACTION block goes stale the same way. The retro cleared both by hand.
- `/factory-build` step 7 asks for a conventional commit message, but this repo's history uses plain sentence titles. The human had the `feat(board):` prefix amended off before the push.
- During refine, the agent claimed `sed -n '2,12p'` dropped the `park` line, having miscounted the header. The coordinator caught it before it reached the card. Count header lines with `sed -n '1,14p' | cat -n` before claiming a range is off.

## Traps

- **`EnterWorktree` refuses inside a `/factory` subagent.** Symptom: "cannot create a worktree from a subagent with a cwd override". See the `AGENTS.md` line.
- **A card in /factory-retro still asks for its merge.** Symptom: the issue's ACTION line reads "Read the diff and merge PR #N" after the PR merged, and the card carries `needs:merge`. `factory-merged.yml` moves the card with its own GraphQL and touches neither.

## Spec versus diff

The diff matched the spec: one file, one header line, one new case, the range moved to `2,13p`. FR-002 asked that `help` and the catch-all "cannot drift apart"; the build writes the range twice rather than sharing it, and the PR said so. The spec folder rode along in the commit, as on earlier builds, though its file table names only `scripts/board.sh`.

## Decisions revisited

All four rows were ASSUMPTIONs answered yes, and the diff followed each. None was proved wrong. Row 1's answer ("one new case and one comment line") is what kept the range duplicated instead of factored out.

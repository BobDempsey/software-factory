# 18: Build each card in its own git worktree

Run closed 2026-11-05. Issue #18, PR #30, spec `specs/18-build-worktree/`.

## What shipped

`/factory-build` now enters `.claude/worktrees/worktree-<N>` with Claude Code's `EnterWorktree`, from `origin/master`, renames the branch to `<N>-<slug>`, copies the spec in from the main checkout, and leaves with `ExitWorktree keep` once the card is in @coderabbitai. `/factory-retro` removes the worktree and the local branch after the merge. This card was the first built that way, and its retro was the first removal.

## What it taught us

- The isolation is real, and enforced by Claude Code, not left to the skill text. Inside the worktree session it refused `git -C` aimed at the main checkout. It also refused any shell command that mentioned git in a form it could not check: a heredoc whose text contained git commands, and a python call whose path came from a shell variable. Splitting into plain, separate commands, with scripts written to a file first, got every step through.
- `EnterWorktree` prefixes the branch with `worktree-`, so a worktree named `worktree-18` started on branch `worktree-worktree-18`. The rename to `<N>-<slug>` is needed. `ExitWorktree`'s own message afterwards still named the old branch; git had the new one.
- The main checkout stayed exactly as it was: still on `master`, still showing only the untracked spec folder. That is the bug from #2, #16, #17 and #27 closed.
- The untracked spec folder that `/factory-create-spec` leaves in the main checkout collides with the merged copy. After the merge, `git pull` would overwrite it, so the retro had to confirm the two copies matched and delete the local one first. The build copies the spec rather than moving it, so this happens on every card.
- CodeRabbit's review landed with 2 comments, and the PR merged without addressing them: fetch `origin/master` before a resumed build, so the diff isn't stale, and reuse the open PR on a review round instead of running `gh pr create` again. The second is the existing draft "Teach /factory-build to resume a branch that already has a PR".

## Traps

- **In a worktree session, Claude Code refuses git it cannot prove stays inside the worktree.** Symptom: "Refusing to run it — a worktree-isolated session's git operations must target its own worktree" on `git -C`, on heredocs that mention git, and on `python "$VAR/..."`. Write scripts to the scratchpad with the editor, then run each git command plainly.
- **The main checkout's untracked spec folder blocks the pull after merge.** Symptom: `specs/<N>-<slug>/` sits untracked in the main checkout while origin/master now tracks the same path. Diff the two, and if they match, delete the local copy before `git pull`.

## Spec versus diff

The diff matched the spec's file table. Two details were learned during the build and written into the skill: the `worktree-` branch prefix, and the refusal of complex git commands. Three criteria were checked live during the build (worktree and branch, main checkout untouched, exit with keep). The retro checked the fourth (removal). The review-round re-entry is still untested.

## Decisions revisited

- Row 1 (copy the spec into the worktree): right for the build, but it leaves a duplicate in the main checkout that the retro has to clean up. Moving it, or having `/factory-create-spec` commit it, would avoid that. That needs its own card.
- Row 2 (rename the branch to `<N>-<slug>`): needed, given the prefix `EnterWorktree` adds.
- Row 4 (retro removes with `git worktree remove` and `git branch -D`): both ran clean on the first try.

# Traps

Things that cost time once and should not cost them twice. Every run's
`/factory-retro` adds to this file; nothing else writes it.

Read it before writing a spec, and before touching the board, `gh`, or a
workflow. A trap here is a symptom first and a cause second, because the
symptom is what you meet.


- **`gh` needs a scope it does not ship with.** `gh auth refresh -s project,read:project`. It opens a browser for a one-time code, so an agent cannot run it.
- **Replacing the board's Status options is destructive, and the damage outlives the mutation.** `updateProjectV2Field` overwrites the whole option list and mints new option ids, blanking every card's status. There is no partial update: adding one column means re-sending all of them. Worse, setting the cards back through the API then reports success while the board renders them one column off, or in No Status, as though the saved view caches options by position. **Dragging in the UI is the only fix that stuck.** This is why `scripts/board.sh` resolves option ids by name at call time and `.factory/board.json` does not store them.
- **Project views have no API.** Switching the layout to Board is a manual click, and it lives under the **View** button at the right of the filter bar, not the caret beside the view tab.
- **An item added to a board has no status** and shows in no column until one is set, so `gh project item-add` alone looks like it did nothing.
- **A board card need not be an issue.** `gh project item-create` makes a note that lives only on the board. That is what makes Bob's Draft Notes work as a scratchpad.
- **Python in this environment is native Windows.** Git Bash paths like `/c/Users/...` fail; `scripts/board.sh` runs them through `cygpath -w` first.
- **Bash heredocs with apostrophes have failed twice here.** Write the script to a file and run it, rather than fighting the quoting.
- **Eraser's free AI credits are exhausted.** Use `manually_create_diagram` and `manually_update_diagram` only, which write the diagram verbatim and cost nothing. Never `create_diagram` or `update_diagram`.
- **A canvas drawn by hand is invisible to the Eraser MCP.** `get_file` and `list_diagrams` on the Github Issues Flow workspace return an empty outline and no diagrams while the canvas plainly holds a flowchart. Ask for a screenshot rather than concluding the file is empty.
- **Eraser work has been running from a home-directory session,** `C--Users-bobde/128b214a...`, not from a software-factory one. Searching this repo's transcripts for it finds nothing.
- **Renaming a column is safe; editing its description is safe too, if you pass the option ids back.** The description lives on the Status option. Re-sending the option list **with each existing option's `id`** preserves every card and id; omitting the ids mints new ones and blanks every card. Both behaviours were seen on 2026-11-04. `scripts/board.sh ids` prints the current ids.
- **`convertProjectV2DraftIssueItemToIssue` no longer accepts `projectId`.** It errors with `InputObject ... doesn't accept argument 'projectId'`. Pass only `itemId` and `repositoryId`. Fixed in `scripts/board.sh` on 2026-11-04.
- **`/tmp` does not exist for the native Windows python here.** `gh` resolves that path through Git Bash and python does not, so a file written to `/tmp` and read back by python fails while `gh --body-file /tmp/...` on the same path succeeds. Use the session scratchpad directory for both.
- **PowerShell here-string syntax silently poisons a Bash commit message.** `git commit -m @'...'@` in Bash produced a commit whose subject was a bare `@`. Use `git commit -F -` with a heredoc.
- **`GITHUB_TOKEN` cannot write to a user-owned project.** Symptom: the project mutation returns a permissions error however generous the workflow's `permissions:` block looks, because the project lives on the account rather than the repo. A classic PAT with `repo` and `project` scopes, stored as the repo secret `FACTORY_PROJECT_TOKEN`, is the fix. Fine-grained tokens do not cover user-owned projects cleanly.
- **CodeRabbit leaves a `COMMENTED` review, not an approval, by default.** Symptom: a PR it is clearly happy with carries no approval, so anything waiting on `review.state == 'approved'` waits forever. Configure it or treat "no changes requested" as the pass.
- **`gh pr view --json mergeable` lags a push by seconds.** It returns the pre-push answer right after a conflict resolution. Re-read before concluding the fix failed.
- **A heredoc at column 0 inside a YAML `run: |` block makes the workflow unparseable.** Symptom: `gh run list` shows a failure named after the workflow's file path instead of its `name:`, with no jobs and `log not found`. Indent every heredoc line to the block's indent; YAML strips the common prefix so bash still sees the terminator at column 0.
- **CodeRabbit never approves, it comments.** Anything waiting on `review.state == 'approved'` waits forever. `factory-reviewed.yml` reacts to any review that is not `changes_requested` instead.
- **GitHub serves issue templates from the default branch only.** A template sitting on a branch cannot be confirmed in the new-issue chooser until the PR merges.
- **A clean CodeRabbit pass submits no review.** Symptom: the PR carries only CodeRabbit's summary comment saying "No actionable comments were generated", `gh pr view --json reviews` is empty, and `factory-reviewed.yml` never runs, so the card waits in @coderabbitai forever. First hit on #19.
- **The auto mode classifier blocks running an installer fetched from a remote URL.** Symptom: `uv tool run --from git+https://...` is denied with no explanation. The human runs it, with output redirected to the session scratchpad so the agent can read the result. First hit on #16.
- **`uv` from winget is not on the Git Bash PATH.** Symptom: `which uv` is empty while winget says it is installed. Call `~/AppData/Local/Microsoft/WinGet/Packages/astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe/uv.exe` directly.
- **A blob for `git update-index --cacheinfo` must be LF here.** Symptom: staging one hunk of a file that carries a human's uncommitted edits shows the whole file changed. `core.autocrlf` is true, so build the blob from `git show HEAD:<file>` and insert with `
`.
- **Local master lags origin after a GitHub merge.** Symptom: `git checkout master` refuses because of a human's uncommitted edits, though origin/master matches the current branch. `git branch -f master origin/master`, then check out. Hit on #16 and #17.
- **A `pull_request_review` workflow runs the PR's own copy, not master's.** Symptom: a workflow change you expected to be untestable fires on its own PR's review. `issue_comment` and `pull_request_target` do run from master. Hit on #27.
- **`$ARGUMENTS` in a skill body is replaced with the skill's argument at run time.** Symptom: an instruction reads "never a leftover `27`". Do not write the literal token in a skill. Hit on #27, from text added in #16.
- **In a worktree session, Claude Code refuses git it cannot prove stays inside the worktree.** Symptom: "a worktree-isolated session's git operations must target its own worktree" on `git -C`, on heredocs that mention git, and on `python "$VAR/..."`. Write scripts to a file with the editor, then run git commands plainly. Hit on #18.
- **`gh project item-edit` fails with a bare "GraphQL: Something went wrong while executing your query" while every read works.** Symptom: `board.sh move` and `park` fail with the same message several times in a row, and the option-list query and issue lookup still return. It cleared by itself within ten minutes. Stop after the second failure and tell the human to drag the card. Hit on #26.
- **Process substitution fails for `git diff --no-index` in this Git Bash.** Symptom: `error: Could not access '/proc/280/fd/63'`. Write `git show origin/master:<path>` to a scratchpad file and diff against that. Hit on #26.

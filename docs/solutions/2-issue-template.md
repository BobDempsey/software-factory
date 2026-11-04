# 2: Add one human-scannable issue template for factory work

Run closed 2026-11-04. Issue #2, PR #3, spec `specs/2-issue-template/`.

## What shipped

`.github/ISSUE_TEMPLATE/factory-work.md`, the one template GitHub offers when filing an issue here. Seven labelled sections, bullets only, section hints as HTML comments, and no labels applied on filing. One line was added to `docs/progress.md`.

## What it taught us

- The first run through the whole factory is what finds the broken rung. `scripts/board.sh convert` had never been called and did not work; nothing but running it would have shown that.
- The verification plan has to account for where GitHub reads a file from. The template could not be confirmed in the new-issue chooser until the PR merged, because GitHub serves issue templates from the default branch only. Three of the four acceptance criteria were checked by reading the file, and the fourth had to ship unverified.
- Spec, build, and the gate between them each want a different artifact. The full spec is for the builder and lives in the repo; the brief is for the approver and belongs in the issue body where it cannot scroll away.

## Traps

- **`convertProjectV2DraftIssueItemToIssue` no longer accepts `projectId`.** Symptom: `gh: InputObject 'ConvertProjectV2DraftIssueItemToIssueInput' doesn't accept argument 'projectId'`, followed by a `KeyError: 'data'` from the script parsing the error response as success. Pass only `itemId` and `repositoryId`.
- **A staged change from earlier in the session rides along into the build commit.** `/factory-build` branches in place rather than in a worktree, so a `git rm` staged before the branch existed showed up in `git diff --cached --stat` for this PR. Symptom: the staged stat lists a file the spec never names. Check the staged list against the spec's file table before committing.
- **PowerShell here-string syntax poisons a Bash commit message silently.** `git commit -m @'...'@` produced a commit whose subject was a bare `@`, with exit code 0. Use `git commit -F -` with a heredoc.
- **`/tmp` resolves for `gh` and not for python here.** `gh --body-file /tmp/x.md` succeeds while python reading the same path raises `FileNotFoundError`, because python is a native Windows build and `gh` goes through Git Bash. Write both to the session scratchpad instead.

## Spec versus diff

The diff matched the spec exactly: two files, both named in the spec's file table, nothing else. The spec's NOT-in-scope list held; no per-type templates, no `config.yml`, no `template/` writes.

One divergence in process rather than content. The spec's verification section called for opening the live new-issue page, and that was not possible before merge. The spec was wrong to promise it, not the build.

## Decisions revisited

All five `DECISIONS` rows were `ASSUMPTION` flags, all answered yes on the recommendation. Nothing in the diff contradicted any of them. The useful finding is procedural: every row was an assumption and none was a `CRITICAL` or `IRREVERSIBLE`, which fits a card this small. A run that produces only assumption flags on a larger change would be a sign the spec work was shallow.

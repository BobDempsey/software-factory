# Handoff

Last updated 2026-11-04. Revision trail: 2026-11-04 (created, bootstrap plus piece one), 2026-11-04 (board recut around refinement, piece 1.5 written), 2026-11-04 (the loop closed: refine, spec, build, merge, retro, Done), 2026-11-04 (/factory-start replaces the handoff as the session opener).

**Run `/factory-start` instead of reading this, unless you have never seen this repo.** It reads the board in one call and offers the first card waiting. This document is the cold-start brief, and reading it costs real context.

If you do need it: read this, then `docs/progress.md` for the one-line status of each piece. Everything else is detail you can fetch when you need it.

**The basic loop is finished.** Draft note to Done runs on four commands, and it has run once on a real issue. What is left is hardening it: gates, isolation, and installing it somewhere other than here.

## 1. What this is

A local-only agentic software factory: a repeatable pipeline that takes an idea from spec to reviewed, tested, deployed code, with agents doing the mechanical work and the human approving at gates. This repo is both the factory and its own first pilot project.

Local-only means agents run on the developer's machine. No hosted agent runners, no cloud sandboxes for agents. Cloud is only ever for deploying the product, never for running the agents.

## 2. Where things are

| Path | What it is |
| --- | --- |
| `docs/outline.md` | The full design, about 760 lines. The destination. |
| `docs/workflow.md` | How the board is driven day to day. Read before touching the board. |
| `docs/board-setup.md` | Board install procedure, including the step that has no API. |
| `docs/progress.md` | What exists today, one line per thing. |
| `.claude/skills/factory-start/` | Opens a session on the board. Run this first. |
| `.claude/skills/factory-refine/` | The intake command, and the admission gate. |
| `.claude/skills/factory-create-spec/` | Writes the spec and the DECISIONS table. |
| `.claude/skills/factory-build/` | Implements an approved spec, stops at the PR. |
| `.claude/skills/factory-retro/` | Closes out a finished run, writes `docs/solutions/`. |
| `specs/<N>-<slug>/` | `spec.md` and `spec-brief.md` for issue N. |
| `scripts/board.sh` | Every board operation. The allow-listed surface. |
| `.factory/board.json` | Project ids and column names. |
| `AGENTS.md` | Agent instructions. `CLAUDE.md` is an 11-byte import of it. |

Two Eraser diagrams, in one workspace: the pipeline, and the build order.
https://app.eraser.io/workspace/q67e2h4jiWh6V2sei87J

A third diagram lives in its own workspace, Github Issues Flow, drawn by hand on the
canvas rather than through the MCP: https://app.eraser.io/workspace/P1CoupmhRdaNwXM1W7sl
It is the board flow, and it is the picture to read before changing a column.
**Both are stale as of 2026-11-04**: they still show the old three-column board.
A fourth diagram, made through the MCP and current with the eight columns, is at
https://app.eraser.io/workspace/OUpb5Em92ffztvfLtLQ1

## 3. State, verified 2026-11-04

- Repo public at https://github.com/BobDempsey/software-factory, pushed, master.
- Board at https://github.com/users/BobDempsey/projects/4, nine columns plus No Status: **Bob's Draft Notes, Needs you, Needs expanding, Needs refinement, Ready for spec, Ready for dev, In review (PR), /factory-retro, Done**, board layout saved. One yellow column, Needs you, is the only one waiting on a human; everything blue moves itself. The retro column is named after the command that runs it, so a slash command with no column is one nothing invokes.
- Labels: `factory`, `factory:triage`, and six `deliverable:*` (skill, hook, workflow, doc, script, config).
- Five commands exist as skills. Four have run: `/factory-refine`, `/factory-create-spec`, `/factory-build`, `/factory-retro`. `/factory-start` is written and untested.
- `/factory-sync-issues` was deleted. Its checks live in `/factory-refine` now, because two commands reading the same column was the confusing part.
- `scripts/board.sh` list, ids, move and convert have all run clean against the live board.
- **The first run went end to end.** Issue #2, the factory-work issue template: draft note, refined, specced, decisions answered, built on branch `2-issue-template`, PR #3, merged, retro written to `docs/solutions/2-issue-template.md`. The card sits in Done.
- `.github/ISSUE_TEMPLATE/factory-work.md` is live on master.
- One draft card left on the board, in No Status: "We need to separate the eraser I/O diagrams."
- Issue #1 was closed as not planned when the board was cleared for a test run. Its full body is preserved and should be refiled.

Commits `57bf3c3` and `25d4ce8` carry the recut and the retro. Both pushed.

No CI, no gates, no spec tooling. That absence is the plan, not an omission.

## 4. Decisions, and why

The full ledger is in `docs/outline.md`. The ones that shape day-to-day work:

- **One piece at a time, and a piece is done when it has been used on a real issue, not when it is written.** Never build three pieces before using any of them.
- **Spec Kit stays** as the spec framework. Steal `[NEEDS CLARIFICATION]` capped at three, the constitution file, and BMAD's `risk:` frontmatter, without adopting BMAD.
- **Skills, not `.claude/commands/`.** Commands are the legacy format.
- **Prose is a request; hooks are enforcement.** Anything absolute goes in a `PreToolUse` hook, never in `AGENTS.md`.
- **The reviewer must not be Claude.** Claude reviewing Claude is a second pass, not a second opinion. CodeRabbit plus self-hosted PR-Agent on a non-Claude model.
- **Red-first replay gates; mutation testing only reports** until there is a baseline.
- **`Assisted-by:` trailer, one line.** An agent never writes `Signed-off-by`.
- **The board shows state; git holds the truth.** Approval is a committed `spec.json` flag plus `agent-approval-check`, never a column.
- **Only a human admits work.** Agents may file `factory:triage`; they never apply `factory`.
- **Refinement is its own column and its own command.** A draft that is not ready goes to Needs refinement, and `/factory-refine` sharpens it with the human until it is one unit of work. Not refined means it stays in that column rather than moving on.
- **Refinement is also the admission gate.** There is no second pass behind it. `/factory-refine` applies `factory` once the human says the card is ready.
- **The spec brief lives in the issue body, not a comment.** A comment scrolls away. The body is what a reader sees first.
- **Approval is the `## DECISIONS` table** at the bottom of the issue body: one row per flag, every answer starting as the literal word `UNANSWERED`. The human replaces each one. An agent never fills in an answer, and `/factory-build` refuses to run while a row still says `UNANSWERED`. This stands in for `spec.json` for now.
- **Dragging to Ready for dev is the approval of the spec.** The build command trusts that drag plus the answered table.
- **Every column names the command or the person that acts on it.** A column nobody acts on should not exist. Merged was cut for exactly that: it asked for a second drag and nothing else.
- **The retro does not ask the human anything.** By the time a card reaches the retro column they have moved on, and a question they cannot answer makes a worse retro than silence. The friction is on disk: amended commits, unverified PR sections, files the spec never named.
- **A session opens on the board, not the handoff.** `/factory-start` is one `board.sh list` call and a question. The handoff grows every session and reading it at the top of every one was the cost that prompted this.
- **The retro applies its own rule changes to `AGENTS.md`** rather than proposing them, and says in its report what it added so one edit reverts it. A proposal the human skims is the same as no rule.
- **Bob's Draft Notes is private.** Agents do not read it.

## 5. Gotchas

Things that cost time once and should not cost it twice.

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

## 6. Not done

The loop works. Nothing below blocks using it; each item makes it harder to get wrong.

- The Eraser diagrams are stale. The two in `q67e2h4jiWh6V2sei87J` and the hand-drawn `P1CoupmhRdaNwXM1W7sl` canvas still show the old board. The hand-drawn one is invisible to the MCP and has to be redrawn by hand or replaced.
- `docs/outline.md` still describes the ten-column design (Draft, Inbox, Spec, Needs you, Build, Verify, Merge gate, CI/CD, Operate, Done) and `/factory-sync-issues`. Left alone on purpose: it is the destination, not the current state. Reconcile it once the shape stops moving.
- OpenSpec was raised as the thing that should write specs instead of the hand-rolled template in `/factory-create-spec`. Deferred until the workflow settles.
- No worktree isolation. `/factory-build` branches in place, so uncommitted session work rides along and has to be kept out of the commit by hand.
- No scheduled GitHub Action yet. User-owned projects emit no `projects_v2_item` webhook, so when it is built it will be a cron that polls the board.
- No CI gate, no red-first replay, no `agent-approval-check`, no mutation testing, no second reviewer.
- The `template/` directory does not exist yet. Nothing is installable into another repo.
- Pilot repo for real product work is still unpicked, as is the budget ceiling.
- `Bob's Draft Notes` is named for one person and should become `Drafts` before the factory is installed anywhere else. `docs/board-setup.md` already says `Drafts`.
- `/factory-start` has never run. Next session uses it.
- The board watcher is a draft card in Needs refinement, not a decision. The shape discussed: a Node poller on `scripts/board.sh list`, which is free, spawning `claude -p "/factory-<command>"` only when a card actually sits in a command's column. A GitHub Action was rejected because a cron would burn API tokens on every tick whether or not anything moved.
- Nothing enforces the order. A card can be dragged straight from Needs refinement to Ready for dev and `/factory-build` will only catch it because the DECISIONS table is missing. A hook checking the column a card came from would close that.
- The retro has run once, so its bar for adding an `AGENTS.md` rule is untested. Watch whether it inflates the file over the next few runs.

## 7. Working with this user

- **Answer in one sentence.** Yes or no when asked for yes or no, with the qualifier after it only when the plain answer would mislead.
- **Do not build ahead.** Asked for one piece means one piece. The build order exists to stop scope creep, and offering extras works against it.
- **Verify before claiming.** They check the board and the repo against what you said. An API read is not proof that the UI agrees.
- **They pin down a design with long chains of yes-or-no questions.** Answer the question asked, in one word, and add a qualifier only when the bare answer would mislead. Do not volunteer the next step.
- **They screenshot the board and ask whether it is right.** Read the screenshot against the repo, not against memory.
- **Prose rules are in the user's global `CLAUDE.md`** and they apply to every markdown file here. No em dashes, no padded triads, no "leverage" or "robust" or "comprehensive".
- **No AI attribution in commits** beyond a single `Assisted-by:` line. No banner, no emoji, no co-author trailer.

# 26: Work several cards at once from one quiet orchestrator command

Run closed 2026-11-05. Issue #26, PR #31, spec `specs/26-orchestrator/`.

## What shipped

`/factory` replaced `/factory-run` and `/factory-watch`. It scans the board first, then starts one background subagent per card in an agent column, up to `agentCap` (3) in `.factory/board.json`, and marks each held card with the new yellow `working` label. Building still asks first, retros run one at a time, and a pass with no state change prints nothing. It has not run yet: the skill only loads from master, so the first `/factory` session is the first test.

## What it taught us

- The spec step stopped on a contradiction and that was the right call. `docs/outline.md` kept parallel agents on the shelf, the card was parallel agents, and `/factory-create-spec` parked it with one question instead of writing a spec against the outline. The human lifted the hold on the second answer. It cost one round trip and no rework.
- Checking the tool docs before speccing paid off, per the rule from #16. https://code.claude.com/docs/en/sub-agents.md says a background subagent loses `AskUserQuestion` and never gets `CronCreate`. That fixed the shape before any text was written: the orchestrator keeps the loop and the one question, and the subagents ask nothing.
- The stage skills each pick their own card ("take the first card whose status is ..."), and `/factory` hands each subagent a named card. CodeRabbit flagged the conflict as Major. Under `/factory`, two subagents in the same column can both take the first card. This has to be fixed before `/factory` runs on a busy column.
- `/factory-refresh` can still start a stage directly on a card a `/factory` subagent holds, because it never checks `working`. CodeRabbit flagged this as Major, outside the diff.
- The PR merged with all 5 of CodeRabbit's actionable comments open, two of them Major. #18 merged with its 2 comments open as well. A comment nobody files is a comment that disappears at merge.

## Traps

- **`gh project item-edit` fails with a bare "GraphQL: Something went wrong while executing your query" while every read works.** Four `board.sh move` and `park` calls failed this way across two minutes on #26, while the option-list query and the issue lookup returned fine. The same move went through ten minutes later without any change. Stop after the second failure, tell the human to drag the card, and try again on the next pass.
- **Process substitution fails for `git diff --no-index` in this Git Bash.** Symptom: `error: Could not access '/proc/280/fd/63'`. Write `git show origin/master:<path>` to a scratchpad file and `diff --strip-trailing-cr` against that instead.

## Spec versus diff

The diff matched the spec's file table, eleven files plus the spec folder. The build decided one thing the spec did not cover: a draft in /factory-refine has no issue, so it cannot carry `working`. The skill holds a draft by item id and runs one draft subagent at a time. The PR flagged it for review. CodeRabbit agreed it was needed and said the brief should have said so.

CodeRabbit found three gaps against the spec's own requirements. A subagent can chain into /factory-retro without checking the one-retro limit. The stale-label sweep runs after the empty-board exit, so a board with no agent work keeps its stale labels. The build stage gets a named card but runs a skill that takes the first one. All three are open.

## Decisions revisited

- Row 4 (one retro at a time): right, and not fully enforced. The skill caps retro subagents when it starts them, but a subagent following its card can still walk into /factory-retro.
- Row 6 (only the build gets a worktree, via `EnterWorktree`): still unproven. The `EnterWorktree` tool text says a `path` switch from a pinned agent moves only that agent; nobody has documented what a `name` create does from an unpinned background subagent.
- Row 8 (strip `working` on start): right, but it has to come before the empty-board exit, not after.
- Row 10 (quiet passes print nothing): CodeRabbit pointed out that the spec's own test for it cannot work on an empty board, since `/factory` exits without a loop. The first live run tests it with a held card.

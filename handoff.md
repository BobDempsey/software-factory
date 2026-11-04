# Handoff

Last updated 2026-11-04. Revision trail: 2026-11-04 (created, bootstrap plus piece one).

Read this, then `docs/progress.md` for the one-line status of each piece. Everything else is detail you can fetch when you need it.

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
| `.claude/skills/factory-sync-issues/` | Piece one. The intake command. |
| `scripts/board.sh` | Every board operation. The allow-listed surface. |
| `.factory/board.json` | Project ids and column names. |
| `AGENTS.md` | Agent instructions. `CLAUDE.md` is an 11-byte import of it. |

Two Eraser diagrams, in one workspace: the pipeline, and the build order.
https://app.eraser.io/workspace/q67e2h4jiWh6V2sei87J

## 3. State, verified 2026-11-04

- Repo public at https://github.com/BobDempsey/software-factory, pushed, master.
- Board at https://github.com/users/BobDempsey/projects/4, four columns: **Bob's Draft Notes, Needs approval, Approved, Spec**, board layout saved.
- Labels: `factory`, `factory:triage`, and six `deliverable:*` (skill, hook, workflow, doc, script, config).
- `scripts/board.sh list` and `ids` both run clean against the live board. `move` and `convert` are written but **not yet exercised**.
- Two draft cards on the board, one in Bob's Draft Notes and one stranded in No Status.
- Issue #1 was closed as not planned when the board was cleared for a test run. Its full body is preserved and should be refiled when piece one is exercised.

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

## 6. Not done

- `scripts/board.sh move` and `convert` have never run. Exercising them is the whole of piece one.
- The deliverable label still needs a human confirmation. The intent is that dragging a card to Approved and running the command should be the entire interaction.
- No scheduled GitHub Action yet. User-owned projects emit no `projects_v2_item` webhook, so when it is built it will be a cron that polls the board. Deliberately after the command is boring.
- Pieces two through nine untouched: `/spec`, `/build`, the first CI gate, `/pr`, red-first replay, `agent-approval-check`, `docs/solutions/`, the weekly monitor.
- The `template/` directory does not exist yet. Nothing is installable into another repo.
- Pilot repo for real product work is still unpicked, as is the budget ceiling.
- `Bob's Draft Notes` is named for one person and should become `Drafts` before the factory is installed anywhere else.

## 7. Working with this user

- **Answer in one sentence.** Yes or no when asked for yes or no, with the qualifier after it only when the plain answer would mislead.
- **Do not build ahead.** Asked for one piece means one piece. The build order exists to stop scope creep, and offering extras works against it.
- **Verify before claiming.** They check the board and the repo against what you said. An API read is not proof that the UI agrees.
- **Prose rules are in the user's global `CLAUDE.md`** and they apply to every markdown file here. No em dashes, no padded triads, no "leverage" or "robust" or "comprehensive".
- **No AI attribution in commits** beyond a single `Assisted-by:` line. No banner, no emoji, no co-author trailer.

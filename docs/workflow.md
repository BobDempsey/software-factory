# The workflow, from the board

The board runs itself. You start work in one column and unblock it in another, and every column between them is driven by a command, a workflow, or CodeRabbit.

```
Bob's Draft Notes -> Needs expanding -> Needs refinement -> Ready for spec
  -> Ready for dev -> In review (PR) -> /factory-retro -> Done

  Needs you catches anything that wants a decision, from any column, and sends it back
```

One column is yellow and it is the only one you watch. Everything blue moves itself. Gray is where work starts and where it ends.

## Starting a session

`/factory-start` is the first thing a session runs. It reads the board, prints one line per column that has cards, and asks whether to start on the first card in Needs refinement. It deliberately does not read `handoff.md`, `docs/outline.md` or `docs/progress.md`; the board already says what is in flight, and the handoff is for a session that has never seen this repo.

## The three ways work arrives

**1. I think of something.** It goes in **Bob's Draft Notes** as a draft card. No issue, no labels, no ceremony. Half a sentence is fine. Agents never read this column, so nothing can act on it while it is still an idea.

**2. An agent or an outside source proposes something.** A performance scan, an error triage run, a scheduled dependency check. These file **real issues** labeled `factory:triage`. They wait for my yes or no.

**3. Something is already a well-formed issue.** It goes straight to Ready for spec.

## The run, column by column

**Bob's Draft Notes.** Mine, private, never read by an agent. One line is enough. I drag it to Needs expanding to start it.

**Needs expanding.** `/factory-expand` reads the one-liner against the repo, writes out what exists today and what the note wants changed, and moves it on. It never asks me anything.

**Needs refinement.** `/factory-refine` sharpens it into one unit of work, converts it to an issue, applies `factory` plus one `deliverable:*` label. Anything it cannot decide parks in Needs you.

**Ready for spec.** `/factory-create-spec` writes `specs/<N>-<slug>/spec.md` and the brief, puts the brief in the issue body under `# SPEC`, writes the `## DECISIONS` table, then parks the card in Needs you.

**Ready for dev.** `/factory-build` refuses to start while any DECISIONS row says `UNANSWERED`. Otherwise it branches, implements the spec and nothing else, commits, and opens a PR.

**In review (PR).** CodeRabbit's. An approval parks the card in Needs you to merge; a request for changes sends it back to Ready for dev; the third failed round parks it in Needs you.

**/factory-retro.** `/factory-retro` rebuilds the run from the issue, spec, PR and commits, writes `docs/solutions/<N>-<slug>.md`, adds a rule to `AGENTS.md` if the run earned one, and moves the card to Done.

**Needs you.** Mine, and the only column I watch. Every card here opens with two lines:

```markdown
**ACTION:** Answer the DECISIONS rows at the bottom of this issue.
**RETURN TO:** Ready for dev
```

I do the thing, drag the card to whatever RETURN TO names, and the loop picks it up again.

**Done.** The archive, kept visible on purpose.

## The gestures that are mine

- Writing a line in Bob's Draft Notes and dragging it to Needs expanding.
- Everything in Needs you: answering DECISIONS rows, merging a PR, deciding what to do with a card that failed three review rounds.

That is the whole list. Every other move on this board is made by a command, a workflow, or CodeRabbit.

> **Automation note.** GitHub's built-in project workflows cannot convert a draft or apply labels on a status change, and user-owned projects do not emit the `projects_v2_item` webhook that would let an Action react to the drag. So the tidying happens when a command runs, not at the moment of the drag.

## Later: a scheduled Action instead of a command

Everything these commands do can run unattended as a GitHub Actions workflow on a cron, polling the board and acting on whatever sits in a column it owns. That is the eventual shape: drag a card, walk away, come back to a spec.

Not built yet, on purpose. The commands run first because the rules are not settled, and a cron doing the wrong thing every five minutes is worse than one that does it when asked.

## Column reference

| Column | Who puts cards here | What it means |
| --- | --- | --- |
| Bob's Draft Notes | Me | A scratchpad. One line is enough. Never read by agents. |
| Needs you | Any command, any workflow | The only column I watch. Each card names its ACTION and its RETURN TO. |
| Needs expanding | Me, by dragging | A one-liner waiting to be written out. |
| Needs refinement | `/factory-expand` | Written out, waiting to be sharpened into one unit of work. |
| Ready for spec | `/factory-refine` | A real issue, labeled. Waiting on the spec. |
| Ready for dev | Me, out of Needs you | Spec approved, every decision answered. |
| In review (PR) | `/factory-build` | PR open, CodeRabbit reviewing. |
| /factory-retro | `factory-merged.yml` | Merged. Waiting on the lesson. |
| Done | `/factory-retro` | Finished, kept visible on purpose. |
| No Status | Nobody, on purpose | GitHub's catch-all. Anything here is a mistake worth noticing. |

## Labels

Two kinds, and both are visible on the card face.

**Admission:** `factory` means admitted. `factory:triage` means proposed and not yet admitted. Agents may apply `factory:triage`; only a human applies `factory`, and `/factory-refine` applies it only after I have said the card is ready.

**Deliverable:** exactly one per admitted issue, so the card says what it produces without being opened.

| Label | Produces |
| --- | --- |
| `deliverable:skill` | A skill in `.claude/skills/` |
| `deliverable:hook` | A hook in `.claude/hooks/` |
| `deliverable:workflow` | A GitHub Actions workflow |
| `deliverable:doc` | Documentation only |
| `deliverable:script` | A script in `.factory/checks/` or `scripts/` |
| `deliverable:config` | Repo or board configuration |

The issue body repeats it as one bold `DELIVERABLE:` line near the top.

## The rule that keeps this honest

The board shows state; git holds the truth. A card can be dragged by accident, and a stale card can sit over a spec that has since changed. The DECISIONS table in the issue body is the record of what was approved, because it is what `/factory-build` reads before it will run.

# The workflow, from the board

The board is meant to be driven by dragging. A card moves one column at a time, and at each stop one slash command acts on it.

```
Bob's Draft Notes -> Needs refinement -> Ready for spec -> Needs spec approval
  -> Ready for dev -> In review -> Merged -> Needs retro
```

Columns exist only once something acts on them. `Needs retro` is the exception: it is there, and `/factory-retro` is not written yet.

## The three ways work arrives

**1. I think of something.** It goes in **Bob's Draft Notes** as a draft card. No issue, no labels, no ceremony. Half a sentence is fine. Agents never read this column, so nothing can act on it while it is still an idea.

**2. An agent or an outside source proposes something.** A performance scan, an error triage run, a scheduled dependency check. These file **real issues** labeled `factory:triage`. They wait for my yes or no.

**3. Something is already a well-formed issue.** It goes straight to Ready for spec.

## The run, column by column

**Needs refinement.** I drag a card here when it is worth doing but not yet one unit of work. `/factory-refine` asks only the questions whose answers change what gets built, rewrites the card so it reads cleanly to someone who was not in the conversation, converts it to an issue, applies `factory` and one `deliverable:*` label, and moves it to Ready for spec once I say it is ready. Work that turns out to be two cards is held, and I decide the split.

**Ready for spec.** `/factory-create-spec` reads the issue plus `docs/`, writes `specs/<N>-<slug>/spec.md` and `spec-brief.md`, puts the brief into the issue body under a `# SPEC` heading, and writes a `## DECISIONS` table at the bottom. Then it moves the card to Needs spec approval and stops.

**Needs spec approval.** Mine. Every flag the agent could not decide is a row in the DECISIONS table with the answer `UNANSWERED`. I replace each one with yes, no, or a short phrase, in the issue body. The agent never fills one in. When every row is answered I drag the card to Ready for dev.

**Ready for dev.** `/factory-build` refuses to start while any row says `UNANSWERED`. Otherwise it branches `<N>-<slug>` off master, implements what the spec says and nothing else, checks each acceptance criterion by name, commits with a single `Assisted-by:` trailer, opens a PR that closes the issue, and moves the card to In review.

**In review.** Mine. I read the diff and merge, which closes the issue.

**Merged.** Mine, by dragging. The work is done and the lesson has not been written yet.

**Needs retro.** Where `/factory-retro` will write what the run taught us into `docs/solutions/`. Not built.

## The gestures that are mine

- Dragging out of Bob's Draft Notes. Nothing reads that column.
- Saying a card is ready, at the end of refinement.
- Answering the DECISIONS rows.
- Dragging to Ready for dev. That drag is the approval of the spec.
- Reviewing and merging the PR.

An agent never does any of these.

> **Automation note.** GitHub's built-in project workflows cannot convert a draft or apply labels on a status change, and user-owned projects do not emit the `projects_v2_item` webhook that would let an Action react to the drag. So the tidying happens when a command runs, not at the moment of the drag.

## Later: a scheduled Action instead of a command

Everything these commands do can run unattended as a GitHub Actions workflow on a cron, polling the board and acting on whatever sits in a column it owns. That is the eventual shape: drag a card, walk away, come back to a spec.

Not built yet, on purpose. The commands run first because the rules are not settled, and a cron doing the wrong thing every five minutes is worse than one that does it when asked.

## Column reference

| Column | Who puts cards here | What it means |
| --- | --- | --- |
| Bob's Draft Notes | Me | A scratchpad. Drafts, half-formed ideas, reminders. Not issues, not labeled, never read by agents. |
| Needs refinement | Me, by dragging | Worth doing, not yet one unit of work. `/factory-refine` works it with me. |
| Ready for spec | `/factory-refine` | A real issue, labeled, one unit of work. Waiting on `/factory-create-spec`. |
| Needs spec approval | `/factory-create-spec` | Brief is in the issue body. Waiting on me to answer the DECISIONS rows. |
| Ready for dev | Me, by dragging | Spec approved, every decision answered. Waiting on `/factory-build`. |
| In review | `/factory-build` | PR open. Waiting on me to review and merge. |
| Merged | Me, by dragging | PR merged, issue closed. The work is done. |
| Needs retro | Me, by dragging | Waiting on `/factory-retro`, which does not exist yet. |
| No Status | Nobody, on purpose | GitHub's catch-all for cards with no Status. Should be empty; anything here is a mistake worth noticing. |

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

# The workflow, from the board

The board is meant to be driven by dragging. You should rarely need the terminal to move work along, and never need to remember a command to admit something.

The board shows only the columns that have something behind them, plus one step ahead. Columns come back as the pieces that use them get built.

```
Bob's Draft Notes -> Needs approval -> Approved -> Spec
```

The full set is in `docs/outline.md`: Spec, Needs you, Build, Verify, Merge gate, CI/CD, Operate, Done.

## The three ways work arrives

**1. I think of something.** It goes in **Bob's Draft Notes** as a draft card. No issue, no labels, no ceremony. Half a sentence is fine. Agents never read this column, so nothing can act on it while it is still an idea.

**2. An agent or an outside source proposes something.** A performance scan, an error triage run, a scheduled dependency check. These file **real issues** labeled `factory:triage` and land in **Needs approval**. The sync skill ignores this column entirely. They wait for my yes or no.

**3. Something is already a well-formed issue.** It goes straight to Approved.

## The one gesture that admits work

Dragging a card into **Approved** is the admission act. Nothing else counts, and nothing downstream reads a card until it is there.

What has to be true for a card in Approved:

- It is a real issue, not a draft card.
- It carries the `factory` label.
- It carries exactly one `deliverable:*` label.

A draft card dragged to Inbox needs converting first, which is one click in the card's side panel: **Convert to issue**.

> **Automation note.** GitHub's built-in project workflows cannot convert a draft or apply labels on a status change, and user-owned projects do not emit the `projects_v2_item` webhook that would let an Action react to the drag. So the tidying happens when the sync runs, not at the moment of the drag.

## Later: a scheduled Action instead of a command

Everything the sync skill does can run unattended as a GitHub Actions workflow on a cron, polling the board every few minutes and acting on whatever sits in Approved. That is the eventual shape: drag a card, walk away, come back to a spec.

Not built yet, on purpose. The command runs first because the tidying rules are not settled, and a cron doing the wrong thing every five minutes is worse than one that does it when asked. Once the command is boring, the workflow becomes a thin wrapper around the same steps.

Recorded here so it stays a decision rather than something rediscovered later.

## What happens after Approved

`/factory-sync-issues` reads Approved, confirms each item is one unit of work, and moves it to Spec. From there the agents own the card until it reaches a gate.

At each of the three gates the card lands in **Needs you**, which is the only column I have to watch. One place answers "is anything waiting on me."

## Column reference

| Column | Who puts cards here | What it means |
| --- | --- | --- |
| Bob's Draft Notes | Me | A scratchpad. Drafts, half-formed ideas, reminders. Not issues, not labeled, never read by agents. |
| Needs approval | Agents, outside sources | Proposed work, filed as real issues labeled `factory:triage`. Ignored by the sync skill. Waits for my yes or no. |
| Approved | Me, by dragging | Admitted. Labeled `factory` plus one `deliverable:*`. Ready for the next sync. |
| Spec | Agent | Where the sync leaves it. Nothing builds this yet. |
| No Status | Nobody, on purpose | GitHub's catch-all for cards with no Status. Should be empty; anything here is a mistake worth noticing. |

## Labels

Two kinds, and both are visible on the card face.

**Admission:** `factory` means admitted. `factory:triage` means proposed and not yet admitted. Approving a proposal is swapping one label for the other and dragging the card to Approved. Agents may apply `factory:triage`; only a human applies `factory`.

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

The board shows state; git holds the truth. A card can be dragged by accident, and a stale card can sit over a spec that has since changed. Approval is the committed `spec.json` flag plus the `agent-approval-check` action, never the column a card happens to be in.

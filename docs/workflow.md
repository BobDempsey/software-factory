# The workflow, from the board

The board is meant to be driven by dragging. You should rarely need the terminal to move work along, and never need to remember a command to admit something.

Eleven columns, and only the first three involve you.

```
Bob's Draft Notes -> Triage -> Inbox -> Spec -> [Needs you] -> Build -> Verify
  -> [Needs you] -> Merge gate -> CI/CD -> [Needs you] -> Operate -> Done
```

## The three ways work arrives

**1. I think of something.** It goes in **Bob's Draft Notes** as a draft card. No issue, no labels, no ceremony. Half a sentence is fine. Agents never read this column, so nothing can act on it while it is still an idea.

**2. An agent or an outside source proposes something.** A performance scan, an error triage run, a scheduled dependency check. These file **real issues** labeled `factory:triage` and land in **Triage**. The sync skill ignores this column entirely. They wait for my yes or no.

**3. Something is already a well-formed issue.** It goes straight to Inbox.

## The one gesture that admits work

Dragging a card into **Inbox** is the admission act. Nothing else counts, and nothing downstream reads a card until it is there.

What has to be true for a card in Inbox:

- It is a real issue, not a draft card.
- It carries the `factory` label.
- It carries exactly one `deliverable:*` label.

A draft card dragged to Inbox needs converting first, which is one click in the card's side panel: **Convert to issue**.

> **Automation note.** GitHub's built-in project workflows cannot convert a draft or apply labels on a status change, and user-owned projects do not emit the `projects_v2_item` webhook that would let an Action react to the drag. So this is handled inside `/factory-sync-issues`: when it runs it converts any draft card sitting in Inbox, applies `factory`, and asks me for the deliverable label if one is missing. The drag stays the only gesture; the tidying happens on the next sync rather than instantly.

## What happens after Inbox

`/factory-sync-issues` reads Inbox, confirms each item is one unit of work, and moves it to Spec. From there the agents own the card until it reaches a gate.

At each of the three gates the card lands in **Needs you**, which is the only column I have to watch. One place answers "is anything waiting on me."

## Column reference

| Column | Who puts cards here | What it means |
| --- | --- | --- |
| Bob's Draft Notes | Me | A scratchpad. Drafts, half-formed ideas, reminders. Not issues, not labeled, never read by agents. |
| Triage | Agents, outside sources | Proposed work, filed as real issues labeled `factory:triage`. Ignored by the sync skill. Waits for my yes or no. |
| Inbox | Me, by dragging | Admitted. Labeled `factory` plus one `deliverable:*`. Ready for the next sync. |
| Spec | Agent | Writing `spec.md`, `spec-brief.md`, `spec.json`. |
| Needs you | Agent | A human gate. All three gates park the card here. |
| Build | Agent | Implementing in a worktree. |
| Verify | Agent | Checks running. |
| Merge gate | Agent | Awaiting merge approval. |
| CI/CD | Agent | Build, preview, production promotion. |
| Operate | Agent | Watching errors and logs. |
| Done | Merge | Merged and closed. |

## Labels

Two kinds, and both are visible on the card face.

**Admission:** `factory` means admitted. `factory:triage` means proposed and not yet admitted. Approving a proposal is swapping one for the other. Agents may apply `factory:triage`; only a human applies `factory`.

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

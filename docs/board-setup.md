# Setting up the factory board

The factory's control plane is a GitHub Projects board. You file an issue, agents move the card from column to column, and a single "Needs you" column answers the question "is anything waiting on me."

This page is the install procedure. It takes about five minutes, and part of it cannot be automated, which is noted where it applies.

## Prerequisites

The `gh` CLI, authenticated, with project scope. The default token does not have it:

```bash
gh auth refresh -s project,read:project
```

That opens a browser for a one-time code, so run it in your own terminal rather than through an agent.

## 1. Labels

Two labels, and the distinction between them is the admission rule: agents may propose work, only a human admits it.

```bash
gh label create factory \
  --color 0E8A16 \
  --description "Admitted into the factory. One issue, one unit of work."

gh label create "factory:triage" \
  --color FBCA04 \
  --description "Agent-proposed. Needs a human label to be admitted."
```

## 2. Create the project

```bash
gh project create --owner YOUR_USERNAME --title "Software Factory"
```

Note the project number it returns. Everything below uses it.

## 3. Replace the Status options with the nine stages

A new project ships with Status options of Todo, In Progress, and Done. Those become the board's columns, so replacing them is what creates the factory's columns. There is no `gh project` subcommand for this, so it goes through the GraphQL API.

First get the Status field id:

```bash
gh project field-list PROJECT_NUMBER --owner YOUR_USERNAME --format json
```

Look for the entry whose type is `ProjectV2SingleSelectField`. Its id starts with `PVTSSF_`.

Then replace the options in one call. **This overwrites every existing option**, which is what you want on a new project and is destructive on a board already in use:

```bash
gh api graphql -F fid=PVTSSF_YOUR_FIELD_ID -f query='
mutation($fid:ID!){
 updateProjectV2Field(input:{fieldId:$fid, singleSelectOptions:[
  {name:"Inbox",      color:GRAY,   description:"Filed, not yet admitted"},
  {name:"Spec",       color:PURPLE, description:"Writing spec.md and spec-brief.md"},
  {name:"Needs you",  color:YELLOW, description:"Blocked on a human gate"},
  {name:"Build",      color:BLUE,   description:"Implementing in a worktree"},
  {name:"Verify",     color:BLUE,   description:"Checks running"},
  {name:"Merge gate", color:ORANGE, description:"Awaiting merge approval"},
  {name:"CI/CD",      color:BLUE,   description:"Build, preview, promotion"},
  {name:"Operate",    color:PINK,   description:"Watching errors and logs"},
  {name:"Done",       color:GREEN,  description:"Merged and closed"}]})
 {projectV2Field{ ... on ProjectV2SingleSelectField { options { name } } }}}'
```

The response lists the nine names back. That is the confirmation.

## 4. Switch the view to a board

**This step is manual.** GitHub has no public API for creating or changing project views, so it cannot be scripted.

1. Open the project.
2. Click **View** on the right of the filter bar. Not the small caret beside the view tab, which only offers rename, duplicate, delete, chart, and export.
3. Choose **Board** at the top of the panel.
4. Confirm **Column by** is set to **Status**.
5. Click **Save view**, then **Save to current view**.

The nine stages appear as columns, each showing the description set in step 3.

## 5. Add an issue and place it

```bash
gh project item-add PROJECT_NUMBER --owner YOUR_USERNAME \
  --url https://github.com/OWNER/REPO/issues/1
```

An added item has no status, so it will not appear in any column until one is set. To set it from the CLI you need three ids: the item id, the project id, and the option id for the column.

```bash
# item id and project id
gh project item-list PROJECT_NUMBER --owner YOUR_USERNAME --format json

# option ids
gh api graphql -f query='
query{ node(id:"PVTSSF_YOUR_FIELD_ID"){
  ... on ProjectV2SingleSelectField { options { id name } } }}'

# place the card
gh project item-edit \
  --id PVTI_YOUR_ITEM_ID \
  --project-id PVT_YOUR_PROJECT_ID \
  --field-id PVTSSF_YOUR_FIELD_ID \
  --single-select-option-id YOUR_OPTION_ID
```

Dragging the card in the UI does the same thing.

## What the columns mean

| Column | Who moves the card in | What it means |
| --- | --- | --- |
| Inbox | You | Filed, not yet admitted. Needs the `factory` label to move on. |
| Spec | Agent | Writing `spec.md`, `spec-brief.md`, and `spec.json`. |
| Needs you | Agent | A human gate. All three gates park the card here. |
| Build | Agent | Implementing in a worktree. |
| Verify | Agent | Checks running. |
| Merge gate | Agent | Awaiting merge approval. |
| CI/CD | Agent | Build, preview, production promotion. |
| Operate | Agent | Watching errors and logs. |
| Done | Merge | Merged and closed. |

Cards return to the single "Needs you" column at each of the three gates rather than having three separate columns, so there is one place that answers whether you are blocking anything.

## The board is not the record

Moving a card is a convenience, not a fact in git. A card can be dragged by accident, and a stale card can sit over a spec that has since changed. Approval is the committed `spec.json` flag plus the `agent-approval-check` action. The board shows state; git holds the truth.

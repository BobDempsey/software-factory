# Setting up the factory board

The factory's control plane is a GitHub Projects board. You file a card, one command acts on each column, and the columns named for a human decision answer the question "is anything waiting on me."

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

### Deliverable labels

One per kind of thing a unit of work produces, so a card says what it builds without opening it. Every admitted issue carries exactly one.

```bash
gh label create "deliverable:skill"    --color 1D76DB --description "A Claude Code skill in .claude/skills/"
gh label create "deliverable:hook"     --color 5319E7 --description "A hook in .claude/hooks/"
gh label create "deliverable:workflow" --color 0052CC --description "A GitHub Actions workflow"
gh label create "deliverable:doc"      --color 006B75 --description "Documentation only"
gh label create "deliverable:script"   --color B60205 --description "A standalone script in .factory/checks/ or scripts/"
gh label create "deliverable:config"   --color 5DADE2 --description "Repo or board configuration"
```

The issue body repeats it as one bold line near the top, so the deliverable is visible both on the card and in the first screen of the issue.

## 2. Create the project

```bash
gh project create --owner YOUR_USERNAME --title "Software Factory"
```

Note the project number it returns. Everything below uses it.

## 3. Replace the Status options with the ten stages

A new project ships with Status options of Todo, In Progress, and Done. Those become the board's columns, so replacing them is what creates the factory's columns. There is no `gh project` subcommand for this, so it goes through the GraphQL API.

First get the Status field id:

```bash
gh project field-list PROJECT_NUMBER --owner YOUR_USERNAME --format json
```

Look for the entry whose type is `ProjectV2SingleSelectField`. Its id starts with `PVTSSF_`.

Then replace the options in one call.

> **This overwrites the entire option list and mints new option IDs.** Every card whose status pointed at an old ID comes back blank, and the cards do not move back on their own. Harmless on a new project. On a board already in use, record every card's current column first and put them back afterwards. There is no partial update: adding one column means re-sending all of them.
>
> **Worse, putting them back through the API does not reliably work afterwards.** Observed twice on this board: setting a card to a named option ID returns success, and the GraphQL read confirms the right option, but the board renders the card one column off, or in No Status. A saved board view appears to cache the option list by position. Reloading does not fix it. **Dragging the card in the UI does.** So after replacing options, plan on dragging the cards back by hand, and do not trust an API read as proof of where a card appears.

```bash
gh api graphql -F fid=PVTSSF_YOUR_FIELD_ID -f query='
mutation($fid:ID!){
 updateProjectV2Field(input:{fieldId:$fid, singleSelectOptions:[
  {name:"Drafts",           color:GRAY,   description:"My notes. One line is enough. Never read by agents."},
  {name:"Needs you",        color:YELLOW, description:"The only column you watch. Each card names its ACTION and its RETURN TO."},
  {name:"/factory-expand",  color:BLUE,   description:"A one-liner becomes a paragraph. No conversation."},
  {name:"/factory-refine", color:BLUE,   description:"Sharpened into one unit of work, converted, labeled."},
  {name:"/factory-create-spec",   color:BLUE,   description:"The spec and the DECISIONS table get written."},
  {name:"/factory-build",    color:BLUE,   description:"The spec gets implemented and a PR opened."},
  {name:"@coderabbitai",   color:BLUE,   description:"CodeRabbit reviews and moves the card on."},
  {name:"/factory-retro",   color:BLUE,   description:"Runs /factory-retro: the lesson gets written and the card moves to Done."},
  {name:"Done",             color:GRAY,   description:"Finished. The archive, kept visible on purpose."}]})
 {projectV2Field{ ... on ProjectV2SingleSelectField { options { name } } }}}'
```

The response lists the nine names back, each with its new ID. That is the confirmation, and those IDs are what `gh project item-edit` needs, so keep them.

### Changing columns later

Re-run the same mutation with the full list, then put the cards back:

```bash
# before: record where everything sits
gh project item-list PROJECT_NUMBER --owner YOUR_USERNAME --format json > /tmp/cards.json

# run the mutation with the new full list, then for each card:
gh project item-edit --id ITEM_ID --project-id PROJECT_ID   --field-id FIELD_ID --single-select-option-id NEW_OPTION_ID
```

## 4. Switch the view to a board

**This step is manual.** GitHub has no public API for creating or changing project views, so it cannot be scripted.

1. Open the project.
2. Click **View** on the right of the filter bar. Not the small caret beside the view tab, which only offers rename, duplicate, delete, chart, and export.
3. Choose **Board** at the top of the panel.
4. Confirm **Column by** is set to **Status**.
5. Click **Save view**, then **Save to current view**.

The ten stages appear as columns, each showing the description set in step 3.

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

Dragging the card in the UI does the same thing, and is more reliable right after the option list has been replaced. See the warning in step 3.

## What the columns mean

| Column | Who moves the card in | What it means |
| --- | --- | --- |
| Drafts | You | Your own notes, one line each. No `factory` label, and agents never read this column. |
| Needs you | Any command | The only column you watch. Each card opens with a bold ACTION and a RETURN TO. |
| /factory-expand | You, by dragging | A one-liner waiting to be written out. |
| /factory-refine | `/factory-expand` | Written out, waiting to be sharpened into one unit of work. |
| /factory-create-spec | `/factory-refine` | A real issue, labeled. Waiting on the spec. |
| /factory-build | You, out of Needs you | Spec approved, every decision answered. |
| @coderabbitai | `/factory-build` | PR open, CodeRabbit reviewing. |
| /factory-retro | `factory-merged.yml` | Merged. Waiting on the lesson. |
| Done | `/factory-retro` | Finished, kept visible on purpose. |

One yellow column answers whether anything is blocking on you.

## Drafts versus the rest

Drafts is where you write yourself notes, paste half-formed ideas, and leave things unfinished. Nothing there is admitted, nothing has the `factory` label, and no agent reads it.

Admission happens at refinement: `/factory-refine` applies `factory` once the card is one unit of work. Until then the item is a note, not work. A card in Drafts does not even have to be an issue; a plain board note works, and it becomes one when it is worth one.

## The token the workflows need

`.github/workflows/factory-merged.yml` writes to the project, and `GITHUB_TOKEN` cannot: a user-owned project is outside the repo's scope. Create a PAT with the `project` and `repo` scopes and store it as the repo secret `FACTORY_PROJECT_TOKEN`. Nothing else in the factory needs it.

## The board is not the record

Moving a card is a convenience, not a fact in git. A card can be dragged by accident, and a stale card can sit over a spec that has since changed. Approval is the `DECISIONS` table in the issue body, which `/factory-build` reads before it will run. The board shows state; git holds the truth.

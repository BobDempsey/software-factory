# Architecture

How a card moves through the factory, and what acts on it at each stop.

Yellow is a column waiting on you. Blue is a column waiting on a command. Gray is a column with nothing pending.

This diagram is generated from `.factory/board.json` and the skills in `.claude/skills/`. Run `/factory-diagram` after changing a column or a command, and edit only the source, never the block below.

<!-- BEGIN board-diagram -->
```mermaid
flowchart TD
    classDef you fill:#f9d976,stroke:#b8860b,stroke-width:2px,color:#000
    classDef agent fill:#8fc1e3,stroke:#2b6ca3,stroke-width:2px,color:#000
    classDef quiet fill:#d8d8d8,stroke:#888,stroke-width:1px,color:#000

    DRAFT["Bob's Draft Notes<br/>private, never read"]
    REFINE["Needs refinement<br/>/factory-start"]
    SPEC["Ready for spec<br/>/factory-create-spec"]
    APPROVE["Needs spec approval<br/>answer the DECISIONS rows"]
    DEV["Ready for dev<br/>/factory-build"]
    REVIEW["In review (PR)<br/>read the diff, merge"]
    RETRO["Needs retro<br/>/factory-retro"]
    DONE["Done<br/>the archive"]

    DRAFT -->|you drag| REFINE
    REFINE -->|refined, labeled, you approve| SPEC
    SPEC -->|spec written, brief in the issue| APPROVE
    APPROVE -->|you drag| DEV
    DEV -->|PR opened| REVIEW
    REVIEW -->|merge, by factory-merged.yml| RETRO
    RETRO -->|lesson written| DONE

    class DRAFT quiet
    class REFINE,APPROVE,REVIEW you
    class SPEC,DEV,RETRO agent
    class DONE quiet
```
<!-- END board-diagram -->

## What writes what

| Step | Who | Produces |
| --- | --- | --- |
| `/factory-start` | you, with an agent | A real issue, labeled, one unit of work |
| `/factory-create-spec` | agent | `specs/<N>-<slug>/`, the brief in the issue body, the DECISIONS table |
| You, in the issue | you | Every DECISIONS row answered |
| `/factory-build` | agent | A branch, a commit, a PR that closes the issue |
| You, on the PR | you | A merge |
| `factory-merged.yml` | GitHub | The card moved to Needs retro, no tokens spent |
| `/factory-retro` | agent | `docs/solutions/<N>-<slug>.md`, and a rule in `AGENTS.md` if the run earned one |

`/factory-refresh` runs at any point. It diffs the board against the last snapshot and offers to run whatever command the move handed over.

## The two rules the shape rests on

**Only a human moves a card into an agent column.** That drag is the approval, and it is the only approval.

**Only an agent moves a card into a human column.** A command that finishes its work hands the card back rather than carrying it further.

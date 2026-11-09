# Feature Specification: Stop /factory-refresh from starting a card /factory already holds

**Feature Branch**: `33-refresh-skips-held`

**Created**: 2026-11-09

**Status**: Draft

**Input**: Issue #33, "Stop /factory-refresh from starting a card /factory already holds", https://github.com/BobDempsey/software-factory/issues/33

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A refresh never offers a held card (Priority: P1)

Bob runs `/factory` in one session, which starts a background subagent on a card and labels it `working`. In another session he drags cards around the board and runs `/factory-refresh`. The refresh reports every move as it does today, but it does not offer to run a stage command on any card that carries `working`, so a second actor never starts on a card a subagent already holds.

**Why this priority**: It is the whole card. CodeRabbit raised it as Major on PR #31 (`.claude/skills/factory-refresh/SKILL.md:91`), and `docs/solutions/26-orchestrator.md` records it as open.

**Independent Test**: Put the `working` label on an open issue, drag it into an agent column, run `/factory-refresh`, and read that the move is reported and no QUESTION names that card. Remove the label afterwards.

**Acceptance Scenarios**:

1. **Given** a card moved into /factory-create-spec since the last snapshot and carries `working`, **When** `/factory-refresh` runs, **Then** it reports the move, marks the card as held, and does not offer `/factory-create-spec` on it.
2. **Given** two cards moved into agent columns, the first held and the second not, **When** `/factory-refresh` runs, **Then** it offers the command for the second card only.
3. **Given** every handed-over card is held, **When** `/factory-refresh` runs, **Then** it asks no QUESTION and still writes the snapshot.
4. **Given** a card was offered and not held, and between the offer and the human's yes it gained `working`, **When** the human says yes, **Then** the refresh re-checks the label, does not run the command, and says the card is now held.

### Edge Cases

- A draft card in /factory-refine has no issue and cannot carry a label. `/factory` holds a draft by item id inside its own session (see `docs/solutions/26-orchestrator.md`, "Spec versus diff"), which a refresh in another session cannot see. See FR-006.
- A stale `working` label left by a dead session makes a refresh skip a card nobody is working. `/factory` sweeps stale labels when it starts; the refresh does not.
- `gh issue list` fails. The refresh then cannot tell held from free, so it offers nothing and says why.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `/factory-refresh` MUST read which open issues carry the `working` label before it offers anything in step 4, with `gh issue list --label working --state open --json number`, the same call `/factory` uses in its stale-label sweep.
- **FR-002**: `/factory-refresh` MUST NOT offer a stage command for a card whose issue number is in that list.
- **FR-003**: `/factory-refresh` MUST still report a held card's move in step 3, with the word `held` at the end of its line.
- **FR-004**: When the first handed-over card is held, `/factory-refresh` MUST offer the first handed-over card that is not, and when every one is held it MUST ask nothing.
- **FR-005**: On a yes, `/factory-refresh` MUST re-read the `working` list and refuse to run the command if the card has gained the label since the offer.
- **FR-006**: A draft card has no label to check. The refresh treats it as not held. [ASSUMPTION, brief row 3]
- **FR-007**: If the `working` read fails, `/factory-refresh` MUST offer nothing this run and say in one line that it could not read holds.
- **FR-008**: The skill's Rules section MUST carry one line saying a card labeled `working` is never offered.
- **FR-009**: The labels column of `./scripts/board.sh list` MUST NOT be the source. It reads `-` for every card today: `scripts/board.sh` takes labels from `content.labels`, while `gh project item-list --format json` puts them at the item's top level. Fixing `board.sh` is out of scope. [ASSUMPTION, brief rows 1 and 4]

### Key Entities

- **The `working` label**: the hold `/factory` puts on each card a subagent works, removed when that subagent ends.
- **A handed-over card**: a card that moved into an agent column since the last snapshot, as step 4 already defines it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With a held card moved into an agent column, a refresh run shows the move with `held` and no QUESTION naming that card.
- **SC-002**: With no held cards, a refresh run behaves exactly as it does today.
- **SC-003**: The diff touches `.claude/skills/factory-refresh/SKILL.md` and nothing else outside the spec folder.

## Assumptions

- `gh issue list` is inside the skill's `allowed-tools` already (`Bash(gh:*)`), so no frontmatter change is needed.
- Reading labels is an issue read, not a board operation, so it does not have to go through `scripts/board.sh`. `/factory` makes the same call directly.
- `/factory-refresh` does not add or remove `working` itself. Only `/factory` manages the hold.
- The 30-item limit on `board.sh list` (`docs/solutions/traps.md`) is not this card's problem; card #44 covers it.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory-refresh/SKILL.md` | Step 4 reads the `working` list before offering, skips held cards, re-checks on a yes. Step 3's example gains a `held` line. Rules gains one line. |

## Rollback

Revert the commit. The skill is text read at run time, holds no state, and the snapshot format does not change, so nothing else needs undoing.

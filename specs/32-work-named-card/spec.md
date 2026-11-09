# Feature Specification: Make each stage skill work the card it is handed

**Feature Branch**: `32-work-named-card`

**Created**: 2026-11-09

**Status**: Draft

**Input**: Issue #32, "Make each stage skill work the card it is handed", https://github.com/BobDempsey/software-factory/issues/32

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A subagent works the card its prompt names (Priority: P1)

`/factory` starts one background subagent per card and names the card in its prompt, as an issue number or, for a draft, a `PVTI_...` item id (`.claude/skills/factory/SKILL.md`, step 3). The four stage skills choose for themselves. `factory-build` and `factory-retro` say "Take the first card whose status is ...". `factory-refine` and `factory-create-spec` say to work the cards in their column one at a time. With two cards in one column, two subagents reading the skill text can take the same card.

Each stage skill gains one instruction: a card named to it is the card it works, and the only one.

**Why this priority**: This is the whole card. `docs/solutions/26-orchestrator.md` says it has to be fixed before `/factory` runs on a busy column.

**Independent Test**: Read the four changed skills and confirm each one states the named-card rule before any instruction that chooses from the column. The live test is a `/factory` pass with two cards in one column after the merge, because skills load from master.

**Acceptance Scenarios**:

1. **Given** two cards in /factory-build and a prompt naming the second, **When** `factory-build` runs, **Then** it works the second card and leaves the first alone.
2. **Given** a prompt naming a card that is not in the skill's column, **When** the skill runs, **Then** it says so in one line and stops without taking another card.
3. **Given** a draft in /factory-refine named by its `PVTI_...` item id, **When** `factory-refine` runs, **Then** it works that draft.
4. **Given** a named card the skill has finished, **When** other cards wait in the column, **Then** the skill stops without starting one.

---

### User Story 2 - A human runs a stage skill with no card named (Priority: P2)

A human who types `/factory-build` with no card named gets what they get today.

**Why this priority**: The commands are also run by hand, and the card asks for no change there.

**Independent Test**: Read the four changed skills and confirm the existing column-selection text remains for the case where no card is named.

**Acceptance Scenarios**:

1. **Given** no card named, **When** a stage skill runs, **Then** it chooses from its column as it does today, and an empty column ends it in one line.

### Edge Cases

- A named card has moved out of the column since the prompt was written: the skill reports it and stops (Scenario 2).
- A subagent follows its card into the next column: the card is in that column by then, so the next skill finds it there.
- A draft is named to a skill other than `factory-refine`: the existing rule in `AGENTS.md` applies, and this card does not change it.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Each of `factory-refine`, `factory-create-spec`, `factory-build` and `factory-retro` MUST state in step 1 that a card named in its prompt or arguments is the only card it works.
- **FR-002**: The rule MUST accept an issue number or a `PVTI_...` item id, the two forms `/factory` passes.
- **FR-003**: A skill handed a card that is not in its column MUST say so in one line and stop, without falling back to another card.
- **FR-004**: A skill MUST stop when the named card is finished, without moving to the next card in the column.
- **FR-005**: With no card named, each skill MUST keep its existing selection text and behaviour.
- **FR-006**: The new text MUST NOT contain the literal skill-argument token, which is replaced at run time (`docs/solutions/traps.md`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All four skill files carry the named-card rule in step 1, and `factory-build` and `factory-retro` keep "first card" only for the no-card case.
- **SC-002**: `git diff --stat` for the build shows those four files and the spec directory, and nothing else.

## Assumptions

- ASSUMPTION: With no card named, selection stays as it is today.
- ASSUMPTION: A named card outside the skill's column ends the run in one line, with no fallback.
- ASSUMPTION: A card named in the skill's arguments counts the same as one named in the prompt.
- ASSUMPTION: A skill stops after its named card instead of carrying on through the column.
- ASSUMPTION: `factory-needs-you`, `factory-refresh` (#33 covers its `working` check) and `/factory` itself stay unchanged.
- The change only takes effect once merged to master, so the behaviour is reported unverified at PR time, with a `/factory` pass after the merge named as the test.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory-refine/SKILL.md` | Add the named-card rule to step 1, before "Work only on cards". |
| `.claude/skills/factory-create-spec/SKILL.md` | Add the named-card rule to step 1, before "Work only on cards". |
| `.claude/skills/factory-build/SKILL.md` | Add the named-card rule to step 1 and limit "Take the first card" to the no-card case. |
| `.claude/skills/factory-retro/SKILL.md` | Add the named-card rule to step 1 and limit "Take the first card" to the no-card case. |

Text for the rule, with the column name set per skill:

> If your prompt or arguments name a card, by issue number or `PVTI_...` item id, work that card and no other, and stop when it is finished. If it is not in **<column>**, say so in one line and stop. With no card named, carry on below.

## Rollback

Revert the PR. It changes four skill files and touches no board state or labels.

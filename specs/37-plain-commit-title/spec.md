# Feature Specification: Stop asking for a conventional commit title in factory-build

**Feature Branch**: `37-plain-commit-title`

**Created**: 2026-11-09

**Status**: Draft

**Input**: Issue #37, "Stop asking for a conventional commit title in factory-build", https://github.com/BobDempsey/software-factory/issues/37

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A build commit title that needs no amending (Priority: P1)

Step 7 of `.claude/skills/factory-build/SKILL.md` reads "One commit unless the spec asks for more. Conventional message, body wrapped at 72." This repo's history uses plain sentence titles (`git log --oneline`: "Add a help command to board.sh", "Make each stage skill work the card it is handed"). On #34 the build wrote a `feat(board):` title and the human had the prefix amended off before the push, as `docs/solutions/34-board-help.md` and `docs/solutions/traps.md` record. After this change, the agent running `/factory-build` reads step 7 and writes a plain sentence title the human does not have to amend.

**Why this priority**: It is the whole card.

**Independent Test**: Read step 7 of `.claude/skills/factory-build/SKILL.md`. It asks for a plain sentence title, says nothing about a conventional message, and still says the body wraps at 72.

**Acceptance Scenarios**:

1. **Given** the edited skill, **When** someone reads step 7, **Then** it asks for a one-sentence plain title with no type or scope prefix such as `feat(board):`.
2. **Given** the edited skill, **When** someone reads step 7, **Then** it still says one commit unless the spec asks for more, and that the body wraps at 72.
3. **Given** the edited skill, **When** someone searches it for "conventional", **Then** nothing matches.

### Edge Cases

- `docs/solutions/34-board-help.md` and `docs/solutions/traps.md` still name the old step 7 wording. The solution file is a record of a past run and stays as written. Whether the trap line stays is DECISIONS row 2.
- The rest of step 7, the `Assisted-by:` trailer and the ban on `Signed-off-by:`, is unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Step 7 of `.claude/skills/factory-build/SKILL.md` MUST ask for a commit title that is one plain sentence with no conventional-commit type or scope prefix.
- **FR-002**: Step 7 MUST describe the title in the shape the repo history uses: imperative, sentence case, no trailing period (DECISIONS row 1).
- **FR-003**: Step 7 MUST keep "one commit unless the spec asks for more" and "body wrapped at 72".
- **FR-004**: The word "conventional" MUST no longer appear in `.claude/skills/factory-build/SKILL.md`.
- **FR-005**: The step 7 paragraph about the `Assisted-by:` trailer and `Signed-off-by:` MUST stay unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: `rg -n -i conventional .claude/skills/factory-build/SKILL.md` prints nothing.
- **SC-002**: Step 7 names a plain sentence title and a body wrapped at 72.
- **SC-003**: The next `/factory-build` run produces a commit title the human does not amend. This can only be checked on that run, so the build reports it as unverified.

## Assumptions

- The title shape follows `git log --oneline` on master: imperative, sentence case, no trailing period (DECISIONS row 1).
- The trap line in `docs/solutions/traps.md` is left alone by this card (DECISIONS row 2).
- Step 8's PR title, `--title "<one sentence>"`, already asks for one sentence and is not touched.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory-build/SKILL.md` | Step 7: replace "Conventional message" with a plain sentence title rule, keep the 72-column body. |

## Rollback

Revert the commit. The change is one line of one skill file, and nothing reads it but the agent running `/factory-build`.

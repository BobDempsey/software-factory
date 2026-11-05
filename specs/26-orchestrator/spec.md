# Feature Specification: Work several cards at once from one quiet orchestrator command

**Feature Branch**: `26-orchestrator`

**Created**: 2026-11-05

**Status**: Draft

**Input**: Issue #26, "Work several cards at once from one quiet orchestrator command", https://github.com/BobDempsey/software-factory/issues/26

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Two cards move in the same run (Priority: P1)

Today `.claude/skills/factory-run/` and `.claude/skills/factory-watch/` each take one card per five-minute pass and work it in the foreground. A second card waits for the next tick even when nothing about it depends on the first. The human runs one new command, `/factory`, and every card sitting in an agent column gets its own background subagent, so cards move side by side.

The human lifted the outline's hold on parallel agents on 2026-11-05 (issue #26 LOG): `/factory` replaces `/factory-watch`, so proving the old loop first was judged wasted work.

**Why this priority**: It is the whole point of the card. Without it the command is `/factory-watch` under a new name.

**Independent Test**: Put two cards in agent columns that run alone (for example one in /factory-refine and one in /factory-create-spec), run `/factory`, and watch both move before either subagent has finished.

**Acceptance Scenarios**:

1. **Given** two cards in columns that run alone, **When** the human runs `/factory`, **Then** the orchestrator starts one background subagent per card, and both cards move on in the same run.
2. **Given** a subagent is already working a card, **When** the next pass fires, **Then** the orchestrator does not start a second subagent on that card.
3. **Given** the number of running subagents is at the cap, **When** a pass finds another card, **Then** it leaves the card for a later pass.

---

### User Story 2 - The board shows what is being worked right now (Priority: P2)

Folded in from #24. The human looks at the board and sees which cards an agent holds this minute, without asking the session. The orchestrator adds a short yellow `working` label to an issue when a subagent picks the card up, and removes it when the subagent stops, whichever way it stops.

**Why this priority**: Several agents moving cards at once is unreadable without it.

**Independent Test**: Run `/factory` with one card in /factory-refine. Check the issue carries `working` while the subagent runs and has lost it once the card lands in its next column.

**Acceptance Scenarios**:

1. **Given** a card the orchestrator picks up, **When** its subagent starts, **Then** the issue carries `working`.
2. **Given** a subagent finishes, fails, or is stopped, **When** the orchestrator is told, **Then** it removes `working` from that issue.
3. **Given** an issue still carries `working` from a session that died, **When** `/factory` starts, **Then** it removes the stale label before it starts any subagent.

---

### User Story 3 - The orchestrator speaks only when something changed (Priority: P3)

The command reports state changes and nothing else: a card parked in /factory-needs-you, a PR opened, or a subagent that failed. The board and each issue's LOG stay the only shared memory, so nothing a subagent learns lives only in the session.

**Why this priority**: A loop that narrates itself every five minutes is a loop the human stops reading.

**Independent Test**: Leave `/factory` running against a board where nothing is in an agent column. No pass prints anything until a card is dragged in.

**Acceptance Scenarios**:

1. **Given** a pass where no card changed state and no subagent finished, **Then** the pass prints nothing.
2. **Given** a subagent parks a card or opens a PR, **When** the orchestrator is notified, **Then** it prints one line for that card and the current list of cards waiting in /factory-needs-you.
3. **Given** a subagent fails, **Then** the orchestrator prints one line naming the card and the failure, and the card stays in its column.

---

### Edge Cases

- A card in /factory-build needs the human's yes before its subagent starts (DECISIONS row 3). The orchestrator asks in the session and starts nothing for that card until the human answers.
- A draft card outside /factory-refine is not work. The orchestrator names it and asks for it to be dragged back, as `/factory-watch` does today.
- Two cards in /factory-retro both edit `docs/solutions/traps.md` and may edit `AGENTS.md`, and the retro commits on master in the main checkout. Two at once would collide (DECISIONS row 4).
- A subagent that refines a card into /factory-create-spec keeps following it while the next column runs alone, as `/factory-watch` does today, and stops at /factory-build or a human column (DECISIONS row 9).
- The human types mid-run. The orchestrator answers; the background subagents keep running.
- The human says stop. The orchestrator stops every running subagent, removes their `working` labels, deletes the loop, and says the board state in one line.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A new skill at `.claude/skills/factory/SKILL.md` MUST provide the `/factory` command (DECISIONS row 5).
- **FR-002**: `/factory` MUST scan the board once with `./scripts/board.sh list` before it creates any schedule, and end without a schedule when no card sits in an agent column, as `/factory-watch` does today.
- **FR-003**: On each pass, `/factory` MUST start one background subagent, through the Agent tool, for each card in /factory-refine, /factory-create-spec, /factory-retro or an approved /factory-build that no subagent holds, up to the cap. [NEEDS CLARIFICATION: how many subagents may run at once? `docs/outline.md` puts the ceiling for code-writing agents at 3 to 4.]
- **FR-004**: Each subagent MUST run the existing skill for its card's column through the Skill tool, with that card named. It MUST NOT reimplement the skill, and the skill's rules bind it unchanged.
- **FR-005**: The build stage MUST keep working in `.claude/worktrees/worktree-<N>` through `EnterWorktree`, as `/factory-build` does today. The orchestrator MUST NOT pass the Agent tool's own `isolation: "worktree"`, whose worktree is not that path (DECISIONS row 6).
- **FR-006**: [NEEDS CLARIFICATION: does `/factory` replace `/factory-run` and `/factory-watch`, deleting both skills, or do they stay?] Whatever is removed MUST also leave `README.md`, `docs/workflow.md`, `docs/architecture.md`, `AGENTS.md` ("Where things are" and "Build order") and the skills that name it (`factory-needs-you`, `factory-refresh`) pointing at `/factory`.
- **FR-007**: `/factory` MUST add the `working` label to an issue when it starts that card's subagent and remove it when the subagent's completion notification arrives, whatever the outcome.
- **FR-008**: On start, `/factory` MUST remove `working` from every open issue that carries it, since no subagent can be running before the command starts (DECISIONS row 8).
- **FR-009**: The `working` label MUST exist in the repo, yellow. The build creates it with `gh label create working --color FBCA04 --description "An agent is working this card right now"` (DECISIONS row 7).
- **FR-010**: `/factory` MUST print only on a state change: a card parked, a PR opened, a card moved to Done, or a subagent failure. A pass with none of these prints nothing. [NEEDS CLARIFICATION: should a pass with no change still print the list of cards waiting in /factory-needs-you, as `/factory-watch` does on every pass?]
- **FR-011**: A card in /factory-build MUST NOT get a subagent until the human says yes in the session (DECISIONS row 3).
- **FR-012**: `/factory` MUST run at most one /factory-retro subagent at a time (DECISIONS row 4).
- **FR-013**: `/factory` MUST keep the rules every loop has today: never touch /factory-needs-you, @coderabbitai, Bob's Draft Notes or Done; never answer a DECISIONS row; stop after twelve passes at five minutes.
- **FR-014**: `docs/progress.md` MUST gain an entry for `/factory`, and its "On the shelf" line MUST drop parallel agents. `docs/outline.md` is left as it is: it is the design, and its shelf list changes through its own card.

### Key Entities

- **Card hold**: which card a running subagent owns. It is the `working` label on the issue, and nothing else. The session keeps no list of its own that could outlive a crash.
- **Cap**: the most subagents running at once, a number in `.factory/board.json` as `agentCap` (DECISIONS row 2).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In one `/factory` run, two cards move out of agent columns, each from its own subagent, before either subagent has finished.
- **SC-002**: Every issue carries `working` exactly while a subagent holds its card, and no issue carries it after the run ends.
- **SC-003**: A run with nothing to report prints nothing after its first line.

## Assumptions

- Checked against https://code.claude.com/docs/en/sub-agents.md on 2026-11-05: a background subagent keeps the Skill tool, is not filtered from `EnterWorktree`, loses `AskUserQuestion`, and does not get `CronCreate`. Its completion reaches the main session as a notification. Twenty may run at once by default (`CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS`), so the cap in FR-003 is this repo's choice, not the tool's.
- Not documented: the path and branch name of an `isolation: "worktree"` worktree, and whether `EnterWorktree` inside a subagent moves only that subagent. The build checks the second on its first live run and reports it. If `EnterWorktree` moves the main session too, the build stage runs in the foreground instead.
- Not documented: whether the cron loop fires while background subagents run (https://code.claude.com/docs/en/scheduled-tasks.md says only "while Claude Code is running and idle"). Completion notifications wake the orchestrator either way, so a pass missed while busy costs only latency.
- Every stage skill already runs alone and never asks the human, so losing `AskUserQuestion` in a subagent changes nothing. The one question, whether to build, is asked by the orchestrator in the main session.
- Refine and spec run in the main checkout, as today. Spec writes only `specs/<N>-<slug>/`, untracked, which `/factory-build` copies from there, so two specs at once touch different paths (DECISIONS row 6).
- `/factory-needs-you` stays the only reader of /factory-needs-you. No subagent is ever started for that column.
- `/factory-refresh` is unchanged apart from the line that names the removed loop.

## Files touched

| File | Change |
| --- | --- |
| `.claude/skills/factory/SKILL.md` | New: the `/factory` orchestrator |
| `.claude/skills/factory-run/SKILL.md` | Deleted, if DECISIONS row 1 says replace |
| `.claude/skills/factory-watch/SKILL.md` | Deleted, if DECISIONS row 1 says replace |
| `.factory/board.json` | New `agentCap` key |
| `.claude/skills/factory-needs-you/SKILL.md` | Names `/factory` instead of the removed loops |
| `.claude/skills/factory-refresh/SKILL.md` | Names `/factory` instead of `/factory-run` |
| `README.md` | The session starts with `/factory` |
| `docs/workflow.md` | "Starting a session" names `/factory` |
| `docs/architecture.md` | The loop line names `/factory` |
| `AGENTS.md` | "Where things are" and "Build order" name `/factory` |
| `docs/progress.md` | New entry; parallel agents off the shelf |

The `working` label is created with `gh label create` and is repo state outside the diff.

## Rollback

Revert the PR, which restores `/factory-run` and `/factory-watch` and removes `/factory`. Remove `working` from any issue still carrying it, then `gh label delete working --yes`, or leave the label: nothing reads it once `/factory` is gone.

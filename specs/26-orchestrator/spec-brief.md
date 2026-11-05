# Brief: work several cards at once from one quiet orchestrator command

One `/factory` command starts a background agent for every card in an agent column, marks each with `working`, and speaks only when a card changes state.

## WHAT THE USER SEES

- You run `/factory` once. Cards in different columns move at the same time.
- Every card an agent holds shows a yellow `working` label on the board, and loses it when the agent stops.
- The session stays quiet until a card parks, a PR opens, or an agent fails.
- A card in /factory-build still waits for your yes in the session.

## What changes

- New skill `.claude/skills/factory/SKILL.md`; each subagent runs the existing stage skill unchanged.
- OPEN: does `/factory` replace `/factory-run` and `/factory-watch`, deleting both?
- OPEN: how many subagents may run at once? Stored as `agentCap` in `.factory/board.json`.
- ASSUMPTION: building stays ask-first, asked once per card in the main session.
- CRITICAL: one retro at a time, because a retro commits on master in the main checkout.
- ASSUMPTION: the command is `/factory`, in `.claude/skills/factory/`.
- ASSUMPTION: only the build gets a worktree, through `EnterWorktree` as today, not the Agent tool's own.
- ASSUMPTION: label `working`, colour `FBCA04`, created by the build with `gh label create`.
- ASSUMPTION: on start, `/factory` strips `working` from every issue, since nothing can be running yet.
- ASSUMPTION: a subagent follows its own card through columns that run alone, as `/factory-watch` does.
- OPEN: does a quiet pass still list what waits in /factory-needs-you, or print nothing?

## Acceptance criteria

- When two cards sit in columns that run alone, the system shall move both in one run, each from its own subagent.
- When a subagent starts, the system shall add `working` to its issue, and remove it when the subagent stops for any reason.
- When `/factory` starts, the system shall remove every stale `working` label before starting a subagent.
- When a pass changes no card's state, the system shall print nothing beyond what DECISIONS row 10 allows.
- When a card sits in /factory-build, the system shall start no subagent for it until the human says yes.

## Scope

In scope: the new skill, `agentCap`, the `working` label, and every doc and skill that names the loop commands.

NOT in scope: changing any stage skill's behaviour, `/factory-needs-you` itself, `docs/outline.md`'s shelf list, a scheduled GitHub Action, and resuming a branch that already has a PR.

## Technical detail

Full spec in [spec.md](spec.md), plan in [plan.md](plan.md), task list in [tasks.md](tasks.md). Subagent tool access was checked against https://code.claude.com/docs/en/sub-agents.md; whether `EnterWorktree` inside a subagent moves the main session is undocumented and gets checked on the first live build.

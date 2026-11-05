---
name: factory
description: Run the factory. Scans the Software Factory board, stops at once if nothing is waiting, and otherwise starts one background agent per card in an agent column, so several cards move at the same time. Marks each card an agent holds with a `working` label, asks before building, and speaks only when a card changes state. Use when the user says to start the factory, run the factory, watch the board, keep the board moving, or work whatever is queued.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(./scripts/board.sh:*), Read, Write, Edit, Glob, Grep, Skill, Agent, TaskStop, CronCreate, CronDelete
---

# factory

One command for the whole board. It reads the board, hands every card it can to a background agent
of its own, and stays quiet until something changes.

The main session is the orchestrator. It never works a card itself. Each card goes to one subagent,
which runs the stage skill for that card's column, and the orchestrator keeps the loop, the labels
and the one question it ever asks: whether to build.

## Starting

**Scan before you schedule.** Read the board first (step 1 below). If no card sits in an agent
column, say so in one line and stop, without creating a schedule:

```
nothing to work. drag a card into an agent column and run /factory again.
```

Otherwise, before anything else:

1. **Clear stale holds.** No subagent can be running before this command starts, so every
   `working` label on an open issue was left behind by a session that died. Remove them all:

   ```bash
   for n in $(gh issue list --label working --state open --json number -q '.[].number'); do
     gh issue edit "$n" --remove-label working
   done
   ```

2. **Start the loop**, every five minutes, with CronCreate and the prompt `/factory`. Say the
   interval once, here, and never again.

3. Run the first pass.

On a later pass, fired by the loop, skip this section: the loop already exists.

### The loop stops after an hour

Count passes. At pass 12, delete the cron job with CronDelete. Subagents already running finish and
report as usual; nothing new starts. Say it once, in one line:
`factory stopped after 1h, 12 passes. /factory to restart.`

## Board constants

```bash
cat .factory/board.json
```

Column names come from there. `agentCap` is the most subagents that may run at once. Never hardcode
a column or option id.

## What a pass does

### 1. Read the board

```bash
./scripts/board.sh list | grep -vE '	(Done|Bob.s Draft Notes)	'
```

One call, in this session. Column five is the labels: a card whose labels include `working` is held
by a subagent already, and gets nothing new.

### 2. Start a subagent for each free card

Walk the agent columns in this order, and start one subagent per card that is not held, until
`agentCap` subagents are running:

| Column | Stage skill | Autonomy |
| --- | --- | --- |
| /factory-create-spec | `factory-create-spec` | **Alone.** |
| /factory-retro | `factory-retro` | **Alone, one at a time.** A retro commits on master in the main checkout and may edit `AGENTS.md` and `docs/solutions/traps.md`, so two at once collide. |
| /factory-refine | `factory-refine` | **Alone.** |
| /factory-build | `factory-build` | **Ask first**, per card, in this session. Start nothing for it until the human says yes. |

A card that does not fit under the cap waits for the next pass, or for a subagent to finish.

**Never touch** /factory-needs-you, @coderabbitai, Bob's Draft Notes or Done. Those wait on the human
or on CodeRabbit. `/factory-needs-you` is the human's own command, and no subagent is ever started
for that column.

**A draft outside /factory-refine is not work.** Name it and the column it sits in, ask for it to be
dragged back to /factory-refine, and leave it.

### 3. Hold the card, then start its subagent

Add the label first, so the board shows the hold before any work begins:

```bash
gh issue edit <N> --add-label working
```

A draft in /factory-refine has no issue yet, so it cannot carry a label. Hold it by its `PVTI_...`
item id for as long as its subagent runs, and start at most one draft subagent at a time, so no two
agents can convert the same note.

Then call the Agent tool with `run_in_background: true`, `subagent_type: general-purpose`, and no
`isolation`. The build makes its own worktree at `.claude/worktrees/worktree-<N>` through
`EnterWorktree`; the Agent tool's own worktree is not that path. The prompt:

```
You are working one card on the Software Factory board: <#N or PVTI_ item id>, "<title>",
now in <column>. Run the `<stage skill>` skill through the Skill tool, on this card only.
Its rules bind you unchanged. Never answer a DECISIONS row, and never touch another card.

When the skill moves this card into another column that runs alone (/factory-refine,
/factory-create-spec, /factory-retro), run that column's skill on it too. Stop when it lands
in /factory-build, /factory-needs-you, @coderabbitai or Done.

Do not remove the `working` label; the orchestrator does that.

Finish with one line: the card, the column it ended in, and what it produced
(a spec path, a PR number, a solution file), or FAILED and the reason.
```

### 4. When a subagent finishes

Its completion arrives as a notification. Whatever it says, first release the hold:

```bash
gh issue edit <N> --remove-label working
```

Then read the board once and report (below). A slot is free again, so start the next free card the
same way, without waiting for the next pass.

A subagent that fails leaves its card in the column it was in. Release the hold, report the failure,
and do not restart it on the same pass: a card that fails twice in a row is a card to name to the
human, not to retry.

## Reporting

Speak only when a card changes state: it parks in /factory-needs-you, a PR opens, it reaches Done,
or a subagent fails. One line per card:

```
#14  -> /factory-needs-you, specs/14-issue-template/, 3 rows for you
#15  -> @coderabbitai, PR #31
#16  FAILED in /factory-retro: merge commit not found
```

After those lines, every card waiting in /factory-needs-you, each with what its ACTION line asks
for in a few words:

```
waiting on you
  #14  answer 3 DECISIONS rows -> /factory-needs-you
  #12  merge PR #29            -> /factory-needs-you
```

**A pass with no state change prints nothing.** Not `nothing moved`, not the list of waiting cards,
not a pass count. A subagent that started this pass is not a state change; the `working` label on the
board already says so.

Never print the board, the interval, the cron job id or the cap. The last line on the screen is what
the human has to act on.

A question about a card in /factory-build is the one exception to quiet, and it is asked in one
line:

```
#26 is ready to build: one new skill, 11 files. build it?
```

## Being interrupted

A message from the human mid-pass is answered, and the subagents keep running underneath.

"Stop" ends everything: stop each running subagent with TaskStop, remove every `working` label this
session added, delete the loop with CronDelete, and say the board state in one line.

## Rules

- **Scan before you schedule.** An empty board ends the command; it does not start a loop.
- **One subagent per card.** The `working` label is the hold. A held card gets nothing new.
- **Never more than `agentCap` at once**, and never more than one retro.
- **Ask before building.** Refine, spec and retro run alone.
- **The orchestrator works no card itself.** Every stage runs in a subagent, through its skill,
  unchanged.
- **Never answer a DECISIONS row.** Transcribing the human's words is not answering.
- **Never act on a human column.** /factory-needs-you is theirs. @coderabbitai is CodeRabbit's.
- **Bob's Draft Notes is private.** Do not read it, list it, or count it.
- **Release every hold.** A subagent that stops for any reason loses its `working` label, and a
  stale one is cleared when `/factory` starts.
- **Quiet unless something changed.** A pass with no state change prints nothing.
- **One hour, then stop.** Twelve passes, then CronDelete and one line.
- **Everything is in the issue.** The board and each issue's LOG are the only shared memory. Nothing
  a subagent learns may live only in this session.

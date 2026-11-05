---
name: factory-watch
description: Watch the board and work whatever is on it, starting now. Scans the board first, stops immediately if nothing is waiting, and only then loops every five minutes, handing each card to the factory command that owns its column. Use when the user says to watch the board, poll the factory, keep an eye on it, or start work on whatever is queued.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(./scripts/board.sh:*), Read, Write, Edit, Glob, Grep, Skill, CronCreate, CronDelete
---

# factory-watch

Scan first, then loop. `/factory-run` starts a loop and finds out afterwards whether there was
anything to do. This does it the other way round: one board read, and if the board is empty the
command ends there without ever creating a schedule.

Somebody who runs this is ready to work. An empty board is an answer.

## Starting the loop

**Scan before you schedule.** The first thing this command does is step 1 below. Nothing else
happens first, and the human hears about a loop only once there is one.

- The scan finds a card — start the loop, then work the card:

  ```
  /loop 5m /factory-watch
  ```

  Say the interval once, here, and never again.

- The scan finds nothing — do not create a cron job. Say so in one line and stop:

  ```
  nothing to work. drag a card into an agent column and run /factory-watch again.
  ```

  A loop ticking against an empty board is twelve passes of nothing.

Never announce a schedule, an interval or a cron job before the scan has come back. On a later pass,
fired by the loop, skip this section: the loop already exists.

### The loop stops after an hour

- Count passes. At pass 12, delete the cron job and stop.
- Say it in one line: `watch expired after 1h, 12 passes. /factory-watch to restart.`
- Never mention the scheduler's seven-day cron default. It is not this command's behaviour.

## What a pass does

### 1. Read the board

```bash
./scripts/board.sh list | grep -vE '	(Done|Bob.s Draft Notes)	'
```

One call, in this session, and filter at the call site. Do not spawn a subagent to do this: it is a
single shell call, and waiting on a background agent costs more time than the read saves.

`Done` and Bob's Draft Notes are never actionable, so filtering in the pipe keeps them out of the
transcript entirely. Do not read `docs/outline.md` or `docs/progress.md` unless a card needs them.

Column three is the item type. A `DraftIssue` has no issue number, so its number column reads `-`
and you name it by its `PVTI_...` item id.

### 2. Pick up to one card, in this order

| Column | What to do | Autonomy |
| --- | --- | --- |
| /factory-create-spec | Run the `factory-create-spec` skill | **Alone.** Flags become DECISIONS rows, so nothing is decided without the human. |
| /factory-retro | Run the `factory-retro` skill | **Alone.** It asks nothing by design. |
| /factory-refine | Run the `factory-refine` skill | **Alone.** It parks anything it cannot settle in Needs you. |
| /factory-build | Run the `factory-build` skill | **Ask first.** It writes code and opens a PR. |

One card at a time, from the first column in that list that has one. Finishing one card beats
starting four.

**Follow your own move.** A finished card usually lands in the next agent column: `/factory-refine`
hands to `/factory-create-spec`, which hands to `/factory-build`. That card is not new work, it is
the same card one step along, so re-read the board and keep going in the same pass rather than
waiting five minutes to rediscover a move you just made.

Keep following it while the next column is one that runs alone. Stop the chain and end the pass when
the card lands in:

- **an ask-first column** (`/factory-build`) — ask the human, and that is the pass;
- **a human column** (Needs you, @coderabbitai) — their turn;
- **Done**, or a column with nothing in it.

The one-card rule is about not starting four unrelated things at once. Following a card you moved
yourself is still one thing. Starting a second card that was already sitting on the board when the
pass began is not: leave it for the next tick.

Invoke them through the Skill tool rather than reimplementing them. Their rules bind here unchanged:
no DECISIONS row is ever answered by an agent, no card is moved into a human column except by the
command that owns that transition.

**Never touch** Needs you, @coderabbitai, Bob's Draft Notes or Done. Those wait on the human or on
CodeRabbit, and a pass that nudges them is a pass that lies about what is blocking.

### 3. Hand back a misplaced draft

**/factory-refine is the only column that may hold a draft.** Every column after it needs a
written-out, labeled issue, so a draft further down the board skipped its intake.

Do not move it, do not convert it, do not work it. Say so in one line, naming the column and the
card, and ask the human to drag it back to /factory-refine. Then carry on with whatever else the
scan found.

### 4. Report the pass

Lead with what changed. Three lines at most.

```
pass 4   specced #11 -> Needs you, 3 rows for you
         #9 waiting on CodeRabbit, #12 in Needs you: merge the PR
```

An idle pass is one line:

```
pass 5   nothing moved
```

Do not re-list the board every pass. The human can see the board; what they cannot see is what you
just did.

### 5. Surface what is blocked on the human

Name anything sitting in Needs you, and what each card's ACTION line asks for. Say it once per card,
on the pass it arrives, then stay quiet until it moves unless the human asks.

## Being interrupted

A message from the human mid-pass is not an interruption to apologise for. Answer it, then carry on.
The loop keeps running underneath; the current pass just becomes that work. "Stop" ends the loop
immediately, with the board state in one line.

## Rules

- **Scan before you schedule.** No cron job exists until a scan has found a card. An idle board ends
  the command; it does not start a loop.
- **Scan in this session.** One `board.sh list` call, no subagent, no background work.
- **A draft outside /factory-refine is not work.** Name it, ask for it to be dragged back, and leave
  it where it is. Moving a human's card is the human's call.
- **One card per pass, followed as far as it goes.** Chain onto a column your own move filled, and
  stop at the first ask-first or human column. Never pick up a second card that the pass did not
  create.
- **Ask before building.** Refine, spec and retro run alone.
- **Never answer a DECISIONS row yourself.** Transcribing the human's words is not answering.
- **Never act on a human column.** Needs you is theirs. @coderabbitai is CodeRabbit's.
- **Bob's Draft Notes is private.** Do not read it, do not list it, do not count it.
- **Never print the board.** A pass says what it did, not what the board holds.
- **One hour, then stop.** Twelve passes, then CronDelete and one line saying how to restart.
- **Everything is in the issue.** Nothing a pass learns may live only in this session.

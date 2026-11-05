---
name: factory-run
description: Run the factory as a loop. Starts a recurring pass over the Software Factory board, moving every card it can through refine, spec, build and retro, reporting each pass in a few lines, and staying a conversation the human can interrupt at any time. Use when the user says to start the factory, run the factory, keep the board moving, or asks for the orchestrator.
allowed-tools: Bash(gh:*), Bash(git:*), Bash(./scripts/board.sh:*), Bash(node:*), Read, Write, Edit, Glob, Grep, Skill, ScheduleWakeup
---

# factory-run

Drive the whole board on a loop, and stay talkable while you do it.

`/factory-refresh` reports what moved and stops. This keeps going: every pass, take whatever the board hands over, do it, say what happened in a few lines, and sleep until the next pass.

The human can type at any moment. Their message arrives mid-pass and takes priority over whatever the pass was doing.

## Starting the loop

This skill runs under `/loop`. On the first invocation, start it:

```
/loop 5m /factory-run
```

If you were invoked directly rather than through `/loop`, say so in one line, start the loop, and run the first pass. Do not run passes by hand in a tight sequence; the loop exists so the session stays responsive between them.

Say the interval once, on the first pass only. After that the loop is assumed and repeating it is noise.

## What a pass does

### 1. Read the board

```bash
./scripts/board.sh list
```

One call. Do not read `docs/outline.md` or `docs/progress.md` unless a card needs them, and never read Bob's Draft Notes.

### 2. Pick up to one card, in this order

| Column | What to do | Autonomy |
| --- | --- | --- |
| Ready for spec | Run the `factory-create-spec` skill | **Alone.** Flags become DECISIONS rows, so nothing is decided without the human. |
| /factory-retro | Run the `factory-retro` skill | **Alone.** It asks nothing by design. |
| Ready for dev | Run the `factory-build` skill | **Ask first.** It writes code and opens a PR. |
| Needs refinement | Run the `factory-refine` skill | **Ask first.** Refinement is a conversation. |

One card per pass, from the first column in that list that has one. Finishing one card beats starting four.

**Never touch** Needs you, In review (PR), Bob's Draft Notes or Done. Those wait on the human or on CodeRabbit, and a pass that nudges them is a pass that lies about what is blocking.

Invoke the other commands through the Skill tool rather than reimplementing them. Their rules bind here unchanged: no DECISIONS row is ever answered by an agent, no card is moved into a human column except by the command that owns that transition.

### 3. Report the pass

Three lines at most. Lead with what changed.

```
pass 4   specced #11 -> Needs you, 3 rows for you
         #9 waiting on CodeRabbit, #12 in Needs you: merge the PR
```

When nothing moved and nothing is waiting on you, one line:

```
pass 5   nothing moved
```

Do not re-list the board every pass. The human can see the board; what they cannot see is what you just did.

### 4. Surface what is blocked on the human

Every pass, in one line, name anything sitting in Needs you, and what each card's ACTION line asks for. That is the whole reason to leave the loop running: the board tells them where the queue is, without them opening it.

Say it once per card, not once per pass. A card that has been in Needs you for six passes gets mentioned on the pass it arrived and then stays quiet until it moves, unless the human asks.

## Being interrupted

A message from the human mid-pass is not an interruption to apologise for. Answer it, then carry on.

They may:

- **Ask what is happening.** Answer from the board and the issues, not from memory of earlier passes.
- **Steer a card.** "That spec is wrong" means stop and fix it with them, in conversation. The loop keeps running underneath; the current pass just becomes that work.
- **Answer DECISIONS rows out loud.** Transcribe their words into the issue body verbatim and move the card on. This is the one way a card leaves Needs you without them opening GitHub.
- **Say stop.** End the loop immediately and say the board state in one line.

## Rules

- **One card per pass.** The loop is patient; you do not need to be.
- **Ask before building or refining.** Those two write code or need a conversation. Spec and retro run alone.
- **Never answer a DECISIONS row yourself.** Transcribing the human's words is not answering.
- **Never act on a human column.** Needs you is theirs. In review (PR) is CodeRabbit's.
- **Needs you is untouchable.** No pass reads it, acts on it, or offers it.
- **Bob's Draft Notes is private.** Do not read it, do not list its contents, do not count it.
- **Three lines a pass.** A loop that narrates itself is worse than no loop, because the human stops reading it.
- **Everything is in the issue.** Nothing a pass learns may live only in this session: it goes in the issue body, the spec, or `docs/solutions/`.

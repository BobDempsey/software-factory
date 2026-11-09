# Stop asking for a conventional commit title in factory-build

`/factory-build` step 7 asks for a plain sentence commit title, matching this repo's history, instead of a conventional message.

## WHAT THE USER SEES

The next build's commit reads like "Add a help command to board.sh" rather than "feat(board): add a help command", so the human no longer amends the title before the push.

## Summary

- One line changes: step 7 of `.claude/skills/factory-build/SKILL.md`, "Conventional message, body wrapped at 72."
- Hit on #34, recorded in `docs/solutions/34-board-help.md` and `docs/solutions/traps.md`.
- ASSUMPTION: the title is imperative, sentence case, no trailing period, as `git log --oneline` shows.
- ASSUMPTION: the trap line in `docs/solutions/traps.md` stays as it is; this card edits only the skill.
- The `Assisted-by:` and `Signed-off-by:` paragraph is unchanged.

## Acceptance criteria

- When someone reads step 7 of the build skill, the system shall ask for a one-sentence plain title with no type or scope prefix.
- When someone reads step 7, the system shall still say one commit unless the spec asks for more, and a body wrapped at 72.
- When someone searches the build skill for "conventional", the system shall return no match.
- When the next build commits, its title shall need no amending. Unverified until that run.

## Scope boundaries

In scope: the step 7 commit message line in `.claude/skills/factory-build/SKILL.md`.

NOT in scope: the step 8 PR title, the `Assisted-by:` rule, `docs/solutions/34-board-help.md`, the user-level `commit` skills, any hook that enforces a title format.

## Technical detail

Full spec: [spec.md](spec.md). Plan: [plan.md](plan.md). Tasks: [tasks.md](tasks.md). One file, `.claude/skills/factory-build/SKILL.md`, line 98 today.

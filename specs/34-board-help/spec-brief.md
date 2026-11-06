# Add a help command to board.sh

`./scripts/board.sh help` prints the usage and exits 0, so reading the usage no longer looks like a failure.

## WHAT THE USER SEES

Running `./scripts/board.sh help` prints the same command list a bad command prints today, and `echo $?` reads 0. A bad command or no command still prints the list and exits 1.

## Summary

- `scripts/board.sh` gains a `help)` case. Today only the catch-all prints the usage, with exit 1.
- `help` and the catch-all print the same header lines, so the two cannot drift.
- ASSUMPTION: the header comment gets a `board.sh help` line, and the printed range grows by one to include it.
- ASSUMPTION: only `help`. `-h` and `--help` stay unknown commands.
- ASSUMPTION: the catch-all is unchanged: usage on stdout, exit 1.
- ASSUMPTION: `help` still reads `.factory/board.json` first, so it fails without the config like every other command.

## Acceptance criteria

- When someone runs `./scripts/board.sh help`, the system shall print the usage block and exit 0.
- When someone runs `./scripts/board.sh` with an unknown command or none, the system shall print the same usage block and exit 1.
- When the usage prints, the system shall list `help` among the commands.

## Scope boundaries

In scope: the `help` case, its header line, and the shared usage range in `scripts/board.sh`.

NOT in scope: `-h` and `--help` aliases, per-command help, sending the catch-all's output to stderr, the `AGENTS.md` line that names the subcommands.

## Technical detail

Full spec: [spec.md](spec.md). Plan: [plan.md](plan.md). Tasks: [tasks.md](tasks.md). One file, `scripts/board.sh`. The usage is `sed -n '2,12p'` over the header today; lines 5 to 12 are the eight commands, `list` through `park`.

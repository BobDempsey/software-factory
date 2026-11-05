# software-factory

**[How it works, in one diagram](docs/architecture.md)**

A local-only agentic software factory, built one piece at a time, with this repo
as its own first pilot project.

The design lives in [docs/outline.md](docs/outline.md). The diagrams live in
Eraser: the pipeline, and the build order.

## Driving it from GitHub

You touch two columns. Everything between them moves itself.

1. Open the [board](https://github.com/users/BobDempsey/projects/4).
2. Write a one-line card in **Bob's Draft Notes** and drag it to **Needs expanding**.
3. Run `/factory-run`. It loops over the board, taking one card a pass through
   expand, refine, spec, build and retro, and reports each pass in a few lines.
4. Watch **Needs you**. Every card there opens with a bold `ACTION:` saying what
   it wants and a `RETURN TO:` naming where it goes next. Do the thing, drag it
   there, and the loop carries on.
5. Repeat step 4 until the card reaches **Done**.

`/factory-start` does a single card instead of looping, if you would rather drive
it by hand.

Agents propose work by filing issues labeled `factory:triage`. Only a human
applies `factory`.

Full detail in [docs/workflow.md](docs/workflow.md).

## Docs

- [docs/workflow.md](docs/workflow.md) is how the board is driven day to day.
- [docs/outline.md](docs/outline.md) is the full design.
- [docs/board-setup.md](docs/board-setup.md) is how to set up the Kanban board.
- [docs/progress.md](docs/progress.md) is what exists today and what is next.

Nothing here is installable yet. The whole loop has run once, on issue #2.

# software-factory

**[How it works, in one diagram](docs/architecture.md)**

A local-only agentic software factory, built one piece at a time, with this repo
as its own first pilot project.

The design lives in [docs/outline.md](docs/outline.md). The diagrams live in
Eraser: the pipeline, and the build order.

## Driving it from GitHub

You touch two columns. Everything between them moves itself.

1. Open the [board](https://github.com/users/BobDempsey/projects/4).
2. Write a one-line card in **Bob's Draft Notes** and drag it to **/factory-refine**.
3. Run `/factory`. It reads the board, stops right there if nothing is waiting,
   and otherwise gives every card in an agent column its own background agent,
   so cards move through refine, spec, build and retro side by side. A card an
   agent holds shows `working`. It asks before building, and speaks only when a
   card changes state.
4. Watch **/factory-needs-you**. Every card there opens with a bold `ACTION:` saying what
   it wants and a `RETURN TO:` naming where it goes next. Run `/factory-needs-you`
   to work that queue in chat: it asks, writes your answer into the issue, and
   moves the card. Dragging it yourself works just as well.
5. Repeat step 4 until the card reaches **Done**.

Every open issue in this repo lands in **Bob's Draft Notes** on its own, wherever
it was created. Issues agents file carry `agent-created`. Dragging a card out of
that column is what admits it.

To walk one card through by hand, run `/factory step #N`. It asks before every
column move.

Full detail in [docs/workflow.md](docs/workflow.md).

## Docs

- [docs/workflow.md](docs/workflow.md) is how the board is driven day to day.
- [docs/outline.md](docs/outline.md) is the full design.
- [docs/board-setup.md](docs/board-setup.md) is how to set up the Kanban board.
- [docs/progress.md](docs/progress.md) is what exists today and what is next.

Nothing here is installable yet. The whole loop has run once, on issue #2.

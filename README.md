# software-factory

A local-only agentic software factory, built one piece at a time, with this repo
as its own first pilot project.

The design lives in [docs/outline.md](docs/outline.md). The diagrams live in
Eraser: the pipeline, and the build order.

## Driving it from GitHub

1. Jot the idea as a card in **Bob's Draft Notes**. No issue, no labels.
2. Convert it to an issue, add `factory` and one `deliverable:*` label.
3. Drag it to **Inbox**. That drag is the admission act.
4. Agents move it from there. Watch **Needs you**: it is the only column that
   means you are blocking something.

Agents propose work by filing issues labeled `factory:triage` into **Triage**.
Approving one is swapping that label for `factory`.

Full detail in [docs/workflow.md](docs/workflow.md).

## Docs

- [docs/workflow.md](docs/workflow.md) is how the board is driven day to day.
- [docs/outline.md](docs/outline.md) is the full design.
- [docs/board-setup.md](docs/board-setup.md) is how to set up the Kanban board.
- [docs/progress.md](docs/progress.md) is what exists today and what is next.

Nothing here is installable yet. Current piece: issue sync.

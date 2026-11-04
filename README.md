# software-factory

A local-only agentic software factory, built one piece at a time, with this repo
as its own first pilot project.

The design lives in [docs/outline.md](docs/outline.md). The diagrams live in
Eraser: the pipeline, and the build order.

## Driving it from GitHub

Run `/factory-start` at the top of a session. It reads the board, says where
everything sits, and offers the first card waiting on refinement.

1. Jot the idea as a card in **Bob's Draft Notes**. No issue, no labels.
2. Drag it to **Needs refinement** and run `/factory-refine`. It sharpens the
   card with you, converts it to an issue, labels it, and moves it to
   **Ready for spec**.
3. Run `/factory-create-spec`. It writes the spec, puts the brief in the issue
   body, and parks the card in **Needs spec approval**.
4. Answer the `DECISIONS` rows in the issue body, then drag the card to
   **Ready for dev**.
5. Run `/factory-build`. It implements the spec, opens a PR, and moves the card
   to **In review**.
6. Merge the PR, then drag the card to **Merged**, then to **Needs retro**.
7. Run `/factory-retro`. It writes what the run taught us into
   `docs/solutions/` and moves the card to **Done**.

Agents propose work by filing issues labeled `factory:triage`. Only a human
applies `factory`, and only a human drags a card onward.

A scheduled GitHub Action will run the commands on its own later. Not yet.

Full detail in [docs/workflow.md](docs/workflow.md).

## Docs

- [docs/workflow.md](docs/workflow.md) is how the board is driven day to day.
- [docs/outline.md](docs/outline.md) is the full design.
- [docs/board-setup.md](docs/board-setup.md) is how to set up the Kanban board.
- [docs/progress.md](docs/progress.md) is what exists today and what is next.

Nothing here is installable yet. The whole loop has run once, on issue #2.

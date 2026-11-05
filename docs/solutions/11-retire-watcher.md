# 11: Retire the node watcher

Run closed 2026-11-05. Issue #11, PR #12, spec `specs/11-retire-watcher/`.

## What shipped

`scripts/watch.mjs` deleted, along with the section of `docs/workflow.md` that told you to run it. `docs/progress.md` gained a dated entry saying why. `/factory-run` is now the only thing in the repo that watches the board.

The watcher lasted from run #4 to run #11, both on the same day.

## What it taught us

- A deletion is a normal unit of work and the factory handles it unchanged. Expand, refine, spec, build, review, merge, retro all ran on a card whose deliverable was removing a file, with no special casing anywhere.
- The thing that killed the watcher was not that it was wrong. It worked, every acceptance criterion passed, and it was still the smaller half of something else. Duplication costs more than it looks: it was a second place every column rename had to land, and it failed that test within hours of shipping.
- Writing acceptance criteria as a grep is brittle. "`rg watch.mjs` returns matches only in these two paths" could not hold, because another criterion required the progress entry to name the file and the spec itself names it in every paragraph. The criterion was reported as failed rather than quietly rescoped, which is the right call and also a sign the criterion should have said "outside `specs/` and `docs/`".

## Traps

- **A criterion phrased as a whole-repo search will catch the spec that describes it.** Symptom: a `rg` criterion fails on files the change itself created. Scope repo-wide searches to the directories that matter, or phrase the criterion as "no match outside `specs/` and `docs/`".

## Spec versus diff

The diff matched the spec exactly: one file deleted, one doc section removed, one progress entry added. The out-of-scope list held, including the two tempting ones: `specs/4-board-watcher/` and `docs/solutions/4-board-watcher.md` were left exactly as written.

That was the interesting decision of the run. A factory that edits its own history to look tidier loses what `docs/solutions/` is for, so the record of building a thing survives the thing.

## Decisions revisited

Two `ASSUMPTION` rows, both answered yes on the recommendation, both confirmed.

Adding a progress entry rather than amending the old one was right: `docs/progress.md` now reads as a log that says the watcher landed and then why it went, which is more useful than a file that never mentions it.

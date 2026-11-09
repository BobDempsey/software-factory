# 32: Make each stage skill work the card it is handed

Run closed 2026-11-09. Issue #32, PR #43, spec `specs/32-work-named-card/`.

## What shipped

`factory-refine`, `factory-create-spec`, `factory-build` and `factory-retro` each gained one paragraph in step 1: a card named by issue number or `PVTI_...` item id in the prompt or arguments is the only card the skill works, and a named card outside the skill's column ends the run in one line. With no card named, selection is unchanged. The live test, two `/factory` subagents in one column, has not run yet.

## What it taught us

- The card `/factory-retro` filed from PR #31 said all four skills "take the first card". Only `factory-build` and `factory-retro` did; `factory-refine` and `factory-create-spec` said to work the column one at a time. Refine caught it by reading the skills. A card filed from a review summary restates the reviewer's reading, so refine checks it against the files before it trusts it.
- `/factory-create-spec` step 5c's fixed ACTION line says "Each carries a recommendation, so `y` accepts them all", but its DECISIONS table has no recommendation column and every Answer cell has to start as `UNANSWERED`. This run wrote yes/no questions so that `y` still meant something. The human answered all five rows with one sentence.
- The subagent worktree rule in `AGENTS.md` (`git worktree add`, then `git branch --unset-upstream`) worked first time, on its second use after #34.
- The named-card check reads `board.sh list`, which fetches at most 30 items. CodeRabbit flagged it as Major on all four skills, and the PR merged with it open.

## Traps

- **`board.sh list` stops at 30 items.** Symptom: a card on the board is missing from the list, so a named-card check reports it outside the column. `gh project item-list` defaults to `--limit 30`, and the board held 21 items at this run, so it has not bitten yet.
- **The skill-argument token in `factory-create-spec/SKILL.md:66` still gets replaced.** Symptom: the loaded skill reads "never a leftover `#32 only. STEP MODE: ...`". This is the trap from #27, hit again, because the line that carries it was never fixed.

## Spec versus diff

The diff matched the spec's file table: four skill files and the spec folder, 237 lines added. The spec said "limit 'Take the first card' to the no-card case" for build and retro; the build left that line as it was and scoped it with the new paragraph's last sentence, "With no card named, carry on below". The spec's own rule text says the same, so both are consistent.

## Decisions revisited

All five rows were answered yes. None was contradicted by the diff or the review. Row 2 (stop with no fallback when the named card is not in the column) is the one CodeRabbit's finding touches: with more than 30 items on the board it would stop on a card that is there.

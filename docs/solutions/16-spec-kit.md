# 16: Write specs with GitHub Spec Kit in /factory-create-spec

Run closed 2026-11-05. Issue #16, PR #23, spec `specs/16-spec-kit/`.

## What shipped

`specify init` (specify-cli 1.3.2.dev0) installed `.specify/` with Spec Kit's templates, bash scripts and a constitution copied from `AGENTS.md`. `/factory-create-spec` now fills in `.specify/templates/spec-template.md`, writes at most three `[NEEDS CLARIFICATION]` markers as `OPEN` DECISIONS rows, keeps `specs/<N>-<slug>/` naming, and ends `spec.md` with a `Files touched` and `Rollback` appendix. The nine `speckit-*` skills and the bundled `speckit` workflow that init wrote are deleted.

## What it taught us

- The spec was written from Spec Kit's docs, not from the version that would run, and two of its facts were wrong. It named `--ai claude`, which the current CLI has renamed to `--integration`. It said `create-new-feature.sh` creates and checks out a git branch, but the script runs no git command at all. It numbers spec directories with Spec Kit's `001-` counter and writes `.specify/feature.json`. DECISIONS row 1, a `CRITICAL` row, was answered on that wrong premise. The rule it led to survived, for a different reason. Spec work on a third-party tool reads that version's `--help` and source before stating what it does.
- Spec Kit 1.3 installs skills, not commands. The spec and DECISIONS row 5 talked about `.claude/commands/speckit.*`, but init wrote nine folders under `.claude/skills/`. Init also registered a bundled workflow in `.specify/workflows/` that called those skills. Deleting the skills without the workflow left a dangling second path to a spec, one that skips the board. CodeRabbit caught it, not the build.
- A human saying "done" after running an installer is not evidence that it ran. The first install attempt failed on the renamed flag, and the board sat for six watch passes with no `.specify/` before the error was seen. Checking for the installer's output, or for the directory it creates, settled it in one call each time.

## Traps

- **The auto mode classifier blocks running an installer fetched from a remote URL.** Symptom: `uv tool run --from git+https://...` is denied with no explanation. The human has to run it. Have them redirect the output to the session scratchpad so the agent can read the result.
- **`uv` installed by winget is not on the PATH in Git Bash.** Symptom: `which uv` finds nothing, and `winget install astral-sh.uv` says the package is already installed. The binary is at `~/AppData/Local/Microsoft/WinGet/Packages/astral-sh.uv_Microsoft.Winget.Source_8wekyb3d8bbwe/uv.exe`.
- **Staging one hunk of a file with uncommitted human edits, via `git hash-object` and `git update-index`, needs LF line endings.** With `core.autocrlf=true`, a blob built with `\r\n` shows as a whole-file change against the working copy. Build the blob from `git show HEAD:<file>`, which is LF, and insert with `\n`.
- **A Spec Kit refresh will likely restore what this run deleted.** `.specify/integrations/claude.manifest.json` still lists the nine `speckit-*` skills. Check `.claude/skills/` and `.specify/workflows/` after any `specify` command.

## Spec versus diff

The diff followed the spec's approach. It diverged on three points, and the diff was right each time. It used `--integration` instead of `--ai`. It deleted skills instead of commands, because skills are what this version writes. And, after review, it also deleted the `speckit` workflow and its registry entry, which the spec never mentioned. The `create-new-feature.sh` rule was corrected to the real reason in a second commit. The spec and brief still carry the wrong one, because they are the approved record.

Two acceptance criteria are unverified until `/factory-create-spec` next runs on a real card: the template's headings plus the appendix, and the `[NEEDS CLARIFICATION]` cap.

## Decisions revisited

- Row 1 (skip `create-new-feature.sh`): the answer was right, but its stated reason was false.
- Row 5 (delete the speckit commands): this held, and it widened to cover the skills and the bundled workflow that this version installs in their place.
- Row 6 (the human installs `uv`): this held, and the classifier made it the only option for the install too.

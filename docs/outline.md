# Software Factory Outline

Working draft, started 2026-11-04. Goal: a repeatable pipeline that takes an idea
from spec to deployed, reviewed, tested code with AI agents doing most of the
mechanical work and me approving at the gates.


## Decisions that shape day-to-day work

The full ledger is the rest of this document. These are the ones a session needs
in the first minute, moved here when `handoff.md` was retired.

- **One piece at a time, and a piece is done when it has been used on a real issue, not when it is written.** Never build three pieces before using any of them.
- **Spec Kit stays** as the spec framework. Steal `[NEEDS CLARIFICATION]` capped at three, the constitution file, and BMAD's `risk:` frontmatter, without adopting BMAD.
- **Skills, not `.claude/commands/`.** Commands are the legacy format.
- **Prose is a request; hooks are enforcement.** Anything absolute goes in a `PreToolUse` hook, never in `AGENTS.md`.
- **The reviewer must not be Claude.** Claude reviewing Claude is a second pass, not a second opinion. CodeRabbit plus self-hosted PR-Agent on a non-Claude model.
- **Red-first replay gates; mutation testing only reports** until there is a baseline.
- **`Assisted-by:` trailer, one line.** An agent never writes `Signed-off-by`.
- **The board shows state; git holds the truth.** Approval is a committed `spec.json` flag plus `agent-approval-check`, never a column.
- **Only a human admits work.** Agents may file `agent-created` issues; only a human drags a card out of Bob's Draft Notes.
- **Refinement is its own column and its own command.** A draft that is not ready goes to Needs refinement, and `/factory-refine` sharpens it with the human until it is one unit of work. Not refined means it stays in that column rather than moving on.
- **Refinement is also the admission gate.** There is no second pass behind it.
- **The spec brief lives in the issue body, not a comment.** A comment scrolls away. The body is what a reader sees first.
- **Approval is the `## DECISIONS` table** at the bottom of the issue body: one row per flag, every answer starting as the literal word `UNANSWERED`. The human replaces each one. An agent never fills in an answer, and `/factory-build` refuses to run while a row still says `UNANSWERED`. This stands in for `spec.json` for now.
- **Dragging to Ready for dev is the approval of the spec.** The build command trusts that drag plus the answered table.
- **Every column names the command or the person that acts on it.** A column nobody acts on should not exist. Merged was cut for exactly that: it asked for a second drag and nothing else.
- **The retro does not ask the human anything.** By the time a card reaches the retro column they have moved on, and a question they cannot answer makes a worse retro than silence. The friction is on disk: amended commits, unverified PR sections, files the spec never named.
- **A session opens on the board.** `/factory-run` is one `board.sh list` call and a loop. A document describing the state grows every session, and reading it before the work is context spent on the wrong thing.
- **The retro applies its own rule changes to `AGENTS.md`** rather than proposing them, and says in its report what it added so one edit reverts it. A proposal the human skims is the same as no rule.
- **Bob's Draft Notes is private.** Agents do not read it.

## Working with this user

- **Answer in one sentence.** Yes or no when asked for yes or no, with the qualifier after it only when the plain answer would mislead.
- **Do not build ahead.** Asked for one piece means one piece. The build order exists to stop scope creep, and offering extras works against it.
- **Verify before claiming.** They check the board and the repo against what you said. An API read is not proof that the UI agrees.
- **They pin down a design with long chains of yes-or-no questions.** Answer the question asked, in one word, and add a qualifier only when the bare answer would mislead. Do not volunteer the next step.
- **They screenshot the board and ask whether it is right.** Read the screenshot against the repo, not against memory.
- **Prose rules are in the user's global `CLAUDE.md`** and they apply to every markdown file here. No em dashes, no padded triads, no "leverage" or "robust" or "comprehensive".
- **No AI attribution in commits** beyond a single `Assisted-by:` line. No banner, no emoji, no co-author trailer.


## 1. Spec and planning

- Spec-driven development with GitHub Spec Kit as the entry point for every change.
- Each unit of work gets a spec, a plan, and a task list before any code is written.
- Research and plan steps run as agents; I approve the plan before implementation.

## 2. Implementation

- Claude Code in the terminal and the VS Code extension as the primary agent.
- Project-level CLAUDE.md plus skills and slash commands to encode house rules.
- Subagents or workflows for fan-out work (migrations, audits, broad sweeps).

## 3. Quality gates

- Tessl for spec-anchored test generation and verification.
- CodeRabbit on every pull request for an independent review pass.
- A security review pass on branch changes before merge.
- Local hooks: lint, typecheck, and tests run on save or pre-commit.

## 4. CI/CD

- GitHub Actions for build, test, and preview deploys on every PR.
- Vercel (or equivalent) for preview environments per branch and production promotion.
- Deploy logs and runtime errors pulled back into the agent loop for triage.

## 5. Handoff and memory

- The board per repo, so the next session picks up where the last one stopped.
- Persistent memory for preferences and standing decisions.
- Global todo list for the cross-project picture.

## 6. Observability and feedback

- Runtime error and log review on a schedule, not only when something breaks.
- Scheduled agents for recurring chores (dependency bumps, stale branch cleanup).

## Open questions

- Which repos are in scope first, and what is the pilot project?
- Self-hosted or managed CI, and what budget ceiling applies?
- How much autonomy do agents get at each gate before a human must sign off?
- What counts as "done" for a unit of work, and who or what verifies it?

## Next steps

- Pick the pilot repo.
- Stand up the spec -> plan -> implement -> review loop on one small change end to end.
- Write down the gate rules once the loop has run a few times.

---

## Session log

### 2026-11-04 — visual layer chosen

Decision: use **Eraser** (https://www.eraser.io) as the visual layer for the factory.

Why Eraser over Excalidraw, Miro, or Lucid:

- Hosted MCP server at `https://app.eraser.io/api/mcp`, so an agent can create and
  edit diagrams directly from Claude Code.
- Full diagram and file CRUD over MCP, not just one-shot rendering.
- Three editing modes: click-and-drag, AI prompt, and diagram-as-code.
- Cloud icon sets (AWS and friends), ERDs, sequence diagrams, flowcharts.
- Works on the free tier, subject to the same credit limits as in-app use.

Excalidraw was the runner-up. The open-source MCP server has no auth, no access
control, and no export beyond an excalidraw.com URL. `iagogfe/excalidraw-icons-mcp`
adds real AWS/Azure/GCP/Kubernetes icons if we ever want a local, free fallback.

### What was done

- Free Eraser account created.
- MCP server registered in Claude Code:
  `claude mcp add --transport http eraser https://app.eraser.io/api/mcp`
- Config landed in `C:\Users\bobde\.claude.json` under project `C:\Users\bobde`.
- OAuth completed. `claude mcp list` reports `eraser ... Connected`.

### Known gotcha

The Eraser tools do not appear in a session that was started before the server was
added, even after OAuth. Start a **fresh** session (not `--continue`) and the
`mcp__eraser__*` tools load.

### Start here next

1. Confirm the `mcp__eraser__*` tools are callable in a fresh session.
2. Draft the first diagram: the factory pipeline itself, spec -> plan -> implement
   -> review -> CI -> deploy, with the tool at each stage labeled.
3. Second diagram: target application architecture with AWS icons, once the pilot
   repo is picked.
4. Decide where diagram source lives. Preference is diagram-as-code checked into
   the repo so the picture and the code move together.
5. Answer the open questions above, starting with the pilot repo.

### 2026-11-04 — web research on agentic software factories

Three research agents swept vendor, consultancy, and academic sources. Findings below, filtered for a local-only factory (no hosted agent runners, no cloud sandboxes for agents; cloud is only for app deploys).

#### Consensus pipeline

The field converges on one stage list, with different names per vendor:

intake -> spec -> plan -> build -> verify -> merge gate -> operate

Atlan's five-stage version is the tightest published form: work intake, specification, agent execution, verification, merge gate. Microsoft's agentic-sdlc-starter is spec-gated the same way (assessor, resolver, specifier, generator, validator) and notably keeps the PRD away from the generator, which sees only the spec plus the instruction file. Our outline already matches this shape, so the work is filling in the layers around it, not reordering stages.

#### Four standing layers around the pipeline

Agent Baseline's framing is the one most worth adopting: **the agent proposes, policy authorizes, infrastructure enforces.** Four layers wrap every stage.

1. **Orchestration (the "agent harness").** BCG and Gartner both use the word harness: rule files, tooling, and hooks that tell agents how to behave at each stage. Locally this is CLAUDE.md, skills, slash commands, subagents, and hooks.
2. **Context and memory.** Specs, code context, and project context, plus persistence of validated decisions. Locally: the board, `docs/solutions/`, auto memory, path-scoped rules.
3. **Governance.** Sandbox, network egress, supply chain, and identity boundaries enforced outside the agent. Locally: Claude Code sandboxing, deny rules on secrets, a registry allowlist, branch protection.
4. **Observability and evaluation.** Enough record to reconstruct a run: tool calls, diffs, test results, cost. Plus evaluation kept separate from testing.

#### Autonomy ladder

Gartner's finding is that uniform governance across all agents is what breaks; govern proportionally instead. Agent Baseline's three levels map cleanly to us: human-orchestrated (I start each run), workflow-orchestrated (events and hooks trigger runs, approval gates on high-impact actions), agent-orchestrated (an orchestrator delegates to narrowed-authority agents).

Autonomy is per stage, not per agent. Generation and local execution inside a worktree can be near-autonomous; merge needs approval; schema, secrets, and production changes need strict review. One agent can be autonomous for writing tests and tightly gated for migrations.

Honesty check on gates: approval rates for permission prompts run around 93%, which means a per-action prompt is mostly theatre. Few gates, each on a genuinely irreversible action, placed before the side effect.

#### Gate order

Cheapest gate first, because each one costs more than the last.

1. Spec and acceptance criteria, human-approved before design.
2. Task sizing so each task is implementable and testable alone.
3. Context and policy injection (instruction files, hard constraints as hooks).
4. Sandbox and permission scoping (deny secrets, allowlist package registries).
5. Deterministic sensors in the loop: lint, typecheck, compile, format, with inline suppression disabled so the agent cannot silence them.
6. Agent-authored tests validated by **mutation score, not coverage**. Coverage is gameable by an agent; mutation score is not.
7. Identical CI for every author, enforced CI-side so a local bypass does not help.
8. An independent AI reviewer running a different model than the author.
9. Human review scoped to intent and blast radius, not syntax.
10. Provenance stamping on agent-authored commits.
11. Progressive delivery with a measured revert path.

The one rule to not compromise on: **verification artifacts live outside the implementation path.** Tests and acceptance criteria an agent can edit are not a gate. Independence is the whole mechanism.

#### Local orchestration rules

- Parallelize research and read-only analysis freely. Parallelize writes reluctantly.
- Practical ceiling is 3 to 4 concurrent code-writing agents when one human reviews. Review and semantic conflict resolution become the bottleneck, not generation.
- Partition by file ownership, not by feature description.
- Merge sequentially, one branch at a time, diffing against base first.
- Git worktree per agent. Claude Code enforces this with real checks, not advice.
- Native Windows is unsandboxed; use WSL2 if sandboxing matters.
- A `PostToolUse` hook running `git merge-tree` catches conflicts during development instead of at merge time.

CooperBench (ICLR 2026) measured roughly a 30% drop in success when two agents cooperate versus one agent doing both tasks. A study of 33,596 agent-authored PRs found a 41.7% cross-agent merge conflict rate against 19.8% intra-agent. Parallel agents are a cost, and they have to earn their place.

#### Context sizing

Keep CLAUDE.md under about 200 lines. Longer files eat context and measurably reduce adherence, and imports organize without reducing cost since imported files load with the importer. Move procedures into skills (loaded on demand) and part-of-codebase rules into path-scoped rules under `.claude/rules/`. AGENTS.md has become the cross-tool standard, now under the Agentic AI Foundation; Claude Code reads it when no CLAUDE.md exists at or above cwd.

#### Metrics to baseline before scaling

Capture 8 to 12 weeks before expanding agent use, or there is nothing to compare against.

- DORA four, tracked as a set. The 2025 report has throughput up and stability down at the same time, so either number alone lies.
- Code churn rate: lines changed within two weeks of being written.
- PR revert rate. This is the guard against speed bought with quality.
- Duplicated blocks of 5+ lines, and refactoring as a share of changed lines.
- Review load per reviewer and PR size distribution.
- Agent task success rate on our own backlog, attempts per completed task, cost per completed task, human intervention rate.
- AI reviewer precision measured on our repos, since published benchmarks disagree with each other.

Do not track lines of AI code, suggestion acceptance rate, or raw commit counts.

#### Failure modes with data behind them

- **Security does not improve with model quality.** Veracode tested 100+ models on 80 tasks: 45% of samples failed security tests, 86% failed to defend against XSS. Security performance stayed flat as functional correctness improved, so this gate cannot be retired by upgrading models.
- **Maintainability erodes.** GitClear, 211 million changed lines: churn up from 4.5% to 5.7%, refactoring down from 25% to under 10% of changed lines, copy-pasted lines exceeding moved lines for the first time on record, duplicated 5+ line blocks up roughly eightfold in 2024. Agents add rather than restructure.
- **Perceived speed is not speed.** METR's randomized trial: 16 experienced developers on repos they knew well were 19% slower with AI tools while estimating they were 20% faster. A 39-point perception gap means the factory cannot be steered by asking whether it feels like it is working.
- **Hallucinated dependencies.** 19.7% of generated samples across 16 models named at least one package that does not exist, and 43% of those names reappeared on every one of ten identical re-runs, which makes them reliably squattable. This is why the registry allowlist belongs in the sandbox layer.
- **Spec drift.** Code changes, the spec does not, silently. Drift detection has to be an enforced CI check rather than a convention.
- **Agent self-reports are not evidence.** In the Replit incident the assistant deleted a production database during a code freeze, fabricated records, and falsely reported rollback as impossible. Verification comes from outside the agent.

#### Open questions this research answers

- *How much autonomy at each gate?* Per stage, on the three-level ladder above, with autonomy earned by track record on a task class.
- *What counts as done?* Spec acceptance criteria met, deterministic gates green, mutation score above threshold, independent reviewer clear, human approved the intent. Verified by artifacts outside the agent's reach.

Still open: pilot repo, and the budget ceiling.

#### Revised next steps

1. Pick the pilot repo.
2. Write the gate list above into CI for that one repo before running agents on it.
3. Baseline the metrics for 8 weeks.
4. Run one small change end to end through spec, plan, implement, review, merge.
5. Add the second agent only after the single-agent loop is boring.

#### Key sources

- Agent Baseline, The Secure Software Factory reference architecture: https://agentbaseline.org/reference-architecture
- Atlan, Agentic Software Factory: https://atlan.com/know/ai-agent/agentic-software-factory/
- microsoft/agentic-sdlc-starter: https://github.com/microsoft/agentic-sdlc-starter
- BCG Platinion, The Agentic Software Factory: https://www.bcgplatinion.com/insights/the-agentic-software-factory
- CodeRabbit, Guardrails for agentic coding workflows: https://www.coderabbit.ai/guides/guardrails-for-agentic-coding-workflows
- Anthropic, Effective context engineering for AI agents: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Claude Code worktrees and sandboxing: https://code.claude.com/docs/en/worktrees and https://code.claude.com/docs/en/sandboxing
- CooperBench: https://cooperbench.com/
- GitClear, AI code quality research 2025: https://www.gitclear.com/ai_assistant_code_quality_2025_research
- Veracode 2025 GenAI Code Security Report: https://www.veracode.com/blog/genai-code-security-report/
- DORA 2025: https://dora.dev/dora-report-2025/
- DX AI Measurement Framework: https://getdx.com/blog/ai-measurement-framework-guide/
- arXiv 2604.26275, Agentic AI in the SDLC (six-layer L0-L5 architecture): https://arxiv.org/abs/2604.26275

## The spec brief (human review artifact)

Stage 2 produces two artifacts, not one, from the same source of truth:

- `spec.md` — the full technical spec the agents implement against.
- `spec-brief.md` — the human review document. This is what I read and approve at the gate.

The brief exists because the gate only works if it is cheap enough to actually read. A spec an approver skims is the same as no gate, and approval rates near 93% are what that looks like in practice. The brief is written to be scannable in under two minutes, and gets more technical the further down you read.

### Required structure

The brief is ordered widest to narrowest. Each section is deeper than the one above it, so a reader can stop at any point and still have made a real decision about everything above.

**1. The pitch.** One sentence, under 30 words, saying what this change is and who it is for. No preamble, no context paragraph. If it takes two sentences the unit of work is too big and should be split.

**2. WHAT THE USER SEES.** Mandatory section, in these words, near the top. Plain-language description of the observable change from outside the system: the screen, the button, the message, the email, the number that moves. If a change is genuinely invisible to users, the section says `NO USER-VISIBLE CHANGE` and names who or what does see it instead (an operator, a downstream service, a log). This section exists because specs drift toward describing mechanism and away from describing effect, and mechanism is not what gets approved.

**3. Scannable bullets.** The body of the brief. One line per item, no wrapping, no nested paragraphs. Written as claims that can be approved or rejected on sight rather than as descriptions.

**4. Flags in caps.** Anything that changes the risk of the change is marked inline in capitals so it cannot be missed while scanning:
- `CRITICAL` — gets this wrong and something breaks for users.
- `IRREVERSIBLE` — cannot be undone by a revert (data deleted, email sent, payment taken, migration applied).
- `SECURITY` — touches auth, permissions, secrets, or user data.
- `BREAKING` — changes an existing contract, API, or saved state.
- `ASSUMPTION` — the agent decided something the spec did not say. Every one of these needs a yes or no from me.
- `OPEN` — genuinely unresolved and blocking.

A brief with no flags on a non-trivial change is itself a signal that the spec work was shallow.

**5. Acceptance criteria.** Still in the brief, because this is what "done" means and it is the thing verification is built from. EARS form (when X, the system shall Y). These are the artifacts that must live outside the implementation path, so approving them here is approving the test contract.

**6. Scope boundaries.** Two short lists: in scope, and explicitly NOT in scope. The second list is the more useful one.

**7. Technical detail.** Everything below this line is for when I want it: files touched, data model changes, dependencies added, migration steps, rollback plan, performance notes. Progressive depth means this section can be long. Nothing above it may depend on having read it.

### Rules

- The brief is generated from the same source as the full spec, never hand-maintained alongside it. Two documents maintained separately drift, and the drift is silent.
- A CI check fails the PR when `spec.md` changes and `spec-brief.md` does not.
- Hard cap: the brief is one screen down to the end of acceptance criteria. If it does not fit, split the unit of work.
- Approval is recorded on the brief, with a timestamp and the commit it refers to, so the record says what was actually approved.
- Every `ASSUMPTION` and `OPEN` flag must be resolved before the gate can pass. The agent does not get to resolve its own assumptions.

### Template

```markdown
# <change name>

<one sentence: what this is and who it is for>

## WHAT THE USER SEES

<plain language, observable from outside the system, or NO USER-VISIBLE CHANGE>

## Summary

- <scannable claim>
- CRITICAL: <claim>
- IRREVERSIBLE: <claim>
- ASSUMPTION: <what the agent decided that the spec did not say>

## Acceptance criteria

- WHEN <trigger>, THE SYSTEM SHALL <observable result>

## Scope

In: <list>
NOT in: <list>

---

## Technical detail

<files, data model, dependencies, migration, rollback, performance>
```

## Input channels

> Update 2026-11-09: the `factory` label is gone and `factory:triage` is now `agent-created`. The board column is the admission control. Mentions of those labels below are the original design.

**Decision: one intake channel. Every item enters the factory as a single GitHub Issue labeled `factory`, and that issue is the parent record for everything downstream.**

One channel rather than several, because an intake with two front doors has no queue, no single place to see what is in flight, and nothing to attach approvals to. GitHub Issues wins over a separate tracker because the repo is already the system of record: the issue, the spec, the branch, the PR, and the merge all live in one place and link to each other without an integration in the middle.

### How an item moves in

1. An issue is opened and labeled `factory`. The label is the admission control, so an unlabeled issue is a note, not work.
2. Intake sizes it. One issue is one unit of work, scoped to a window of minutes to hours, not a two-week epic. Anything bigger is split into child issues before it is labeled.
3. The issue number is the correlation id for the whole run: branch name, worktree name, spec directory, and the approval record all carry it.
4. The issue body does not need to be a spec. It needs a problem statement and a reason. The spec is produced in stage 2.

### Intake sources feeding that one channel

Other sources are allowed, but they all have to become a labeled issue before anything runs. They are intake sources, not channels.

- Me, typing an idea.
- Runtime errors and deploy logs from the Operate stage, filed automatically.
- Scheduled chores (dependency bumps, stale branch cleanup).
- Review findings from a prior run that were deferred rather than fixed.
- Deferred work from an earlier run, filed as issues rather than left as prose.

Keeping the funnel narrow is what makes the queue honest, and it is also what makes work-in-progress limits enforceable: the number of open `factory` issues in progress is the dial that caps concurrency, matching the 3 to 4 concurrent writing agents ceiling.

### Rules

- No label, no run. An agent does not start work from a chat message, a comment, or a TODO in the code.
- One issue, one unit of work, one branch, one PR.
- Issues the agents file themselves land in a `factory:triage` state and need a human label to be admitted. Agents can propose work; they cannot admit it.
- The issue is closed by the merge, not by the agent that wrote the code.

### Eraser: no AI credits

**Decision: diagrams are authored with the non-AI Eraser tools only.** The free-tier AI
credits ran out on 2026-11-04 mid-edit, so the factory does not depend on them.

- Use `manually_create_diagram` and `manually_update_diagram`. Both write the diagram
  body verbatim, no model runs, and no credits are consumed.
- `create_diagram` and `update_diagram` take a natural-language prompt and spend credits.
  Do not use them.
- For freeform diagrams, `manually_update_diagram` takes a `freeformEdits` array of
  add, update, and delete ops against element ids, so a targeted change does not mean
  re-emitting the whole scene.
- Read current state with `get_diagram` and `includeFreeformDefinition: true` to get the
  element ids before editing.
- Reads, exports, and file and folder operations never cost credits.

This also fits the preference for diagram-as-code: the source is ours, checked into the
repo, and Eraser is the renderer rather than the author.

## What it takes to stand the factory up

In one sentence: one pilot repo wired with Spec Kit, CI gates the agents cannot edit, worktree isolation, and an issue label.

Everything below is that sentence expanded. None of it needs new infrastructure, and all of it runs on the local machine.

### The build list

**1. The pilot repo.** One repo, small enough that a bad run costs an afternoon, real enough that the loop is worth running. This is still the open decision blocking everything else.

**2. Intake.** A `factory` label on GitHub Issues, plus a `factory:triage` label for agent-filed items. Nothing to install.

**3. Spec.** GitHub Spec Kit installed in the repo. A `spec-brief.md` template committed alongside it, and a generator that produces the brief from the same source as `spec.md`.

**4. The harness.** A project `CLAUDE.md` under 200 lines, path-scoped rules in `.claude/rules/`, and skills for the repeated procedures. Most of this already exists globally and needs a project-level layer.

**5. Isolation.** Git worktrees per agent, already native to Claude Code. On Windows, WSL2 if sandboxing is wanted, since native Windows is unsandboxed.

**6. The gates in CI.** This is the real work, and the part that cannot be skipped:
- Lint, typecheck, and tests as required checks.
- Mutation score threshold, not a coverage threshold.
- An independent reviewer on every PR.
- A security scan.
- A drift check failing the PR when `spec.md` moves and `spec-brief.md` does not.
- Branch protection so none of the above can be bypassed locally.

**7. Baseline measurement.** Churn rate, PR revert rate, review load, and the DORA four, captured before agents are turned loose so there is something to compare against.

**8. Handoff.** The board in the pilot repo, so a run that stops mid-flight can be resumed from the column it stopped in.

### Order of operations

Build the gates before running the agents. A factory with agents and no gates is faster than a human at producing work nobody can trust, which is the expensive failure mode. The gates are also the only part that has to be right on day one; the harness, the brief template, and the metrics all improve by use.

### What is explicitly not required

No cloud agent runners, no hosted sandboxes, no orchestration platform, no second agent. The single-agent loop running end to end on one small change is the milestone. Parallelism is an optimization to add after that loop is boring, and the research says it costs more than it looks like it does.

## One ticket, end to end

What the factory feels like from the outside, for a single unit of work.

You open an issue, label it `factory`, and walk away. A few minutes later the agent posts `spec-brief.md` on the issue and stops: you read a one-sentence pitch, WHAT THE USER SEES, a dozen bullets with anything risky in caps, and you reply approve or you answer the `ASSUMPTION` flags. It builds in its own worktree and opens a PR with the checks already green, so what reaches you is a diff, the brief you approved, and the reviewer's comments. You approve the merge, approve the production promotion, and the issue closes itself.

Three decisions from you, each one a yes or a no on something already laid out.

### The same thing, stage by stage

| Stage | The agent does | You see | You do |
| --- | --- | --- | --- |
| Intake | Picks up the labeled issue, sizes it, claims the issue number as the run id | A comment: scope accepted, or a request to split | Nothing, or split the issue |
| Spec | Writes `spec.md` and generates `spec-brief.md` | The brief, posted on the issue | **Gate 1:** approve, or answer the flags |
| Build | Works in `worktree-<issue>` on its own branch | Nothing. Silence here is correct | Nothing |
| Verify | Runs lint, typecheck, mutation-scored tests, reviewer, security scan | A PR with checks green or red | Nothing until green |
| Merge gate | Waits | Diff, the approved brief, reviewer comments | **Gate 2:** approve the merge |
| CI/CD | Builds, tests, deploys a preview | Preview URL on the PR | **Gate 3:** approve production |
| Operate | Watches errors and logs | A new labeled issue if something breaks | Nothing; the loop restarts |

### When it does not go cleanly

- **Flags unanswered.** The run stops at gate 1 and stays stopped. Agents do not resolve their own `ASSUMPTION` entries.
- **Checks red.** The agent iterates inside its worktree. You are not asked to look until they are green, and a run that cannot get green comes back to you as a question, not a PR.
- **Scope grew.** The merge-gate diff is checked against the approved brief. A diff that exceeds what was approved goes back to spec rather than through.
- **It broke in production.** Revert first, then the incident becomes a new `factory` issue. The fix goes through the same three gates as anything else.

### What you are actually approving

Gate 1 is the only one where you shape the work. Gate 2 and gate 3 are checks on an already-constrained result, which is why they can be quick. If you find yourself doing real thinking at gate 2, the brief at gate 1 was not specific enough, and that is the thing to fix rather than adding another gate.

## Self-monitoring

The observability layer collects; self-monitoring is what reads it. Without this, metrics are a folder nobody opens.

A scheduled agent runs weekly against git history, CI results, and the issue queue, and files one report as a `factory` issue. No new infrastructure: everything it needs is already in the repo.

### What it reports

- **Flow.** Issues admitted, merged, and still in flight. Age of the oldest in-flight item. Time spent at each gate, which is where stalls show up.
- **Gate behavior.** Pass rate per gate, which gate fails most, and how often a gate was bypassed or overridden. A gate that never fails is either perfect or not running; both are worth knowing.
- **Quality leading indicators.** Code churn rate, PR revert rate, duplicated blocks of 5+ lines, refactoring as a share of changed lines. These move before delivery metrics do.
- **Agent performance.** Task success rate, attempts per completed task, human intervention rate, cost per completed task.
- **Reviewer precision.** How many reviewer findings were acted on versus dismissed. A reviewer trending toward noise trains people to ignore it, which is worse than not having one.
- **Drift.** Specs that moved without their brief, instruction files growing past the 200-line cap, skills nobody has invoked.

### Alarms

Three conditions get raised immediately rather than waiting for the weekly report, because each one means the factory is producing work that cannot be trusted:

- Revert rate crossing its threshold.
- A gate disabled, skipped, or overridden more than once in a week.
- Churn rate climbing for three consecutive weeks.

### Rules

- The monitor reads only. It opens issues; it does not change code, thresholds, or rules.
- It reports against the baseline captured before agents were turned loose. Without that baseline the numbers describe nothing.
- Its own report is subject to the same rule as any agent output: the numbers come from git and CI, not from asking the agents how they did.

## Self-improvement

**The rule: every gate failure and every human correction becomes a rule, a skill, or a CI check, so the same mistake cannot pass twice.**

This is the only mechanism that makes the factory better rather than just busier. Left alone, agents repeat the same classes of mistake indefinitely, because nothing in a fresh context remembers last Tuesday.

### The loop

1. **Capture.** Every gate failure, reviewer finding that was acted on, and human correction at gate 1 gets logged with the issue number and the gate that caught it.
2. **Cluster.** The weekly monitor groups them. A single occurrence is noise. The same correction three times is a missing rule.
3. **Propose.** The monitor files an issue naming the pattern and proposing exactly one of four fixes:
   - a **rule** in `.claude/rules/` when it is a convention, scoped by path,
   - a **skill** when it is a repeated procedure,
   - a **CI check** when it can be decided deterministically,
   - a **spec template change** when the problem was that the question was never asked.
4. **Approve.** I approve the change. The factory proposes improvements to itself; it does not apply them.
5. **Verify.** The improvement is itself a `factory` issue and goes through the same three gates as any other change.

### Preference order

CI check beats rule beats skill beats prose, every time. Anything that can be decided deterministically should be, because a check cannot be talked out of its position and a rule can. Prose in `CLAUDE.md` is the last resort, and it costs context on every single run, which is why the 200-line cap is enforced.

### Pruning

Self-improvement that only adds becomes the context-rot failure mode. Each cycle removes as well:

- Rules that have not fired in two months.
- Skills nobody has invoked.
- CI checks that have never failed and never could.
- Any instruction contradicted by a newer one. Contradictory instructions are resolved arbitrarily by the model, which is the worst possible outcome.

### What does not improve itself

Thresholds, gate definitions, and the autonomy ladder are set by me. An agent that can lower its own bar has no bar. The factory can propose a threshold change the same as anything else, and it goes through gate 1 like anything else.

## Where the factory lives

**Decision: the factory is its own GitHub repository, and it installs into a product repo as a self-contained `.factory/` directory plus a few thin stub files at the paths the tools require.**

Two reasons for a standalone repo. The factory is a thing we work on in its own right, with its own issues, its own history, and its own diagram, and that work should not be tangled in a product repo's history. And the factory has to be installable into more than one project, which means it needs a source of truth outside all of them.

### The factory repo

```
software-factory/
  README.md
  docs/
    outline.md              # this document, moved off the desktop
    diagrams/               # diagram-as-code, the Eraser source
  template/                 # everything that gets copied into a product repo
    .factory/
      rules/                # path-scoped rules
      skills/               # the repeated procedures
      commands/             # slash commands: intake, spec, brief, build, verify, pr, triage, factory-status
      templates/
        spec-brief.md
        issue-forms/
      checks/               # the gate scripts CI calls
      config.yml            # thresholds, labels, concurrency cap
      VERSION
    stubs/
      CLAUDE.md             # one import line pointing into .factory/
      .claude/              # thin pointers to .factory/skills and .factory/rules
      .github/workflows/    # factory-*.yml, each one calling .factory/checks/
  install/
    install.sh
    sync.sh
```

### Installing into a product repo

The product repo ends up with one directory it can ignore and three small files it cannot:

```
your-project/
  .factory/                 # the whole factory, self-contained
  CLAUDE.md                 # imports .factory/rules
  .claude/                  # pointers only
  .github/workflows/
    factory-gates.yml       # calls .factory/checks/
    factory-monitor.yml     # the weekly self-monitoring run
  src/ ...                  # untouched
```

Contamination is minimal by design. Everything the factory owns lives under `.factory/`, and the stubs exist only because GitHub Actions and Claude Code read from fixed paths and will not look anywhere else. If a stub ever needs logic in it, that logic belongs in `.factory/` with the stub calling into it.

### Install and sync

Two commands, both thin wrappers over git:

- **`/factory-install`** — copies `template/` into the current repo, writes the stubs, pins the factory version in `.factory/VERSION`, and opens a PR rather than committing directly. The install is itself a change that goes through review.
- **`/factory-sync`** — fetches the factory repo, diffs the pinned version against the current one, and reports what changed before touching anything. Updates land as a PR with the factory changelog in the body.

### Sync rules

- **Version pinning.** `.factory/VERSION` records the factory commit the project is on. Without it, sync has no idea what it is upgrading from.
- **Nothing silent.** Sync never rewrites files behind your back. It proposes a PR, and the PR goes through the same gates as any other change.
- **Local overrides survive.** A project can override a threshold or disable a check in `.factory/config.yml`, and sync preserves local values rather than stamping over them. Overrides are listed in the sync report so they stay visible rather than becoming invisible drift.
- **One direction.** Improvements flow factory to project. A fix discovered in a project is filed back as an issue on the factory repo and goes through the self-improvement loop; it is not hand-edited into one project and forgotten.
- **Divergence is reported.** If `.factory/` was edited in place, sync says so instead of silently clobbering it or silently skipping.

### What this gives us

The self-improvement loop now has somewhere to put its output. A rule learned on one project becomes a factory commit, and every other project picks it up on its next sync. That is the difference between a factory that improves and one project that happens to get better.

## Decisions from the open-source survey

Three research agents surveyed open-source factories, Claude Code harness patterns, and gate tooling on 2026-11-04. The headline finding: repos branded "agentic software factory" are tiny (microsoft/agentic-sdlc-starter has 21 stars), while the real adoption sits in harnesses and spec-driven tools (obra/superpowers 312k, github/spec-kit 147k, Fission-AI/OpenSpec 74k). We were looking at the wrong tier of the field.

Decisions below are settled. Each names its dependency so nothing arrives by accident.

### Dependency ledger

| Decision | Dependency | New, replacing, or none |
| --- | --- | --- |
| Spec framework | github/spec-kit | None, already planned |
| Independent review | CodeRabbit + self-hosted PR-Agent on a non-Claude model | One new (PR-Agent) |
| Spec drift | fiberplane/drift | New |
| Harness format | Claude Code skills | Replaces `.claude/commands/` |
| Provenance | `Assisted-by:` trailer + GitHub App bot identity | None, convention only |
| Gate record | `spec.json` + anthropics/claude-code-action `agent-approval-check` | New (the action) |
| Test validity | Red-first replay script; Stryker / mutmut / pitest report-only | One new, stack-dependent |
| Learning capture | `docs/solutions/`, plain markdown | None |
| Control plane | GitHub Projects board + claude-code-action | New (the GitHub App) |

### 1. Spec Kit stays

147k stars, pushed daily, MIT, 124 community extensions and 23 presets. Nothing in the survey justified replacing it. We steal two conventions rather than switching frameworks:

- **`[NEEDS CLARIFICATION: question]` markers, capped at three**, prioritized scope > security and privacy > user experience > technical details, with "no markers remain" as a gate condition. This is the mechanism for the `ASSUMPTION` and `OPEN` flags we already specified.
- **The constitution file.** Written once per project, holding non-negotiable principles every later phase must respect, with a Constitution Check gate in the plan template.

Also adopted from Kiro's workflow: **silence is not approval.** The gate requires an explicit word, not an absence of objection. And a Decisions Needed section with recommended defaults in bold, so the common case is a one-word reply.

BMAD was the runner-up. We take its `risk:` and `review:` frontmatter fields into our own brief template so CI can route review depth, without adopting the framework.

### 2. Two reviewers, one of them not Claude

The survey named a flaw in the earlier plan: **Claude reviewing Claude is correlated, not independent.** Running `claude-code-action` as the only reviewer buys a second pass, not a second opinion.

- **CodeRabbit** on the PR. Free forever on public repos, roughly $24 to $72 per active developer per month on private ones. Config is `.coderabbit.yaml`; keep noise down with `reviews.profile`, `path_filters` excluding generated files and lockfiles, and natural-language custom instructions.
- **PR-Agent self-hosted** (Apache-2.0) pointed at a different model family, GPT or Gemini, for a few dollars of tokens a month. This is the cheapest genuine model independence available.

### 3. fiberplane/drift for spec-to-code drift

MIT, active, AST-fingerprint based, so reformatting does not trip it. You bind a doc to a symbol (`drift link docs/auth.md src/auth/provider.ts#AuthConfig`) and CI runs `drift check --changed`, exiting nonzero on staleness. It is the only tool that says *which* spec went stale rather than that something changed.

Worth knowing: the survey calls spec-to-code drift the field's central unsolved problem, and Spec Kit's own newsletter lists drift management as a competitive gap. We are not going to solve it; we are going to catch the obvious half cheaply.

### 4. Skills, not commands

Correction to the earlier slash-command list. `.claude/commands/` is now the **legacy format**; `.claude/skills/<name>/SKILL.md` produces the same `/name` invocation and adds supporting files, `paths` filtering, `context: fork`, and model and effort overrides.

Two rules that follow:

- **Do not rebuild what ships.** `/code-review`, `/security-review`, `/simplify`, `/run`, `/verify`, and `/fewer-permission-prompts` already exist.
- **Prose is a request; hooks are enforcement.** An instruction like "never edit `.env`" in `CLAUDE.md` is a request. A `PreToolUse` hook that exits 2 is the guarantee. Anything absolute belongs in a hook or a permission rule.

Two corrections to things written earlier in this document: `@path` imports do **not** save context, since imported files load with the importer; only `paths:`-scoped rules and skills defer loading. And `CLAUDE.local.md` is not deprecated.

Also adopted: Metabase's **write/review skill pairing** (`typescript-write` beside `typescript-review`), and zed's Rules Hygiene principle, **"rules should be traps to avoid, not maps to follow."**

### 5. Provenance: one line, no banner

`Assisted-by:` trailer on agent-authored commits, which is the Fedora, LLVM, and OpenTelemetry convention, plus a GitHub App bot identity so `git log --author` separates agent work from mine. One line, no prose, no emoji, no "generated with" banner, which keeps the intent of the no-AI-verbiage rule intact.

**An agent never writes `Signed-off-by`.** Only a human can certify the DCO. This one is absolute, so it belongs in a hook rather than in prose.

### 6. Gates recorded as committed facts

- **Gate 1** is a `spec.json` beside the spec with per-phase `{generated, approved}` flags and one `ready_for_implementation` flag the build step checks. Approval becomes a diffable commit rather than a sentence in a chat window.
- **Gate 2** is Anthropic's `agent-approval-check` action, described as the gate they run internally on every agent-authored PR. It requires N human approvals on agent-authored PRs, triggers on `pull_request_target` so the workflow runs from the base branch and a PR cannot edit the check to approve itself, verifies write access per approver, and fails closed. Do not use `exempt_head_branches`, since branch names are attacker-controlled.

### 7. Test validity: red-first replay now, mutation later

- **Red-first replay is the gate.** Every new test is run against the merge-base worktree and must FAIL there. A dozen lines of script, no dependency, and it is the only check that mechanically separates "this test encodes a requirement" from "this test encodes current behavior." Tautological tests are the specific failure mode of agent-written tests.
- **Mutation testing reports, it does not gate, until there is a baseline.** Diff-scoped on each PR plus a full nightly run. Tool follows the pilot repo's stack: StrykerJS for TS and JS, mutmut for Python, pitest for Java. A threshold set on day one fights you, equivalent mutants need manual triage every time, and a flaky run makes kill-or-survive meaningless.

Supporting evidence worth recording: Birgitta Böckeler found **no discernible difference between TDD and non-TDD agent workflows** across five batches, and now uses mutation testing rather than process instructions to assess test effectiveness. Process prompts do not produce good tests; measurement does.

### 8. Learning capture: `docs/solutions/`

Adopted from EveryInc's `/ce-compound`. Every run that taught us something writes a short markdown file to `docs/solutions/`, and the spec and plan steps read that directory back on later runs. Their documented case: a lesson captured about an environment variable trap was applied 18 days later on unrelated work.

This is the concrete mechanism the self-improvement section was missing. The loop already specified (capture, cluster, propose, approve, verify) now has a file system under it.

### 9. Deferred, deliberately

Not in scope for v1, recorded so they are a decision rather than an oversight:

- **Test-tamper hook** (snapshot test hashes at `SessionStart`, block at `Stop` if tests were weakened while no source changed). Roughly 40 lines. Add when agents start touching existing tests. Do not install the zero-star PyPI packages that claim to do this; several read as machine-generated.
- **Post-merge verification** (`/canary`, `/land-and-deploy`). Almost nobody in the field verifies after merge, which makes it a real gap, but it is not v1.
- **Cost guard hook** (`PreToolUse` ceiling plus a repeated-identical-call loop guard). Matters once runs are unattended.

## The GitHub board is the control plane

**Decision: a GitHub Projects board is the factory's control surface. You file an issue, the agents move the card from column to column, and a single "/factory-needs-you" column is the only place you have to look to know whether you are blocking anything.**

This replaces nothing in the pipeline. The seven stages, the three gates, and the standing layers are unchanged. The board is where that pipeline becomes visible.

### Columns

One per stage, plus the gate column:

```
Draft -> Inbox -> Spec -> [/factory-needs-you] -> Build -> Verify -> [/factory-needs-you] -> Merge gate -> CI/CD -> [/factory-needs-you] -> Operate -> Done
```

In practice that is ten columns: **Draft, Inbox, Spec, /factory-needs-you, Build, Verify, Merge gate, CI/CD, Operate, Done.** Cards return to the one /factory-needs-you column at each of the three gates rather than having three separate ones, so there is a single place that answers "is anything waiting on me."

**Draft is the ingestion control.** It holds my own notes and half-formed ideas, carries no `factory` label, and no agent reads it. A card there does not even have to be an issue; a plain board note works until it is worth one. Admission is a deliberate two-part act: add the `factory` label, and move the card to Inbox. Until both happen the item is invisible to the factory. The setup procedure is in `docs/board-setup.md`.

### How work moves

1. **You file an issue** and drop it in Inbox. Typing it by hand is the normal case. The issue body needs a problem and a reason, not a spec.
2. **You run `/factory-sync-issues`** (or the scheduled run picks it up). It reads Inbox, admits anything labeled `factory`, sizes it, and moves the card to Spec.
3. **The agent works a stage and moves the card itself.** Column position is the run's state, readable with `gh project item-list`, which is also what the weekly monitor reads for time-in-stage.
4. **At a gate the agent moves the card to /factory-needs-you** and posts what it needs: the spec brief at gate 1, the diff and reviewer comments at gate 2, the preview URL at gate 3.
5. **You reply in the issue thread**, either in the GitHub UI with `@claude` or from the terminal. The agent flips the matching `spec.json` flag, commits it, and moves the card onward.
6. **Merge closes the issue**, and the card lands in Done.

### Talking to it

The GitHub App is installed with `/install-github-app`, which drops `claude.yml` into `.github/workflows/`. Commenting `@claude` on the issue runs the agent in Actions and it answers in the thread, so the board, the conversation, and the approval all live in one place. The terminal still drives everything else.

Hardening, copied from how Anthropic hardens their own workflow:

- SHA-pinned checkout, minimal `contents` / `issues` / `pull-requests` permissions.
- `concurrency` keyed on the issue number with `cancel-in-progress`, or repeated `@claude` comments spawn parallel jobs on one thread.
- `timeout-minutes` and `--max-turns`, plus `--max-budget-usd` as a ceiling. The budget flag counts subagent spend and can overshoot, so leave headroom.
- Bot actors are rejected by default, which is what stops an agent from triggering an agent in a loop. Leave that default alone.

### Why the board rather than files alone

The state was always going to exist somewhere. Keeping it on a board rather than only in `.planning/`-style files buys three things: you can see the queue from a phone, the "is anything waiting on me" question has a one-glance answer, and the weekly monitor gets time-in-stage for free rather than parsing timestamps out of markdown.

What the board is **not** is the record of approval. Moving a card is a convenience, not a fact in git. The `spec.json` flag and the `agent-approval-check` action remain the enforcement, because a card can be dragged by accident and a stale card can sit over a changed spec. The board shows state; git holds the truth.

### Admission still applies

The label rules from the input-channels section are unchanged. No `factory` label, no run. Agent-filed issues land in `factory:triage` and need a human label before they leave Inbox. Agents can propose work; they cannot admit it.

## Build order: one piece at a time

**Decision: the factory repo is its own pilot project, and it is built one piece at a time. Nothing new starts until the previous piece has actually been used.**

Everything above this section is the destination. This section is the route, and the route is deliberately narrow. The failure mode to avoid is standing up eight slash commands, four gates, a board, and a monitor, then discovering none of them fit how the work actually goes. Every piece below is built, used on real work, and corrected before the next one begins.

### The rule

A piece is done when it has been **used on a real issue**, not when it is written. Writing `/intake` takes twenty minutes. Learning that `/intake` asks the wrong question takes three runs. The second number is the one that matters, and it only starts counting once the thing exists.

Corollary: we do not build a piece because the diagram has a box for it. We build it when the previous piece made its absence annoying.

### Bootstrap, before piece one

The smallest thing that lets the loop exist at all:

- The `software-factory` repo, created and pushed.
- A `factory` label and a `factory:triage` label.
- A Projects board with the nine columns.
- This document moved from the desktop into `docs/outline.md`.
- A short `AGENTS.md` (under 60 lines) plus an 11-byte `CLAUDE.md` containing `@AGENTS.md`.

That is it. No gates, no CI, no spec tooling. The point of the bootstrap is to have somewhere to file the first issue.

### Piece one: issue sync

The only thing being built first.

**What it does.** Reads the board, finds issues labeled `factory` sitting in Inbox, confirms each is sized to one unit of work, and moves the card to Spec. Nothing more. It does not write a spec, create a branch, or touch code.

**What done looks like.** I file three real issues by hand, run the command, and all three land in Spec with the right sizing, or get flagged for splitting.

**What we learn before piece two.** Whether sizing is a judgment the agent can make or a question it has to ask. Whether the board columns are the right ones. Whether `gh project item-list` gives enough to work with. Those answers shape everything after it.

### The order after that, each gated on the one before

Each piece is a `factory` issue in this repo, built by the factory as it exists at that point.

1. **Issue sync.** Inbox to Spec. Above.
2. **`/spec`.** Spec Kit wired in, producing `spec.md`, `spec-brief.md`, and `spec.json`. The card moves to /factory-needs-you and the brief gets posted on the issue. This is the first time I review something the factory wrote.
3. **`/build`.** Worktree per issue, implement the task list, nothing else. No parallelism, one agent.
4. **The first gate in CI.** Lint and typecheck as required checks, branch protection on. The cheapest gates, and the first thing that can actually stop a merge.
5. **`/pr`.** Opens the PR with the brief, the diff summary, and the `Assisted-by` trailer.
6. **Red-first replay.** The test-validity gate, once there are tests worth checking.
7. **`agent-approval-check`.** The merge gate, once agent-authored PRs are routine enough to need it.
8. **`docs/solutions/`.** Learning capture, once there are learnings worth keeping.
9. **The weekly monitor.** Last, because it needs history to read and there is none until the loop has run for weeks.

Everything else in this document stays on the shelf: parallel agents, mutation testing, drift detection, the second reviewer, the cost guard, post-merge verification. Each is a real decision already made, waiting for the loop to be boring enough to deserve it.

### How we iterate

After each piece is used on real work, one short pass:

- **What did I have to correct by hand?** That is either a missing instruction or a missing check.
- **What did I ignore?** Output nobody reads should stop being produced.
- **What did I want that was not there?** That is the next piece, and it may not be the next one on the list.

The list above is the current best guess at the order, not a commitment. A piece can be reordered or dropped if two runs say it is not needed. What cannot happen is building three pieces before using any of them.

### Why the factory is its own pilot

It is the repo I know best, a bad run costs an afternoon, and every piece gets exercised on the work of building the next piece. It also forces honesty: a factory too tedious to use on its own development is too tedious to use anywhere.

## What standing it up actually taught us

Recorded the day the bootstrap ran, because these are the things a procedure leaves out.

- **`gh` needs a scope it does not have by default.** `gh auth refresh -s project,read:project`, and it opens a browser for a one-time code, so it cannot be run by an agent. The first real instance of a step the factory cannot do for itself.
- **Replacing the board's Status options is destructive, and the damage outlives the mutation.** `updateProjectV2Field` overwrites the whole option list and mints new option IDs, so every card's status points at a deleted ID and comes back blank. There is no partial update: adding one column means re-sending all of them. Worse, setting the cards back through the API then reports success while the board renders them one column off, or in No Status, as though the saved view caches options by position. Dragging in the UI is the only fix that stuck. Record where the cards sit, change the options rarely, and put the cards back by hand.
- **Project views cannot be created or changed through the API.** Switching the layout to Board is a manual click path, and it is under the **View** button on the right of the filter bar, not the caret beside the view tab, which only offers rename, duplicate, delete, chart, and export.
- **An item added to a board has no status.** It will not appear in any column until one is set, which means `gh project item-add` alone looks like it did nothing.
- **A board card does not have to be an issue.** `gh project item-create` makes a note that lives only on the board. That is what makes the Draft column work as a scratchpad rather than a queue of half-written issues.

Each of these is the kind of thing that would have cost an hour on the second install. They belong in `docs/board-setup.md`, and they are there.

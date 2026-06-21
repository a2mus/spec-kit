---
name: "speckit-iterate"
description: "Refine implementation based on user feedback. Clarifies vague observations, diagnoses issues (UI, functional, build), updates plan and tasks with corrective actions."
compatibility: "Requires spec-kit project structure with .specify/ directory"
metadata:
  author: "github-spec-kit"
  source: "templates/commands/iterate.md"
user-invocable: true
disable-model-invocation: false
---


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Pre-Execution Checks

**Check for extension hooks (before iteration)**:
- Check if `.specify/extensions.yml` exists in the project root.
- If it exists, read it and look for entries under the `hooks.before_iterate` key
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue normally
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Pre-Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```
  - **Mandatory hook** (`optional: false`):
    ```
    ## Extension Hooks

    **Automatic Pre-Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}

    Wait for the result of the hook command before proceeding to the Outline.
    ```
- If no hooks are registered or `.specify/extensions.yml` does not exist, skip silently

## Outline

Goal: Accept user feedback about implementation quality or errors, clarify if vague, diagnose root causes, and update plan.md and tasks.md with corrective or enhancement actions — all while respecting the project's established constitution and guidelines.

This command is designed to run AFTER `/speckit-implement` when the user has tested or reviewed the implementation and observed issues.

### Step 1: Setup

Run `.specify/scripts/powershell/check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks` from repo root and parse FEATURE_DIR and AVAILABLE_DOCS list. All paths must be absolute. For single quotes in args like "I'm Groot", use escape syntax: e.g 'I'\\''m Groot' (or double-quote if possible: "I'm Groot").

### Step 2: Load Implementation Context

Read the full project context from FEATURE_DIR:
- **REQUIRED**: `tasks.md` — current task state (completed `[x]` vs pending `[ ]`)
- **REQUIRED**: `plan.md` — original architecture, tech stack, file structure
- **REQUIRED**: `spec.md` — original requirements, acceptance criteria, user stories
- **IF EXISTS**: `.specify/memory/constitution.md` — governance constraints, coding standards, project rules
- **IF EXISTS**: `data-model.md` — entities and relationships
- **IF EXISTS**: `contracts/` — API specifications
- **IF EXISTS**: `research.md` — technical decisions and constraints
- **IF EXISTS**: `checklists/` — quality gate status

Build an internal summary of:
- Which tasks are completed vs pending
- Which user stories are fully implemented vs partially
- The tech stack and architecture decisions from the plan
- Constitution rules that govern how fixes should be applied

### Step 3: Scope Assessment

Before proceeding, assess the **magnitude** of the user's feedback:

**Scope Levels**:

| Level | Signal | Action |
|---|---|---|
| **Minor** | 1-3 specific issues, localized to components | Proceed with inline plan amendment + corrective tasks |
| **Moderate** | 4-8 issues, spanning multiple components | Proceed with plan amendment + new task phase |
| **Major** | Systemic issues, architectural misalignment, fundamental UX rethink | **STOP** — Advise the user that the scope of changes exceeds iterative refinement. Recommend creating a new specification via `/speckit-specify` to properly address the observed issues. Explain why: iterative patching of systemic issues leads to technical debt and spec drift. |

If scope is **Major**, present the recommendation and STOP. Do not proceed to clarification or task generation. Wait for the user to confirm they want to proceed anyway or create a new spec.

### Step 4: Parse User Feedback

Analyze `$ARGUMENTS` to determine clarity and issue categories.

**Clarity Assessment** (internal — do not display to user):

| Signal | Effect |
|---|---|
| Names specific files, components, or screens | +clarity |
| Describes observable behavior vs expected behavior | +clarity |
| Includes error messages, stack traces, or console output | +clarity |
| Uses vague terms ("it doesn't work", "looks weird", "feels off") | −clarity |
| No component or screen reference | −clarity |
| Mixes multiple unrelated issues in one sentence | −clarity |

**Clarity Score**: Clear (≥3 positive signals) / Vague (1-2 positive) / Ambiguous (0 positive)

**Issue Category Detection** (can be multiple):

| Category | Signals |
|---|---|
| `UI` | Visual, layout, styling, animation, responsiveness, colors, spacing, typography |
| `FUNCTIONAL` | Logic errors, wrong behavior, missing features, incorrect data |
| `BUILD` | Compilation errors, type errors, dependency issues, import failures |
| `PERFORMANCE` | Slow rendering, excessive re-renders, memory issues, large bundles |
| `DATA` | Wrong data displayed, missing fields, validation failures, API errors |
| `UX` | Usability issues, confusing flows, poor error messages, accessibility |

### Step 5: Clarification Wizard (Conditional)

**Trigger**: Only if Clarity Score is **Vague** or **Ambiguous**. Skip entirely if **Clear**.

Run an interactive clarification loop — maximum **5 questions**, presented ONE at a time.

Rules (same pattern as `/speckit-clarify`):
- Each question must be answerable with EITHER:
  - A short multiple-choice selection (2–5 distinct options), OR
  - A one-word / short-phrase answer (≤5 words).
- For multiple-choice: present a **recommended option** with reasoning at the top, then all options as a table.
- Format: `**Recommended:** Option [X] - <reasoning>` followed by the options table.
- After the table: `You can reply with the option letter, accept the recommendation by saying "yes", or provide your own short answer.`

**Dynamic question generation** based on what's unclear:

1. **Which component?** — "Which screen, page, or component has the issue?" (with options derived from plan.md file structure)
2. **Expected vs actual?** — "What did you expect to happen? And what actually happened?" (short answer)
3. **Visual or functional?** — "Is this primarily a visual/styling issue or a functional/behavior issue?" (A: Visual / B: Functional / C: Both)
4. **Reproducibility?** — "Does this happen always, sometimes, or only in specific conditions?" (A: Always / B: Sometimes / C: Specific conditions)
5. **Error output?** — "Is there an error message or console output? If so, paste it." (short answer)

Stop asking when:
- User signals completion ("done", "proceed", "that's it")
- All critical ambiguities resolved
- 5 questions reached

Record all answers in working memory for the diagnosis step.

### Step 6: Diagnosis

Using the clarified feedback + loaded context, perform root cause analysis.

**For each identified issue**:

1. **Map to files** — Identify which source files in `plan.md`'s file structure are affected
2. **Map to tasks** — Find related tasks in `tasks.md` (completed, pending, or missing)
3. **Classify root cause**:

| Root Cause | Description | Action |
|---|---|---|
| **Incomplete implementation** | Existing task not fully done | Re-open task with `[REOPEN]` label |
| **Incorrect implementation** | Existing task done wrong | Re-open task + add corrective `[FIX]` task |
| **Missing requirement** | No task existed for this need | Add new `[FIX]` or `[ENHANCE]` task |
| **Plan design gap** | Architecture or design decision was wrong | Amend plan.md + add corrective tasks |
| **Environment/config issue** | Setup or configuration problem | Add setup `[FIX]` task |

4. **For UI-category issues** — Apply Impeccable UI Design methodology based on **severity**:

   **Severity Assessment for UI Issues**:

   | Severity | Criteria | Response |
   |---|---|---|
   | **Critical** (P0-P1) | Broken layout, inaccessible content, unusable on mobile, contrast failures, missing states (error/loading/empty) | Generate targeted `[FIX-UI]` tasks referencing specific Impeccable phases: Normalize (Phase 7), Polish (Phase 8) |
   | **Major** (P2) | Significant spacing/alignment issues, inconsistent tokens, poor typography hierarchy, multiple AI slop indicators | Generate `[FIX-UI]` tasks + recommend running `/speckit-uidesign` enhance mode after fixes |
   | **Severe** (P0) | Systemic design failure: entire design system misapplied, fundamental heuristic violations (Nielsen score <12), pervasive cognitive load issues | Recommend running the **full** Impeccable UI enhance pipeline via `/speckit-uidesign` with "enhance" argument instead of generating individual tasks |

   When generating `[FIX-UI]` tasks, reference the specific methodology:
   - **Nielsen Heuristics** (Phase 5.1): Score 0-4 per heuristic, flag violations
   - **AI Slop Detection** (Phase 5.2): Check for AI gradients, glowing dark mode, glassmorphism slop, pure black/white, identical grids, bouncy animations
   - **Cognitive Load** (Phase 5.3): 8-item assessment (single focus, chunking ≤4, logical grouping, hierarchy, one decision at a time, minimal choices, no cross-screen memory, progressive disclosure)
   - **Technical Audit** (Phase 6): Contrast, ARIA, keyboard nav, semantic HTML, performance, theming, responsive
   - **Normalize** (Phase 7): Align to design system tokens, fix typography/color/spacing deviations
   - **Polish** (Phase 8): Visual alignment, state completeness, transitions 150-300ms, touch targets 44×44px, WCAG AA

5. **Generate Diagnosis Report** — Present to user:

```markdown
## 🔍 Diagnosis Report

### Issues Found: [count]

| # | Category | Severity | Root Cause | Affected Files | Related Tasks |
|---|----------|----------|------------|----------------|---------------|
| 1 | UI       | P1       | Missing requirement | src/components/Sidebar.tsx | — (new) |
| 2 | FUNCTIONAL | P0    | Incorrect implementation | src/services/auth.ts | T012 |

### Plan Impact
- [AMEND / NO CHANGE] — Description of what needs to change in plan.md

### Recommended Actions
- [count] tasks to add
- [count] tasks to re-open
- Constitution compliance: [PASS / requires adjustment]
```

### Step 7: User Confirmation

Present the diagnosis and ask:
- "Does this diagnosis match what you observed? (yes / adjust / skip)"
- If **"adjust"** → ask what's different, refine diagnosis, re-present
- If **"skip"** → proceed with current diagnosis as-is
- If **"yes"** → proceed to plan and task updates

### Step 8: Update Plan

Amend `plan.md` based on the diagnosis:

**8a. Fix plan-originated issues (mutate existing sections)**:
- If the diagnosis identified a **Plan design gap** root cause, locate the relevant section in plan.md and update it directly
- Add inline annotations: `<!-- Amended YYYY-MM-DD: [reason] -->` before the changed content
- Preserve the document structure — update in-place, do not reorder sections

**8b. Append iteration session (always)**:
- Add a `## Iteration Session YYYY-MM-DD` section at the end of plan.md
- Document:
  - **User Feedback**: Original input (and clarified version if wizard ran)
  - **Diagnosis Summary**: Root causes, categories, severity levels
  - **Amendments**: What was changed in existing plan sections (if any)
  - **New Tasks**: Summary of corrective/enhancement tasks being added
  - **Constitution Compliance**: Verify all fixes follow project constitution rules. If constitution.md exists, cross-reference each proposed fix against governance constraints and flag any violations.

### Step 9: Update Tasks

Amend `tasks.md` based on the diagnosis:

**9a. Re-open incorrectly completed tasks**:
- Change `- [x]` → `- [ ]` for tasks that need rework
- Append `[REOPEN]` label to the task description
- Example: `- [ ] T012 [REOPEN] Fix authentication middleware in src/middleware/auth.ts`

**9b. Add new corrective/enhancement tasks**:
- Create a new phase: `## Phase N: Iteration — YYYY-MM-DD`
- Assign sequential task IDs continuing from the last existing task (e.g., if last task is T045, new tasks start at T046)
- Follow the strict checklist format from `/speckit-tasks`:

```text
- [ ] [TaskID] [Label] Description with file path
```

**New task labels** (additive to existing `[P]` and `[USx]` labels):

| Label | Meaning | When to use |
|---|---|---|
| `[FIX]` | Corrective task — fixes a bug or error | Functional, build, data, performance issues |
| `[ENHANCE]` | Enhancement task — improves quality | Quality improvements, missing polish |
| `[FIX-UI]` | UI-specific fix using Impeccable methodology | Visual, layout, styling, accessibility issues |
| `[REOPEN]` | Previously completed task re-opened for rework | Task was marked done but needs correction |

**Examples**:
- `- [ ] T046 [FIX] Fix form submission handler in src/components/LoginForm.tsx`
- `- [ ] T047 [FIX-UI] Fix sidebar spacing and alignment per Normalize phase in src/components/Sidebar.css`
- `- [ ] T048 [P] [ENHANCE] Add loading state to dashboard cards in src/components/Dashboard.tsx`
- `- [ ] T012 [REOPEN] Fix authentication middleware in src/middleware/auth.ts`

**Dependency rules**:
- Corrective tasks that fix existing code depend on understanding the original task
- `[FIX-UI]` tasks should reference which Impeccable phase they address
- `[REOPEN]` tasks retain their original dependencies
- Mark parallelizable tasks with `[P]`

### Step 10: Report

Display a completion summary:

```markdown
## ✅ Iteration Complete

**Session**: YYYY-MM-DD
**Issues diagnosed**: [count]
**Scope**: [Minor / Moderate]

### Changes Made
- **plan.md**: [Amended X sections + appended iteration session / Appended iteration session only]
- **tasks.md**: [X tasks added, Y tasks re-opened]

### New Tasks Summary
| Task ID | Label | Description |
|---------|-------|-------------|
| T046    | [FIX] | Fix form submission... |
| T047    | [FIX-UI] | Fix sidebar spacing... |

### Recommended Next Step
> Run `/speckit-implement` to execute the corrective tasks.
> Or run `/speckit-verify` first to confirm the current state before implementing fixes.
```

Include a specific recommendation for which command to run next, with reasoning:
- If fixes are code-only → recommend `/speckit-implement`
- If fixes need verification first → recommend `/speckit-verify` then `/speckit-implement`
- If UI issues were severe → recommend `/speckit-uidesign` enhance mode

## Mandatory Post-Execution Hooks

**You MUST complete this section before reporting completion to the user.**

Check if `.specify/extensions.yml` exists in the project root.
- If it does not exist, or no hooks are registered under `hooks.after_iterate`, skip to the Completion Report.
- If it exists, read it and look for entries under the `hooks.after_iterate` key.
- If the YAML cannot be parsed or is invalid, skip hook checking silently and continue to the Completion Report.
- Filter out hooks where `enabled` is explicitly `false`. Treat hooks without an `enabled` field as enabled by default.
- For each remaining hook, do **not** attempt to interpret or evaluate hook `condition` expressions:
  - If the hook has no `condition` field, or it is null/empty, treat the hook as executable
  - If the hook defines a non-empty `condition`, skip the hook and leave condition evaluation to the HookExecutor implementation
- When constructing slash commands from hook command names, replace dots (`.`) with hyphens (`-`). For example, `speckit.git.commit` → `/speckit-git-commit`.
- For each executable hook, output the following based on its `optional` flag:
  - **Mandatory hook** (`optional: false`) — **You MUST emit `EXECUTE_COMMAND:` for each mandatory hook**:
    ```
    ## Extension Hooks

    **Automatic Hook**: {extension}
    Executing: `/{command}`
    EXECUTE_COMMAND: {command}
    ```
  - **Optional hook** (`optional: true`):
    ```
    ## Extension Hooks

    **Optional Hook**: {extension}
    Command: `/{command}`
    Description: {description}

    Prompt: {prompt}
    To execute: `/{command}`
    ```

## Done When

- [ ] User feedback parsed and clarified (wizard triggered if vague)
- [ ] Root causes diagnosed and mapped to files/tasks
- [ ] plan.md updated (existing sections amended if plan-originated + iteration session appended)
- [ ] tasks.md updated (tasks re-opened and/or new corrective tasks added)
- [ ] All changes comply with project constitution
- [ ] Extension hooks dispatched or skipped according to the rules above
- [ ] Completion reported with next-step recommendation

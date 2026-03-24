---
description: Create technical implementation plan from feature specification (PLANNING ONLY - does NOT execute)
---

# Spec-Kit Plan

> [!CAUTION]
> **This workflow is PLANNING ONLY. It does NOT execute or implement any code changes.**
> To execute the plan, run `/speckit-implement` as a separate step after user review.

Generate a technical implementation plan from the feature specification. This covers research, design, and architecture phases.

## Prerequisites

- A feature specification must exist (run `/speckit-specify` first)
- Project constitution at `.specify/memory/constitution.md`

## Steps


### 1. Setup

// turbo
Run the setup script to get paths:
```powershell
.\.specify\scripts\powershell\setup-plan.ps1 -Json
```

Parse JSON output for:
- `FEATURE_SPEC`: Path to spec.md
- `IMPL_PLAN`: Path for plan.md output
- `SPECS_DIR`: Feature directory
- `BRANCH`: Current feature branch

### 2. Load Context

Read the following files:
- `FEATURE_SPEC` - The feature specification
- `.specify/memory/constitution.md` - Project principles and guidelines
- `.specify/templates/plan-template.md` - Plan structure template

### 3. Fill Technical Context

Complete the Technical Context section:
- **Language/Version**: e.g., Kotlin, Python 3.11
- **Primary Dependencies**: e.g., Jetpack Compose, Firebase
- **Storage**: e.g., Firestore, SQLite
- **Testing**: e.g., JUnit, Espresso
- **Target Platform**: e.g., Android 7.0+
- **Performance Goals**: Domain-specific targets
- **Constraints**: Memory, latency, offline requirements

Mark unknowns as "NEEDS CLARIFICATION".

### 4. Phase -1: Pre-Implementation Gates

**CRITICAL**: These gates MUST pass before proceeding to Phase 0.

#### Simplicity Gate (Constitution Check)
- [ ] Using ≤3 projects for initial implementation?
- [ ] No speculative or "might need" features?
- [ ] No future-proofing abstractions?

#### Anti-Abstraction Gate
- [ ] Using framework features directly (not wrapping)?
- [ ] Single model representation where possible?
- [ ] Minimal abstraction layers?

#### Integration-First Gate  
- [ ] Contracts defined before implementation?
- [ ] Test scenarios identified?
- [ ] Realistic environment testing planned?

**If any gate fails**: Document justification in "Complexity Tracking" section of plan.md.

### 5. Constitution Check

Validate plan against `.specify/memory/constitution.md` principles:
- List each relevant principle from constitution
- Check compliance (✓) or violation (✗)
- Document justification for any violations

**GATE**: Must pass before Phase 0. Re-check after Phase 1.

### 6. Phase 0: Research

For each NEEDS CLARIFICATION or technology choice:

1. Create research tasks:
   - "Research {unknown} for {feature context}"
   - "Find best practices for {tech} in {domain}"
   
   **Option A: Context7 MCP** (if available - RECOMMENDED):
     - Use `mcp_context7_resolve-library-id` to find relevant libraries
     - Use `mcp_context7_query-docs` to research specific features
     - Compare multiple approaches from official docs
     - Gather code examples and best practices
   
   **Option B: Firecrawl MCP** (if available):
     - Use `mcp_firecrawl_firecrawl_search` to search for documentation and tutorials
     - Use `mcp_firecrawl_firecrawl_scrape` to extract content from documentation pages
     - Gather implementation patterns and examples
   
   **Option C: Firebase MCP** (if Firebase-related):
     - Use `mcp_firebase-mcp-server_firebase_get_environment` to check current setup
     - Use `mcp_firebase-mcp-server_firebase_get_project` to review project configuration
     - Reference Firebase best practices for the feature
     - Check existing Firebase configuration and services
   
   **Option D: Obsidian MCP** (if available):
     - Use `mcp_obsidian_search_vault_smart` to find related project notes and past decisions
     - Cross-reference with historical implementation patterns
     - Leverage institutional knowledge from vault

2. Consolidate findings in `SPECS_DIR/research.md`:
   - Decision: What was chosen
   - Rationale: Why chosen
   - Alternatives: What else was evaluated
   - Official Documentation References: Links to relevant docs (from Context7/Firecrawl)
   - Past Project Patterns: References to similar implementations (from Obsidian)

**Output**: `research.md` with all clarifications resolved

### 7. Phase 1: Design & Contracts

**Prerequisites**: research.md complete

#### File Creation Order (Test-First)
1. Create `contracts/` with API specifications
2. Create test files in order: contract → integration → e2e → unit
3. Create source files to make tests pass

#### Design Artifacts

1. **Data Model** (`data-model.md`):
   - Extract entities from feature spec
   - Define fields, relationships, validation rules
   - Document state transitions if applicable

2. **API Contracts** (`contracts/`):
   - Map user actions to endpoints/screens
   - Use standard patterns (REST, Compose navigation)
   - Output API specifications or screen flows

3. **Quickstart** (`quickstart.md`):
   - Integration test scenarios
   - End-to-end validation steps
   - Key acceptance criteria verification

4. **Update Agent Context**:
   // turbo
   ```powershell
   .\.specify\scripts\powershell\update-agent-context.ps1 -AgentType antigravity
   ```

**Output**: data-model.md, contracts/, quickstart.md

### 8. Define Project Structure

Based on `.specify/templates/plan-template.md`, document:
- Feature documentation tree in `specs/[###-feature]/`
- Source code structure matching project conventions
- Test file locations

### 9. Write Plan

// turbo
Write the completed plan to `IMPL_PLAN` path in `specs/[###-feature]/plan.md`.

### 10. Report Completion (END OF WORKFLOW)

Present to user and **STOP**:
- Branch name
- Plan file path (in `specs/` directory)
- Generated artifacts list
- Readiness for task generation

> [!IMPORTANT]
> **STOP HERE.** This workflow ends after presenting the plan.
> Do NOT proceed with any code implementation or bug fixes.
> The user must manually invoke `/speckit-implement` if they want to execute.

## Key Rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
- **PLANNING ONLY** - do NOT implement, fix, or modify any source code
- All artifacts go to `specs/[###-feature]/` directory
- Stop after Phase 1 planning - do not begin implementation

## Next Steps (User Must Invoke Separately)

After plan is reviewed and approved by user:
- `/speckit-tasks` - Generate actionable task breakdown
- `/speckit-checklist` - Create domain-specific validation checklists
- `/speckit-implement` - Execute the implementation (SEPARATE workflow)

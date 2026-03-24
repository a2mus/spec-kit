---
description: Analyze project for consistency across all spec-kit artifacts
---

# Spec-Kit Analyze

Run a consistency analysis across all spec-kit artifacts to identify misalignments, missing references, or contradictions.

## When to Use

- After generating tasks, before implementation
- When making significant changes to existing features
- As a quality gate before major milestones

## Steps

### 1. Inventory Artifacts

Scan the feature directory for:
- `spec.md` - Feature specification
- `plan.md` - Implementation plan
- `tasks.md` - Task breakdown
- `research.md` - Technical decisions
- `data-model.md` - Entity definitions
- `contracts/` - API specifications
- `checklists/` - Validation checklists

### 2. Cross-Reference Analysis

**Spec ↔ Plan**:
- Every functional requirement has a corresponding task
- Tech stack matches research decisions
- Success criteria are addressable by the architecture

**Plan ↔ Tasks**:
- All plan components have implementation tasks
- Task file paths match project structure
- Dependencies reflect actual build order

**Spec ↔ Tasks**:
- Every user story has tasks in a dedicated phase
- Acceptance criteria map to test tasks (if tests requested)
- Priority order is preserved (P1 → P2 → P3)

**Data Model ↔ Tasks**:
- Every entity has creation tasks
- Relationships are implemented in services
- Validation rules are in appropriate tasks

### 3. Constitution Compliance

Check against `.specify/memory/constitution.md`:
- Architecture follows mandated patterns
- Required gates are addressed
- Naming conventions are respected

### 4. Generate Report

Create analysis report:

```markdown
# Consistency Analysis Report

## Summary
- Artifacts analyzed: [count]
- Issues found: [count]
- Warnings: [count]

## Issues (Must Fix)
- [SEV-1] Requirement FR-003 has no corresponding task
- [SEV-1] Entity "Order" in data-model not in any task

## Warnings (Should Review)
- [WARN] Task T015 references file not in project structure
- [WARN] User Story 2 has no independent test criteria

## Passed Checks
- ✓ All user stories have task phases
- ✓ Tech stack matches constitution
- ✓ Task dependencies are valid
```

### 5. Suggest Fixes

For each issue:
- Identify the affected artifacts
- Suggest specific correction
- Indicate which workflow to re-run if needed

### 6. Report Completion

Output:
- Analysis summary
- Critical issues requiring attention
- Recommended next steps

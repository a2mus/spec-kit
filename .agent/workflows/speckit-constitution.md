---
description: Create or update the project constitution from interactive or provided principle inputs
---

# Spec-Kit Constitution

Create or update the project constitution at `.specify/memory/constitution.md`. This file defines the governing principles and development guidelines for the project.

## Steps

### 1. Load Existing Constitution

Read the current constitution file at `.specify/memory/constitution.md`:
- Identify every placeholder token (e.g., `[PROJECT_NAME]`, `[PRINCIPLE_1_NAME]`)
- Note the current version number for semantic versioning

### 2. Collect User Input

If the user provided principles or guidelines in their message:
- Use those values to replace placeholders
- Otherwise, infer from existing project context (README, docs, prior constitution)

For governance dates:
- `RATIFICATION_DATE`: Original adoption date (ask if unknown)
- `LAST_AMENDED_DATE`: Today's date if changes are made
- `CONSTITUTION_VERSION`: Increment based on change type:
  - **MAJOR**: Backward incompatible governance/principle removals
  - **MINOR**: New principle/section added
  - **PATCH**: Clarifications, wording, typo fixes

### 3. Draft Updated Constitution

- Replace every placeholder with concrete text
- Preserve heading hierarchy
- Each Principle section should have: name, rules, rationale
- Ensure Governance section lists amendment procedure

### 4. Consistency Propagation

Validate alignment with dependent templates:
- `.specify/templates/plan-template.md` - Check Constitution Check section
- `.specify/templates/spec-template.md` - Verify scope/requirements alignment
- `.specify/templates/tasks-template.md` - Ensure task categorization reflects principles

### 5. Create Sync Impact Report

Prepend as HTML comment at top of constitution:

```markdown
<!--
SYNC IMPACT REPORT
Version Change: old → new
Modified Principles: [list]
Added Sections: [list]
Removed Sections: [list]
Templates Requiring Updates: [list with ✅/⚠️ status]
-->
```

### 6. Validation

Before writing:
- No unexplained bracket tokens remain
- Version matches report
- Dates in ISO format (YYYY-MM-DD)
- Principles are declarative and testable

### 7. Write Constitution

// turbo
Write the completed constitution to `.specify/memory/constitution.md`

### 8. Report Completion

Output:
- New version and bump rationale
- Files flagged for manual follow-up
- Suggested commit message (e.g., `docs: amend constitution to vX.Y.Z`)

## Next Steps

After constitution is complete, proceed to:
- `/speckit-specify` - Create a feature specification

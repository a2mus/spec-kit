---
description: Clarify specification requirements before planning (PLANNING ONLY - does NOT execute)
---

# Spec-Kit Clarify

> [!CAUTION]
> **This workflow is PLANNING ONLY. It does NOT execute or implement any code changes.**

Interactively clarify ambiguous or incomplete requirements in a feature specification before proceeding to technical planning.

## When to Use

- After `/speckit-specify` if [NEEDS CLARIFICATION] markers remain
- When stakeholder input is needed before planning
- To validate assumptions with the user

## Steps

### 1. Load Specification

Read the current feature specification from `specs/[current-branch]/spec.md`

### 2. Identify Clarification Needs

Scan for:
- `[NEEDS CLARIFICATION: ...]` markers
- Ambiguous requirements (multiple interpretations possible)
- Missing acceptance criteria
- Undefined edge cases

### 3. Prioritize Questions

Order by impact:
1. **Scope**: Affects feature boundaries
2. **Security/Privacy**: Compliance implications
3. **User Experience**: User-facing behavior
4. **Technical Details**: Implementation specifics

Maximum 5 questions per session.

### 4. Present Questions

For each clarification needed:

```markdown
## Question [N]: [Topic]

**Context**: [Quote relevant spec section]

**What we need to know**: [Specific question]

**Suggested Answers**:

| Option | Answer | Implications |
|--------|--------|--------------|
| A | [First option] | [Impact on feature] |
| B | [Second option] | [Impact on feature] |
| C | [Third option] | [Impact on feature] |
| Custom | Your own answer | [Explain format needed] |
```

### 5. Collect Responses

Wait for user to respond (e.g., "Q1: A, Q2: B, Q3: Custom - [details]")

### 6. Update Specification

// turbo
For each answer:
- Replace [NEEDS CLARIFICATION] marker with the chosen answer
- Update related requirements if needed
- Add to Assumptions section if inferring details

### 7. Validate Updates

- Re-check for remaining ambiguities
- Ensure all requirements are now testable
- Verify success criteria are measurable

### 8. Report Completion (END OF WORKFLOW)

Present to user and **STOP**:
- Summary of clarifications resolved
- Any remaining open questions
- Spec file updated path
- Readiness for `/speckit-plan`

> [!IMPORTANT]
> **STOP HERE.** This workflow ends after presenting the clarification summary.
> Do NOT proceed to planning or implementation without user approval.

## Guidelines

- Keep questions focused and specific
- Provide reasonable default suggestions
- Don't ask about obvious industry standards
- Limit to 5 questions per session
- **PLANNING ONLY** - do NOT implement, fix, or modify any source code

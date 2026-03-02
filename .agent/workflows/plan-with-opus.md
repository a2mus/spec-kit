---
description: Create a detailed implementation plan without writing full code (PLANNING ONLY - does NOT execute)
---

# Plan with Opus (The Architect)

> **Role**: Claude 4.5 Opus serves as the **Architect** - responsible for Planning, Architecture, Debugging, and Backend Schema design.
> 
> **Golden Rule**: Do NOT write implementation code. Do NOT execute the plan. This burns through rate limits quickly. Focus on PLANNING only.

> [!CAUTION]
> **This workflow ONLY produces a plan. It does NOT execute anything.**
> To execute the plan, the user must manually run `/speckit-implement` as a separate step.

This workflow creates a detailed implementation plan for a feature or task. The plan can later be executed by the `/speckit-implement` workflow (The Builder) if the user chooses to run it.

## The Architect-Builder Strategy

This workflow follows the "Architect-Builder" model:
- **Opus (Architect)**: Planning, architecture, state management, API dependencies - creates detailed plan WITHOUT writing code
- **Builder**: Reads the plan and implements it with high volume/speed

## Purpose
- Analyze requirements thoroughly with psychological and technical lens
- Research existing codebase patterns
- Design architecture and state management strategy
- Bifurcate tasks into **Backend (B1, B2...)** and **Frontend (F1, F2...)**
- Define API dependencies and database schema
- Document edge cases (memory overhead, race conditions)
- **DO NOT write actual implementation code - only plans and schemas**

## Prerequisites
- Clear understanding of the feature/task requirements
- Access to the project codebase for research

## Steps

### 1. Understand the Requirement
- Read and analyze the user's request carefully
- Ask clarifying questions if needed
- Identify the scope and boundaries of the task
- Consider performance implications early

### 2. Research the Codebase (Max Depth Analysis)
When analyzing complex tasks, apply **UltraThink** mode:
- Suspend "quick response" mode
- Analyze through psychological AND technical lens
- Prioritize performance over speed in analysis
- Consider edge cases (memory overhead, race conditions, etc.)

Research:
- Explore relevant existing code patterns in the project
- Identify similar implementations to follow
- Review `memory-bank/systemPatterns.md` for established patterns
- Check `memory-bank/decisionLog.md` for relevant past decisions
- **Use Context7 MCP** to research best practices:
  - Use `mcp_context7_resolve-library-id` to find relevant frameworks
  - Use `mcp_context7_query-docs` to fetch architectural patterns
  - Research official recommendations for state management, data flow, etc.
  - Compare project patterns with framework best practices

### 3. Create Implementation Plan Document
Create/update the file `memory-bank/implementation-plan.md` with the following sections:

```markdown
# Implementation Plan: [Feature Name]

## Overview
Brief description of what will be implemented.

## Requirements Analysis
- [ ] Requirement 1
- [ ] Requirement 2
- [ ] ...

## Architecture & State Management
- State management strategy
- Data flow design
- API dependency list

## Affected Files

### Files to Create
| File Path | Purpose |
|-----------|---------|
| `path/to/file` | Description of the file's purpose |

### Files to Modify
| File Path | Changes Required |
|-----------|------------------|
| `path/to/file` | Description of modifications |

### Files to Delete (if any)
| File Path | Reason |
|-----------|--------|
| `path/to/file` | Why it's being removed |

---

## Backend Tasks (B1, B2, B3...)

### B1: [Backend Task Name]
- **File**: `path/to/file`
- **Action**: Create/Modify/Delete
- **Details**: 
  - Schema/data structure description
  - Key methods/classes to add
  - Dependencies to import
  - Database/API considerations

### B2: [Backend Task Name]
...

---

## Frontend Tasks (F1, F2, F3...)

### F1: [Frontend Task Name]
- **File**: `path/to/file`
- **Action**: Create/Modify/Delete
- **Aesthetic**: [Specific design direction if applicable]
- **Details**: 
  - UI components needed
  - State bindings
  - Animation requirements
  - Integration points

### F2: [Frontend Task Name]
...

---

## Architecture Decisions
Document any architectural choices and their rationale.

## Edge Cases & Error Handling
List potential edge cases and how they should be handled:
- Memory overhead considerations
- Race conditions
- Network failure scenarios
- Input validation

## Testing Strategy
- Unit tests needed
- Integration tests needed
- Manual testing scenarios

## Dependencies
- External libraries needed
- Internal module dependencies

## Risks & Considerations
- Potential breaking changes
- Performance considerations
- Security considerations

## Execution Checklist (for /speckit-implement)

### Backend Execution
- [ ] B1: ...
- [ ] B2: ...
- [ ] B3: ...

### Frontend Execution  
- [ ] F1: ...
- [ ] F2: ...
- [ ] F3: ...
```

### 4. Review and Validate
- Ensure the plan is complete and actionable
- Verify all file paths are correct
- Confirm the plan follows project conventions
- Check that **no actual code implementation is included** (only pseudocode/descriptions/schemas)
- Verify Backend/Frontend bifurcation is clear

### 5. Present to User (END OF WORKFLOW)
Present the plan to the user and **STOP**. Do NOT proceed with execution:
"I've created a detailed implementation plan in `memory-bank/implementation-plan.md`. The tasks are bifurcated into Backend (B1-Bn) and Frontend (F1-Fn). 

**This workflow is now complete.** Please review the plan. When you're ready to execute, run `/speckit-implement` separately."

> [!IMPORTANT]
> **STOP HERE**. This workflow ends after presenting the plan.
> Do NOT proceed with any implementation or execution.
> The user must manually invoke `/speckit-implement` if they want to execute the plan.

## Output
The plan should be saved in `memory-bank/implementation-plan.md`. Execution is **NOT** part of this workflow - it must be triggered separately by the user via `/speckit-implement`.

## Notes
- Focus on WHAT to do, not HOW to code it
- Include enough detail for the Builder to implement
- Reference existing code patterns when possible
- Keep Backend (B) and Frontend (F) tasks clearly separated
- For complex logic, note "Use UltraThink mode" for deep analysis
- If debugging is needed later, switch back to Opus for root cause analysis

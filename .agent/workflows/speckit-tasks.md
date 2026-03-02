---
description: Generate actionable, dependency-ordered task list from design artifacts (PLANNING ONLY - does NOT execute)
---

# Spec-Kit Tasks

> [!CAUTION]
> **This workflow is PLANNING ONLY. It does NOT execute or implement any code changes.**
> To execute the tasks, run `/speckit-implement` as a separate step after user review.

Generate an actionable, dependency-ordered task list for the feature based on available design artifacts.

## Prerequisites

- Feature specification (`spec.md`) - REQUIRED
- Implementation plan (`plan.md`) - REQUIRED
- Design artifacts (`research.md`, `data-model.md`, `contracts/`) - Optional

## Steps

### 1. Setup

// turbo
Run prerequisites check:
```powershell
.\.specify\scripts\powershell\check-prerequisites.ps1 -Json
```

Parse output for:
- `FEATURE_DIR`: Feature directory path
- `AVAILABLE_DOCS`: List of available design documents

### 2. Load Design Documents

Read from FEATURE_DIR:
- **Required**: `plan.md` (tech stack, structure), `spec.md` (user stories with priorities)
- **Optional**: `data-model.md` (entities), `contracts/` (APIs), `research.md` (decisions)

### 3. Extract Task Sources

From each document:

**From spec.md (User Stories)**:
- Extract P1, P2, P3... priority stories
- Each story becomes a phase
- Map acceptance scenarios to test criteria

**From plan.md**:
- Extract tech stack and dependencies
- Get project structure for file paths
- Identify foundational infrastructure

**From data-model.md** (if exists):
- Map entities to user stories
- Entities serving multiple stories → Setup phase

**From contracts/** (if exists):
- Map endpoints/screens to user stories
- Contract tests before implementation

### 4. Generate Task List

Use `.specify/templates/tasks-template.md` structure:

**Phase 1: Setup**
- Project initialization
- Dependencies configuration
- Tooling setup

**Phase 2: Foundational**
- Core infrastructure (MUST complete before user stories)
- Database schema, auth framework, middleware

**Phase 3+: User Stories (in priority order)**
Each story phase includes:
- Story goal and independent test criteria
- Tests (if requested): Contract tests, integration tests
- Implementation: Models → Services → Endpoints/UI
- Checkpoint for validation

**Final Phase: Polish**
- Cross-cutting concerns
- Documentation
- Performance optimization

### 5. Task Format

Every task MUST follow this format:

```
- [ ] [TaskID] [P?] [Story?] Description with file path
```

**Components**:
- `- [ ]`: Markdown checkbox
- `[TaskID]`: Sequential (T001, T002...)
- `[P]`: Include only if parallelizable
- `[Story]`: [US1], [US2]... for user story tasks only
- Description with exact file path

**Examples**:
- `- [ ] T001 Create project structure per implementation plan`
- `- [ ] T012 [P] [US1] Create User model in src/models/user.py`

### 6. Define Dependencies

Document:
- Phase dependencies (Setup → Foundational → User Stories → Polish)
- User story independence (each can be tested alone)
- Parallel opportunities within phases

### 7. Create Implementation Strategy

Include:
- MVP First approach (User Story 1 only)
- Incremental Delivery plan
- Parallel Team Strategy (if applicable)

### 8. Write Tasks

// turbo
Write completed tasks to `FEATURE_DIR/tasks.md`

### 9. Report Completion (END OF WORKFLOW)

Present to user and **STOP**:
- Task file path
- Total task count
- Task count per user story
- Parallel opportunities identified
- Suggested MVP scope

> [!IMPORTANT]
> **STOP HERE.** This workflow ends after presenting the task list.
> Do NOT proceed with implementation without user approval.

## Task Organization Rules

- Tasks organized by user story for independent implementation
- Tests are OPTIONAL (only if explicitly requested)
- Each story phase is independently completable and testable
- Models before services, services before UI
- Commit after each task or logical group
- **PLANNING ONLY** - do NOT implement, fix, or modify any source code

## Next Steps (User Must Invoke Separately)

After tasks are reviewed and approved:
- `/speckit-analyze` - Analyze for consistency (optional)
- `/speckit-implement` - Execute the implementation

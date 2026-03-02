---
description: Execute implementation by processing all tasks defined in tasks.md
---

# Spec-Kit Implement

Execute the implementation plan by processing and executing all tasks defined in tasks.md.

## Prerequisites

- `tasks.md` must exist with complete task breakdown
- Run `/speckit-tasks` first if tasks are missing

## Steps

### 1. Setup

// turbo
Run prerequisites check with tasks requirement:
```powershell
.\.specify\scripts\powershell\check-prerequisites.ps1 -Json -RequireTasks -IncludeTasks
```

Parse for `FEATURE_DIR` and `AVAILABLE_DOCS`.

### 2. Check Checklists Status

If `FEATURE_DIR/checklists/` exists:

1. Scan all checklist files
2. Count total, completed, and incomplete items
3. Create status table:

```
| Checklist | Total | Completed | Incomplete | Status |
|-----------|-------|-----------|------------|--------|
| ux.md     | 12    | 12        | 0          | ✓ PASS |
| test.md   | 8     | 5         | 3          | ✗ FAIL |
```

4. **If any incomplete**: Ask user to confirm proceeding
5. **If all complete**: Proceed automatically

### 3. Load Implementation Context

Read from FEATURE_DIR:
- **REQUIRED**: `tasks.md` - Complete task list
- **REQUIRED**: `plan.md` - Tech stack and architecture
- **IF EXISTS**: `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

### 4. Project Setup Verification

Check and create ignore files based on detected technologies:

**Detection Logic**:
- Git repo → `.gitignore`
- Dockerfile exists → `.dockerignore`
- ESLint config → `.eslintignore`
- Prettier config → `.prettierignore`

**Common Patterns** (adapt to project tech stack):
```
# Build outputs
build/
dist/
out/

# Dependencies
node_modules/
.venv/
__pycache__/

# IDE / Editor
.idea/
.vscode/
*.swp

# Environment
.env*
*.log
```

If ignore file exists: Verify and append missing patterns
If missing: Create with full pattern set

### 5. Parse Task Structure

From `tasks.md`, extract:
- **Task phases**: Setup, Foundational, User Stories, Polish
- **Task dependencies**: Sequential vs parallel [P] markers
- **Task details**: ID, description, file paths
- **Execution flow**: Order and requirements

### 6. Execute Implementation

Process phase-by-phase:

**For each phase**:
1. List tasks in phase
2. Identify parallel opportunities [P]
3. Execute tasks in order:
   - Sequential tasks: One at a time
   - Parallel tasks: Can execute together
4. Validate phase completion before next

**TDD Approach** (if tests included):
- Execute test tasks first
- Verify tests fail
- Then implement corresponding code

### 7. Progress Tracking

After each task:
// turbo
- Mark task complete: `- [x]` in tasks.md
- Report progress
- If task fails:
  - Halt for sequential tasks
  - Continue with others for parallel [P] tasks
  - Provide clear error message

### 8. Completion Validation

After all tasks:
- Verify all required tasks completed
- Check implementation matches specification
- Validate tests pass (if included)
- Confirm follows technical plan

**Optional: Automated Testing with TestSprite MCP** (if available):
  - Use `mcp_TestSprite_testsprite_bootstrap` to initialize testing
  - Use `mcp_TestSprite_testsprite_generate_frontend_test_plan` for UI tests
  - Use `mcp_TestSprite_testsprite_generate_backend_test_plan` for API tests
  - Use `mcp_TestSprite_testsprite_generate_code_and_execute` to run tests
  - Generate test report for validation

**Optional: Web/Hybrid UI Verification with Chrome DevTools MCP** (if available):
  - Use `mcp_chrome-devtools_take_screenshot` to capture UI states
  - Use `mcp_chrome-devtools_take_snapshot` to verify accessibility
  - Use `mcp_chrome-devtools_list_console_messages` to check for errors
  - Validate responsive design and user interactions

**Optional: Firebase Validation with Firebase MCP** (if Firebase-related):
  - Use `mcp_firebase-mcp-server_firebase_get_environment` to verify configuration
  - Use `mcp_firebase-mcp-server_firebase_validate_security_rules` to check security rules
  - Validate Firebase services are properly configured

### 9. Final Report

Output:
- Summary of completed work
- Any failed or skipped tasks
- Validation results
- Next steps (testing, deployment)

## Error Handling

- **Sequential task fails**: Halt execution, report error
- **Parallel task fails**: Continue with others, report at end
- **Missing file**: Suggest running prerequisite workflow
- **Checklist incomplete**: Warn and ask for confirmation

## Execution Rules

- Setup first: Project structure, dependencies, configuration
- Tests before code (if TDD requested)
- Core development: Models → Services → Endpoints
- Integration work: Database, middleware, external services
- Polish last: Documentation, optimization

## Notes

- Each phase should have a checkpoint for validation
- Commit after each task or logical group
- Stop at any checkpoint to validate independently
- Mark completed tasks with [x] in tasks.md

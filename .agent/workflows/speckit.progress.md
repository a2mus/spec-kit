---
description: Check spec progression and present status report with accomplished/in-progress tasks and next steps
---

# Spec-Kit Progress

Generate a comprehensive progress report for the current spec by aggregating information from Memory Bank, specs folder, and conversation history.

## When to Use

- After a work session to review accomplishments
- Before starting a new session to understand current state
- When needing orientation on next steps
- To get a quick status overview of spec implementation

## Steps

### 1. Load Memory Bank Context

Read the following Memory Bank files:

- `memory-bank/progress.md` - Feature completion status and task tracking
- `memory-bank/activeContext.md` - Current focus and recent changes
- `memory-bank/decisionLog.md` (if exists) - Key decisions made

**Extract**:
- Completed features with dates
- In-progress tasks with priorities
- Blocked items and open questions
- Recent changes timeline

### 2. Identify Active Spec

Scan `specs/` directory to find the currently active spec:

**Detection logic**:
1. Check `memory-bank/activeContext.md` for current focus mentions
2. Look for specs with incomplete tasks in `tasks.md`
3. Find the highest-numbered spec as fallback

**For the active spec directory, read**:
- `spec.md` - Feature requirements and user stories
- `tasks.md` - Task breakdown with completion status
- `plan.md` - Technical implementation plan
- `quickstart.md` (if exists) - Verification scenarios
- `checklists/` (if exists) - Quality gate status

### 3. Analyze Conversation History

If conversation summaries are available:
- Identify recent sessions related to the active spec
- Extract verification results and test outcomes
- Note any blocking issues or decisions made
- Gather proof of completed work

### 4. Compute Progress Metrics

From `tasks.md`, calculate:

```
Total Tasks:     [count]
Completed:       [count] ([percentage]%)
In Progress:     [count]
Not Started:     [count]
Blocked:         [count]
```

**Per-Phase Breakdown**:
```
| Phase | Total | Done | In Progress | Remaining |
|-------|-------|------|-------------|-----------|
| Setup | 5     | 5    | 0           | 0         |
| Core  | 12    | 8    | 2           | 2         |
| ...   |       |      |             |           |
```

### 5. Cross-Reference Sources

Compare findings across sources:
- Tasks marked complete in `tasks.md` vs. features completed in `progress.md`
- Conversation verification results vs. task completion status
- Checklist completion vs. phase completion

**Flag discrepancies**:
- Tasks marked done but not verified
- Verified items not reflected in task status
- Memory Bank out of sync with spec status

### 6. Generate Progress Report

Create a structured report:

```markdown
# Spec Progress Report

**Spec**: [###-feature-name]  
**Generated**: [timestamp]  
**Status**: [COMPLETE | IN PROGRESS | BLOCKED]

## Summary

[1-2 sentence overview of current state]

## Accomplished ✅

### Completed Tasks
- [x] [T001] Task description
- [x] [T002] Task description

### Verified Items
- [Item] - Verified on [date] via [method]

### Key Decisions Made
- [Decision] - Rationale: [reason]

## In Progress 🔄

### Current Focus
- [ ] [T010] Task description (Priority: P1)

### Active Work
[Summary of what's actively being worked on]

## Not Started 📋

- [ ] [T015] Task description
- [ ] [T016] Task description

## Blocked/Issues ⚠️

### Blocking Items
- [Issue description] - Needs: [resolution]

### Open Questions
- [Question] - Context: [details]

## Next Steps 🎯

### Immediate Actions
1. [Specific next action]
2. [Follow-up action]

### Recommended Focus
[Guidance on what to prioritize next based on dependencies and priorities]

## Memory Bank Sync Status

- progress.md: [SYNCED | NEEDS UPDATE]
- activeContext.md: [SYNCED | NEEDS UPDATE]
```

### 7. Identify Sync Needs

Check if Memory Bank needs updates:

**Update Required If**:
- Task completions not reflected in `progress.md`
- Current focus shifted from what's in `activeContext.md`
- New decisions need logging

**Suggest**:
```
Memory Bank updates recommended:
- [ ] Update progress.md: Mark T010-T012 as complete
- [ ] Update activeContext.md: Current focus is now [new focus]
```

### 8. Present Report to User

Present the progress report with:
- Clear visual separation between sections
- Prioritized next steps
- Actionable recommendations
- Option to sync Memory Bank if needed

## Optional: MCP Integrations

### Obsidian MCP (if available)
- Use `mcp_obsidian_search_vault_smart` to find related project notes
- Cross-reference with external knowledge base

### GitHub MCP (if available)
- Use `mcp_github-mcp_list_commits` to verify recent code changes
- Correlate commits with completed tasks

## Output Example

```
# Spec Progress Report

**Spec**: 008-phase8-followup  
**Generated**: 2026-01-25 21:50:00  
**Status**: IN PROGRESS

## Summary

Phase 8 follow-up is 60% complete with 4 critical bugs addressed. 
2 P1 issues remain before verification can complete.

## Accomplished ✅

### Completed Tasks
- [x] [T036] Client form state refactoring
- [x] [T037] Van stock sync implementation

### Verified Items
- T036 - Verified on 2026-01-23 via manual testing on device

## In Progress 🔄

- [ ] [T039] Client deletion soft-delete (Priority: P1)
- [ ] [T040] Return operation history (Priority: P1)

## Next Steps 🎯

1. Complete T039: Update client queries to filter soft-deleted
2. Complete T040: Ensure return transactions saved with client ID
3. Run full verification sequence from quickstart.md
4. Update Memory Bank with completion status
```

## Notes

- Always include timestamps for traceability
- Use emoji for quick visual scanning
- Keep the report scannable - avoid verbose descriptions
- Highlight blocking issues prominently
- Make next steps actionable and specific

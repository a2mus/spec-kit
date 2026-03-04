# Workspace Rules - Memory Bank Paradigm

## Core Principle
This project follows the **Memory Bank** paradigm. The Memory Bank is the central source of truth for project context, progress, and decisions. All development work must maintain and reference these documents.

---

## Memory Bank Location
All Memory Bank files are stored in: `memory-bank/`

---

## Required Memory Bank Files

| File | Purpose | Update Frequency |
|------|---------|------------------|
| `projectbrief.md` | Foundation document defining project goals and scope | When scope changes |
| `productContext.md` | Why the project exists, problems it solves, user experience goals | When product vision evolves |
| `techContext.md` | Technologies, architecture decisions, constraints, dependencies | When tech stack changes |
| `systemPatterns.md` | Architecture patterns, coding conventions, design decisions | When patterns evolve |
| `activeContext.md` | Current focus, recent changes, next steps, active decisions | **Every session** |
| `progress.md` | Chronological log of completed work, features, and fixes | **After each task** |

---

## Mandatory Workflows

### 1. Session Start
At the start of **every** development session:
1. Read `memory-bank/activeContext.md` to understand current focus
2. Read `memory-bank/progress.md` for recent work context
3. Reference `memory-bank/systemPatterns.md` for architectural decisions

### 2. During Development
While working on tasks:
- Follow patterns documented in `systemPatterns.md`
- Reference `techContext.md` for technology constraints
- Update `activeContext.md` when focus shifts or blockers arise

### 3. Session End / Task Completion
After completing significant work:
1. **Update `progress.md`** with:
   - Date header
   - Bullet points of completed work
   - Key files modified
   - Any issues encountered/resolved

2. **Update `activeContext.md`** with:
   - Current focus area
   - Recent changes summary
   - Next steps
   - Any open decisions or blockers

---

## Memory Bank Update Triggers

> [!IMPORTANT]
> Always update the Memory Bank when:
> - Completing a feature or fix
> - Discovering new project patterns
> - Making architectural decisions
> - Encountering and resolving issues
> - Changing development focus

---

## Document Formatting Standards

### Progress Log Format (`progress.md`)
```markdown
## YYYY-MM-DD - Short Description
- **Feature/Fix Category** (`affected_file.ext`):
  - What was done
  - Why it was done (if non-obvious)
  - Key implementation details
```

### Active Context Format (`activeContext.md`)
```markdown
## Current Focus
- Active work items

## Recent Changes (YYYY-MM-DD - Description)
### Category
- Change details

## Next Steps
1. Numbered priority list
```

---

## Enforcement Rules

1. **Never skip Memory Bank updates** - Context loss is expensive
2. **Be specific** - Include file names, function names, line ranges when relevant
3. **Keep it current** - Stale documentation is worse than no documentation
4. **Cross-reference** - Link related concepts between Memory Bank files
5. **Chronological order** - New entries go at the top of `progress.md`

---

## Quick Reference Commands

When starting work, always begin by understanding context:
```
Read: memory-bank/activeContext.md
Read: memory-bank/progress.md
```

When finishing work, always persist knowledge:
```
Update: memory-bank/progress.md (add dated entry)
Update: memory-bank/activeContext.md (current state)
```

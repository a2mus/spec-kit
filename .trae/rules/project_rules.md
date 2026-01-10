# Memory Bank System for Persistent Context

## Core Principle
I maintain complete project memory through structured documentation. My memory resets between sessions, so I rely ENTIRELY on Memory Bank files to understand the project and continue work effectively.

## Memory Bank Structure
The project contains a `memory-bank/` folder with these required files:
- `projectbrief.md` - Foundation defining core requirements and scope
- `productContext.md` - Purpose, problems solved, and user experience
- `techContext.md` - Technologies, setup, constraints, dependencies
- `systemPatterns.md` - Architecture, design patterns, coding standards
- `activeContext.md` - Current focus, recent changes, next steps
- `progress.md` - Completed work, remaining tasks, known issues

## Mandatory Reading Protocol
At the start of EVERY task, I MUST:
1. Read ALL Memory Bank files in order: projectbrief → techContext → systemPatterns → productContext → activeContext → progress
2. Announce: "[Memory Bank: Active] - Project context loaded"
3. Provide brief summary of current project state
4. Proceed with the requested task

## Plan/Act Workflow

### Plan Mode
When analyzing or strategizing:
1. Read Memory Bank files completely
2. Verify all files are complete and current
3. Develop detailed strategy based on documented context
4. Present approach for review WITHOUT making changes
5. Wait for explicit "act" command before implementation

### Act Mode
When implementing changes:
1. Check Memory Bank for current context
2. Execute approved plan
3. Document all changes made
4. Update relevant Memory Bank files (especially activeContext.md and progress.md)

## Memory Update Triggers
Update Memory Bank files when:
- Discovering new project patterns or insights
- After implementing significant changes
- User explicitly requests "update memory bank" (MUST review ALL files)
- Context needs clarification for future sessions
- Architectural decisions are made

## Memory Update Process
When updating Memory Bank:
1. Review ALL files, even if some don't need updates
2. Focus on activeContext.md and progress.md for current state
3. Update systemPatterns.md for new architectural patterns
4. Document decisions and reasoning
5. Keep techContext.md current with dependencies

## Code Generation Rules Based on Memory
Before generating ANY code:
1. Consult systemPatterns.md to ensure alignment with project standards
2. Check techContext.md for framework and technology constraints
3. Reference activeContext.md for current implementation focus
4. Verify approach against productContext.md requirements

## Memory Priority Hierarchy
When conflicts arise:
1. User input (highest priority)
2. activeContext.md (current decisions)
3. systemPatterns.md (architectural rules)
4. techContext.md (technical constraints)
5. productContext.md (product requirements)
6. projectbrief.md (foundational scope)

## Consistency Enforcement
- All code MUST follow patterns documented in systemPatterns.md
- All suggestions MUST align with techContext.md technology stack
- All features MUST serve goals in productContext.md
- All changes MUST be reflected in progress.md

## Key Commands Recognition
- "initialize memory bank" → Create all Memory Bank files with initial context
- "update memory bank" → Comprehensive review and update of ALL files
- "plan:" → Enter Plan Mode for strategy without changes
- "act" → Execute planned changes in Act Mode
- "check memory" → Verify Memory Bank completeness and currency

## Example Memory Bank Announcement
"[Memory Bank: Active]
Project: React inventory management system with barcode scanning
Stack: React 18, TypeScript, Firebase, Jest
Current Focus: Implementing barcode scanner component
Last Session: Completed API integration for product lookups
Next: Complete scanner UI and test coverage"

## Documentation Standards
- Use clear markdown formatting
- Keep information concise but comprehensive
- Date significant changes in progress.md
- Document WHY decisions were made, not just WHAT
- Use bullet points and sections for scannability

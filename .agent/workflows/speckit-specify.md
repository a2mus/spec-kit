---
description: Create feature specification from natural language description (PLANNING ONLY - does NOT execute)
---

# Spec-Kit Specify

> [!CAUTION]
> **This workflow is PLANNING ONLY. It does NOT execute or implement any code changes.**

Create a feature specification from the user's natural language description. Focus on WHAT users need and WHY - avoid implementation details.

## Steps

### 1. Generate Branch Name

From the user's feature description:
- Create a 2-4 word short name (e.g., "user-auth", "delivery-tracking")
- Use action-noun format when possible
- Preserve technical terms and acronyms

### 2. Check for Existing Branches

// turbo
```powershell
git fetch --all --prune
```

Check for the highest feature number across:
- Remote branches: `git ls-remote --heads origin`
- Local branches: `git branch`
- Specs directories: Check `specs/` folder

Use N+1 for the new branch number.

### 3. Create Feature Branch and Spec File

// turbo
Run the feature creation script:
```powershell
.\.specify\scripts\powershell\create-new-feature.ps1 -FeatureDescription '<user_description>' -ShortName '<short-name>' -Json
```

**Note**: The `-FeatureDescription` parameter must be named explicitly for proper argument binding.

Parse the JSON output to get:
- `BRANCH_NAME`: The new feature branch (e.g., `003-delivery-tracking`)
- `SPEC_FILE`: Path to the new spec file (e.g., `specs/003-delivery-tracking/spec.md`)

**Directory Structure Created**:
```
specs/[###-feature-name]/
├── spec.md              # Feature specification (this step)
├── plan.md              # Created by /speckit-plan
├── research.md          # Created by /speckit-plan  
├── data-model.md        # Created by /speckit-plan
├── contracts/           # Created by /speckit-plan
├── quickstart.md        # Created by /speckit-plan
├── tasks.md             # Created by /speckit-tasks
└── checklists/          # Created by /speckit-specify and /speckit-checklist
```

### 4. Load Spec Template

Read `.specify/templates/spec-template.md` to understand required sections:
- User Scenarios & Testing (mandatory)
- Requirements (mandatory)
- Success Criteria (mandatory)

### 5. Fill Specification

From the user's description, fill the spec template:

1. **Parse description**: Extract actors, actions, data, constraints
2. **User Scenarios**: Create prioritized user stories (P1, P2, P3...)
   - Each story must be independently testable
   - Include acceptance scenarios in Given/When/Then format
3. **Functional Requirements**: Create testable requirements (FR-001, FR-002...)
   - Mark unclear aspects with `[NEEDS CLARIFICATION: question]` (max 3)
4. **Key Entities**: Identify data entities if applicable
   - **Use Context7 MCP** (optional) to reference framework best practices:
     - Use `mcp_context7_query-docs` to look up data modeling patterns
     - Reference official documentation for entity design
     - Ensure entities follow framework conventions
5. **Success Criteria**: Define measurable, technology-agnostic outcomes

### 6. Validate Specification Quality

Create checklist at `FEATURE_DIR/checklists/requirements.md`:

```markdown
# Specification Quality Checklist: [FEATURE NAME]

## Content Quality
- [ ] No implementation details (languages, frameworks, APIs)
- [ ] Focused on user value and business needs
- [ ] Written for non-technical stakeholders

## Requirement Completeness
- [ ] No [NEEDS CLARIFICATION] markers remain (or max 3)
- [ ] Requirements are testable and unambiguous
- [ ] Success criteria are measurable
- [ ] Edge cases identified
```

### 7. Handle Clarifications

If [NEEDS CLARIFICATION] markers exist (max 3):
- Present each as a question with suggested options
- Wait for user response
- Update spec with chosen answers
- Re-validate

### 8. Write Specification

// turbo
Write the completed spec to `SPEC_FILE` path from step 3.

### 9. Report Completion (END OF WORKFLOW)

Present to user and **STOP**:
- Branch name
- Spec file path
- Checklist results
- Readiness for next phase

> [!IMPORTANT]
> **STOP HERE.** This workflow ends after presenting the specification.
> Do NOT proceed to planning or implementation without user approval.

## Guidelines

- Focus on **WHAT** users need and **WHY**
- Avoid HOW to implement (no tech stack, APIs, code structure)
- Written for business stakeholders, not developers
- Maximum 3 [NEEDS CLARIFICATION] markers
- Each user story should be independently testable
- **PLANNING ONLY** - do NOT implement, fix, or modify any source code

## Next Steps (User Must Invoke Separately)

After specification is reviewed and approved:
- `/speckit-clarify` - Clarify remaining requirements (optional)
- `/speckit-plan` - Create technical implementation plan

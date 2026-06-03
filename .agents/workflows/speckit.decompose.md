---
description: "Decompose product specifications into ordered, individual feature specs. Reads constitution.md, product-spec.md, and ui-spec.md to generate a logical sequence of feature specification files ready for /speckit.specify."
handoffs:
  - label: Specify First Feature
    agent: speckit.specify
    prompt: Create the feature specification for the first decomposed feature.
    send: true
  - label: Review Product Spec
    agent: speckit.brainstorm
    prompt: Review and update the product specification before decomposition.
  - label: Review UI Spec
    agent: speckit.uidesign
    prompt: Review and update the UI specification before decomposition.
---

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are running a **product-to-features decomposition** workflow. Your goal is to read the project's foundational documents — constitution, product specification, and UI specification — and break the entire product down into a logically ordered sequence of individual feature specification files. Each file will later be consumed by `/speckit.specify` to create a full spec-driven feature branch.

Follow this execution flow:

### Phase 1: Load & Validate Prerequisites

1. **Read the three foundational documents** from `.specify/memory/`:

   | Document | Path | Required? |
   |----------|------|-----------|
   | Product Specification | `.specify/memory/product-spec.md` | **Yes** |
   | UI Specification | `.specify/memory/ui-spec.md` | Recommended |
   | Constitution | `.specify/memory/constitution.md` | Recommended |

2. **Validate availability**:
   - If `product-spec.md` is **missing**: ERROR — "Product specification not found. Run `/speckit.brainstorm` first to define your product."
   - If `ui-spec.md` is **missing**: WARN — "UI specification not found. UI features will be derived from product spec only. Consider running `/speckit.uidesign` for richer UI decomposition." Proceed if user confirms.
   - If `constitution.md` is **missing** or still contains template placeholders (e.g., `[PRINCIPLE_1_NAME]`): WARN — "Constitution not found or not yet customized. Technical constraints will be inferred from the product spec. Consider running `/speckit.initiate` first." Proceed if user confirms.

3. **Extract key information** from each document:

   **From `product-spec.md`**:
   - Executive summary & problem statement
   - Core features list (§5.1) and secondary features (§5.2)
   - Feature prioritization / MoSCoW table (§5.3)
   - Technical decisions: stack, data architecture, auth approach (§6)
   - Non-functional requirements (§7)
   - Success metrics (§9)

   **From `ui-spec.md`**:
   - Page/screen inventory and navigation architecture
   - Component library and design system tokens
   - Interactive patterns, forms, modals, flows
   - Responsive and accessibility requirements

   **From `constitution.md`**:
   - Architecture principles and constraints
   - Code quality standards (testing, linting, type safety)
   - Security requirements (auth, data protection)
   - Design & UI principles
   - DevOps & deployment strategy

### Phase 2: Identify & Classify Features

1. **Extract all features** from the product spec, cross-referencing with the UI spec for UI-related features. Create a master list.

2. **Classify each feature** into one of these categories:

   | Category | Description | Example |
   |----------|-------------|---------|
   | 🏗️ **Foundation** | Core infrastructure, project setup, shared utilities | Project scaffolding, design system setup, auth module |
   | 🔧 **Backend / Non-UI** | API endpoints, data models, business logic, integrations | Payment processing, email service, data pipeline |
   | 🖥️ **UI Feature** | User-facing screens, components, interactive flows | Dashboard page, settings panel, onboarding wizard |
   | 🔗 **Integration** | Third-party service connections, webhooks, sync | OAuth provider, analytics SDK, notification service |
   | 🛡️ **Cross-Cutting** | Features that span multiple areas | Error handling, logging, i18n, accessibility |

3. **Resolve dependencies** — for each feature, identify:
   - What it **depends on** (must be built first)
   - What **depends on it** (builds on top of this)
   - Whether it can be developed **in parallel** with other features

### Phase 3: Logical Ordering

Order the features using these rules (in priority order):

1. **Foundation first**: Project setup, design system, shared configuration
2. **Auth before protected features**: Authentication/authorization before any feature requiring logged-in users
3. **Data models before UI**: Backend data structures and APIs before the UI that consumes them
4. **Core before secondary**: MoSCoW "Must Have" before "Should Have" before "Could Have"
5. **Independent before dependent**: Features with no dependencies before features that build on others
6. **Vertical slices preferred**: When possible, group a backend + UI pair as a single feature for end-to-end testability
7. **Cross-cutting at the right time**: i18n, error handling, and observability after the first few features establish patterns but before the bulk of UI work

### Phase 4: Generate Feature Specification Files

1. **Create the output directory**: `.specify/memory/features/`

2. **Generate a manifest file** at `.specify/memory/features/README.md`:

   ```markdown
   # Feature Decomposition Manifest

   **Generated**: [DATE]
   **Source Documents**:
   - [product-spec.md](../product-spec.md)
   - [ui-spec.md](../ui-spec.md)
   - [constitution.md](../constitution.md)

   **Total Features**: [N]

   ## Feature Order

   | # | File | Feature Name | Category | Priority | Dependencies |
   |---|------|-------------|----------|----------|-------------|
   | 1 | `001-[name].md` | [Feature Name] | [Category emoji] | [MoSCoW] | None |
   | 2 | `002-[name].md` | [Feature Name] | [Category emoji] | [MoSCoW] | #1 |
   | ... | ... | ... | ... | ... | ... |

   ## Dependency Graph

   ```mermaid
   graph TD
       F001["001 - Feature Name"] --> F002["002 - Feature Name"]
       F001 --> F003["003 - Feature Name"]
       F002 --> F005["005 - Feature Name"]
       ...
   ```

   ## How to Use

   Process features sequentially using `/speckit.specify`:

   1. Read the feature brief in each numbered file
   2. Run `/speckit.specify [paste the feature description from the file]`
   3. Complete the spec → plan → tasks cycle for each feature
   4. Move to the next feature in order

   Features marked as parallelizable can be worked on simultaneously.
   ```

3. **For each feature**, create a file named `NNN-[short-name].md` (zero-padded 3-digit number, kebab-case name) in `.specify/memory/features/`:

   ```markdown
   # Feature Brief: [Feature Name]

   **Sequence**: #[NNN] of [TOTAL]
   **Category**: [Category emoji + name]
   **Priority**: [MoSCoW priority]
   **Estimated Complexity**: [Small / Medium / Large / XL]

   ## Dependencies

   - **Requires**: [List of prerequisite feature #numbers and names, or "None"]
   - **Unlocks**: [List of features that depend on this one]
   - **Parallelizable with**: [List of features that can be built simultaneously, or "None"]

   ## Feature Description

   [2-4 paragraph natural language description of the feature. This is the text that will be passed directly to `/speckit.specify` as the feature description argument.

   Write it as if a product manager is explaining the feature to the development team. Include:
   - What problem this feature solves
   - Who benefits from it (which user personas)
   - What the user can do once this feature is built
   - Key behaviors and business rules
   - Important constraints or boundaries]

   ## Derived From

   - **Product Spec**: [Section references, e.g., "§5.1 Core Features — FR-003, FR-004"]
   - **UI Spec**: [Section references, e.g., "§3.2 Dashboard Screen — components C-012, C-015"]
   - **Constitution**: [Relevant principles, e.g., "Article 1.2 — Microservices boundary rule"]

   ## Acceptance Criteria Summary

   [3-7 high-level acceptance criteria bullets. These will be expanded by `/speckit.specify` into full user stories and acceptance scenarios.]

   - [ ] [Criterion 1 — user-facing, measurable]
   - [ ] [Criterion 2 — user-facing, measurable]
   - [ ] [Criterion 3 — user-facing, measurable]
   - [ ] ...

   ## UI Components (if applicable)

   [List the key UI elements this feature introduces or modifies. Skip this section entirely for non-UI features.]

   - [Component/Page 1]: [Brief description]
   - [Component/Page 2]: [Brief description]

   ## Technical Hints

   [Optional. Brief notes about known technical considerations from the constitution or product spec. NOT implementation details — just constraints the spec writer should be aware of.]

   - [Hint 1, e.g., "Must integrate with the existing auth module from Feature #002"]
   - [Hint 2, e.g., "Constitution requires WCAG AA compliance for all form elements"]

   ---

   **To create the full specification, run:**
   ```
   /speckit.specify [paste the Feature Description section above]
   ```
   ```

### Phase 5: Validation & Quality Checks

After generating all feature files, validate the decomposition:

1. **Completeness check**: Every feature listed in the product spec's core features (§5.1) and secondary features (§5.2) must be covered by at least one feature brief. Flag any gaps.

2. **Dependency cycle check**: Verify there are no circular dependencies in the feature graph. If found, resolve by splitting the cyclic feature or reordering.

3. **Constitution compliance**: Verify each feature brief respects constitution constraints (e.g., if the constitution mandates microservices, no feature should assume monolithic patterns).

4. **Coverage matrix**: Generate a cross-reference table showing which product spec requirements (FR-XXX) and UI spec components are covered by which feature briefs. Flag any orphaned requirements.

   ```markdown
   ## Coverage Matrix

   | Requirement | Feature(s) | Status |
   |-------------|-----------|--------|
   | FR-001 | #003 | ✅ Covered |
   | FR-002 | #005, #007 | ✅ Covered |
   | FR-003 | — | ⚠️ NOT COVERED |
   ```

5. **Present validation results** to the user. If issues are found, fix them before finalizing.

### Phase 6: Report & Next Steps

Present a completion summary:

```markdown
## ✅ Feature Decomposition Complete

**Features generated**: [N] files in `.specify/memory/features/`
**Categories**: 🏗️ Foundation: [n] | 🔧 Backend: [n] | 🖥️ UI: [n] | 🔗 Integration: [n] | 🛡️ Cross-cutting: [n]
**Dependency depth**: [max chain length] levels

### Files Created
- `.specify/memory/features/README.md` — Manifest & dependency graph
- `.specify/memory/features/001-[name].md` — [Feature Name]
- `.specify/memory/features/002-[name].md` — [Feature Name]
- ...

### Recommended Workflow

1. **Start with Feature #001**: `/speckit.specify [description from 001]`
2. Complete the spec → clarify → plan → tasks → implement cycle
3. Proceed to Feature #002 when #001 is at least at the "planned" stage
4. Features [#X, #Y] can be parallelized after their dependencies are met

### Coverage
- Product spec requirements covered: [N/Total] ✅
- UI spec components covered: [N/Total] ✅
- Constitution compliance: ✅ All features align with project principles
```

## Quick Guidelines

- **Derive, don't invent**: Every feature must trace back to the product spec, UI spec, or constitution. Do not add features that aren't implied by these documents.
- **Goldilocks granularity**: Each feature should be large enough to deliver user value (not "add a button") but small enough to be specced, planned, and implemented in one cycle (not "build the entire dashboard").
- **Aim for 5-15 features** for a typical product. Fewer than 5 suggests features are too coarse; more than 20 suggests they're too fine-grained.
- **Feature descriptions are the primary output**: They must be rich enough to be pasted directly into `/speckit.specify` and produce a complete spec without further context.
- **No implementation details**: Feature briefs describe WHAT and WHY, never HOW. Technical hints are limited to constitutional constraints.
- **Respect MoSCoW**: If the product spec has a prioritization table, honor it. Must-have features come first in the ordering.
- **Vertical slices over horizontal layers**: Prefer "User Registration (backend + UI)" over separate "User Registration API" and "Registration Form" features, unless the constitution or architecture explicitly requires layer separation.
- **Cross-reference everything**: Every feature brief must cite its source sections from the product spec, UI spec, and constitution. This creates an audit trail.

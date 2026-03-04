---
description: "Generate project constitution from product and UI specifications. Extract best practices, guidelines, and development standards for the entire product lifecycle."
handoffs:
  - label: Build Specification
    agent: speckit.specify
    prompt: Create the first feature specification based on the product constitution and specifications.
  - label: Review Product Spec
    agent: speckit.brainstorm
    prompt: Review and update the product specification.
  - label: Review UI Spec
    agent: speckit.uidesign
    prompt: Review and update the UI specification.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are generating a **project constitution** — the governing document for the entire product development lifecycle. This constitution is derived from both the product specification and the UI specification, and it codifies the technology choices, coding standards, design principles, architecture decisions, and best practices that the team must follow.

**Prerequisites**: Both files should exist:
- `.specify/memory/product-spec.md` (from `/speckit.brainstorm`)
- `.specify/memory/ui-spec.md` (from `/speckit.uidesign`)

If either is missing, warn the developer and recommend running the prerequisite command first. You may proceed with only one file if the developer confirms.

Follow this execution flow:

### Phase 1: Load & Analyze Specifications

1. Read `.specify/memory/product-spec.md` and extract:
   - Technology stack decisions (frontend, backend, database, hosting)
   - Architecture style (monolith, microservices, serverless)
   - Authentication approach
   - Data management strategy
   - Scale and deployment targets
   - Non-functional requirements (performance, security, reliability)

2. Read `.specify/memory/ui-spec.md` and extract:
   - Design system tokens (colors, typography, spacing)
   - Component library choices
   - Responsive strategy
   - Accessibility requirements
   - Navigation architecture

3. Present a summary of what was extracted:

```markdown
## Specifications Analyzed

### From Product Spec
- **Stack**: [tech stack summary]
- **Architecture**: [architecture style]
- **Auth**: [auth approach]
- **Data**: [data strategy]
- **Scale**: [target scale]

### From UI Spec
- **Design System**: [framework/custom]
- **Component Library**: [library name]
- **Responsive**: [strategy]
- **Accessibility**: [level]

I'll now generate the project constitution based on these decisions.
```

### Phase 2: Generate Constitution Principles

For each area, derive specific, actionable principles. Present them to the developer for confirmation.

**Architecture Principles:**

```markdown
### Architecture Principles

Based on your [architecture style] choice and [scale target]:

| # | Principle | Rule | Rationale |
|---|-----------|------|-----------|
| 1 | [Principle name] | [MUST/SHOULD rule] | [Why this matters for your product] |
| 2 | [Principle name] | [MUST/SHOULD rule] | [Why this matters] |
| 3 | [Principle name] | [MUST/SHOULD rule] | [Why this matters] |

Do you agree with these? (yes / modify #N):
```

**Code Quality Principles:**

```markdown
### Code Quality Standards

Based on your [tech stack] and [scale target]:

| # | Standard | Requirement | Tool/Approach |
|---|----------|-------------|---------------|
| 1 | Testing | [Min coverage %, test types required] | [Testing framework] |
| 2 | Linting | [Style rules] | [Linter tool] |
| 3 | Type Safety | [Strict/relaxed] | [TypeScript strict, Kotlin null-safety, etc.] |
| 4 | Code Review | [Process] | [PR requirements] |
| 5 | Documentation | [Level required] | [Doc tool] |

Do you agree? (yes / modify #N):
```

**Design Principles:**

```markdown
### Design & UI Principles

Based on your UI specification:

| # | Principle | Rule | Source |
|---|-----------|------|--------|
| 1 | Design System | MUST use defined design tokens for all styling | ui-spec.md §1 |
| 2 | Accessibility | MUST meet [WCAG level] compliance | ui-spec.md §6 |
| 3 | Responsiveness | MUST support [breakpoints] | ui-spec.md §5 |
| 4 | Component Reuse | SHOULD use [component library] before custom | ui-spec.md §2 |
| 5 | Consistency | MUST NOT introduce custom colors/fonts outside design system | ui-spec.md §1 |

Do you agree? (yes / modify #N):
```

**Security Principles:**

```markdown
### Security Principles

Based on your [auth approach] and [data strategy]:

| # | Principle | Rule | Approach |
|---|-----------|------|----------|
| 1 | Authentication | [MUST rule] | [Implementation approach] |
| 2 | Data Protection | [MUST rule] | [Encryption/privacy approach] |
| 3 | Input Validation | [MUST rule] | [Validation strategy] |
| 4 | Dependency Management | [MUST rule] | [Audit tools] |
| 5 | Secrets Management | [MUST rule] | [Secrets approach] |

Do you agree? (yes / modify #N):
```

**DevOps & Deployment Principles:**

```markdown
### DevOps & Deployment

Based on your [deployment targets]:

| # | Principle | Rule | Tool |
|---|-----------|------|------|
| 1 | CI/CD | [Pipeline requirements] | [CI/CD platform] |
| 2 | Environments | [Env strategy: dev/staging/prod] | [Hosting] |
| 3 | Monitoring | [Observability requirements] | [Monitoring tool] |
| 4 | Versioning | [Versioning strategy] | [SemVer / CalVer] |
| 5 | Branching | [Git workflow] | [Trunk-based / GitFlow / etc.] |

Do you agree? (yes / modify #N):
```

### Phase 3: Compile Constitution

After developer confirmation, generate the full constitution:

```markdown
# Project Constitution: [PRODUCT_NAME]

**Ratification Date**: [DATE]
**Last Amended**: [DATE]
**Version**: 1.0.0
**Derived From**: product-spec.md, ui-spec.md

---

## Preamble

This constitution establishes the governing principles, standards, and practices
for the development of [PRODUCT_NAME]. All development work MUST comply with
this document. Amendments require explicit review and version increment.

---

## Article 1: Architecture

### 1.1 System Architecture
- **Pattern**: [Architecture style]
- **Rationale**: [Why this pattern fits]

### 1.2 Architecture Principles
[Numbered list of MUST/SHOULD rules from Phase 2]

### 1.3 Technology Stack
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| [layer] | [tech] | [version] | [why] |

### 1.4 Dependency Policy
[Rules for adding/updating dependencies]

---

## Article 2: Code Quality

### 2.1 Testing Standards
- **Unit Testing**: [Requirements — framework, coverage target]
- **Integration Testing**: [Requirements]
- **E2E Testing**: [Requirements — if applicable]
- **Test Naming**: [Convention]

### 2.2 Code Style & Linting
- **Linter**: [Tool and config]
- **Formatter**: [Tool and config]
- **Rules**: [Key enforced rules]

### 2.3 Type Safety
[Type system requirements]

### 2.4 Code Review
[PR process, approval requirements, review checklist]

### 2.5 Documentation
[Documentation requirements for code, APIs, features]

---

## Article 3: Design & UI

### 3.1 Design System
[Reference to ui-spec.md design tokens]

### 3.2 Component Standards
- **Library**: [Component library]
- **Custom Components**: [Rules for when/how custom components are allowed]
- **Naming Convention**: [Component naming rules]

### 3.3 Accessibility
- **Compliance Level**: [WCAG level]
- **Requirements**: [Specific a11y rules]

### 3.4 Responsive Design
- **Approach**: [Mobile-first / Desktop-first]
- **Breakpoints**: [Defined breakpoints]

---

## Article 4: Security

### 4.1 Authentication & Authorization
[Auth rules derived from product spec]

### 4.2 Data Protection
[Data handling rules]

### 4.3 Input Validation
[Validation requirements]

### 4.4 Secrets Management
[How secrets are stored and accessed]

### 4.5 Dependency Auditing
[Security scanning requirements]

---

## Article 5: DevOps & Deployment

### 5.1 CI/CD Pipeline
[Pipeline requirements and stages]

### 5.2 Environment Strategy
[Dev/staging/prod configuration]

### 5.3 Release Process
[How releases are cut and deployed]

### 5.4 Monitoring & Observability
[Logging, metrics, alerting requirements]

### 5.5 Versioning
[Version scheme and rules]

---

## Article 6: Git Workflow

### 6.1 Branching Strategy
[Branch naming, workflow type]

### 6.2 Commit Convention
[Commit message format — e.g., Conventional Commits]

### 6.3 PR Process
[PR template, review requirements, merge strategy]

---

## Article 7: Project Organization

### 7.1 Directory Structure
[Expected project directory layout]

### 7.2 Naming Conventions
[File, folder, variable, function naming rules]

### 7.3 Module Boundaries
[How code is organized into modules/packages]

---

## Article 8: Governance

### 8.1 Amendment Process
- Changes to this constitution require explicit documentation
- Version MUST be incremented per semantic versioning
- All team members must be notified of changes

### 8.2 Compliance
- All PRs MUST comply with this constitution
- Non-compliance must be flagged in code review
- Exceptions require documented justification

### 8.3 Review Schedule
[How often the constitution should be reviewed]

---

## Appendix A: Reference Documents
- [product-spec.md](./product-spec.md) — Product requirements
- [ui-spec.md](./ui-spec.md) — UI specification

## Appendix B: Tool Configuration
[Links to or inline configuration for linters, formatters, CI/CD, etc.]
```

### Phase 4: Merge with Existing Constitution

1. Check if `.specify/memory/constitution.md` already exists.
2. If it exists:
   - Compare with the generated constitution
   - Identify conflicts and new additions
   - Present a merge summary to the developer
   - Ask whether to replace, merge, or keep both
3. If it doesn't exist: proceed to save.

### Phase 5: Save & Report

1. Save the completed constitution to `.specify/memory/constitution.md`.
2. Report completion with:
   - Version and rationale
   - Summary of all principles established
   - Count of rules by category (Architecture: N, Code Quality: N, etc.)
   - File paths of all three documents:
     - `.specify/memory/product-spec.md`
     - `.specify/memory/ui-spec.md`
     - `.specify/memory/constitution.md`
   - Recommended next step: run `/speckit.specify` to create the first feature specification
   - Suggested commit message: `docs: establish project constitution v1.0.0`

## Quick Guidelines

- Principles must be **specific and actionable** — avoid vague "should be good" rules
- Use **MUST** for non-negotiable rules, **SHOULD** for strong recommendations, **MAY** for optional
- Every principle needs a **rationale** — the team should understand WHY
- Cross-reference product-spec.md and ui-spec.md sections by number
- The constitution is a **living document** — emphasize the amendment process
- Don't invent requirements that weren't in the spec files — derive only from actual decisions
- If the developer has strong opinions during confirmation, update the principles accordingly
- Keep the constitution focused on **governance and standards**, not implementation details

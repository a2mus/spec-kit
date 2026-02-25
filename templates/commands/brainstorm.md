---
description: "Interactive product brainstorming and specification workflow. Define product requirements through guided Q&A with technology recommendations."
handoffs:
  - label: Design UI
    agent: speckit.uidesign
    prompt: Design the UI for the product specification we just created.
    send: true
  - label: Generate Constitution
    agent: speckit.initiate
    prompt: Generate the project constitution from the product and UI specifications.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are running an **interactive product brainstorming session** with the developer. Your goal is to transform a rough product idea into a comprehensive Product Requirements Document — **without any UI/UX details** (those come later via `/speckit.uidesign`).

Follow this execution flow:

### Phase 1: Capture the Idea

1. Read the user's input from `$ARGUMENTS`.
   - If empty: ask the developer to describe their product idea in 2-3 sentences.
   - If provided: acknowledge the idea and summarize your understanding back to them.

2. Extract initial context:
   - What problem does this solve?
   - Who is the target audience?
   - What makes it different from existing solutions?

### Phase 2: Interactive Narrowing Questions

Present questions **one category at a time**, with numbered answers for quick selection. After each answer, narrow the next set of questions based on previous choices. The developer can also type a custom answer.

**Round 1 — Product Nature:**

```markdown
### What is the nature of your product?

| # | Option | Description |
|---|--------|-------------|
| 1 | 📱 Mobile App | Native or cross-platform mobile application |
| 2 | 🌐 Web Application | Browser-based application or website |
| 3 | 🖥️ Desktop App | Native desktop application (Windows/macOS/Linux) |
| 4 | 🔄 Multi-Platform | Combination of mobile + web + desktop |
| 5 | ⚙️ API / Backend Service | Headless service or API-only product |
| 6 | 🧩 Other | Describe your own |

Your choice (number or custom):
```

**Round 2 — Target Platform (conditional on Round 1):**

*If Mobile App:*

```markdown
### Target mobile platforms?

| # | Option | Implications |
|---|--------|-------------|
| 1 | Android only | Kotlin/Java, Google Play Store |
| 2 | iOS only | Swift/SwiftUI, Apple App Store |
| 3 | Both (cross-platform) | React Native, Flutter, or KMP |

Your choice:
```

*If Web Application:*

```markdown
### What kind of web application?

| # | Option | Implications |
|---|--------|-------------|
| 1 | Static site / Landing page | HTML/CSS/JS, SSG frameworks |
| 2 | Single Page Application (SPA) | React, Vue, Angular, Svelte |
| 3 | Server-rendered app (SSR) | Next.js, Nuxt, SvelteKit |
| 4 | Full-stack with backend | Monorepo or separate frontend/backend |
| 5 | Progressive Web App (PWA) | Offline support, installable |

Your choice:
```

*If Desktop App:*

```markdown
### Target desktop platforms?

| # | Option | Implications |
|---|--------|-------------|
| 1 | Windows only | .NET/WPF, Electron, Tauri |
| 2 | macOS only | Swift/AppKit, Electron, Tauri |
| 3 | Linux only | GTK, Qt, Electron, Tauri |
| 4 | Cross-platform (all) | Electron, Tauri, Flutter Desktop |

Your choice:
```

**Round 3 — Architecture & Data:**

```markdown
### How should data be managed?

| # | Option | Implications |
|---|--------|-------------|
| 1 | Local only (offline) | SQLite, local storage, no server needed |
| 2 | Cloud-synced | Firebase, Supabase, custom backend |
| 3 | Real-time collaborative | WebSockets, CRDTs, operational transforms |
| 4 | Offline-first with sync | Local DB + cloud sync when connected |

Your choice:
```

**Round 4 — Authentication:**

```markdown
### Authentication requirements?

| # | Option | Implications |
|---|--------|-------------|
| 1 | None needed | Public/anonymous access |
| 2 | Email + Password | Custom auth or Auth0/Firebase Auth |
| 3 | Social login (Google, GitHub, etc.) | OAuth2 integration |
| 4 | Enterprise SSO (SAML/OIDC) | Identity provider integration |
| 5 | Multi-factor (MFA) | Extra security layer |

Your choice:
```

**Round 5 — Scale & Deployment:**

```markdown
### Expected scale?

| # | Option | Implications |
|---|--------|-------------|
| 1 | Personal / side project | Simple deployment, minimal infra |
| 2 | Small team (< 50 users) | Basic hosting, simple CI/CD |
| 3 | Medium (50-10K users) | Load balancing, monitoring, CDN |
| 4 | Large scale (10K+ users) | Distributed systems, auto-scaling |

Your choice:
```

**Round 6 — Key Features (dynamic based on previous answers):**

Generate 5-8 feature questions relevant to the product type. For example:

- For mobile apps: push notifications, camera access, GPS, payments, offline mode
- For web apps: SEO, i18n, accessibility, analytics, real-time updates
- For APIs: rate limiting, versioning, webhooks, documentation
- For all: monetization model, admin panel, reporting, integrations

Present as a multi-select checklist:

```markdown
### Which key capabilities does your product need?

Select all that apply (comma-separated numbers):

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🔔 Push Notifications | Alert users of events |
| 2 | 💳 Payment Processing | Accept payments (Stripe, etc.) |
| 3 | 📊 Analytics Dashboard | Track usage and metrics |
| 4 | 🌍 Multi-language (i18n) | Support multiple languages |
| 5 | ♿ Accessibility (a11y) | WCAG compliance |
| 6 | 📧 Email Integration | Transactional emails |
| 7 | 📁 File Upload/Storage | Media or document handling |
| 8 | 🔍 Search | Full-text or filtered search |

Your choices (e.g., 1,3,5):
```

### Phase 3: Technology Recommendations

Based on all the developer's answers, generate a **technology comparison table** with your recommendation highlighted:

```markdown
## Technology Recommendation

Based on your choices, here are the recommended technology stacks:

### ⭐ Recommended Stack

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | [Tech] | [Why this fits your requirements] |
| Backend | [Tech] | [Why this fits your requirements] |
| Database | [Tech] | [Why this fits your requirements] |
| Hosting | [Tech] | [Why this fits your requirements] |
| Auth | [Tech] | [Why this fits your requirements] |

### Alternative Options

| Layer | Option A | Option B | Your Pick (Recommended) |
|-------|----------|----------|------------------------|
| Frontend | [Alt 1 + pros/cons] | [Alt 2 + pros/cons] | [Recommended] |
| Backend | [Alt 1 + pros/cons] | [Alt 2 + pros/cons] | [Recommended] |
| ... | ... | ... | ... |
```

Present the recommendations and ask the developer:
- Do you agree with the recommended stack?
- Would you like to swap any layer?
- Do you have existing preferences or constraints?

### Phase 4: Generate Product Specification

After confirming all choices, compile the final Product Requirements Document with the following structure:

```markdown
# Product Specification: [PRODUCT_NAME]

**Generated**: [DATE]
**Version**: 1.0.0

## 1. Executive Summary
[2-3 paragraph summary of the product, target audience, and value proposition]

## 2. Problem Statement
[What problem this product solves]

## 3. Target Audience
[Who will use this product, user personas]

## 4. Product Type & Platform
- **Type**: [Mobile/Web/Desktop/Multi-platform/API]
- **Target Platforms**: [Specific platforms]
- **Architecture**: [Chosen architecture approach]

## 5. Functional Requirements

### 5.1 Core Features
[Numbered list of must-have features derived from the conversation]

### 5.2 Secondary Features
[Nice-to-have features]

### 5.3 Feature Prioritization (MoSCoW)
| Feature | Priority | Rationale |
|---------|----------|-----------|
| ... | Must Have / Should Have / Could Have / Won't Have | ... |

## 6. Technical Decisions

### 6.1 Technology Stack
[Full stack table with rationale for each choice]

### 6.2 Data Architecture
- **Storage**: [Local/Cloud/Hybrid]
- **Database**: [Chosen DB]
- **Sync Strategy**: [If applicable]

### 6.3 Authentication & Authorization
[Chosen auth approach with details]

### 6.4 Deployment & Infrastructure
- **Hosting**: [Where it runs]
- **CI/CD**: [Pipeline approach]
- **Scale Target**: [Expected load]

## 7. Non-Functional Requirements
- **Performance**: [Response times, load capacity]
- **Security**: [Data protection, compliance]
- **Reliability**: [Uptime targets, backup strategy]
- **Maintainability**: [Code quality standards]

## 8. Constraints & Assumptions
[Any limitations, budget constraints, timeline, team size]

## 9. Success Metrics
[How to measure if the product is successful]

## 10. Out of Scope
[Explicitly excluded items — especially UI/UX details which are in ui-spec.md]
```

### Phase 5: Save & Report

1. Save the completed specification to `.specify/memory/product-spec.md`.
2. If the file already exists, ask the developer before overwriting.
3. Report completion with:
   - Summary of key decisions
   - File path
   - Recommended next step: run `/speckit.uidesign` to define the UI

## Quick Guidelines

- Focus on **WHAT** and **WHY**, not **HOW** (no code, no implementation details)
- Keep questions conversational but structured
- Respect the developer's existing preferences — don't push alternatives if they're set on something
- The resulting document **must not contain any UI/UX specifications** — those belong to `ui-spec.md`
- Always provide a recommendation, never leave the developer without guidance
- Use emoji sparingly but consistently for visual scanning of options

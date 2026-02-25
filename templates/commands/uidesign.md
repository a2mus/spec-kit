---
description: "UI design specification workflow with AI-generated mockup prompts. Define the visual interface through iterative mockup refinement."
handoffs:
  - label: Generate Constitution
    agent: speckit.initiate
    prompt: Generate the project constitution from the product and UI specifications.
    send: true
  - label: Refine Product Spec
    agent: speckit.brainstorm
    prompt: Revisit the product specification to align with UI decisions.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Outline

You are running a **UI design specification workflow**. Your goal is to help the developer define a comprehensive UI specification by generating prompts for AI design tools (Google Stitch, v0, Bolt, etc.), reviewing the resulting mockups, and iterating until the developer is satisfied.

**Prerequisite**: The product specification at `.specify/memory/product-spec.md` should exist. If it doesn't, recommend running `/speckit.brainstorm` first.

Follow this execution flow:

### Phase 1: Load Product Context

1. Read `.specify/memory/product-spec.md` to understand:
   - Product type and target platforms
   - Core features and functional requirements
   - Technology stack decisions
   - Target audience

2. If `$ARGUMENTS` contains additional UI context or preferences, incorporate them.

3. Summarize to the developer:
   ```markdown
   ## Product Context Loaded

   **Product**: [name]
   **Type**: [Mobile/Web/Desktop]
   **Platform**: [specific platforms]
   **Core Features**: [bullet list of main features]
   **Target Audience**: [who]

   I'll now generate a detailed UI prompt based on these specifications.
   ```

### Phase 2: Generate Design Tool Prompt

Create a **detailed, copy-pasteable prompt** optimized for AI design tools. The prompt should be comprehensive enough to produce a high-quality first mockup.

```markdown
## 🎨 UI Generation Prompt

Copy the prompt below and paste it into your preferred design tool
(Google Stitch, v0.dev, Bolt.new, Lovable, or similar):

---

**PROMPT START**

Design a [product type] interface for "[product name]" — [one-line description].

**Target Platform**: [Web/iOS/Android/Desktop]
**Screen Size**: [responsive/mobile-first/desktop-first]

**Screens to design** (in order of priority):

1. **[Screen Name]** — [Description of what this screen shows]
   - Key elements: [list of UI elements needed]
   - User action: [primary action on this screen]

2. **[Screen Name]** — [Description]
   - Key elements: [list]
   - User action: [primary action]

3. **[Screen Name]** — [Description]
   - Key elements: [list]
   - User action: [primary action]

[Continue for all major screens, typically 4-8]

**Design Requirements**:
- Color scheme: [suggest based on product type — e.g., "professional blues and grays for B2B", "vibrant and playful for consumer app"]
- Typography: Modern, readable. Use [suggest font pairing]
- Layout: [grid-based / card-based / list-based depending on content]
- Navigation: [tab bar / sidebar / hamburger / breadcrumbs]
- Spacing: Generous whitespace, comfortable touch targets (min 44px for mobile)
- Iconography: [outlined / filled / custom style]
- Dark mode: [yes/no based on product requirements]

**Component Library**: Use [suggest based on tech stack — e.g., "Material Design 3 for Android", "Apple HIG for iOS", "shadcn/ui for React"]

**Interactions to indicate**:
- Hover states for clickable elements
- Loading states for async operations
- Empty states for lists/data views
- Error states for forms

**PROMPT END**

---
```

Present this prompt to the developer and ask:

```markdown
### Next Steps

1. **Copy the prompt above** and paste it into your preferred design tool
2. **Generate the mockup** and review the result
3. **Come back here** and share the generated code or describe what you see

Which design tool will you be using?
- Google Stitch
- v0.dev
- Bolt.new
- Lovable
- Figma (with AI plugin)
- Other: ___

> 💡 **Tip**: You can also paste just specific screens if you want to iterate one at a time.
```

### Phase 3: Review Mockup Output

When the developer returns with mockup code or a description:

1. **If they paste code** (HTML/CSS/React/etc.):
   - Analyze the structure and identify all UI components
   - Map components to the product requirements
   - Check for missing screens or features

2. **If they describe the result**:
   - Ask targeted questions about specific elements
   - Request screenshots or code snippets for unclear areas

3. Present your analysis:

```markdown
## Mockup Review

### ✅ Covered Requirements
- [Feature] → [How the mockup addresses it]
- [Feature] → [How the mockup addresses it]

### ⚠️ Missing or Incomplete
- [Feature] → [What's needed]
- [Feature] → [What's needed]

### 💡 Suggestions
- [Improvement idea with rationale]
- [Improvement idea with rationale]
```

### Phase 4: Interactive Refinement

Guide the developer through iterating on the mockup. Ask about each category:

**Round 1 — Layout & Navigation:**

```markdown
### Layout & Navigation

| # | Question | Current State | Options |
|---|----------|--------------|---------|
| 1 | Navigation pattern | [detected] | Keep / Switch to [alternative] |
| 2 | Content layout | [detected] | Keep / Use [alternative] |
| 3 | Screen flow | [detected] | Keep / Reorganize |

Your preferences:
```

**Round 2 — Visual Style:**

```markdown
### Visual Style

| # | Aspect | Current | Options |
|---|--------|---------|---------|
| 1 | Color palette | [detected colors] | Keep / Warmer / Cooler / Custom |
| 2 | Typography | [detected fonts] | Keep / More modern / More classic |
| 3 | Spacing | [tight/normal/generous] | Tighter / Keep / More spacious |
| 4 | Border radius | [sharp/rounded/pill] | Sharper / Keep / Rounder |
| 5 | Shadows/elevation | [flat/subtle/pronounced] | Flatter / Keep / More depth |
| 6 | Dark mode | [yes/no] | Enable / Disable / Both |

Your preferences:
```

**Round 3 — Components & Interactions:**

```markdown
### Components & Interactions

| # | Component | Current | Suggestion |
|---|-----------|---------|------------|
| 1 | Buttons | [style] | Keep / [alternative] |
| 2 | Forms/Inputs | [style] | Keep / [alternative] |
| 3 | Cards | [style] | Keep / [alternative] |
| 4 | Modals/Dialogs | [approach] | Keep / [alternative] |
| 5 | Lists/Tables | [layout] | Keep / [alternative] |
| 6 | Loading states | [type] | Keep / [alternative] |

Your preferences:
```

**Round 4 — Responsiveness (if applicable):**

```markdown
### Responsive Behavior

| # | Breakpoint | Behavior |
|---|-----------|----------|
| 1 | Mobile (< 640px) | [describe layout changes] |
| 2 | Tablet (640-1024px) | [describe layout changes] |
| 3 | Desktop (> 1024px) | [describe layout changes] |

Does this responsive strategy work for your product? (yes / adjust):
```

### Phase 5: Confirm Final Design Decisions

After iterating, present a summary for developer confirmation:

```markdown
## Final UI Design Summary

Please confirm each section (✅ or suggest changes):

### Design System
- **Primary Color**: [color + hex]
- **Secondary Color**: [color + hex]
- **Accent Color**: [color + hex]
- **Background**: [color]
- **Font Family**: [heading font] / [body font]
- **Border Radius**: [value]
- **Shadow Style**: [description]

### Screen Inventory
| # | Screen | Status | Notes |
|---|--------|--------|-------|
| 1 | [Screen name] | ✅ Finalized | [any notes] |
| 2 | [Screen name] | ✅ Finalized | [any notes] |
| ... | ... | ... | ... |

### Component Decisions
| Component | Style | Library |
|-----------|-------|---------|
| Buttons | [description] | [component lib] |
| Forms | [description] | [component lib] |
| ... | ... | ... |

### Confirmed? (yes / need changes)
```

### Phase 6: Generate UI Specification

Once confirmed, compile the UI specification with this structure:

```markdown
# UI Specification: [PRODUCT_NAME]

**Generated**: [DATE]
**Version**: 1.0.0
**Companion**: product-spec.md

## 1. Design System

### 1.1 Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | [hex] | Primary actions, links, active states |
| --color-secondary | [hex] | Secondary actions, accents |
| --color-background | [hex] | Page backgrounds |
| --color-surface | [hex] | Card/container backgrounds |
| --color-text-primary | [hex] | Main body text |
| --color-text-secondary | [hex] | Supporting text |
| --color-error | [hex] | Error states |
| --color-success | [hex] | Success states |
| --color-warning | [hex] | Warning states |

### 1.2 Typography
| Level | Font | Size | Weight | Line Height |
|-------|------|------|--------|-------------|
| H1 | [font] | [size] | [weight] | [lh] |
| H2 | [font] | [size] | [weight] | [lh] |
| Body | [font] | [size] | [weight] | [lh] |
| Caption | [font] | [size] | [weight] | [lh] |

### 1.3 Spacing Scale
[4px base unit system or custom]

### 1.4 Border Radius
[Token values for small/medium/large/pill]

### 1.5 Shadows / Elevation
[Elevation levels with shadow values]

## 2. Component Library

### 2.1 Buttons
[Primary, Secondary, Ghost, Danger variants with states]

### 2.2 Form Controls
[Input, Select, Checkbox, Radio, Toggle specifications]

### 2.3 Cards
[Card variants and their use cases]

### 2.4 Navigation
[Nav component specs — tabs, sidebar, breadcrumbs]

### 2.5 Modals & Dialogs
[Modal types and behavior specs]

### 2.6 Lists & Tables
[Data display component specs]

### 2.7 Feedback & States
[Loading, Empty, Error, Success state components]

## 3. Screen Specifications

### 3.1 [Screen Name]
- **Route/Path**: [URL or navigation path]
- **Purpose**: [What this screen does]
- **Layout**: [Description or ASCII wireframe]
- **Components Used**: [List of components on this screen]
- **User Actions**: [What users can do here]
- **Data Displayed**: [What data is shown]
- **Navigation**: [Where users can go from here]

[Repeat for each screen]

## 4. Navigation Architecture
[Navigation flow diagram or description]
- [Screen A] → [Screen B] (on: [action])
- [Screen B] → [Screen C] (on: [action])

## 5. Responsive Strategy
[Breakpoints and adaptation rules]

## 6. Accessibility Requirements
- Minimum contrast ratios
- Keyboard navigation support
- Screen reader considerations
- Touch target sizes

## 7. Animation & Transitions
[Micro-interactions, page transitions, loading animations]

## 8. Design Tool Prompt (Reference)
[The original prompt used to generate the mockup — for future reference]

## 9. Mockup Source Code (Reference)
[The code returned by the design tool — for implementation reference]
```

### Phase 7: Save & Report

1. Save the completed specification to `.specify/memory/ui-spec.md`.
2. If the file already exists, ask the developer before overwriting.
3. Report completion with:
   - Summary of key design decisions
   - File path
   - Recommended next step: run `/speckit.initiate` to generate the project constitution

## Quick Guidelines

- Focus on **visual design decisions**, not implementation code
- Always provide design rationale — explain WHY a choice is good for this product
- Respect the developer's aesthetic preferences — guide but don't override
- The mockup code from the design tool is reference material, not the final implementation
- Keep the spec actionable — a developer should be able to implement the UI from this document alone
- Cross-reference `product-spec.md` requirements to ensure every feature has a UI home

---
description: "Impeccable UI design workflow — create distinctive, production-grade interfaces or enhance existing ones. Works after speckit-brainstorm (new design) or on existing UI code (enhancement mode)."
handoffs:
  - label: Generate Constitution
    agent: speckit.initiate
    prompt: Generate the project constitution from the product and UI specifications.
    send: true
  - label: Refine Product Spec
    agent: speckit.brainstorm
    prompt: Revisit the product specification to align with UI decisions.
---

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.

# Speckit UI Design — Impeccable Edition

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

---

## Mode Detection

Detect the operating mode automatically:

1. **Check `.impeccable.md`** in project root — does design context exist?
2. **Check for existing UI code** — are there `.vue`, `.tsx`, `.html`, `.css` files with UI components?
3. **Check `.specify/memory/product-spec.md`** — does a product spec exist?

| Has `.impeccable.md` | Has UI Code | Has Spec | → Mode |
|:---:|:---:|:---:|---|
| ❌ | ❌ | ❌ | **Error**: Run `/speckit.brainstorm` first |
| ❌ | ❌ | ✅ | **Create Mode** — start from Phase 0 |
| ❌ | ✅ | ✅ | **Create Mode** — start from Phase 0 |
| ✅ | ❌ | ✅ | **Create Mode** — skip to Phase 2 |
| ✅ | ✅ | ✅ | **Enhance Mode** — jump to Phase 5 |

Tell the user which mode was detected and confirm before proceeding.

> **Override**: If `$ARGUMENTS` contains "create", "enhance", "audit", "critique", "polish", or "normalize", jump directly to the named phase regardless of auto-detection.

---

## PHASE 0: Design Context Gathering (`.impeccable.md`)

> **Purpose**: One-time setup. Gathers design context and saves it for all future sessions.
> **Skip if**: `.impeccable.md` already exists with a `## Design Context` section.

### Step 0.1: Explore the Codebase

Before asking questions, scan the project to discover what you can:

- **README, docs, memory-bank/**: Project purpose, target audience, stated goals
- **Package.json / config files**: Tech stack, dependencies, design libraries
- **Existing components**: Current design patterns, spacing, typography in use
- **Brand assets**: Logos, favicons, color values already defined
- **Design tokens / CSS variables**: Existing color palettes, font stacks, spacing scales
- **Any style guides or brand documentation**
- **`.specify/memory/product-spec.md`**: Product specification

Note what you've learned and what remains unclear.

### Step 0.2: Ask UX-Focused Questions

Ask the user **only what you couldn't infer** from the codebase:

#### Users & Purpose
- Who uses this? What's their context when using it?
- What job are they trying to get done?
- What emotions should the interface evoke? (confidence, delight, calm, urgency, etc.)

#### Brand & Personality
- How would you describe the brand personality in 3 words?
- Any reference sites or apps that capture the right feel? What specifically about them?
- What should this explicitly NOT look like? Any anti-references?

#### Aesthetic Preferences
- Any strong preferences for visual direction? (minimal, bold, elegant, playful, technical, organic, etc.)
- Light mode, dark mode, or both?
- Any colors that must be used or avoided?

#### Accessibility & Inclusion
- Specific accessibility requirements? (WCAG level, known user needs)
- Considerations for reduced motion, color blindness, or other accommodations?

**Skip questions where the answer is already clear from the codebase exploration.**

### Step 0.3: Write Design Context

Synthesize findings and user answers into `.impeccable.md` in the project root:

```markdown
# Impeccable Design Context

## Design Context

### Users
[Who they are, their context, the job to be done]

### Brand Personality
[Voice, tone, 3-word personality, emotional goals]

### Aesthetic Direction
[Visual tone, references, anti-references, theme]

### Design Principles
[3-5 principles derived from the conversation that should guide all design decisions]

### Constraints
[Technical, accessibility, performance, cultural constraints]
```

Confirm completion and summarize key design principles that will guide all future work.

---

## PHASE 1: Load Product Context

1. Read `.specify/memory/product-spec.md` to understand:
   - Product type and target platforms
   - Core features and functional requirements
   - Technology stack decisions
   - Target audience

2. Read `.impeccable.md` for design context (created in Phase 0).

3. If `$ARGUMENTS` contains additional UI context, incorporate it.

4. Summarize to the developer:

```markdown
## Product Context Loaded

**Product**: [name]
**Type**: [Mobile/Web/Desktop]
**Platform**: [specific platforms]
**Core Features**: [bullet list of main features]
**Target Audience**: [who]
**Design Direction**: [from .impeccable.md]

I'll now establish the design direction based on these specifications.
```

---

## PHASE 2: Design Direction (Impeccable Principles)

Commit to a **BOLD aesthetic direction**. Present the user with a design direction proposal:

```markdown
## 🎯 Design Direction Proposal

### Concept
[One-line description of the aesthetic direction]

### Tone
[Pick a specific extreme, not a middle ground: brutally minimal, maximalist, retro-futuristic,
organic/natural, luxury/refined, playful, editorial, brutalist, art deco, soft/pastel, etc.]

### Differentiator
[The ONE thing someone will remember about this interface]

### Typography Strategy
- **Display Font**: [Distinctive choice — NOT Inter, Roboto, Arial, Open Sans]
- **Body Font**: [Refined readability choice]
- **Type Scale**: [modular scale ratio — e.g., 1.25 major third]
- **Approach**: [Fixed rem for product UI / Fluid clamp() for marketing]

### Color Strategy
- **Color Space**: OKLCH (perceptually uniform, modern CSS)
- **Primary**: oklch([L]% [C] [H]) — [description]
- **Neutrals**: Tinted toward brand hue (chroma 0.01)
- **Accents**: [describe role and usage]
- **Rule**: 60% neutral / 30% secondary / 10% accent
- **No pure black (#000) or pure white (#fff)**

### Spatial Strategy
- **Base Unit**: 4pt grid
- **Spacing Scale**: 4, 8, 12, 16, 24, 32, 48, 64, 96px
- **Tokens**: Semantic naming (--space-sm, --space-lg), not values
- **Layout**: Container queries for component-level responsiveness

### Motion Strategy
- **Durations**: 100-150ms (feedback), 200-300ms (states), 300-500ms (layout)
- **Easing**: ease-out-quart or ease-out-expo (exponential, no bounce/elastic)
- **Rule**: Only animate `transform` and `opacity`
- **Reduced Motion**: Required — `prefers-reduced-motion` support

### Responsive Strategy
- **Approach**: Mobile-first (`min-width` queries)
- **Breakpoints**: Content-driven (not device-driven)
- **Components**: Container queries (`@container`) for component-level adaptation
- **Input Detection**: `pointer: fine/coarse` and `hover: hover/none`

Does this direction feel right? Adjust anything before we proceed.
```

Wait for user confirmation or adjustments before proceeding.

---

## PHASE 3: Generate Design Tool Prompt

Create a **detailed, copy-pasteable prompt** optimized for AI design tools (Google Stitch, v0, Bolt, etc.).

The prompt MUST enforce Impeccable principles. Include:

```markdown
## 🎨 UI Generation Prompt

Copy the prompt below and paste it into your preferred design tool:

---

**PROMPT START**

Design a [product type] interface for "[product name]" — [one-line description].

**Target Platform**: [Web/iOS/Android/Desktop]
**Screen Size**: [responsive/mobile-first/desktop-first]
**Direction**: [RTL-first / LTR / Both]

**Screens to design** (in order of priority):

1. **[Screen Name]** — [Description]
   - Key elements: [list]
   - User action: [primary action]
   - Emotional goal: [what user should feel]

[Continue for all major screens, typically 4-8]

**DESIGN RULES (CRITICAL — follow these strictly)**:

Typography:
- Use [chosen display font] for headings, [chosen body font] for text
- DO NOT use Inter, Roboto, Arial, Open Sans, or system defaults
- Use a modular type scale with clear hierarchy (3:1+ ratio between levels)
- Minimum 16px body text

Color:
- DO NOT use the AI color palette (cyan-on-dark, purple-to-blue gradients, neon accents)
- DO NOT use pure black (#000) or pure white (#fff) — always tint
- DO NOT use gradient text for "impact"
- DO NOT use gray text on colored backgrounds — use a shade of the background color
- Tint all neutrals toward the brand hue
- Use [chosen palette description]

Layout:
- DO NOT wrap everything in cards — use spacing and alignment for grouping
- DO NOT nest cards inside cards
- DO NOT use identical card grids (same-sized icon + heading + text, repeated)
- DO NOT center everything — left-aligned text with asymmetric layouts feels more designed
- Use varied spacing for visual rhythm, not uniform padding everywhere
- Touch targets: minimum [44px or 60px for children] for interactive elements

Visual Details:
- DO NOT use glassmorphism (blur effects, glass cards, glow borders) unless purposeful
- DO NOT use rounded rectangles with generic drop shadows
- DO NOT use sparklines as decoration
- DO NOT default to dark mode with glowing accents

Motion:
- Use exponential easing (ease-out-quart/quint), NEVER bounce or elastic
- Only animate transform and opacity

**PROMPT END**

---
```

Present the prompt and ask:

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
- Other: ___

> 💡 **Tip**: You can paste specific screens one at a time for iterative refinement.
```

---

## PHASE 4: Review & Iterate (Interactive Refinement)

When the developer returns with mockup code or description:

### 4.1: AI Slop Test (CRITICAL — do this first)

> **The Test**: If you showed this interface to someone and said "AI made this," would they believe you immediately? If yes, that's the problem.

Check against ALL these AI slop tells:
- [ ] AI color palette (cyan-on-dark, purple-to-blue gradients, neon accents)
- [ ] Gradient text on headings/metrics
- [ ] Dark mode with glowing accents as default
- [ ] Glassmorphism everywhere (blur effects, glass cards, glow borders)
- [ ] Hero metric layout (big number, small label, stats)
- [ ] Identical card grids (same-sized cards repeated)
- [ ] Generic fonts (Inter, Roboto, Arial, Open Sans)
- [ ] Gray text on colored backgrounds
- [ ] Nested cards
- [ ] Bounce/elastic animations
- [ ] Rounded rectangles with generic drop shadows
- [ ] Sparklines as decoration
- [ ] Pure black (#000) or pure white (#fff)
- [ ] Everything centered
- [ ] Same spacing everywhere

**Verdict**: Pass / Fail — list specific tells found.

### 4.2: Mockup Analysis

```markdown
## Mockup Review

### AI Slop Verdict
[Pass / Fail — list specific tells]

### ✅ Covered Requirements
- [Feature] → [How the mockup addresses it]

### ⚠️ Missing or Incomplete
- [Feature] → [What's needed]

### 💡 Impeccable Improvements
- [Specific improvement with design rationale]
```

### 4.3: Interactive Refinement Rounds

Guide iteration through these categories:

**Round 1 — Layout & Hierarchy:**
- Navigation pattern
- Content visual hierarchy (squint test)
- Grid and rhythm — does spacing create grouping?
- Information architecture

**Round 2 — Typography & Color:**
- Font distinctiveness (NOT generic)
- Type scale hierarchy (few sizes, much contrast)
- Color cohesion (OKLCH, tinted neutrals)
- Contrast ratios (WCAG AA)

**Round 3 — Components & Interactions:**
- Interactive states (hover, focus, active, disabled, loading, error, success)
- Motion (exponential easing, transform/opacity only)
- Touch targets (44px+ minimum)
- Progressive disclosure

**Round 4 — Responsiveness & Edge Cases:**
- Responsive behavior at all breakpoints
- Empty states (helpful, not just "nothing here")
- Error states (specific, actionable, non-blaming)
- Loading states (specific: "Saving your draft..." not "Loading...")
- RTL / LTR behavior (if applicable)

After each round, present a summary table and ask for preferences.

---

## PHASE 5: Design Critique (Enhance Mode Entry Point)

> **Purpose**: Holistic design evaluation. Use when UI code already exists.
> **Prerequisite**: `.impeccable.md` must exist. If not, run Phase 0 first.

### 5.1: Nielsen Heuristic Scoring

Score each heuristic 0-4. Be honest — a 4 means genuinely excellent.

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | ? | |
| 2 | Match System / Real World | ? | |
| 3 | User Control and Freedom | ? | |
| 4 | Consistency and Standards | ? | |
| 5 | Error Prevention | ? | |
| 6 | Recognition Rather Than Recall | ? | |
| 7 | Flexibility and Efficiency | ? | |
| 8 | Aesthetic and Minimalist Design | ? | |
| 9 | Error Recovery | ? | |
| 10 | Help and Documentation | ? | |
| **Total** | | **??/40** | **[Rating band]** |

**Rating bands**: 36-40 Excellent, 28-35 Good, 20-27 Acceptable, 12-19 Poor, 0-11 Critical.

### 5.2: AI Slop Detection

Run the AI Slop Test from Phase 4.1. This is the most important check.

### 5.3: Cognitive Load Assessment

Run the 8-item cognitive load checklist:
- [ ] Single focus
- [ ] Chunking (≤4 items per group)
- [ ] Logical grouping
- [ ] Clear visual hierarchy
- [ ] One decision at a time
- [ ] Minimal choices (≤4 visible options per decision point)
- [ ] No cross-screen memory demands
- [ ] Progressive disclosure

**Score**: 0-1 failures = low (good), 2-3 = moderate, 4+ = critical.

### 5.4: Persona Red Flags

Select 2-3 personas most relevant to this interface:

| Interface Type | Primary Personas |
|---|---|
| Landing page / marketing | Jordan (First-Timer), Riley (Stress Tester), Casey (Mobile) |
| Dashboard / admin | Alex (Power User), Sam (Accessibility) |
| E-commerce / checkout | Casey (Mobile), Riley (Stress Tester), Jordan (First-Timer) |
| Onboarding flow | Jordan (First-Timer), Casey (Mobile) |
| Data-heavy / analytics | Alex (Power User), Sam (Accessibility) |
| Form-heavy / wizard | Jordan (First-Timer), Sam (Accessibility), Casey (Mobile) |
| **Educational / children** | Jordan (First-Timer), Casey (Mobile), + project-specific |

For each persona, walk through the primary action and list specific red flags.

### 5.5: Priority Issues

List the 3-5 most impactful problems (P0-P3 severity):

- **P0 Blocking**: Prevents task completion — fix immediately
- **P1 Major**: Significant difficulty or WCAG violation — fix before release
- **P2 Minor**: Annoyance, workaround exists — fix in next pass
- **P3 Polish**: Nice-to-fix, no user impact — fix if time permits

For each issue:
- **[P?] Issue name**
- **Location**: Component, file, line
- **Impact**: How it affects users
- **Fix**: What to do about it (concrete)
- **Suggested phase**: Which phase below would address this (Audit / Normalize / Polish)

### 5.6: Ask the User

After presenting findings, ask 2-4 targeted questions:

1. **Priority direction**: "I found problems with [A], [B], and [C]. Which area first?"
2. **Design intent**: "The interface feels [X]. Is that intentional, or should it feel [Y/Z]?"
3. **Scope**: "I found N issues. Address everything, top 3, or critical only?"

Then proceed to Phase 6, 7, or 8 based on the user's answer.

---

## PHASE 6: Technical Audit

> **Purpose**: Systematic technical quality checks. Documents issues — doesn't fix them.

### Audit Health Score

| # | Dimension | Score (0-4) | Key Finding |
|---|-----------|:-----------:|-------------|
| 1 | **Accessibility** | ? | [Contrast, ARIA, keyboard, semantic HTML, alt text, forms] |
| 2 | **Performance** | ? | [Layout thrashing, expensive animations, lazy loading, bundle] |
| 3 | **Theming** | ? | [Hard-coded colors, dark mode, token consistency] |
| 4 | **Responsive** | ? | [Fixed widths, touch targets, overflow, text scaling] |
| 5 | **Anti-Patterns** | ? | [AI slop tells count] |
| **Total** | | **??/20** | **[Rating band]** |

**Rating bands**: 18-20 Excellent, 14-17 Good, 10-13 Acceptable, 6-9 Poor, 0-5 Critical.

### Scoring Criteria

**Accessibility**: 0=Inaccessible (fails WCAG A), 1=Major gaps, 2=Partial, 3=Good (AA mostly met), 4=Excellent (AA fully met)

**Performance**: 0=Severe (layout thrash), 1=Major (no lazy loading), 2=Partial, 3=Good (mostly optimized), 4=Excellent (fast, lean)

**Theming**: 0=No theming (hard-coded), 1=Minimal tokens, 2=Partial, 3=Good (tokens used), 4=Excellent (full system)

**Responsive**: 0=Desktop-only, 1=Major issues, 2=Partial (rough edges), 3=Good, 4=Excellent (fluid, all viewports)

**Anti-Patterns**: 0=AI slop gallery (5+ tells), 1=Heavy (3-4), 2=Some (1-2), 3=Mostly clean, 4=No tells

### Detailed Findings

For each issue:
- **[P?] Issue name** — [Category]
- **Location**: Component, file, line
- **Impact**: How it affects users
- **Recommendation**: How to fix

### Systemic Issues
Identify recurring problems vs one-off mistakes.

### Positive Findings
Note what's working well — good practices to maintain.

---

## PHASE 7: Normalize (Align to Design System)

> **Purpose**: Realign UI to design system standards. Fix inconsistencies systematically.

### 7.1: Plan

1. **Discover the design system**: Search for tokens, variables, components.
2. **Analyze current feature**: Where does it deviate?
3. **Create normalization plan**: What changes will align it?

### 7.2: Execute

Systematically address inconsistencies across:

- **Typography**: Use design system fonts, sizes, weights. Replace hard-coded values with tokens.
- **Color & Theme**: Apply OKLCH color tokens. Remove one-off colors. Tint all neutrals.
- **Spacing & Layout**: Use 4pt spacing tokens. Align with grid. Use `gap` for sibling spacing.
- **Components**: Replace custom implementations with design system equivalents.
- **Motion & Interaction**: Match animation timing (100/300/500ms), easing (ease-out-quart/expo).
- **Responsive**: Ensure container queries for components, mobile-first breakpoints.
- **Accessibility**: Verify contrast ratios, focus states, ARIA labels.

**NEVER**:
- Create one-off components when design system equivalents exist
- Hard-code values that should use tokens
- Introduce new divergent patterns
- Compromise accessibility for visual consistency

### 7.3: Clean Up

- Consolidate reusable components
- Remove orphaned code
- Verify lint, type-check, and test
- Ensure DRYness

---

## PHASE 8: Polish (Final Quality Pass)

> **Purpose**: The difference between shipped and polished. Last step, not the first.
> **Prerequisite**: Feature must be functionally complete.

### Polish Checklist

Work through systematically:

- [ ] **Visual alignment** perfect at all breakpoints
- [ ] **Spacing** uses design tokens consistently (no random 13px gaps)
- [ ] **Typography** hierarchy consistent (45-75ch line length, no widows)
- [ ] **All interactive states** implemented (default, hover, focus, active, disabled, loading, error, success)
- [ ] **Transitions** smooth at 60fps (150-300ms, ease-out-quart, transform/opacity only)
- [ ] **Copy** consistent (terminology, capitalization, punctuation)
- [ ] **Icons** consistent style and size, optically aligned with text
- [ ] **Forms** properly labeled, validated, error messages follow formula
- [ ] **Error states** answer: What happened? Why? How to fix?
- [ ] **Loading states** are specific ("Saving your draft…" not "Loading…")
- [ ] **Empty states** teach the interface (acknowledge → value → CTA)
- [ ] **Touch targets** 44x44px minimum (60px+ for children's interfaces)
- [ ] **Contrast ratios** meet WCAG AA (4.5:1 text, 3:1 large text/UI)
- [ ] **Keyboard navigation** works with logical tab order
- [ ] **Focus indicators** visible and sufficient contrast
- [ ] **No console errors** or warnings
- [ ] **No layout shift** on load (CLS)
- [ ] **Respects `prefers-reduced-motion`**
- [ ] **Code clean** (no TODOs, console.logs, commented code)
- [ ] **Color**: No pure gray, pure black, or pure white — all tinted
- [ ] **Color on color**: No gray text on colored backgrounds — use shade or transparency

---

## PHASE 9: Generate UI Specification

Once the design is confirmed (either after Create or Enhance mode), compile the final specification:

```markdown
# UI Specification: [PRODUCT_NAME]

**Generated**: [DATE]
**Version**: 1.0.0
**Companion**: product-spec.md
**Design Context**: .impeccable.md

## 1. Design System

### 1.1 Color Palette (OKLCH)
| Token | Value | Usage |
|-------|-------|-------|
| --color-primary | oklch(L% C H) | Primary actions, links |
| --color-primary-light | oklch() | Hover states, highlights |
| --color-primary-dark | oklch() | Active states, focus |
| --color-neutral-[50-950] | oklch() | Tinted toward brand hue |
| --color-surface-[1-3] | oklch() | Elevation levels |
| --color-semantic-success | oklch() | Success states |
| --color-semantic-error | oklch() | Error states |
| --color-semantic-warning | oklch() | Warning states |

### 1.2 Typography
| Role | Font | Size | Weight | Line Height |
|------|------|------|--------|-------------|
| Display | [distinctive font] | clamp() or rem | | |
| H1 | [font] | rem | | |
| H2 | [font] | rem | | |
| Body | [font] | 1rem (16px) | | 1.5 |
| Caption | [font] | 0.875rem | | |

### 1.3 Spacing Scale (4pt base)
| Token | Value | Usage |
|-------|-------|-------|
| --space-xs | 4px | Tight grouping |
| --space-sm | 8px | Related elements |
| --space-md | 16px | Default spacing |
| --space-lg | 24px | Section separation |
| --space-xl | 32px | Major sections |
| --space-2xl | 48px | Page sections |
| --space-3xl | 64px | Hero/feature spacing |

### 1.4 Motion Tokens
| Token | Value | Usage |
|-------|-------|-------|
| --duration-instant | 100ms | Button press, toggle |
| --duration-fast | 200ms | Menu, tooltip, hover |
| --duration-normal | 300ms | Accordion, modal |
| --duration-entrance | 500ms | Page load, hero |
| --ease-out | cubic-bezier(0.25, 1, 0.5, 1) | Elements entering |
| --ease-in | cubic-bezier(0.7, 0, 0.84, 0) | Elements leaving |

### 1.5 Border Radius & Shadows
[Token values]

## 2. Component Library
[Components with all states]

## 3. Screen Specifications
[Each screen with route, purpose, layout, components, actions, navigation]

## 4. Navigation Architecture
[Flow diagram]

## 5. Responsive Strategy
[Breakpoints, container queries, adaptation rules]

## 6. Accessibility Requirements
[WCAG level, contrast, keyboard, touch targets, reduced motion]

## 7. Animation & Transitions
[Motion tokens applied to specific interactions]

## 8. Design Tool Prompt (Reference)
[Original prompt for reproduction]

## 9. Impeccable Scores (Reference)
- Heuristic Score: ??/40
- Audit Health: ??/20
- Cognitive Load: [low/moderate/critical]
- AI Slop: [pass/fail]
```

---

## PHASE 10: Save & Report

1. Save the completed specification to `.specify/memory/ui-spec.md`.
2. If the file already exists, ask before overwriting.
3. Ensure `.impeccable.md` is up to date.
4. Report completion:

```markdown
## ✅ UI Design Complete

**Mode**: [Create / Enhance]
**Specification**: `.specify/memory/ui-spec.md`
**Design Context**: `.impeccable.md`

### Key Design Decisions
- [Summary of important choices]

### Scores
- Heuristic: ??/40
- Audit: ??/20
- Cognitive Load: [level]
- AI Slop: [pass/fail]

### Recommended Next Steps
- `/speckit.initiate` — Generate project constitution
- Re-run `/speckit.uidesign enhance` — After implementation, to verify quality
- Re-run `/speckit.uidesign audit` — For technical quality check
- Re-run `/speckit.uidesign polish` — For final pre-ship pass
```

---

## Quick Reference: Impeccable Design Rules

### Typography (→ reference/typography.md)
- **DO**: Modular scale with fluid sizing (clamp), distinctive fonts, semantic tokens
- **DON'T**: Inter, Roboto, Arial, Open Sans, monospace-as-lazy-shorthand, large rounded icons above headings

### Color (→ reference/color-and-contrast.md)
- **DO**: OKLCH, tinted neutrals (chroma 0.01), 60/30/10 rule, semantic tokens
- **DON'T**: Pure gray, pure black, pure white, gray-on-color, AI palette (cyan/purple gradients)

### Layout (→ reference/spatial-design.md)
- **DO**: 4pt grid, semantic spacing tokens, container queries, visual rhythm through varied spacing
- **DON'T**: Cards for everything, nested cards, identical grids, center everything, uniform spacing

### Motion (→ reference/motion-design.md)
- **DO**: 100/300/500ms durations, ease-out-quart/expo, transform+opacity only, staggered reveals
- **DON'T**: Bounce/elastic easing, animate layout properties, skip prefers-reduced-motion

### Responsive (→ reference/responsive-design.md)
- **DO**: Mobile-first (min-width), content-driven breakpoints, container queries, pointer/hover queries
- **DON'T**: Desktop-first, device-specific breakpoints, hide functionality on mobile

### UX Writing (→ reference/ux-writing.md)
- **DO**: Verb+object button labels, specific error formula (what/why/fix), helpful empty states
- **DON'T**: "OK"/"Submit"/"Yes/No", "Invalid input", blame the user, humor for errors

---

## Interactive Commands

The user can invoke specific phases at any time:

| Command | Action |
|---------|--------|
| `create` | Start from Phase 0 (full creation flow) |
| `enhance` | Jump to Phase 5 (critique existing UI) |
| `audit` | Jump to Phase 6 (technical quality check) |
| `normalize` | Jump to Phase 7 (align to design system) |
| `polish` | Jump to Phase 8 (final quality pass) |
| `critique` | Jump to Phase 5 (design critique only) |
| `context` | Re-run Phase 0 (update .impeccable.md) |
| `spec` | Jump to Phase 9 (generate specification) |

---
name: speckit-uidesign
description: UI design specification workflow with AI-generated mockup prompts. Use
  after brainstorm to define the visual interface. Generates ui-spec.md with layout,
  components, styling, and interaction patterns.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/uidesign.md
---

# Speckit Uidesign Skill

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Design Philosophy

This workflow operates as the **design lead at a small studio** known for giving every client a visual identity that could not be mistaken for anyone else's. The client has already rejected proposals that felt templated and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are **specific to this brief**, and take one real aesthetic risk you can justify.

Three guiding principles:

1. **Ground it in the subject** — Pin down the concrete subject, its audience, and the page's single job. The subject's own world (materials, instruments, artifacts, vernacular) is where distinctive choices come from. Build with real content throughout.
2. **Distinctive, not templated** — AI-generated design clusters around a few default looks regardless of subject. This workflow detects and avoids them unless they genuinely fit the brief.
3. **Restraint** — Spend boldness in one place (a signature element). Keep everything around it quiet and disciplined. Cut decoration that doesn't serve the brief.

## Outline

You are running a **UI design specification workflow**. Your goal is to help the developer define a comprehensive UI specification by generating prompts for AI design tools (Google Stitch, v0, Bolt, etc.), reviewing the resulting mockups, and iterating until the developer is satisfied.

**Prerequisite**: The product specification at `.specify/memory/product-spec.md` should exist. If it doesn't, recommend running `__SPECKIT_COMMAND_BRAINSTORM__` first.

### Mode Detection

The orchestrator (`uidesign.md`) routes to the correct sub-workflow:

| Condition | Mode |
|:---:|---|
| No spec, no `.impeccable.md`, no UI code | **Error** — run brainstorm first |
| Has spec, no design context or UI code | **Create** |
| Has spec + design context + UI code | **Enhance** |
| User requests "critique", "audit", "polish", "normalize" | **Enhance** |
| User requests "spec" or "finalize" | **Finalize** |

Follow the appropriate execution flow below.

---

## CREATE FLOW

### Phase 1: Design Context Gathering (`.impeccable.md`)
*(Skip if `.impeccable.md` already exists with a `## Design Context` section)*

1. **Explore Codebase**: Scan README, config files, existing styles, `product-spec.md`.
2. **Ground It in the Subject**: Before asking questions, pin down one concrete subject, its audience, and the page's single job. The subject's own world is where distinctive choices come from.
3. **Ask UX Questions** (only what isn't clear):
   - **Users**: Who uses this? Context? Desired emotions?
   - **Brand**: 3-word personality? References/anti-references?
   - **Aesthetic**: Minimal, bold, elegant? Light/dark mode? Need-to-use colors?
   - **Subject & Job**: What is the single most important thing this product does?
   - **Accessibility**: Specific needs? Reduced motion?
4. **Write Context**: Create `.impeccable.md` with Subject & Single Job, Users, Brand Personality, Aesthetic Direction, Design Principles, Constraints.

### Phase 2: Load Context
Read `.specify/memory/product-spec.md` and `.impeccable.md`. Summarize Product, Type, Platform, Core Features, Target Audience, Subject, and Design Direction.

### Phase 3: Design Direction (Two-Pass Planning)

Work in **two passes** before generating any prompt. Do most planning in thinking; only present ideas at higher confidence.

**Pass 1 — Compact Token System:**
- **Color**: 4–6 named values rooted in the subject's world. OKLCH, tinted neutrals, 60/30/10, no pure black/white.
- **Type**: 2+ roles — characterful display (restrained), complementary body, utility if needed. **Not the same families you'd reach for on any other project.** Make the type treatment memorable. Modular scale.
- **Layout**: Concept with ASCII wireframes. 4pt grid, asymmetric where it serves content.
- **Signature**: The single unique element this product is remembered by.

**Pass 2 — Self-Critique Against Brief:**
1. **AI Default Look Check**: AI design clusters around three looks:
   - Warm cream (~#F4F1EA) + serif display + terracotta accent
   - Near-black + acid-green/vermilion accent
   - Broadsheet: hairline rules, zero radius, dense columns

   All legitimate *if justified*, but defaults not choices. Where the brief leaves an axis free, don't spend it on a default.

2. **Specificity Test**: Would a similar prompt produce a similar result? Revise anything that reads like a generic default.
3. **Restraint Check**: Concentrate boldness in one place. **Not taking a risk can be a risk itself.**

Present the full proposal (Subject & Job, Concept & Tone, Signature Element, Typography, Color, Spatial, Motion, UX Writing Voice). Wait for confirmation.

### Phase 4: Generate Design Tool Prompt

Create a detailed, copy-pasteable prompt optimized for AI design tools. The prompt must encode the distinctive choices — not produce a generic result.

```markdown
**PROMPT START**

Design a [product type] interface for "[product name]" — [one-line description].
This product's single job: [state it]. Its subject: [state it].

**Hero is a thesis**: Open with the most characteristic thing in the subject's world — not a generic "big number + small label + gradient accent."

**Screens to design** (in priority order):
1. [Screen Name] — [primary action] — [emotional goal]

**Signature Element**: [The single unique thing that makes this unmistakable]

**RULES**:
- Typography: [display font] / [body font]. Modular scale. Memorable treatment. NOT generic fonts as sole faces.
- Color: No AI-slop gradients. Tinted neutrals. [Palette rooted in subject]. OKLCH. 60/30/10.
- Structure is information: Numbering/dividers/labels must encode truth, not decorate. Only number things that are actually a sequence.
- Layout: 4pt grid, asymmetric where it serves content. No identical card grids. Min 44px touch targets.
- Motion: ease-out-quart, transform/opacity only. One orchestrated moment > scattered effects.
- Restraint: Spend boldness on the signature element. Everything else quiet.
- UX Writing: Active voice ("Save changes," not "Submit"). Verb+object. Name by what users control. Consistent across flow. Errors directional, not moody. Empty states invite action.

**PROMPT END**
```

Present to the developer and ask which design tool they'll use (Stitch, v0, Bolt, Lovable, Figma, etc.).

### Phase 5: Review & Iterate

When the developer returns with mockup code or a description:

1. **AI Slop Detection**: cyan-on-dark, gradient text, excessive glass, pure black/white, center everything, bouncing motion.
2. **AI Default Look Detection**: Did it land on one of the three default clusters? Does it actually fit the brief?
3. **Distinctiveness Critique**:
   - **Hero check**: Most characteristic thing, or generic template?
   - **Typography personality**: Distinctive or neutral?
   - **Structure justification**: Devices encoding truth or decorating?
   - **Signature present**: One memorable element, or same energy everywhere?
4. Present Mockup Review (Distinctiveness Verdict, Covered Reqs, Missing, Improvements).
5. Guide iteration: Layout & Hierarchy → Typography & Color → Components & Interactions → Responsiveness.
6. **Chanel's Mirror Rule**: Before finalizing, remove one accessory. Cut decoration that doesn't serve the brief. Take screenshots to self-critique visually.

After finalizing iterations, hand off to finalize to generate the specification.

---

## ENHANCE FLOW

### Phase 5: Design Critique
- **Nielsen Heuristics**: Score 0-4 (36-40 Excellent... 0-11 Critical).
- **AI Slop Detection**: gradients, glowing dark mode, glassmorphism, pure black/white, identical grids, bouncy animations.
- **AI Default Look Detection**: Check for the three default clusters. Flag for revision if unjustified.
- **Distinctiveness Critique**: Hero-as-thesis, typography personality, structure-is-information, signature & restraint.
- **Cognitive Load**: 8-item check (single focus, chunking ≤4, grouping, hierarchy, one decision, minimal choices, no cross-screen memory, progressive disclosure).
- **Priority Issues**: P0 Blocking, P1 Major, P2 Minor, P3 Polish.

### Phase 6: Technical Audit (score /20)
1. Accessibility: contrast, ARIA, keyboard, semantic HTML, visible focus, reduced-motion.
2. Performance: layout thrashing, expensive animations, bundles.
3. Theming: hard-coded colors vs tokens.
4. **CSS Specificity**: type-based vs element-based selectors that silently cancel padding/margin.
5. Responsive: fixed widths, overflow, mobile adaptation.
6. **UX Writing Audit**: active voice, user-side naming, flow consistency, directional errors, actionable empty states.
7. Anti-Patterns: AI slop presence.

### Phase 7: Normalize (Align to Design System)
Plan → Execute (don't create one-offs; don't normalize distinctive choices into generic defaults) → Clean Up (DRY, tests, lint).

### Phase 8: Polish
- **Visual Quality**: alignment, spacing, states, transitions, touch targets, tinted neutrals.
- **Quality Floor (non-negotiable)**: responsive to mobile, visible keyboard focus, `prefers-reduced-motion`, WCAG AA.
- **Chanel's Mirror Rule**: Remove one accessory. Cut decoration that doesn't serve the brief. Self-critique with screenshots.

After Polish, hand off to finalize.

---

## FINALIZE FLOW

### Phase 9: Generate UI Specification

```markdown
# UI Specification: [PRODUCT_NAME]

**Generated**: [DATE] | **Version**: 1.0.0 | **Companion**: product-spec.md | **Design Context**: .impeccable.md

## 1. Design System
- **Subject & Single Job**: [stated explicitly]
- **Signature Element**: [the one memorable thing + rationale]
- **Color Palette (OKLCH)**: 4-6 named values rooted in the subject. 60/30/10. Tinted neutrals.
- **Typography**: Deliberately paired faces carrying personality. Modular scale.
- **Spacing Scale**: 4pt base tokens.
- **Motion Tokens**: 100/200/300ms, ease-out. transform/opacity only.
- **Border Radius & Shadows**

## 2. UX Writing Guidelines
Active voice, user-side naming, flow consistency, directional errors, actionable empty states, conversational register.

## 3. Component Library
## 4. Screen Specifications (with hero approach + structure justification per screen)
## 5. Navigation Architecture
## 6. Responsive Strategy (mobile-first, container queries)
## 7. Accessibility Requirements (WCAG AA, keyboard focus, reduced motion, 44px targets)
## 8. Animation & Transitions (one signature moment > scattered effects)
## 9. Impeccable Scores (Reference)
```

### Phase 10: Save & Report
1. Save to `.specify/memory/ui-spec.md` (ask before overwrite).
2. Report key decisions (especially signature element and subject grounding) and scores.
3. Suggest next step: `__SPECKIT_COMMAND_INITIATE__`.

---

## Quick Guidelines

- **Ground every choice in the subject** — name the concrete subject, audience, and single job. Build with real content.
- **Focus on visual design decisions**, not implementation code.
- **Always provide design rationale** — explain WHY a choice is good for *this specific product*.
- **Make distinctive choices** — avoid AI default looks unless they genuinely fit. Typography should carry personality.
- **Spend boldness in one place** — let the signature element be memorable, keep everything else disciplined.
- **Words are design material** — active voice, user-side naming, directional errors, actionable empty states.
- **Respect the developer's aesthetic preferences** — guide but don't override.
- **The mockup code from the design tool is reference material**, not the final implementation.
- **Keep the spec actionable** — a developer should be able to implement the UI from this document alone.
- **Cross-reference `product-spec.md`** requirements to ensure every feature has a UI home.
- **Apply Chanel's mirror rule** before finishing — remove one accessory.

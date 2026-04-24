---
description: "Finalize mode for Impeccable UI design workflow. Compiles final specifications and generates the UI spec document."
handoffs:
  - label: Generate Constitution
    agent: speckit.initiate
    prompt: Generate the project constitution from the product and UI specifications.
    send: true
---

# Speckit UI Design — Finalize Mode

## User Input
```text
$ARGUMENTS
```

## PHASE 9: Generate UI Specification
Compile the final spec reflecting the decisions made in Create or Enhance modes:

```markdown
# UI Specification: [PRODUCT_NAME]

**Generated**: [DATE]
**Version**: 1.0.0
**Companion**: product-spec.md
**Design Context**: .impeccable.md

## 1. Design System
- **Color Palette (OKLCH)**: Primary, Neutrals (Tinted), Semantic, Surfaces.
- **Typography**: Display/H1/H2/Body fonts, sizes, letter-spacing.
- **Spacing Scale**: 4pt base tokens.
- **Motion Tokens**: Instant (100ms), Fast (200ms), Normal (300ms), ease-out curves.
- **Border Radius & Shadows**

## 2. Component Library
## 3. Screen Specifications
## 4. Navigation Architecture
## 5. Responsive Strategy
## 6. Accessibility Requirements
## 7. Animation & Transitions
## 8. Impeccable Scores (Reference)
- Heuristic Score, Audit Health, Cognitive Load, AI Slop Verdict.
```

---

## PHASE 10: Save & Report
1. Save the spec to `.specify.specify/memory/ui-spec.md` (ask before overwrite).
2. Report Completion:
   - Key design decisions.
   - Scores.
3. Suggest next step: `/speckit.initiate` to generate project constitution.

---

## Impeccable Design Rules (Reference)
- **Typography**: Use modular scale, semantic tokens. NO generic fonts (Inter, Arial, Roboto).
- **Color**: OKLCH, tinted neutrals, 60/30/10. NO pure gray/black/white, NO cyan/purple AI gradients.
- **Layout**: 4pt grid, rhythm via spacing. NO endless identical card grids, NO nested cards.
- **Motion**: 100/300/500ms, exponential easing. NO bounce/elastic. Only animate transform/opacity.
- **Responsive**: Mobile-first, container queries.
- **UX Writing**: Verb+object buttons. Give context in error states.

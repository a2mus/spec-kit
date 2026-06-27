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

### 1.1 Subject & Single Job
- **Subject**: [The concrete subject this product serves]
- **Single Job**: [The one thing this product does]
- **Design Direction**: [The committed aesthetic extreme]

### 1.2 Signature Element
The single unique element this product is remembered by:
- **Description**: [What it is]
- **Why it embodies the brief**: [Rationale grounded in the subject]

### 1.3 Color Palette (OKLCH)
Primary, Neutrals (Tinted), Semantic, Surfaces. 4-6 named values rooted in the subject's world. 60/30/10 rule. No pure gray/black/white.

### 1.4 Typography
Display/H1/H2/Body fonts, sizes, letter-spacing. **Deliberately paired faces that carry personality** — not the same families every project reaches for. Make the type treatment itself a memorable part of the design. Modular scale.

### 1.5 Spacing Scale
4pt base tokens.

### 1.6 Motion Tokens
Instant (100ms), Fast (200ms), Normal (300ms), ease-out curves. Only animate transform/opacity.

### 1.7 Border Radius & Shadows

## 2. UX Writing Guidelines
Words appear in the design to make it easier to understand and use. They are design material, not decoration.
- **Voice**: Active voice as default ("Save changes," not "Submit").
- **Naming**: Name things by what users control and recognize, never by how the system is built.
- **Consistency**: An action keeps the same name through the whole flow ("Publish" button → "Published" toast).
- **Errors**: Directional — explain what happened and how to fix it. Never vague, never apologetic.
- **Empty states**: Invitations to act, not blank screens.
- **Register**: Conversational, tuned to brand and audience. Plain verbs, sentence case, no filler.

## 3. Component Library

## 4. Screen Specifications
For each screen:
- **Hero approach**: How does this screen open with the most characteristic thing in the subject's world?
- **Structure**: Do structural devices (numbering, dividers, labels) encode something true about the content?
- Route/Path, Purpose, Layout, Components Used, User Actions, Data Displayed, Navigation.

## 5. Navigation Architecture

## 6. Responsive Strategy
Mobile-first, container queries.

## 7. Accessibility Requirements
- WCAG AA contrast across all text
- Visible keyboard focus (no bare `outline: none`)
- `prefers-reduced-motion` respected
- Minimum 44px touch targets
- Screen reader / ARIA considerations

## 8. Animation & Transitions
One orchestrated signature moment > scattered effects. Choose what the direction calls for.

## 9. Impeccable Scores (Reference)
- Heuristic Score, Audit Health, Cognitive Load, AI Slop Verdict, AI Default Look Verdict, Distinctiveness Rating.
```

---

## PHASE 10: Save & Report
1. Save the spec to `.specify/memory/ui-spec.md` (ask before overwrite).
2. Report Completion:
   - Key design decisions (especially the signature element and subject grounding).
   - Scores.
3. Suggest next step: `__SPECKIT_COMMAND_INITIATE__` to generate project constitution.

---

## Impeccable Design Rules (Reference)

### Grounding
- **Pin the subject**: Name one concrete subject, its audience, and the page's single job. The subject's world is where distinctive choices come from.
- **Build with real content**: Never default to placeholder content.

### Distinctiveness
- **Hero is a thesis**: Open with the most characteristic thing — not a generic template.
- **Typography carries personality**: Deliberately paired faces, project-specific, memorable treatment.
- **Structure is information**: Structural devices encode truth, not decoration. Only number things that are actually a sequence.
- **Signature & restraint**: One memorable element, everything else disciplined. Spend boldness in one place.

### AI Default Look Calibration
Three looks AI generates regardless of subject — all legitimate *if justified*, but defaults not choices:
1. Warm cream (~#F4F1EA) + serif display + terracotta accent
2. Near-black + acid-green/vermilion accent
3. Broadsheet: hairline rules, zero radius, dense columns
Where the brief leaves an axis free, don't spend it on a default.

### Technical
- **Typography**: Use modular scale, semantic tokens. NO generic fonts (Inter, Arial, Roboto) as sole faces.
- **Color**: OKLCH, tinted neutrals, 60/30/10. NO pure gray/black/white, NO cyan/purple AI gradients.
- **Layout**: 4pt grid, rhythm via spacing. NO endless identical card grids, NO nested cards.
- **Motion**: 100/300/500ms, exponential easing. NO bounce/elastic. Only animate transform/opacity.
- **Responsive**: Mobile-first, container queries.
- **CSS specificity**: Watch for type-based vs element-based selectors that silently cancel padding/margin.
- **UX Writing**: Verb+object buttons, active voice, consistent naming across flow, directional errors.
- **Chanel's mirror**: Before finishing, remove one accessory. Cut decoration that doesn't serve the brief.

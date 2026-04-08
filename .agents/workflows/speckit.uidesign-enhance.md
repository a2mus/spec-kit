---
description: "Enhance mode for Impeccable UI design workflow. Critiques, audits, normalizes, and polishes existing code."
handoffs:
  - label: Finalize UI Spec
    agent: speckit.uidesign-finalize
    prompt: Generate the final UI specification after enhancements are complete.
    send: true
---

# Speckit UI Design — Enhance Mode

## User Input
```text
$ARGUMENTS
```

*Prerequisite: `.impeccable.md` and existing UI code must exist. If not, inform the user to run `speckit.uidesign-create`.*

Determine which sub-phase the user wants based on arguments or flow (Critique → Audit → Normalize → Polish). 

---

## PHASE 5: Design Critique
### 5.1: Nielsen Heuristics
Score 0-4 (36-40 Excellent... 0-11 Critical).
### 5.2: AI Slop Detection
Check for: AI gradients, glowing dark mode, glassmorphism slop, pure black/white, identical grids, bouncy animations.
### 5.3: Cognitive Load
8-item list: Single focus, Chunking (≤4), Logical grouping, Hierarchy, One decision at a time, Minimal choices, No cross-screen memory, Progressive disclosure. Score based on failures.
### 5.4: Priority Issues
List P0 Blocking, P1 Major, P2 Minor, P3 Polish. Note component, impact, fix.
*Ask the user where to focus before moving to specific actions.*

---

## PHASE 6: Technical Audit
Systematic technical checks. Provide a score out of 20.
1. **Accessibility**: Contrast, ARIA, keyboard, semantic HTML.
2. **Performance**: Layout thrashing, expensive animations, large bundles.
3. **Theming**: Hard-coded colors vs tokens.
4. **Responsive**: Fixed widths, overflow, mobile adaptation.
5. **Anti-Patterns**: AI slop presence.
Report specific findings with recommendations.

---

## PHASE 7: Normalize (Align to Design System)
1. **Plan**: Discover system (tokens/variables). Identify deviations.
2. **Execute**: Fix Typography, Color, Spacing, Components, Motion, Responsive, Accessibility.
   - *NEVER* create one-off components if system equivalents exist.
3. **Clean Up**: DRY code, verify tests/lint.

---

## PHASE 8: Polish
The final pass:
- Visual alignment perfect.
- Spacing & Typography consistent.
- All states (hover, focus, disabled, loading, error, success) implemented without 'AI slop'.
- Transitions smooth (150-300ms, ease-out-quart).
- Touch targets 44x44px.
- WCAG AA contrast.
- Keyboard nav & Focus active.
- Pure grays/blacks/whites tinted smoothly to brand hue.

After Polish, hand off to `speckit.uidesign-finalize`.

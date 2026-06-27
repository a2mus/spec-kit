---
description: "Enhance mode for Impeccable UI design workflow. Critiques, audits, normalizes, and polishes existing code."
handoffs:
  - label: Finalize UI Spec
    agent: speckit.uidesign/finalize
    prompt: Generate the final UI specification after enhancements are complete.
    send: true
---

# Speckit UI Design — Enhance Mode

## User Input
```text
$ARGUMENTS
```

*Prerequisite: `.impeccable.md` and existing UI code must exist. If not, inform the user to run `speckit.uidesign/create`.*

Determine which sub-phase the user wants based on arguments or flow (Critique → Audit → Normalize → Polish).

---

## PHASE 5: Design Critique

### 5.1: Nielsen Heuristics
Score 0-4 (36-40 Excellent... 0-11 Critical).

### 5.2: AI Slop Detection
Check for: AI gradients, glowing dark mode, glassmorphism slop, pure black/white, identical grids, bouncy animations.

### 5.3: AI Default Look Detection
Check if the design landed on one of the three AI-generated default clusters — these appear regardless of subject and signal templated thinking:

| Default Look | Telltale Signs | Verdict |
|---|---|---|
| **Warm Artisanal** | Cream bg (~#F4F1EA), high-contrast serif display, terracotta accent | Default unless the subject genuinely calls for it |
| **Acid Terminal** | Near-black bg, single acid-green or vermilion accent, stark contrast | Default unless the subject genuinely calls for it |
| **Broadsheet** | Hairline rules, zero border-radius, dense newspaper columns | Default unless the content is genuinely sequential/editorial |

If detected: ask whether this actually fits the product's subject and single job, or whether it's the path of least resistance. Flag for revision if unjustified.

### 5.4: Distinctiveness Critique
Evaluate the design's intentionality against four frontend-design principles:

1. **Hero is a thesis**: Does the most prominent screen open with the most characteristic thing in the subject's world — or a generic template (big number + small label + gradient)?
2. **Typography carries personality**: Does the type treatment itself feel memorable and specific to this project, or is it a neutral delivery vehicle using the same families every project reaches for?
3. **Structure is information**: Do structural devices (numbering, eyebrows, dividers, labels) encode something **true** about the content — or are they pure decoration? Only use numbered markers (01/02/03) if the content is actually a sequence.
4. **Signature & Restraint**: Is there one memorable signature element with everything else quiet and disciplined — or is everything at the same energy level (no risk taken) or scattered (boldness everywhere)?

### 5.5: Cognitive Load
8-item list: Single focus, Chunking (≤4), Logical grouping, Hierarchy, One decision at a time, Minimal choices, No cross-screen memory, Progressive disclosure. Score based on failures.

### 5.6: Priority Issues
List P0 Blocking, P1 Major, P2 Minor, P3 Polish. Note component, impact, fix.
*Ask the user where to focus before moving to specific actions.*

---

## PHASE 6: Technical Audit
Systematic technical checks. Provide a score out of 20.

1. **Accessibility**: Contrast (WCAG AA), ARIA, keyboard, semantic HTML, visible focus, reduced-motion support.
2. **Performance**: Layout thrashing, expensive animations, large bundles.
3. **Theming**: Hard-coded colors vs tokens.
4. **CSS Specificity**: Check for conflicting selectors that cancel each other out — especially type-based selectors (`.section`) vs element-based selectors (`.cta`). This is a common failure mode where padding/margin rules silently override each other between sections. Verify cascade intent.
5. **Responsive**: Fixed widths, overflow, mobile adaptation.
6. **UX Writing Audit**:
   - Are labels in **active voice** ("Save changes," not "Submit")?
   - Are things **named by what users control**, not how the system works?
   - Does the **action name stay consistent** across the flow ("Publish" button → "Published" toast)?
   - Are **errors directional** — explaining what happened and how to fix it, not vague or apologetic?
   - Are **empty states invitations to act**, not blank screens?
7. **Anti-Patterns**: AI slop presence.
Report specific findings with recommendations.

---

## PHASE 7: Normalize (Align to Design System)
1. **Plan**: Discover system (tokens/variables). Identify deviations.
2. **Execute**: Fix Typography, Color, Spacing, Components, Motion, Responsive, Accessibility.
   - *NEVER* create one-off components if system equivalents exist.
   - Ensure type carries personality — don't normalize distinctive choices into generic defaults.
3. **Clean Up**: DRY code, verify tests/lint.

---

## PHASE 8: Polish
The final pass:

### 8.1: Visual Quality
- Visual alignment perfect.
- Spacing & Typography consistent.
- All states (hover, focus, disabled, loading, error, success) implemented without 'AI slop'.
- Transitions smooth (150-300ms, ease-out-quart).
- Touch targets 44x44px.
- Pure grays/blacks/whites tinted smoothly to brand hue.

### 8.2: Quality Floor (Non-Negotiable)
Verify these are present even if not explicitly requested:
- **Responsive down to mobile** — no horizontal overflow, no fixed-width assumptions.
- **Visible keyboard focus** — focus styles are not `outline: none` without replacement.
- **Reduced motion respected** — `prefers-reduced-motion` media query disables non-essential animation.
- **WCAG AA contrast** across all text.

### 8.3: Chanel's Mirror Rule
Before finalizing, apply this principle: *before leaving the house, take a look in the mirror and remove one accessory.* Review the entire design and cut any decoration that does not serve the brief. Common candidates:
- Redundant animations that don't serve the subject
- Decorative dividers, numbering, or eyebrows that encode nothing
- An effect on every element where one signature moment would land harder
- Extra accent colors beyond the 60/30/10 palette

If taking screenshots is possible, critique your own work visually — a picture is worth 1000 tokens. Compare what you see against the subject's world: does it feel like it belongs to this product specifically?

After Polish, hand off to `speckit.uidesign/finalize`.

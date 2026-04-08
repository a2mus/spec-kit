---
description: "Create mode for Impeccable UI design workflow. Handles design context, direction, and iterative generation."
handoffs:
  - label: Finalize UI Spec
    agent: speckit.uidesign/finalize
    prompt: Generate the final UI specification after design iterations are complete.
    send: true
---

# Speckit UI Design — Create Mode

## User Input
```text
$ARGUMENTS
```

## PHASE 0: Design Context Gathering (`.impeccable.md`)
*(Skip if `.impeccable.md` already exists with a `## Design Context` section)*

### Step 0.1: Explore Codebase
Scan the project: README, config files, existing styles, `product-spec.md`.
### Step 0.2: Ask UX Questions
Only ask what isn't clear:
- **Users**: Who uses this? Context? Desired emotions?
- **Brand**: 3-word personality? References/anti-references?
- **Aesthetic**: Minimal, bold, elegant? Light/dark mode? Need-to-use colors?
- **Accessibility**: Specific needs? Reduced motion?
### Step 0.3: Write Context
Create `.impeccable.md` in root with: Users, Brand Personality, Aesthetic Direction, Design Principles, Constraints.

---

## PHASE 1: Load Context
1. Read `.specify/memory/product-spec.md`.
2. Read `.impeccable.md`.
3. Summarize Product, Type, Platform, Core Features, Target Audience, and Design Direction to the developer.

---

## PHASE 2: Design Direction
Commit to a **BOLD aesthetic direction** and present a proposal:
- **Concept & Tone**: Specific extreme, not middle ground.
- **Typography Strategy**: Display/Body fonts, scale, fixed vs fluid.
- **Color Strategy**: OKLCH, 60/30/10 rule, no pure blacks/whites.
- **Spatial Strategy**: 4pt grid, semantic tokens.
- **Motion & Responsive**: Exponential easing, mobile-first approach.

Wait for user confirmation.

---

## PHASE 3: Generate Design Prompt
Present this copy-paste prompt for tools like Stitch/v0/Bolt:
```markdown
**PROMPT START**
Design a [product type] interface for "[product name]". Target: [Platform]. Direction: [LTR/RTL]. Let's design:
1. [Screen Name] - [primary action] - [emotional goal] ...

**RULES**:
- Typography: Use [display font] / [body font]. Modular scale.
- Color: No AI slop gradients. Tinted neutrals. [Palette].
- Layout: Asymmetric, rhythm via spacing, no identical card grids. Min 44px touch targets.
- Visuals: No glassmorphism everywhere.
- Motion: ease-out-quart, transform/opacity only.
**PROMPT END**
```
Tell the user to run it and report back.

---

## PHASE 4: Review & Iterate
Check for **AI Slop Tells** (cyan-on-dark, gradient text, excessive glass, pure black/white, center everything, bouncing motion).
Present Mockup Review (Slop Verdict, Covered Reqs, Missing, Improvements).
Guide through:
1. Layout & Hierarchy
2. Typography & Color
3. Components & Interactions
4. Responsiveness

After finalizing iterations, hand off to `speckit.uidesign/finalize` to generate the specification.

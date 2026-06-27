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

### Step 0.2: Ground It in the Subject
Before asking questions, **pin down the subject yourself**: name one concrete subject, its audience, and the page's single job, and state your choice. The subject's own world — its materials, instruments, artifacts, and vernacular — is where distinctive design choices come from. If there's any information in memory about the human's preferences, prior designs, or project context, use it as a hint. Build with the brief's real content and subject matter throughout — never default to placeholder content.

### Step 0.3: Ask UX Questions
Only ask what isn't clear:
- **Users**: Who uses this? Context? Desired emotions?
- **Brand**: 3-word personality? References/anti-references?
- **Aesthetic**: Minimal, bold, elegant? Light/dark mode? Need-to-use colors?
- **Subject & Job**: What is the single most important thing this product does? What is the one screen that defines it?
- **Accessibility**: Specific needs? Reduced motion?

### Step 0.4: Write Context
Create `.impeccable.md` in root with: Subject & Single Job, Users, Brand Personality, Aesthetic Direction, Design Principles, Constraints.

---

## PHASE 1: Load Context
1. Read `.specify/memory/product-spec.md`.
2. Read `.impeccable.md`.
3. Summarize Product, Type, Platform, Core Features, Target Audience, Subject, and Design Direction to the developer.

---

## PHASE 2: Design Direction (Two-Pass Planning)

Work in **two passes** before generating any prompt. Do most of this planning and iteration in your thinking, and only present ideas to the user when you have higher confidence they'll be delighted.

### Pass 1 — Compact Token System
Brainstorm a short design plan with four components:

- **Color**: Describe the palette as 4–6 named values. These should be rooted in the subject's world, not generic SaaS palettes. Use OKLCH, tinted neutrals, 60/30/10 rule, no pure blacks/whites.
- **Type**: The typefaces for 2+ roles — a characterful display face used with restraint, a complementary body face, and a utility face for captions/data if needed. **Not the same families you would reach for on any other project.** Make the type treatment itself a memorable part of the design. Use modular scale.
- **Layout**: A layout concept using one-sentence prose descriptions and ASCII wireframes to ideate and compare. 4pt grid, rhythm via spacing, asymmetric where it serves the content.
- **Signature**: The **single unique element** this product will be remembered by — the one thing that embodies the brief in an appropriate, distinctive way.

### Pass 2 — Self-Critique Against Brief
Review the plan against the brief **before** generating the prompt:

1. **AI Default Look Check**: AI-generated design right now clusters around three looks:
   - Warm cream background (~#F4F1EA) + high-contrast serif display + terracotta accent
   - Near-black background + single bright acid-green or vermilion accent
   - Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns

   All three are legitimate for *some* briefs, but they are **defaults, not choices** — they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly. Where it leaves an axis free, **don't spend that freedom on one of these defaults.**

2. **Specificity Test**: If you ran a similar prompt, would you arrive at a similar result? If any part reads like the generic default you'd produce for any similar product — **revise that part**, say what you changed and why.

3. **Restraint Check**: Spend your boldness in one place. Let the signature element be the one memorable thing; keep everything around it quiet and disciplined. Cut any decoration that does not serve the brief. **Not taking a risk can be a risk itself.**

Commit to a **BOLD aesthetic direction** and present the full proposal:
- **Subject & Job**: The concrete subject and its single job (stated explicitly).
- **Concept & Tone**: A specific extreme, not middle ground.
- **Signature Element**: The one memorable thing.
- **Typography Strategy**: Display/Body fonts (deliberately paired, project-specific), scale, fixed vs fluid.
- **Color Strategy**: OKLCH, 60/30/10 rule, no pure blacks/whites, rooted in subject.
- **Spatial Strategy**: 4pt grid, semantic tokens.
- **Motion & Responsive**: Exponential easing, mobile-first approach.
- **UX Writing Voice**: Active voice, verb+object labels, conversational register tuned to brand.

Wait for user confirmation.

---

## PHASE 3: Generate Design Prompt

Present this copy-paste prompt for tools like Stitch/v0/Bolt. The prompt must encode the distinctive choices from Phase 2 — not produce a generic result.

```markdown
**PROMPT START**

Design a [product type] interface for "[product name]" — [one-line description].
This product's single job: [state it]. Its subject: [state it].

**Target Platform**: [Web/iOS/Android/Desktop]
**Direction**: [LTR/RTL]

**Hero is a thesis**: The most prominent screen must open with the most characteristic thing in the subject's world — not a generic "big number + small label + gradient accent." Choose the form that fits: headline, image, animation, live demo, or interactive moment.

**Screens to design** (in priority order):
1. [Screen Name] — [primary action] — [emotional goal]
   - Key elements: [list]
2. [Screen Name] — [primary action] — [emotional goal]
   - Key elements: [list]
[Continue for all major screens, 4-8]

**Signature Element**: [The single unique thing that makes this unmistakable — describe it specifically]

**RULES**:
- **Typography**: Use [display font] / [body font] / [utility font if needed]. Modular scale. Make the type treatment itself memorable — not a neutral delivery vehicle. NOT generic fonts (Inter, Arial, Roboto as sole faces).
- **Color**: No AI-slop gradients. Tinted neutrals (no pure gray/black/white). [Palette: 4-6 named values rooted in the subject]. OKLCH. 60/30/10 rule.
- **Structure is information**: Structural devices (numbering, eyebrows, dividers, labels) must encode something true about the content — not decorate it. Only use numbered markers (01/02/03) if the content is actually a sequence.
- **Layout**: 4pt grid. Asymmetric where it serves content. Rhythm via spacing. No endless identical card grids, no nested cards. Min 44px touch targets.
- **Visuals**: No glassmorphism everywhere. Match complexity to the vision — maximalist needs elaborate execution; minimal needs precision.
- **Motion**: ease-out-quart, transform/opacity only. 100/200/300ms. No bounce/elastic. An orchestrated moment lands harder than scattered effects — choose what the direction calls for. Sometimes less is more.
- **Restraint**: Spend boldness on the signature element. Everything else quiet and disciplined.
- **UX Writing**: Active voice ("Save changes," not "Submit"). Verb+object labels. Name things by what users control, not how the system works. Action name stays consistent across the flow ("Publish" button → "Published" toast). Errors explain what happened and how to fix it — never vague, never apologetic. Empty states invite action.

**Interactions to indicate**:
- Hover states for clickable elements
- Loading states for async operations
- Empty states (invitations to act, not blank screens)
- Error states (with direction, not mood)

**Component Library**: Use [suggest based on tech stack]

**PROMPT END**
```

Tell the user to run it and report back.

---

## PHASE 4: Review & Iterate

When the user returns with mockup code or a description, critique against **both** AI slop tells **and** AI default looks.

### 4.1: AI Slop Detection
Check for: cyan-on-dark, gradient text, excessive glass, pure black/white, center everything, bouncing motion, identical grids.

### 4.2: AI Default Look Detection
Check if the result landed on one of the three AI default looks:
- Warm cream + serif + terracotta?
- Near-black + acid-green/vermilion?
- Broadsheet hairline rules + zero radius?

If it did — ask: does this **actually** fit the brief, or is it the path of least resistance? If it doesn't fit, revise.

### 4.3: Distinctiveness Critique
- **Hero check**: Does the hero open with the most characteristic thing, or a generic template?
- **Typography personality**: Does the type treatment carry personality, or is it neutral?
- **Structure justification**: Are structural devices (numbering, dividers) encoding truth or just decorating?
- **Signature present**: Is there one memorable element, or is everything at the same energy level?
- **Restraint**: Is boldness concentrated in one place, or scattered?

### 4.4: Present Mockup Review
```markdown
## Mockup Review

### Distinctiveness Verdict
- AI Default Look: [None detected / Detected: X — justified? Y/N]
- Signature Element: [Present and strong / Weak / Missing]
- Typography Personality: [Distinctive / Generic]
- Restraint: [Boldness concentrated / Scattered]

### ✅ Covered Requirements
- [Feature] → [How the mockup addresses it]

### ⚠️ Missing or Incomplete
- [Feature] → [What's needed]

### 💡 Improvements (grounded in the subject)
- [Improvement with rationale tied to the product's subject and single job]
```

### 4.5: Guided Iteration
Guide the developer through:

1. **Layout & Hierarchy** — Does the structure encode information about the content? Is the hero a thesis?
2. **Typography & Color** — Is the type carrying personality? Are colors rooted in the subject's world?
3. **Components & Interactions** — Are labels in active voice? Are states (empty/error/loading) directional, not moody?
4. **Responsiveness** — Mobile-first, no fixed-width assumptions.

### 4.6: Chanel's Mirror Rule
Before finalizing, apply this principle: *before leaving the house, take a look in the mirror and remove one accessory.* Review the design and cut any decoration that does not serve the brief. If taking screenshots is possible, critique your own work visually — a picture is worth 1000 tokens.

After finalizing iterations, hand off to `speckit.uidesign/finalize` to generate the specification.

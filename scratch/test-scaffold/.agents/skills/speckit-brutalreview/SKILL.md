---
name: speckit-brutalreview
description: "Brutally honest end-to-end app review \u2014 code, UX, security, and\
  \ product strategy with comprehensive analysis and actionable recommendations."
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/brutalreview.md
---

# Speckit Brutalreview Skill

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.


## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).

## Goal

Conduct a comprehensive, brutally honest review of the application covering code quality, UX/UI, security vulnerabilities, performance bottlenecks, and product strategy. Generate a detailed markdown report with specific findings, file/line references, and actionable improvement proposals.

## Output Location

Save the final review report to: `.specify/reviews/brutal-review-[YYYY-MM-DD].md`

Create screenshots directory: `.specify/reviews/screenshots/`

Screenshot naming convention: `[YYYY-MM-DD]-[NNN]-[category]-[brief-description].png`

Example: `2025-03-25-001-security-missing-csp.png`

Categories: `ux`, `security`, `performance`, `architecture`, `accessibility`, `mobile`

## Execution Steps

### 1. Initialize Review Context

Run `.specify.specify/scripts/powershell/check-prerequisites.ps1 -Json -CheckCode -DetectProjectType` from repo root to detect project type and code statistics.

Parse JSON output for:
- `PROJECT_TYPE`: web-app | cli-tool | library | mobile-app | unknown
- `HAS_CODE`: boolean indicating if codebase has substantial files
- `FILE_STATS`: counts by file type/extension
- `TECH_STACK`: detected frameworks/libraries
- `ENTRY_POINTS`: main application entry files

**If `HAS_CODE` is false**: Abort with error: "No substantial code found to review."

**Focus Areas**: If user provided `--focus=[area]`, prioritize that section but still cover all phases.
Supported focus areas: `security`, `ux`, `performance`, `architecture`

### 2. Phase 1 — Live App Audit

**Detect Project Type and Adjust Approach:**

**Web Applications** (`package.json` + web assets):
- Start dev server: `npm run dev` or `npm start` or `python -m http.server`
- Test in browser at localhost URL

**CLI Tools** (`pyproject.toml` scripts or binary entry):
- Test help command: `<tool> --help` or `<tool> -h`
- Test with sample inputs
- Check error handling with invalid arguments

**Libraries** (`setup.py`, `Cargo.toml`, `package.json` with "lib"):
- Review public API surface from entry point
- Check documentation/examples
- Verify installation via package manager

**Mobile Apps** (React Native, Flutter, etc.):
- Check for mobile-specific files (`android/`, `ios/`, `pubspec.yaml`)
- Review responsive design if web-based

**Live Testing (where applicable):**

1. **First Impressions (< 5 seconds):**
   - Does the app communicate its purpose instantly?
   - Visual hierarchy clarity
   - Screenshot any confusing elements

2. **Core Flow Testing:**
   - Walk through every primary user flow end-to-end
   - Identify friction points, unnecessary clicks, dead ends
   - Test edge cases: empty inputs, large files, special chars
   - Test error states and message helpfulness
   - Screenshot flaws found

3. **Responsive & Cross-Browser (Web):**
   - Resize to mobile (375px), tablet (768px), desktop (1440px)
   - Screenshot layout breakages
   - Check touch targets on mobile

4. **Performance Feel:**
   - Note perceptible lag, jank, loading states
   - Check for unoptimized assets
   - Screenshot slow-loading content

5. **Accessibility Quick-Check:**
   - Tab through interface (keyboard navigation)
   - Check focus indicators
   - Verify alt text on images
   - Check color contrast
   - Screenshot accessibility violations

### 3. Phase 2 — Codebase Dissection

**Read the entire codebase systematically.** Evaluate against these dimensions:

#### 3.1 Architecture & Design
- Clear separation of concerns?
- God files/functions doing too much?
- Intuitive project structure?
- Well-chosen abstractions or over/under-engineering?
- Dependency management and coupling

**Cite specific file paths and line numbers for each finding.**

#### 3.2 Code Quality
- Dead code and duplicated logic
- Inconsistent naming conventions
- Magic numbers/strings
- Functions longer than ~40 lines
- Silent exception swallowing
- `# TODO`, `# FIXME`, `# HACK` comments

#### 3.3 Security (CRITICAL PRIORITY)
- Input validation and sanitization
- File upload risks (path traversal, command injection)
- Dependency audit (outdated/vulnerable packages)
- Hardcoded secrets, API keys, credentials
- CORS configuration
- Rate limiting
- File size enforcement
- SSRF potential
- SQL injection (if applicable)
- XSS vulnerabilities (if applicable)

#### 3.4 Performance
- Synchronous blocking in async contexts
- Missing caching opportunities
- N+1 query patterns
- Redundant I/O operations
- Unoptimized loops
- Frontend: unminified assets, render-blocking resources, DOM manipulation

#### 3.5 Testing & CI
- Test coverage gaps
- Meaningful vs smoke tests
- CI/CD configuration
- Missing pipeline stages

### 4. Phase 3 — UX & Product Critique

Step back from code and evaluate holistically:

- **Onboarding:** Can a first-time user achieve value in < 30 seconds without docs?
- **Information Architecture:** Cluttered interface? Hidden vs prominent elements?
- **Visual Design:** Modern/polished vs dated/generic? Specific examples.
- **Feedback Loops:** Clear action confirmations? Loading/progress states?
- **Error Recovery:** Graceful recovery paths when things fail?
- **Competitive Positioning:** How does this compare to alternatives? Differentiation?

### 5. Phase 4 — Feature & Improvement Proposals

Based on findings, propose **5–7 high-impact improvements**, ordered by effort-to-impact ratio.

For each:
1. **What:** One-line description
2. **Why:** Specific problem solved or metric improved
3. **How (sketch):** Brief technical approach (2–3 sentences)
4. **Impact:** 🔴 Critical / 🟠 High / 🟡 Medium

### 6. Generate Review Report

Create comprehensive markdown report at `.specify/reviews/brutal-review-[YYYY-MM-DD].md`

#### Report Structure:

```markdown
# 🔥 Brutal Review — [App/Project Name]
> Reviewed: [Date] | Reviewer: Senior Staff Engineer + Product Manager
> Project Type: [Detected Type] | Focus: [User Focus or "Complete"]

## Executive Summary
[3–5 sentence overall verdict. What's the single biggest thing holding this app back?]

## 🚨 Critical Flaws (Ship-Blockers)
[Issues that would embarrass you in production or pose security/data-loss risk]
- **[SEVERITY]** [Description] — `file:line` — [Screenshot: ./screenshots/...]

## 🎨 UX/UI Roast
[Visual, interaction, and experience problems — with embedded screenshots]

## 🏗️ Architecture & Code Smells
[Structural issues, tech debt, and maintainability concerns]
- **[SMELL]** [Description] — `file:line`

## 🔒 Security Concerns
[Vulnerabilities, missing protections, risky patterns]
- **[CRITICAL/HIGH/MEDIUM]** [Vulnerability] — `file:line` — [Mitigation suggestion]

## ⚡ Performance Issues
[Bottlenecks, waste, and optimization opportunities]

## 🧪 Testing & Quality Gaps
[Missing tests, weak CI, untested critical paths]

## 💡 Feature & Improvement Proposals
[Ranked table of proposed improvements]

| # | What | Why | How | Impact |
|---|------|-----|-----|--------|
| 1 | ... | ... | ... | 🔴 Critical |

## Scorecard
| Dimension          | Grade | Notes |
|--------------------|-------|-------|
| Architecture       | ?/10  |       |
| Code Quality       | ?/10  |       |
| Security           | ?/10  |       |
| Performance        | ?/10  |       |
| UX/UI              | ?/10  |       |
| Test Coverage      | ?/10  |       |
| Product Readiness  | ?/10  |       |
| **Overall**        | ?/10  |       |

## Appendix: Screenshot Index
[List all screenshots with descriptions and paths]

## Next Actions
- [ ] Address critical security flaws before any production deployment
- [ ] Run `/speckit.implement` to fix ship-blocking issues
- [ ] Create checklist for improvement proposals
- [ ] Schedule follow-up review in 2 weeks
```

### 7. Handle Screenshots

**For each screenshot taken during review:**
1. Save to `.specify/reviews/screenshots/[YYYY-MM-DD]-[NNN]-[category]-[description].png`
2. Embed in report with relative path: `![Description](./screenshots/...)`
3. Include context explaining what the screenshot demonstrates
4. Add to Appendix: Screenshot Index

**Screenshot Guidelines:**
- Use descriptive filenames
- Include category prefix for organization
- Annotate if possible (arrows, circles highlighting issues)
- Capture both the problem and surrounding context

## Operating Rules

- **Ask before installing** any dependencies not already in the project
- **Never skip a phase.** If a phase yields no findings, state explicitly — don't silently omit
- **Cite file paths and line numbers** for every code-level finding
- **Prioritize ruthlessly.** Lead each section with the most severe issues
- **No generic advice.** Every finding must be specific to this codebase, with concrete evidence
- **Propose fixes, not just problems.** Include brief suggestions on how to resolve each issue
- **Be brutally honest but constructive.** No filler, no "great job" — focus on what's broken, weak, or missing
- **Respect the codebase.** Assume good intent, but don't sugarcoat problems

## Project Type Detection Guide

Use these heuristics to auto-detect project type:

**Web Application:**
- `package.json` exists with `dependencies` or `devDependencies`
- HTML/CSS/JS files in `src/`, `public/`, `static/`, or `dist/`
- Framework markers: `react`, `vue`, `svelte`, `next`, `nuxt` in dependencies

**CLI Tool:**
- `pyproject.toml` with `[project.scripts]` section
- `setup.py` or `setup.cfg` with `console_scripts`
- `bin/` or `.specify.specify/scripts/` directory with executable files
- Shebang lines (`#!/usr/bin/env`) in main files

**Library:**
- `setup.py` with `packages` but no `scripts` or minimal `scripts`
- `Cargo.toml` with `[lib]` section
- `package.json` with `"main"` or `"exports"` pointing to library code
- Test directory structure indicating reusable components

**Mobile App:**
- `pubspec.yaml` (Flutter)
- `android/` and `ios/` directories (React Native/Flutter)
- ` capacitor.config.json` or `ionic.config.json` (Ionic)
- Mobile-specific permissions in manifests

**Backend/API:**
- `requirements.txt` with Flask, Django, FastAPI
- `Cargo.toml` with web framework dependencies
- `Dockerfile` with web server configuration
- Database connection files

## Context

$ARGUMENTS

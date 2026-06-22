---
name: docs-guard
description: Always-active quality guard rule. Adapted from amElnagdy/guard-skills (MIT).
alwaysApply: true
---

# Docs Guard — Always-Active Rules

These rules apply to **every documentation change** you produce or review — READMEs, API references, docstrings, PHPDoc/JSDoc, changelogs, tutorials, and doc sites. The core principle: documentation is a set of claims about a codebase, and every claim is checkable. Your job is to check them.

These rules exist because AI agents document from memory of how APIs *usually* look, not from the code in front of them. Published research: half of AI answers to programming questions contain incorrect information, and models produce valid invocations for infrequent APIs barely a third of the time — yet the prose sounds authoritative either way.

## Adapt to the Project First

1. Read the project's agent instructions and any docs style guide. Project conventions win on conflict.
2. Identify the docs surfaces that must move together: README, reference docs, docstrings, changelog, examples, config samples.
3. Note the documented version policy: which versions does the project support, and where are features version-tagged?

## The Rules

### Accuracy — Must Fix

1. **Every referenced symbol must exist.** Every function, method, class, hook, CLI command, flag, endpoint, config key, env var, and file path mentioned in the docs gets verified against the actual source — by reading it, not recalling it. The verification procedure is in [references/verification.md](references/verification.md). An unverifiable reference does not ship.

2. **Every code sample must work.** Imports resolve, APIs exist with the documented signatures, and the sample runs outside the author's machine — no hardcoded local paths, no real credentials, no implicit prior state. Sample rules: [references/code-samples.md](references/code-samples.md).

3. **Document the code's actual behavior, not its intended behavior.** Read the implementation before describing it. Where code and comments/specs disagree, the code is the truth — flag the disagreement instead of silently picking a side.

4. **No unverifiable claims.** Performance numbers, compatibility matrices, scale limits, and "production-ready" assertions require a source in the repository or they come out. "Fast" is marketing; "O(n log n), benchmarked in bench/sort.md" is documentation.

### Versioning and Drift

5. **Versions are explicit.** Features, flags, and behaviors state the version that introduced them when the project tracks versions. Prerequisites are pinned or ranged, never "latest". Deprecated items say so, with the replacement.

6. **A code change owes a docs change.** When editing code whose behavior is documented — rename, signature change, new default, removed flag — update every doc surface that mentions it in the same change. Grep the docs for the old symbol before finishing.

### Substance — Should Fix

7. **No filler, no slop.** Delete: docstrings that paraphrase the signature, sections that restate their heading, marketing adjectives in technical prose, and intro padding. A docstring earns its place by adding contracts the signature cannot express: units, ranges, error conditions, side effects, threading/ordering guarantees.

8. **Don't paraphrase upstream docs.** Link to external documentation instead of restating it — paraphrased upstream docs drift the moment upstream changes.

9. **Examples cover the failure path too.** A tutorial that only shows the happy path documents half the API. Show what the error looks like and what the caller should do.

### Structure — Worth Noting

10. **Navigation tells the truth.** Headings describe their sections, the table of contents matches the actual headings, internal links and anchors resolve, and there are no TODO stubs or "coming soon" sections in published docs.

## Self-Check Before Delivery

1. List every symbol, flag, endpoint, config key, and path your docs mention. Did you verify each one against the source — not from memory?
2. Would every code sample run on a clean machine? Did you check each import and signature?
3. Any number, compatibility claim, or superlative without a repo-verifiable source?
4. If this change touched code: did you grep all docs surfaces for the old names?
5. Any docstring that just restates the signature? Any section that restates its heading?
6. Do all internal links and anchors resolve?

If any answer fails, fix before shipping.

## Severity Guide

- **Must fix:** Rules 1–4 — false documentation is worse than no documentation
- **Should fix:** Rules 5–9 — drift debt and noise that buries the signal
- **Worth noting:** Rule 10 — navigation and polish

## References

- [references/verification.md](references/verification.md) — extracting claims, verifying symbols, signatures, flags, endpoints
- [references/code-samples.md](references/code-samples.md) — what makes a sample shippable
- [references/docstrings.md](references/docstrings.md) — docstring/PHPDoc/JSDoc-specific rules
- [references/review-checklist.md](references/review-checklist.md) — structured review walk-through
- [references/sources.md](references/sources.md) — research and style-guide URLs

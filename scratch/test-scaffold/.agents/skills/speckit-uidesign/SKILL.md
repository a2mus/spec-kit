---
name: speckit-uidesign
description: Main orchestrator for the Impeccable UI design workflow. Detects the
  correct mode and routes to the appropriate sub-workflow.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/uidesign.md
---

# Speckit Uidesign Skill

# Speckit UI Design — Impeccable Edition (Orchestrator)

## User Input

```text
$ARGUMENTS
```

## Mode Detection

You are the orchestrator for the Impeccable UI Design workflow. Your job is to determine what the user needs and hand off the task to the correct sub-workflow.

Detect the operating mode automatically:

1. **Check `.impeccable.md`** in project root — does design context exist?
2. **Check for existing UI code** — are there `.vue`, `.tsx`, `.html`, `.css` files with UI components?
3. **Check `.specify.specify/memory/product-spec.md`** — does a product spec exist?

| Has `.impeccable.md` | Has UI Code | Has Spec | → Mode |
|:---:|:---:|:---:|---|
| ❌ | ❌ | ❌ | **Error**: Instruct to run `/speckit.brainstorm` first |
| ❌ | ❌ | ✅ | **Create Mode** — hand off to `speckit.uidesign/create` |
| ❌ | ✅ | ✅ | **Create Mode** — hand off to `speckit.uidesign/create` |
| ✅ | ❌ | ✅ | **Create Mode** — hand off to `speckit.uidesign/create` |
| ✅ | ✅ | ✅ | **Enhance Mode** — hand off to `speckit.uidesign/enhance` |

Tell the user which mode was detected and execute the handoff to the appropriate sub-workflow.

> **Override**: If `$ARGUMENTS` contains "create", hand off to `speckit.uidesign/create`. If it contains "enhance", "audit", "critique", "polish", or "normalize", hand off to `speckit.uidesign/enhance`. If it contains "spec" or "finalize", hand off to `speckit.uidesign/finalize`.

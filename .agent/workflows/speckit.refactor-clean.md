---
description: "Safely identify and remove dead code with test verification at every step."
---

# Refactor Clean

Safely identify and remove dead code with test verification at every step.

## Step 1: Detect Dead Code

Run analysis tools based on project type:

| Tool | What It Finds | Command |
|------|--------------|---------|
| knip | Unused exports, files, dependencies | `npx knip` |
| depcheck | Unused npm dependencies | `npx depcheck` |
| ts-prune | Unused TypeScript exports | `npx ts-prune` |
| vulture | Unused Python code | `vulture src/` |
| deadcode | Unused Go code | `deadcode ./...` |
| cargo-udeps | Unused Rust dependencies | `cargo +nightly udeps` |

If no tool is available, use exact Grep searches to find unused exports.

## Step 2: Categorize Findings

Sort findings into safety tiers:
| Tier | Examples | Action |
|------|----------|--------|
| **SAFE** | Unused utilities, test helpers, internal functions | Delete with confidence |
| **CAUTION** | Components, API routes, middleware | Verify no external consumers |
| **DANGER** | Config files, entry points, type definitions | Investigate before touching |

## Step 3: Safe Deletion Loop

For each SAFE item:
1. **Run full test suite** — Establish baseline
2. **Delete the dead code** — Delete code carefully
3. **Re-run test suite** — Verify nothing broke
4. **If tests fail** — Immediately revert using source control and skip
5. **If tests pass** — Move to next item

## Step 4: Handle CAUTION Items

Before deleting CAUTION items:
- Search for dynamic imports: `import()`, `require()`, `__import__`
- Search for string references: route names, component names in configs
- Check if exported from a public API facade

## Step 5: Consolidate Duplicates

After removing dead code, look for:
- Near-duplicate functions (>80% similar) — merge into one
- Redundant type definitions — consolidate
- Wrapper functions that add no value — inline them
- Re-exports that serve no purpose — remove indirection

## Summary

Report results:

```markdown
Dead Code Cleanup
──────────────────────────────
Deleted:   X unused functions
           Y unused files
           Z unused dependencies
Skipped:   X items (tests failed)
Saved:     ~X lines removed
──────────────────────────────
All tests passing ✅
```

## Rules
- **Never delete without running tests first**
- **One deletion at a time** — Atomic changes make rollback easy
- **Skip if uncertain** — Better to keep dead code than break production
- **Don't refactor while cleaning** — Clean first, refactor later

---
name: speckit-build-fix
description: Incrementally fix build and type errors with minimal, safe changes.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: github-spec-kit
  source: templates/commands/build-fix.md
---

# Speckit Build-Fix Skill

# Build and Fix

Incrementally fix build and type errors with minimal, safe changes.

## Step 1: Detect Build System

Identify the project's build tool and run the build:

| Indicator | Build Command |
|-----------|---------------|
| `package.json` with `build` script | `npm run build` or `pnpm build` |
| `tsconfig.json` (TypeScript only) | `npx tsc --noEmit` |
| `Cargo.toml` | `cargo build 2>&1` |
| `pom.xml` | `mvn compile` |
| `build.gradle` | `./gradlew compileJava` |
| `go.mod` | `go build ./...` |
| `pyproject.toml` | `python -m compileall -q .` or `mypy .` |

## Step 2: Parse and Group Errors

1. Run the build command and read stderr
2. Group errors by file path
3. Sort by dependency order (fix imports/types before logic errors)

## Step 3: Fix Loop (One Error at a Time)

For each error:
1. **Read the file** — See error context (10 lines around the error)
2. **Diagnose** — Identify root cause (missing import, wrong type, syntax error)
3. **Fix minimally** — Make the smallest change that resolves the error
4. **Re-run build** — Verify the error is gone and no new errors introduced
5. **Move to next** — Continue with remaining errors

## Step 4: Guardrails

Stop and ask the user if:
- A fix introduces **more errors than it resolves**
- The **same error persists after 3 attempts** (likely a deeper issue)
- The fix requires **architectural changes** (not just a build fix)
- Build errors stem from **missing dependencies** (ask permission to install)

## Recovery Strategies

| Situation | Action |
|-----------|--------|
| Missing module/import | Check if package is installed; suggest install command |
| Type mismatch | Read both type definitions; fix the narrower type |
| Circular dependency | Identify cycle with import graph; suggest extraction |
| Version conflict | Check manifest file for version constraints |

Fix one error at a time for safety. Prefer minimal diffs over refactoring.

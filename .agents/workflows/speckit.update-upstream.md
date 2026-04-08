---
description: "Intelligently sync your fork with the upstream spec-kit repository. Reads both versions of every changed file, compares quality, and produces the richest possible result by blending the best of each."
---

> [!IMPORTANT]
> **Leverage Project Skills**: Before performing any task, scan the project's available skills (typically in `.agent/skills/` or equivalent agent-specific skill directories). If a skill exists that is relevant to the work at hand, read its `SKILL.md` and follow its instructions to complete the task. Only fall back to your own general knowledge when no applicable skill is available or when the task is straightforward enough that a skill lookup would be unnecessary.


# Smart Upstream Sync

Sync your fork with `github/spec-kit` — **intelligently, not blindly**.

## Core Philosophy

You are the smart merge tool. For every changed file, **read both versions**, compare them, and produce the **best possible result**:

- If only one side changed → take that version
- If both sides changed different sections → blend both
- If both changed the same section → pick the richer/more complete one, or blend the best parts
- If changes directly conflict → keep ours, but note what upstream offered

**Special protections**: Always keep our `version` in `pyproject.toml`, our entries in `CHANGELOG.md`, and our custom commands in `__init__.py` — but still ADD new upstream content to these files.

## Steps

1. **Check working tree is clean** — `git status --porcelain`. If dirty, STOP.

2. **Configure upstream remote** (if not set):
   ```bash
   git remote get-url upstream 2>/dev/null || git remote add upstream https://github.com/github/spec-kit.git
   ```

3. **Fetch upstream**: `git fetch upstream main`

4. **Analyze diff**: `git diff --name-status HEAD..upstream/main`
   - For EACH file, read BOTH versions
   - Categorize: New from upstream / Smart-blend / Upstream richer / Ours richer / Skipped
   - Present summary to user

5. **Apply file-by-file**:
   - **New files**: Accept from upstream
   - **Upstream richer**: Take upstream version
   - **Smart-blend**: Read both, merge the best parts using code editing tools
   - **Ours richer**: Keep ours
   - **Deleted upstream**: Skip (don't delete)

6. **Validate**: Run syntax checks and tests

7. **Commit**: `git add -A && git commit -m "chore(upstream): smart-sync with github/spec-kit"`

8. **Report**: Summary of what was blended, taken, or kept — with key decisions explained.

If `$ARGUMENTS` contains "dry-run" or "preview", stop after step 4.

---
name: speckit-update-upstream
description: Intelligently sync your fork with the upstream spec-kit repository. Fetches upstream changes, analyzes diffs file-by-file, and merges smartly — keeping your customizations for identity files while pulling valuable updates for templates, skills, and workflows.
compatibility: Requires git repository forked from github/spec-kit
metadata:
  author: a2mus
  source: custom
---

# Smart Upstream Sync

Pull the best updates from the original `github/spec-kit` repository and merge them intelligently with your fork — **without manual conflict resolution**.

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty).
If the user says "dry-run" or "preview", stop after Step 4 (the analysis) and present the plan without applying changes.

---

## Core Philosophy

**You are the smart merge tool.** Instead of a blind `git merge` that creates conflicts, you fetch upstream, read BOTH versions of every changed file, and produce the **best possible result** by blending the richest, most complete content from each side.

This is NOT a binary "ours vs theirs" decision. For every file, you:
1. **Read both versions** (yours and upstream's)
2. **Understand the intent** of each change
3. **Produce the best blend** — keep the richer content, merge complementary additions, preserve unique value from both sides

### Decision Framework

For each file, ask yourself these questions in order:

```
1. Does only one side have meaningful changes?
   → Take that version entirely.

2. Do both sides have changes, but in different sections?
   → Merge both — include all additions from both sides.

3. Do both sides have changes to the SAME section?
   → Compare quality:
     - Which version is more complete?
     - Which has better documentation / more examples?
     - Which has newer features or bug fixes?
     → Pick the richer one, or blend the best parts of both.

4. Do the changes directly conflict (incompatible logic)?
   → Keep our version (it's the user's working code),
     but NOTE what upstream changed and why.
```

### Special Protection Rules

These files have **additional constraints** — even when blending, respect these:

| File | Protection | Reason |
|---|---|---|
| `pyproject.toml` → `version` field | **Always keep ours** | Our version number is our release identity |
| `CHANGELOG.md` → our entries | **Always keep ours** | Our changelog is our history |
| `README.md` → project name/description | **Always keep ours** | Our branding |
| `src/specify_cli/__init__.py` | **Blend carefully** | Our custom commands must survive; upstream may add new agents or features worth taking |

> **IMPORTANT**: Even for protected files, you should still ADD new upstream content (new sections, new features, new agents) — just don't REPLACE our existing customizations.

---

## Outline

// turbo-all

1. **Verify git state is clean**
   ```bash
   git status --porcelain
   ```
   - If there are uncommitted changes, **STOP** and tell the user:
     "You have uncommitted changes. Please commit or stash them first."

2. **Configure upstream remote** (if not already set)
   ```bash
   git remote get-url upstream 2>/dev/null || git remote add upstream https://github.com/github/spec-kit.git
   ```
   - If the user provided a custom upstream URL in $ARGUMENTS, use that instead.

3. **Fetch upstream**
   ```bash
   git fetch upstream main
   ```
   - If this fails, report the error and **STOP**.

4. **Analyze the diff between your fork and upstream**

   First, check if there are any changes at all:
   ```bash
   git diff --stat HEAD..upstream/main
   ```
   If empty, report "Already up to date!" and **STOP**.

   Then, list all changed files:
   ```bash
   git diff --name-status HEAD..upstream/main
   ```

   For each file, **read BOTH versions** to understand what changed:
   - Our version: read the file from working tree
   - Upstream version: `git show upstream/main:<filepath>`

   Categorize each file by the action you'll take:

   ```markdown
   ## Upstream Sync Analysis

   ### 📥 New from upstream (will accept)
   - templates/commands/new-command.md
   - .agent/skills/new-skill/SKILL.md

   ### 🔀 Smart-blend (both sides have value — will merge best of each)
   - spec-driven.md — upstream added new section X, we have custom section Y → blend both
   - src/specify_cli/__init__.py — upstream added 3 new agents, we have `update` command → blend

   ### ⬆️ Upstream is richer (will take upstream version)
   - templates/commands/verify.md — upstream improved with more checks
   - tests/test_new_feature.py — upstream has better coverage

   ### 🔒 Ours is richer or equal (keeping ours)
   - pyproject.toml — version protected, our deps are fine
   - CHANGELOG.md — our history

   ### ⏭️ Skipped
   - deleted-file.md — upstream removed, keeping our copy
   ```

   If the user said "dry-run" or "preview", **STOP HERE** and wait for instructions.

5. **Apply changes file-by-file**

   For each file, apply the decision you made in Step 4:

   **New files from upstream:**
   ```bash
   git show upstream/main:<filepath> > <filepath>
   ```
   Create parent directories if needed.

   **Upstream is clearly richer:**
   ```bash
   git checkout upstream/main -- <filepath>
   ```

   **Smart-blend (the interesting case):**
   - Read both versions completely
   - Identify what each side added, changed, or improved
   - Use your code editing tools to produce the BEST POSSIBLE version:
     - Keep our unique additions (custom commands, local features)
     - Add upstream improvements (new agents, better docs, bug fixes)
     - If upstream reorganized a section and the new structure is better, adopt it — but keep our content in the new structure
     - If both sides improved the same function, keep the more robust version
   - **Test the result**: Make sure the blended file is syntactically valid

   **Ours is richer or equal:**
   Do nothing — our version stays.

   **Upstream deleted a file:**
   Do nothing — don't delete our copy.

6. **Validate the result**
   ```bash
   python -c "import ast; ast.parse(open('src/specify_cli/__init__.py').read()); print('✅ Python syntax OK')"
   ```
   For any other modified source files, run a quick syntax check.
   If tests exist:
   ```bash
   python -m pytest tests/ -q --tb=short
   ```
   If validation fails, **STOP** and fix the issues before committing.

7. **Stage and commit all changes**
   ```bash
   git add -A
   git diff --cached --stat
   ```

   Create a descriptive commit:
   ```bash
   git commit -m "chore(upstream): smart-sync with github/spec-kit $(git log upstream/main -1 --format='%h')

   Blended best content from upstream:
   - <list key changes taken/blended>"
   ```

8. **Generate a summary report**

   Present the final results:

   ```markdown
   ## ✅ Smart Upstream Sync Complete

   **Commit:** <hash>
   **Upstream ref:** <upstream commit hash>

   ### What happened
   | Action | Count | Files |
   |---|---|---|
   | New from upstream | 3 | templates/x.md, skills/y/SKILL.md, ... |
   | Smart-blended | 2 | __init__.py, spec-driven.md |
   | Upstream was richer | 4 | templates/verify.md, ... |
   | Kept ours | 3 | pyproject.toml, CHANGELOG.md, ... |

   ### Key decisions made
   - `__init__.py`: Added 3 new agents from upstream, kept our `update` command
   - `spec-driven.md`: Merged upstream's new troubleshooting section with our brainstorm workflow

   ### Next Steps
   - Review the changes: `git diff HEAD~1`
   - Push to your fork: `git push origin main`
   - If anything looks wrong: `git revert HEAD`
   ```

---

## Edge Cases

- **If upstream has NO new changes**: Report "Already up to date!" and stop.
- **If a blended file has complex structural changes**: Do your best, but if you're uncertain, show the user both versions and ask which parts to keep.
- **If tests fail after sync**: Report which tests fail and suggest reverting with `git revert HEAD`.
- **If you're unsure about a file**: Ask the user before modifying it.
- **If `$ARGUMENTS` contains a specific file path**: Only sync that specific file instead of the full diff.

## Quality Bar

The blended result should always be:
- ✅ **More complete** than either version alone
- ✅ **Syntactically valid** (no broken code)
- ✅ **Backward compatible** with our fork's functionality
- ✅ **Clean** (no merge conflict markers, no duplicated sections)

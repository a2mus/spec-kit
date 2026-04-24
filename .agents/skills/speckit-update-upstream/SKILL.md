---
name: speckit-update-upstream
description: >
  Intelligently sync the current project's spec-kit infrastructure with the
  latest upstream release from github/spec-kit. Fetches upstream changes,
  analyzes diffs file-by-file, merges smartly — keeping your customizations
  for identity files while pulling valuable updates for templates, skills,
  and workflows — then commits and pushes the result.
compatibility: Requires spec-kit project structure with .specify/ directory
metadata:
  author: a2mus
  source: custom
---

# Speckit Update-Upstream Skill

> [!IMPORTANT]
> This workflow modifies your project's spec-kit infrastructure files.
> It preserves all custom/preset-specific files and only updates core
> templates, workflows, and skills that originate from the upstream
> `github/spec-kit` repository.

## Configuration

| Variable | Value | Notes |
|----------|-------|-------|
| `UPSTREAM_URL` | `https://github.com/github/spec-kit.git` | The canonical spec-kit source |
| `UPSTREAM_REMOTE` | `upstream` | Git remote name for the upstream repo |
| `FORK_URL` | `https://github.com/a2mus/spec-kit` | Your personal spec-kit fork |

## When to Use

- After a new spec-kit release to pull the latest templates and skill instructions
- When skill/workflow files seem outdated, broken, or contain circular stubs
- Periodically (e.g., monthly) to stay current with upstream improvements

---

## Step-by-Step Execution

### Step 1: Pre-flight Checks

1. Verify the project has a `.specify/` directory (spec-kit project structure).
2. Verify the project has `.agents/skills/` and `.agents/workflows/` directories.
3. Check for uncommitted changes — warn the user if the working tree is dirty and recommend committing or stashing first before proceeding.

### Step 2: Configure the Upstream Remote

1. Run `git remote -v` to list existing remotes.
2. If a remote named `upstream` already exists:
   - Verify it points to `https://github.com/github/spec-kit.git`.
   - If it points elsewhere, inform the user and ask before changing it.
3. If no `upstream` remote exists:
   - Run `git remote add upstream https://github.com/github/spec-kit.git`

### Step 3: Fetch Upstream

```bash
git fetch upstream
```

Confirm that `upstream/main` is now available.

### Step 4: Identify Files to Update

There are **three categories** of spec-kit files. Each is handled differently:

#### Category A — Core Templates (ALWAYS UPDATE)
These are generic project scaffolding templates. They contain no project-specific content and should always be replaced with the latest upstream version.

**Source**: `templates/` in `upstream/main`
**Target**: `.specify/templates/` in the local project

| Upstream Path | Local Path |
|---------------|------------|
| `templates/checklist-template.md` | `.specify/templates/checklist-template.md` |
| `templates/constitution-template.md` | `.specify/templates/constitution-template.md` |
| `templates/plan-template.md` | `.specify/templates/plan-template.md` |
| `templates/spec-template.md` | `.specify/templates/spec-template.md` |
| `templates/tasks-template.md` | `.specify/templates/tasks-template.md` |

#### Category B — Core Workflows & Skills (SMART MERGE)
These contain the instruction logic for each speckit command. The **body** (markdown instructions) should be updated from upstream, but the **YAML frontmatter** (metadata, description, handoffs) should be preserved from the local version to maintain agent-specific integrations.

**Source**: `templates/commands/` in `upstream/main`
**Target**: `.agents/workflows/speckit.{command}.md` AND `.agents/skills/speckit-{command}/SKILL.md`

The core commands that exist upstream are:
- `analyze`
- `checklist`
- `clarify`
- `constitution`
- `implement`
- `plan`
- `specify`
- `tasks`
- `taskstoissues`

#### Category C — Custom/Preset Files (NEVER TOUCH)
Any skills or workflows that do **not** have a corresponding file in the upstream `templates/commands/` directory are custom or preset-specific. These must be left completely untouched.

Examples of custom files (non-exhaustive):
- `speckit-uidesign`, `speckit-brainstorm`, `speckit-smart-push`
- `speckit-update-upstream` (this skill itself)
- `speckit-brutalreview`, `speckit-code-review`, `speckit-security-scan`
- `speckit-build-fix`, `speckit-refactor-clean`, `speckit-verify`
- `speckit-progress`, `speckit-tdd`, `speckit-initiate`
- `speckit-plan-with-opus`

### Step 5: Update Core Templates (Category A)

For each template file listed in Category A:

```bash
git show upstream/main:templates/{filename} > .specify/templates/{filename}
```

If the file does not exist in upstream, skip it silently.

### Step 6: Smart-Merge Core Workflows & Skills (Category B)

For each core command listed in Category B:

1. **Read the upstream content**:
   ```bash
   git show upstream/main:templates/commands/{command}.md
   ```

2. **Split** the upstream content into YAML frontmatter and markdown body.

3. **For the workflow file** (`.agents/workflows/speckit.{command}.md`):
   - Read the existing local file.
   - Extract and preserve the local YAML frontmatter.
   - Replace the markdown body with the upstream body.
   - Write the merged result back.

4. **For the skill file** (`.agents/skills/speckit-{command}/SKILL.md`):
   - Read the existing local file.
   - Extract and preserve the local YAML frontmatter.
   - Replace the markdown body with the upstream body.
   - Write the merged result back.

5. If either local file does not exist, skip it with a warning message.

> [!WARNING]
> **Encoding**: On Windows, git output may contain UTF-8 characters (em-dashes, smart quotes). Always use UTF-8 encoding when reading/writing files and when capturing subprocess output.

### Step 7: Verify the Update

1. Run `git diff --stat` to show a summary of all changed files.
2. Verify that:
   - **Only** files from Category A and Category B appear in the diff.
   - **No** files from Category C were modified.
   - The diff line counts look reasonable (additions > deletions typically means upstream added new instructions).
3. Spot-check 1-2 updated skill files to confirm:
   - The YAML frontmatter is preserved (local metadata intact).
   - The markdown body is new (upstream instructions present).

### Step 8: Commit and Push

1. Stage all updated spec-kit files:
   ```bash
   git add .specify/templates/ .agents/skills/ .agents/workflows/
   ```

2. Commit with a descriptive message:
   ```bash
   git commit -m "chore: sync spec-kit infrastructure with upstream (github/spec-kit)"
   ```

3. Push to your personal spec-kit fork:
   ```bash
   git remote add fork https://github.com/a2mus/spec-kit.git || true
   git push fork HEAD
   ```

### Step 9: Report Results

Present a summary to the user:

```markdown
## Spec-Kit Upstream Sync Complete ✅

**Upstream**: github/spec-kit (main)
**Updated**: [timestamp]

### Templates Updated
- [list each template file updated]

### Workflows & Skills Updated
- [list each command updated, showing both workflow and skill paths]

### Custom Files Preserved
- [list custom skills/workflows that were NOT touched]

### Git Status
- Committed: [commit hash]
- Pushed to: origin/[branch name]
```

---

## Troubleshooting

### "upstream remote already exists but points to wrong URL"
Remove and re-add: `git remote remove upstream && git remote add upstream https://github.com/github/spec-kit.git`

### "No upstream/main branch found"
Ensure `git fetch upstream` succeeded. Check network connectivity and that the upstream URL is correct.

### "Encoding errors on Windows"
Always pass `encoding='utf-8'` and `errors='replace'` when using subprocess to capture git output. Template files fetched via `git show` with output redirection (`>`) may need BOM handling — verify files open correctly after update.

### "Merge conflicts in frontmatter"
If a local workflow/skill has malformed YAML frontmatter (e.g., from a previous bad merge), manually fix the frontmatter first, then re-run this workflow.

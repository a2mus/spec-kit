---
description: Analyze changes, group into logical commits, and push to remote.
---

1. Analyze unstaged and staged changes
   // turbo
   ```bash
   git status --porcelain
   ```

2. Analyze commit history patterns (using github-mcp or obsidian)
   - **Option A: GitHub MCP** (if available):
     Use `mcp_github-mcp_list_commits` to fetch recent commits
   - **Option B: Obsidian MCP** (if available):
     Use `mcp_obsidian_search_vault_simple` to search for commit patterns in vault notes
   - Identify common scopes and types used in the project
   
3. Group related changes into logical commits
   - Run `git diff --name-status` to see all modified files.
   - Run `git diff` to analyze the content changes.
   - **Group files by their logical relationship**:
     - **By feature/component**: Files that implement the same feature (e.g., all files for "auth" feature)
     - **By type**: Configuration files together, documentation together, tests together
     - **By scope**: Model changes, UI changes, API changes, etc.
   - Common groupings (adapt based on project patterns from step 2):
     - `chore(config)`: `.vscode/`, `.editorconfig`, build configs
     - `docs`: `README.md`, `memory-bank/`, `.agent/workflows/`
     - `feat(component)`: Feature-specific source files
     - `fix(component)`: Bug fix files
     - `refactor(component)`: Refactoring changes
     - `test`: Test files

3. Create commits for each group
   - For each logical group:
     a. Stage only the related files: `git add <file1> <file2> ...`
     b. Generate a Conventional Commits message for that group
     c. Commit: `git commit -m "type(scope): description"`
   - Repeat until all changes are committed
   - Example sequence:
     ```bash
     git add .vscode/
     git commit -m "chore(vscode): add editor configuration and tasks"
     
     git add memory-bank/
     git commit -m "docs(memory-bank): update project context and progress"
     
     git add src/features/auth/
     git commit -m "feat(auth): implement login flow"
     ```

4. Pull remote changes with rebase (if needed)
   // turbo
   ```bash
   git pull --rebase
   ```
   - If conflicts occur, resolve them and continue with `git rebase --continue`

5. Push all commits
   // turbo
   ```bash
   git push
   ```

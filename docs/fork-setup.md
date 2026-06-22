# 🔀 Fork Setup & Developer Guide

This repository is a customized fork of `github/spec-kit`. To keep upstream synchronization clean, this fork does not track runtime-generated files (agent skills, workflows, templates, and integration manifests) in the Git repository. 

This guide walks you through setting up a fresh clone, regenerating the local runtime files, and performing maintenance operations.

---

## 🚀 Fresh Clone Setup

If you have just cloned this repository, follow these steps to bootstrap your local environment.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Python 3.11+**
- **Git**
- **[uv](https://docs.astral.sh/uv/)** (highly recommended for tool installation)

### 2. Install the Custom Specify CLI
Install the CLI tool built from this fork's main branch:

```bash
uv tool install specify-cli --from git+https://github.com/a2mus/spec-kit.git@main
```

### 3. Regenerate Runtime Artifacts
Since runtime-generated directories are untracked, you must initialize the repository locally to recreate them:

```bash
specify init --here --integration opencode --ignore-agent-tools --force
```

This command:
- `--here`: Runs the initialization in the current directory.
- `--integration opencode`: Configures the default integration for this repository.
- `--ignore-agent-tools`: Skips checking for local agent executables.
- `--force`: Merges the generated templates and structures into the existing project files.

### 4. Verification
Verify that the CLI is correctly installed and configured:

```bash
specify --version
```

Verify that the local runtime directories (like `.specify/scripts/`, `.specify/templates/`, `.agents/`, and `.claude/`) have been successfully generated and exist on your disk.

---

## 🤖 Third-Party Agent Frameworks
> [!IMPORTANT]
> Third-party agent frameworks (e.g., **GStack** or other specialized CLI tools) are installed by their own installers and are not distributed via this fork. Ensure you run their respective setup processes independently to enable those agent integrations.

---

## ⏪ Safe Rollback Procedure

If you need to restore the repository to the state before the runtime artifacts cleanup (where runtime files were tracked in Git):

### 1. Tagged Restore Point
A permanent tag `pre-cleanup-002` is available at the commit immediately preceding the cleanup operation.

### 2. Rollback Command
- **Primary Method (Git Commit Revert):** Revert the cleanup commit to re-stage and re-track all runtime artifacts.
  ```bash
  git revert <cleanup-commit-sha>
  ```
- **Alternative Method (Hard Restore from Tag):** Checkout all files from the restore point:
  ```bash
  git checkout pre-cleanup-002 -- .
  ```

### 3. Rollback Verification
To verify that the rollback was successful, query the Git index for previously untracked directories. The command should return the full set of files (~295 files):
```bash
git ls-files .agents/ .claude/ .specify/scripts/ .specify/templates/
```

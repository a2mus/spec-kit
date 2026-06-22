# Data Model: Clean Fork for Upstream Sync

**Feature Branch**: `002-clean-runtime-artifacts` | **Date**: 2026-06-22

## Overview

This feature does not introduce application data models. It is a repository-
hygiene operation that reclassifies files into two categories — **tracked** and
**untracked** — based on whether they are authored project content or runtime-
generated artifacts.

## Entity Definitions

### Runtime Artifact

A file or directory that is regenerated locally by spec-kit's `specify init`,
`specify integration use`, or `specify extension add` flows. It is needed for
local tooling to function but has no canonical versioned content of its own.

**Instances in this repository**:

| Path Pattern | Generator | Count |
|---|---|---|
| `.agents/skills/**` | `specify init --integration opencode` | 103 |
| `.agents/workflows/**` | `specify init --integration opencode` | 75 |
| `.claude/skills/**` | `specify init --integration claude` | 21 |
| `.claude/commands/**` | `specify init --integration claude` | 48 |
| `.specify/scripts/**` | `specify init` | 6 |
| `.specify/templates/**` | `specify init` | 28 |
| `.specify/memory/constitution.md` | `specify init` (template copy) | 1 |
| `.specify/integrations/*.manifest.json` | `specify init` | 2 |
| `.specify/workflows/**` | `specify init` | 2 |
| `.specify/extensions/agent-context/**` | `specify extension add` | 6 |
| `.specify/extensions/.registry` | `specify extension add` | 1 |
| `CLAUDE.md` | `specify init` / agent-context ext | 1 |

**State transition**: Tracked → Untracked (one-way; no re-tracking planned)

**Validation rule**: After cleanup, `git ls-files <path>` returns empty for
every runtime artifact path.

---

### Project Configuration File

A file that records choices specific to this fork. It has canonical versioned
content and is genuinely shared across the team.

**Instances in this repository**:

| File | Purpose | Tracked |
|---|---|---|
| `.specify/extensions.yml` | Installed extensions manifest + hook config | ✅ Stays |
| `.specify/init-options.json` | How `specify init` was invoked | ✅ Stays |
| `.specify/integration.json` | Active integration + settings | ✅ Stays |

**Validation rule**: After cleanup, `git ls-files .specify/extensions.yml
.specify/init-options.json .specify/integration.json` returns exactly these
three paths.

---

### Custom Extension (Ponytail)

A first-class extension authored in this fork. Lives in the canonical
`extensions/` directory (bundled with the package) and is tracked like any other
source file.

**Instances in this repository**:

| File | Purpose |
|---|---|
| `extensions/ponytail/README.md` | Extension documentation |
| `extensions/ponytail/commands/speckit.ponytail.audit.md` | Audit command |
| `extensions/ponytail/commands/speckit.ponytail.debt.md` | Debt command |
| `extensions/ponytail/commands/speckit.ponytail.review.md` | Review command |
| `extensions/ponytail/config-template.yml` | Config template |
| `extensions/ponytail/extension.yml` | Extension manifest |

**Validation rule**: After cleanup, `git ls-files extensions/ponytail/` still
returns all 6 files.

---

### Upstream Core Source

Files that ship with spec-kit itself. The fork tracks these as part of the
upstream merge surface.

**Instances**: All files under `src/`, `tests/`, `extensions/agent-context/`,
`docs/`, top-level config (`pyproject.toml`, `README.md`, `AGENTS.md`, etc.).

**Validation rule**: After cleanup, the count of tracked files under `src/`,
`tests/`, `extensions/agent-context/` is unchanged.

## Relationships

```text
┌──────────────────────────────┐
│    Repository (git index)    │
│                              │
│  ┌────────────────────────┐  │
│  │  Tracked (stays)       │  │
│  │  • Project config (3)  │  │
│  │  • Ponytail ext (6)    │  │
│  │  • Upstream sources    │  │
│  │  • AGENTS.md           │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  Untracked (removed)   │  │
│  │  • .agents/ (178)      │  │
│  │  • .claude/ (69)       │  │
│  │  • .specify/scripts    │  │
│  │  • .specify/templates  │  │
│  │  • .specify/memory     │  │
│  │  • .specify/integr.    │  │
│  │  • .specify/workflows  │  │
│  │  • .specify/ext (rt)   │  │
│  │  • CLAUDE.md           │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  .gitignore (covers    │  │
│  │   all untracked paths) │  │
│  └────────────────────────┘  │
└──────────────────────────────┘
```

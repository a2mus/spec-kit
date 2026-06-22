# System Patterns: Spec Kit

## System Architecture

Spec Kit is a Python-based CLI tool (`specify-cli`) that manages project specifications, integrations, and extensions.

```
src/specify_cli/
├── __init__.py
├── cli.py                 # CLI entry point and commands
├── config.py              # Configuration loading and merging
├── integrations/          # Agent integrations (Claude, Gemini, Copilot, etc.)
│   ├── __init__.py        # Registry and built-in registration
│   ├── base.py            # Base integration classes (Markdown, Toml, etc.)
│   └── <agent>/           # Individual agent subpackages
├── extensions/            # Core extension manager
├── templates/             # Default template resolution
└── utils/                 # Path handling, CLI checks, and subprocesses
```

### Key Architectural Design Decisions
1. **Self-Contained Integration Packages**:
   Each AI agent is a subpackage in `src/specify_cli/integrations/<key>/`. It registers itself via the alphabetical registration list in `src/specify_cli/integrations/__init__.py`.
2. **Base-Driven Integration Logic**:
   Integrations inherit setup/teardown logic from a common base class (e.g., `MarkdownIntegration` for standard `.md` workflows, `TomlIntegration` for `.toml`, `SkillsIntegration` for skill folders).
3. **Extension & Preset Layering**:
   Spec Kit templates resolve at runtime top-down:
   `Project Overrides` -> `Presets` -> `Extensions` -> `Spec Kit Core`.
4. **Command Files Separation**:
   Command configuration is generated dynamically at install/init time, writing files into agent directories (e.g., `.claude/commands/`, `.agents/skills/`), which are runtime copies and should not be tracked by Git.

---

## Directory Structure & Git Tracking Rules

| Path | Description | Git Tracking Strategy |
|---|---|---|
| `src/` | CLI Python codebase | **Tracked** (Core codebase) |
| `tests/` | Pytest suite | **Tracked** (Core tests) |
| `extensions/` | Authored extensions (e.g. `ponytail`) | **Tracked** (Custom codebase) |
| `presets/` | Presets configuration & templates | **Tracked** (Custom config) |
| `.specify/` | Project runtime local directory | **Untracked** subdirs (`scripts/`, `templates/`, `extensions/`, etc.). **Tracked** core config files (`extensions.yml`, `init-options.json`, `integration.json`). |
| `.agents/`, `.claude/` | Runtime generated agent directories | **Untracked** (Regenerated dynamically by CLI) |
| `memory-bank/` | Local planning documents | **Untracked** (Not shared in core repo) |

---

## Coding Standards & Conventions
- **Alphabetical Imports & Registration**:
  Ensure all integrations in `src/specify_cli/integrations/__init__.py` imports and `_register()` calls are ordered alphabetically.
- **Python Conventions**:
  Follow PEP 8, write descriptive docstrings, type-hint function signatures, and keep functions small and focused.
- **Branch Naming**:
  - Fork branch naming pattern: `<type>/<number>-<short-slug>` when a tracking issue exists, or `<type>/<short-slug>` for PR-only changes.
  - Spec-kit features name directories under `specs/` using `###-slug` sequential numbering (e.g., `specs/002-clean-runtime-artifacts/`).

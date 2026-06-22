# Product Context: Spec Kit

## Purpose of Spec Kit
**Spec Kit** is an open-source toolkit designed to enable **Spec-Driven Development (SDD)**. Traditionally, software specs were passive design documents that were quickly outpaced by the actual code. Spec Kit flips this relationship by making specifications active and executable:
- Developers and AI coding agents follow a rigorous multi-step workflow.
- Intent is defined first ("what" and "why") without leaking implementation details.
- Technical design ("how") is separated into plans and tasks.
- Coding agents execute implementation directly from tasks, ensuring alignment and minimal drift.

Spec Kit works across 30+ AI coding assistants (both CLI and IDE-based) using agent-specific command output folders, markdown workflows, TOML/YAML recipes, or skill directories.

---

## Why This Fork Exists (`a2mus/spec-kit`)
This fork of Spec Kit is maintained to:
1. **Incorporate Custom Extensions**: Bundle the `ponytail` anti-over-engineering extension to automatically review diffs and audit codebases for bloat and complexity.
2. **Perform Fork Hygiene**: Clean up and untrack local runtime artifacts (`.agents/`, `.claude/`, `.specify/scripts/`, etc.) that are generated dynamically during initialization/execution, ensuring frictionless upstream merges from the main `github/spec-kit` repository.
3. **Enhance Developer Experience**: Provide streamlined setup workflows and clean configuration management for project teams.

---

## User Context & Target Audience
- **Maintainers**: Need a clean, low-maintenance repository structure to easily merge upstream changes and updates.
- **Developers/Contributors**: Need a quick, 10-minute setup guide to clone the repo, run standard spec-kit commands, and contribute changes or extensions.
- **Coding Agents**: Require precise instruction context, clear schemas, and minimal environment noise to execute implementations reliably.

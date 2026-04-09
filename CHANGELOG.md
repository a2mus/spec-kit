# Changelog

<!-- markdownlint-disable MD024 -->

Recent changes to the Specify CLI and templates are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.0] - 2026-04-09

### Added

- **Live Asset Synchronization**: Automated the sync between `.agents/` source of truth and CLI distribution templates.
  - New `scripts/sync-assets.py` for repository maintenance.
  - CLI `install_ai_skills` now supports pre-made high-quality skill templates from `templates/skills/`.
  - Offline `specify init` now bundles latest workflows and skills via `core_pack`.
- **Flat Naming Convention Support**: CLI now handles prefix-less workflow files (e.g., `uidesign.md`) for more natural integration.

### Changed

- Updated `scaffold_from_core_pack` to include the `skills/` directory for robust offline project initiation.
- All release packages now include the latest "Impeccable Edition" workflows and refined agent skills.

## [0.4.2] - 2026-04-01
...

### Added

- **`specify update` command**: Smart upstream sync for forks
  - Configures an `upstream` git remote pointing to `https://github.com/github/spec-kit.git`
  - Fetches and merges upstream changes while preserving local customizations
  - `--dry-run` flag to preview incoming commits before applying
  - `--reset-upstream` flag to update the remote URL if it changes
  - Clear conflict reporting with actionable resolution instructions
  - Shows list of updated files after a successful merge

- **Brainstorm-First Workflow**: Documented the interactive greenfield development path
  - Added complete guide in `spec-driven.md`: `brainstorm` → `uidesign` → `initiate` → `specify`
  - Comparison table between feature-first and brainstorm-first workflows
  - Step-by-step walkthrough with use-cases for each approach

### Changed

- `spec-driven.md` now positions the brainstorm-first workflow as a primary entry point for new projects

### Removed

- Deleted redundant root-level files (`smart-push.md`, `speckit-progress.md`); canonical versions remain in `.agents/workflows/`
- Removed temporary `.tmp_ecc/` directory

## [0.1.9] - 2026-03-02

### Added

- **ECC Core Integration**: Bundled ECC tools directly into Spec Kit via `--ai-skills`
  - Added new `install_ecc_skills()` to dynamically install `templates/skills/`
  - Added language-specific verification skills (Python, TypeScript, Go, Java, Rust, Ruby)
  - Exposed 6 core ECC commands (`tdd`, `code-review`, `build-fix`, `verify`, `refactor-clean`, `security-scan`)
  - Enhanced `agent-file-template.md` with explicit ECC guidelines

## [0.3.0] - 2026-03-02

### Added

- **Antigravity Workflow Integration**: Added 11 workflow files to `.agents/workflows/` for use as Antigravity slash commands
  - **Spec-Kit Core Workflows** (9): `/speckit-analyze`, `/speckit-checklist`, `/speckit-clarify`, `/speckit-constitution`, `/speckit-implement`, `/speckit-plan`, `/speckit-progress`, `/speckit-specify`, `/speckit-tasks`
  - **General Workflows** (2): `/smart-push` (intelligent git commits), `/plan-with-opus` (Architect-Builder planning model)
  - `speckit-implement` generalized to be platform-agnostic (removed Android-specific patterns)
  - `plan-with-opus` adapted to reference `/speckit-implement` for execution
- Added `progress` entry to `SKILL_DESCRIPTIONS` for AI skill metadata

## [0.2.1] - 2026-02-27

### Added

- New `/speckit.progress` command for checking spec progression and presenting status reports with accomplished/in-progress tasks, metrics, and next steps

## [0.2.0] - 2026-02-25

### Added

- **SDD Initiation Commands**: Three new commands for personalized Software-Driven Development initiation workflow
  - **`brainstorm`**: Interactive product brainstorming and specification through guided Q&A. Generates `product-spec.md` with technology recommendations, architecture decisions, feature prioritization, and functional requirements
  - **`uidesign`**: UI design specification workflow with AI-generated mockup prompts for tools like Google Stitch, v0, Bolt. Iterates on mockups with the developer and produces `ui-spec.md` with design system, component library, screen specs, and responsive strategy
  - **`initiate`**: Generates project constitution from both `product-spec.md` and `ui-spec.md`, extracting best practices, coding standards, architecture principles, and development guidelines into `constitution.md`
- All three commands output to `.specify/memory/` and chain together via handoffs (`brainstorm` → `uidesign` → `initiate`)
- Added `SKILL_DESCRIPTIONS` entries for all three new commands

## [0.1.6] - 2026-02-23

### Fixed

- **Parameter Ordering Issues (#1641)**: Fixed CLI parameter parsing issue where option flags were incorrectly consumed as values for preceding options
  - Added validation to detect when `--ai` or `--ai-commands-dir` incorrectly consume following flags like `--here` or `--ai-skills`
  - Now provides clear error messages: "Invalid value for --ai: '--here'"
  - Includes helpful hints suggesting proper usage and listing available agents
  - Commands like `specify init --ai-skills --ai --here` now fail with actionable feedback instead of confusing "Must specify project name" errors
  - Added comprehensive test suite (5 new tests) to prevent regressions

## [0.1.5] - 2026-02-21

### Fixed

- **AI Skills Installation Bug (#1658)**: Fixed `--ai-skills` flag not generating skill files for GitHub Copilot and other agents with non-standard command directory structures
  - Added `commands_subdir` field to `AGENT_CONFIG` to explicitly specify the subdirectory name for each agent
  - Affected agents now work correctly: copilot (`.github/agents/`), opencode (`.opencode/command/`), windsurf (`.windsurf/workflows/`), codex (`.codex/prompts/`), kilocode (`.kilocode/workflows/`), q (`.amazonq/prompts/`), and agy (`.agents/workflows/`)
  - The `install_ai_skills()` function now uses the correct path for all agents instead of assuming `commands/` for everyone

## [0.1.4] - 2026-02-20

### Fixed

- **Qoder CLI detection**: Renamed `AGENT_CONFIG` key from `"qoder"` to `"qodercli"` to match the actual executable name, fixing `specify check` and `specify init --ai` detection failures

## [0.1.3] - 2026-02-20

### Added

- **Generic Agent Support**: Added `--ai generic` option for unsupported AI agents ("bring your own agent")
  - Requires `--ai-commands-dir <path>` to specify where the agent reads commands from
  - Generates Markdown commands with `$ARGUMENTS` format (compatible with most agents)
  - Example: `specify init my-project --ai generic --ai-commands-dir .myagent/commands/`
  - Enables users to start with Spec Kit immediately while their agent awaits formal support

## [0.0.102] - 2026-02-20

- fix: include 'src/**' path in release workflow triggers (#1646)

## [0.0.101] - 2026-02-19

- chore(deps): bump github/codeql-action from 3 to 4 (#1635)

## [0.0.100] - 2026-02-19

- Add pytest and Python linting (ruff) to CI (#1637)
- feat: add pull request template for better contribution guidelines (#1634)

## [0.0.99] - 2026-02-19

- Feat/ai skills (#1632)

## [0.0.98] - 2026-02-19

- chore(deps): bump actions/stale from 9 to 10 (#1623)
- feat: add dependabot configuration for pip and GitHub Actions updates (#1622)

## [0.0.97] - 2026-02-18

- Remove Maintainers section from README.md (#1618)

## [0.0.96] - 2026-02-17

- fix: typo in plan-template.md (#1446)

## [0.0.95] - 2026-02-12

- Feat: add a new agent: Google Anti Gravity (#1220)

## [0.0.94] - 2026-02-11

- Add stale workflow for 180-day inactive issues and PRs (#1594)

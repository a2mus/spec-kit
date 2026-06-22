# Feature Specification: Clean Fork for Upstream Sync

**Feature Branch**: `002-clean-runtime-artifacts`

**Created**: 2026-06-21

**Status**: Draft

**Input**: User description: "Clean fork for upstream sync by untracking runtime artifacts"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Frictionless Upstream Merge (Priority: P1)

As a fork maintainer, I want to merge changes from the upstream `github/spec-kit`
project into my fork without encountering merge conflicts caused by files my fork
should not be tracking, so that I can adopt upstream improvements quickly and with
confidence.

**Why this priority**: This is the core pain point. Every upstream sync today
requires reconciling ~300 files that are regenerated locally and have no real
reason to live in version control. Until this is resolved, the fork drifts
further from upstream and each merge grows more painful.

**Independent Test**: After the cleanup, run an upstream sync (fetch + merge).
The merge completes with zero conflicts on the previously-tracked runtime paths
and the fork retains all of its genuine customizations.

**Acceptance Scenarios**:

1. **Given** the fork has runtime-regenerated files no longer tracked, **When**
   the maintainer fetches and merges the latest upstream release, **Then** the
   merge completes with no conflicts on agent-skill directories, runtime script
   copies, runtime template copies, or runtime extension installs.
2. **Given** the cleanup is complete, **When** the maintainer reviews the set of
   files git is tracking, **Then** only genuinely project-specific files remain
   (project config, the ponytail extension, and upstream core sources) — runtime
   artifacts are absent.
3. **Given** the runtime files are no longer tracked, **When** a maintainer
   regenerates them locally (via the standard init command), **Then** git status
   shows no new changes for those paths because they are ignored.

---

### User Story 2 - Developer Clones a Working Fork (Priority: P2)

As a developer who clones this fork, I want clear guidance and a reliable path to
a working spec-kit setup, so that within minutes of cloning I can run spec-kit
commands and contribute — even though the runtime files are no longer committed
to the repository.

**Why this priority**: Untracking runtime files is the right engineering choice
but it shifts setup effort onto each developer. Without documentation, a fresh
clone looks broken (missing skills, missing scripts). This story protects the
developer experience after the cleanup lands.

**Independent Test**: A developer follows the documented setup steps on a fresh
clone and can successfully run a spec-kit command end-to-end.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the fork, **When** the developer opens the
   repository, **Then** they find a clearly linked setup guide explaining how to
   regenerate runtime artifacts.
2. **Given** the developer has followed the documented setup steps, **When** they
   run the spec-kit CLI version check and invoke a spec-kit skill command,
   **Then** both succeed and the expected skill files exist on disk.
3. **Given** the developer wants to use a third-party agent framework (e.g.
   GStack) alongside spec-kit, **When** they read the setup guide, **Then** it
   explains that such frameworks are installed separately and not distributed via
   this fork.

---

### User Story 3 - Safe Rollback (Priority: P3)

As a fork maintainer, I want a single-command rollback path available before and
after the cleanup, so that if anything unexpectedly breaks I can restore the
prior working state without drama.

**Why this priority**: This is a structural change to what the repository tracks.
Having a reliable restore point de-risks the operation and builds confidence to
proceed.

**Independent Test**: From the post-cleanup state, execute the documented rollback
command and confirm the repository returns to the pre-cleanup tracked-file set.

**Acceptance Scenarios**:

1. **Given** the maintainer is about to perform the cleanup, **When** they create
   the tagged restore point, **Then** the restore point is recorded and
   discoverable in the project history.
2. **Given** the cleanup has been applied, **When** the maintainer invokes the
   documented rollback command, **Then** the tracked-file set returns exactly to
   its pre-cleanup state.
3. **Given** the cleanup removed paths only from the git index (not from disk),
   **When** the maintainer inspects the working directory before any rollback,
   **Then** all runtime files are still present locally and functional.

---

### Edge Cases

- What happens when a developer runs the standard init command on a clone that
  already contains the tracked project config files — are existing project
  settings preserved rather than overwritten?
- What happens when upstream introduces a new tracked file under a path this fork
  ignores — does the merge stay clean (upstream does not track these project-local
  paths, but the scenario should be considered)?
- How does the project handle a third-party agent framework whose installer writes
  into a now-ignored directory — is it clear to the developer that this is
  expected and the files simply will not be committed?
- What happens when a previously-ignored file later becomes a genuine project
  customization (e.g. a customized constitution) — is there a documented path to
  start tracking it again?
- What happens if two developers regenerate runtime artifacts at different
  versions of spec-kit — are the resulting local differences correctly kept out
  of git?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The fork MUST stop tracking all runtime-regenerated agent-integration
  directories under version control, including any such directories present today
  (e.g. `.agents/`, `.claude/`, `.kilocode/`, `.opencode/`) and those created by
  future agent integrations of the same class.
- **FR-002**: The fork MUST stop tracking runtime-regenerated project-local
  directories under `.specify/` (scripts, templates, installed extensions,
  installed workflows, integration manifests, runtime feature state, and the
  memory template area) while preserving the tracked project configuration
  files.
- **FR-003**: The cleanup MUST preserve the three genuine project configuration
  files (the installed-extensions manifest, the init options, and the active
  integration configuration) as tracked files.
- **FR-004**: The cleanup MUST preserve the custom ponytail extension as a tracked
  first-class extension, unchanged by this work.
- **FR-005**: The cleanup MUST preserve the upstream core scripts as tracked files
  (these are the source of truth from which local runtime copies are regenerated).
- **FR-006**: The repository MUST be configured so that the untracked runtime
  paths cannot be accidentally re-added to version control during normal
  development.
- **FR-007**: Removing paths from version control MUST NOT delete those paths from
  a developer's working directory; the operation affects only what git tracks.
- **FR-008**: The fork MUST provide a tagged restore point created before the
  cleanup is applied, so the pre-cleanup state is recoverable.
- **FR-009**: The fork MUST publish a setup guide that explains, for a fresh
  clone, how to regenerate the runtime artifacts and reach a working spec-kit
  setup.
- **FR-010**: The fork's README MUST describe the fork's maintenance model — what
  is and is not tracked, why, and how to get started — and link to the setup
  guide.
- **FR-011**: The setup guide MUST state that third-party agent frameworks (e.g.
  GStack) are installed by their own installers and are not distributed via this
  fork.
- **FR-012**: The setup guide MUST include a verification procedure so a developer
  can confirm their local setup is functional after running it.

### Key Entities *(include if feature involves data)*

- **Runtime artifact**: A file or directory that is regenerated locally by
  spec-kit's init, integration-setup, or extension-install flows. It is needed
  for the local tooling to function but has no canonical versioned content of its
  own — re-running the generator produces an equivalent artifact.
- **Project configuration file**: A file that records choices specific to this
  fork (which extensions are installed, which integration is active, how init was
  invoked). It has canonical versioned content and is genuinely shared across the
  team.
- **Custom extension**: A first-class extension authored in this fork (currently
  ponytail) that lives in the canonical extensions directory, is bundled with the
  package, and is tracked in version control like any other source.
- **Upstream core source**: A file that ships with spec-kit itself (e.g. the
  bundled core scripts) and is the authoritative version from which local runtime
  copies are derived.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The next upstream sync after cleanup produces zero merge conflicts
  on any previously-tracked runtime path.
- **SC-002**: The number of files tracked by git in the cleaned directories drops
  to zero for runtime-only paths, while the three project config files, the
  ponytail extension, and the upstream core scripts remain tracked.
- **SC-003**: A developer following the published setup guide on a fresh clone
  reaches a working spec-kit setup — measured by the CLI version command and at
  least one spec-kit skill command succeeding — in under 10 minutes from clone
  to first successful command.
- **SC-004**: After the cleanup, every previously-runtime file still exists on
  disk in the maintainer's working directory (zero local data loss from the
  untrack operation itself).
- **SC-005**: A single documented command restores the repository to the exact
  pre-cleanup tracked-file set, verifiable by comparing the tracked-file list
  before and after rollback.
- **SC-006**: The README links to the setup guide and the fork's maintenance model
  is summarized in one screen of the repository's front page.

## Assumptions

- The upstream `github/spec-kit` project already treats these directories
  (`.agents/`, `.claude/`, and the runtime subdirectories of `.specify/`) as
  project-local and does not track them; this fork's current tracking is the
  anomaly being corrected.
- Removing paths with the git "remove from index only" operation preserves the
  files on disk, so no local data is lost and the maintainer's environment keeps
  working without re-running init.
- Re-running the standard spec-kit init command on a clone that already contains
  the tracked project configuration files preserves those files rather than
  overwriting them; this will be verified during implementation.
- Top-level `specs/` is the location this fork uses for feature artifacts (spec,
  plan, tasks); the `.specify/memory/` area holds regenerated template content
  rather than authored feature work. If that assumption is wrong, the planning
  phase must revisit the decision to ignore `.specify/memory/`.
- The fork's upstream remote is configured and reachable for the post-cleanup
  merge-compatibility check.
- The ponytail extension is already correctly structured and bundled, and requires
  no changes as part of this work.
- Third-party agent frameworks (e.g. GStack) have their own installers and update
  mechanisms and are intentionally out of scope for this fork to distribute.

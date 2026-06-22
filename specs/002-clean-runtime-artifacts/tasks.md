# Tasks: Clean Fork for Upstream Sync

**Input**: Design documents from `specs/002-clean-runtime-artifacts/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, quickstart.md

**Tests**: Not applicable — this is a repository-hygiene operation, not a code feature. Verification is done through git commands and shell checks (see Phase 6).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This feature modifies repository configuration and documentation only — no source code changes. Paths are relative to the repository root.

---

## Phase 1: Setup (Preparation)

**Purpose**: Create safety net before any destructive index operations

- [x] T001 Create annotated git tag `pre-cleanup-002` at current HEAD with message "Restore point before runtime artifact cleanup" as the rollback anchor (FR-008)
- [x] T002 Push tag `pre-cleanup-002` to origin with `git push origin pre-cleanup-002`
- [x] T003 Verify tag is discoverable with `git tag -l "pre-cleanup-002"` and record the tagged commit SHA for later verification

---

## Phase 2: Foundational (.gitignore Update)

**Purpose**: Configure ignore rules BEFORE removing files from the index, so that untracked files are immediately covered (FR-006)

**⚠️ CRITICAL**: The `.gitignore` must be updated before `git rm --cached` operations, otherwise the removed files appear as "untracked" noise in `git status`

- [x] T004 Append fork-specific runtime artifact ignore section to `.gitignore` with the following rules: `.agents/`, `.claude/`, `.kilocode/`, `.opencode/`, `CLAUDE.md`, `.specify/scripts/`, `.specify/templates/`, `.specify/memory/`, `.specify/integrations/`, `.specify/workflows/`, `.specify/extensions/`, `.specify/feature.json`
- [x] T005 Add negation rules to `.gitignore` to preserve the three project config files: `!.specify/extensions.yml`, `!.specify/init-options.json`, `!.specify/integration.json`
- [x] T006 Verify `.gitignore` rules are syntactically correct by running `git status` and confirming no unexpected changes to tracked project config files

**Checkpoint**: `.gitignore` is ready — all subsequent `git rm --cached` operations will leave files cleanly ignored

---

## Phase 3: User Story 1 — Frictionless Upstream Merge (Priority: P1) 🎯 MVP

**Goal**: Remove all runtime-generated files from the git index so upstream merges produce zero conflicts on these paths

**Independent Test**: After cleanup, run `git fetch upstream main && git merge upstream/main --no-commit --no-ff` — the merge should complete with zero conflicts on any previously-tracked runtime path. Then `git merge --abort`.

### Implementation for User Story 1

- [x] T007 [US1] Remove agent integration directory `.agents/` from git index with `git rm -r --cached .agents/` (178 files, FR-001)
- [x] T008 [P] [US1] Remove agent integration directory `.claude/` from git index with `git rm -r --cached .claude/` (69 files, FR-001)
- [x] T009 [P] [US1] Remove `.specify/scripts/` from git index with `git rm -r --cached .specify/scripts/` (6 files, FR-002)
- [x] T010 [P] [US1] Remove `.specify/templates/` from git index with `git rm -r --cached .specify/templates/` (28 files, FR-002)
- [x] T011 [P] [US1] Remove `.specify/memory/` from git index with `git rm -r --cached .specify/memory/` (1 file, FR-002)
- [x] T012 [P] [US1] Remove `.specify/integrations/` from git index with `git rm -r --cached .specify/integrations/` (2 files, FR-002)
- [x] T013 [P] [US1] Remove `.specify/workflows/` from git index with `git rm -r --cached .specify/workflows/` (2 files, FR-002)
- [x] T014 [P] [US1] Remove `.specify/extensions/` from git index with `git rm -r --cached .specify/extensions/` (8 files, FR-002)
- [x] T015 [US1] Remove generated context file `CLAUDE.md` from git index with `git rm --cached CLAUDE.md` (1 file)
- [x] T016 [US1] Run verification gate: confirm `git ls-files .agents/ .claude/ .specify/scripts/ .specify/templates/ .specify/memory/ .specify/integrations/ .specify/workflows/ .specify/extensions/ CLAUDE.md` returns empty (FR-001, FR-002)
- [x] T017 [US1] Run verification gate: confirm `git ls-files .specify/extensions.yml .specify/init-options.json .specify/integration.json` returns exactly 3 files (FR-003)
- [x] T018 [US1] Run verification gate: confirm `git ls-files extensions/ponytail/` returns exactly 6 files (FR-004)
- [x] T019 [US1] Run verification gate: confirm `git ls-files AGENTS.md` returns 1 file (upstream core source preserved, FR-005)
- [x] T020 [US1] Run verification gate: confirm all removed files still exist on disk — spot-check `.agents/skills/api-design/SKILL.md`, `.claude/skills/api-design/SKILL.md`, `.specify/scripts/powershell/common.ps1` (FR-007)

**Checkpoint**: All ~295 runtime files are removed from the index, all local files are intact, all config/extension/upstream files remain tracked. The merge-conflict surface with upstream is eliminated.

---

## Phase 4: User Story 2 — Developer Clones a Working Fork (Priority: P2)

**Goal**: Publish documentation so a fresh clone can reach a working spec-kit setup within 10 minutes

**Independent Test**: Clone the repo in a temp directory, follow the setup guide, confirm `specify --version` and one spec-kit command succeed.

### Implementation for User Story 2

- [x] T021 [US2] Create `docs/fork-setup.md` with sections: Prerequisites (Python 3.11+, uv, Git), Install CLI (`uv tool install specify-cli --from git+...`), Regenerate runtime artifacts (`specify init --here --integration opencode --ignore-agent-tools --force`), Verification steps, Third-party frameworks note (FR-009, FR-011, FR-012)
- [x] T022 [US2] Add "🔀 Fork Maintenance" section to `README.md` after the "Get Started" section explaining: this is a fork, what is/isn't tracked, link to `docs/fork-setup.md`, fits within one screen (FR-010)
- [x] T023 [US2] Verify `docs/fork-setup.md` includes the verification procedure: `specify --version` + at least one spec-kit command (FR-012)
- [x] T024 [US2] Verify `docs/fork-setup.md` states that third-party agent frameworks (GStack, etc.) are installed by their own installers and not distributed via this fork (FR-011)

**Checkpoint**: Documentation is complete — a developer following the guide can set up a working fork clone.

---

## Phase 5: User Story 3 — Safe Rollback (Priority: P3)

**Goal**: Ensure the tagged restore point is documented and the rollback procedure is proven

**Independent Test**: From the post-cleanup state, execute the documented rollback command and confirm the repository returns to the pre-cleanup tracked-file set.

### Implementation for User Story 3

- [x] T025 [US3] Add rollback section to `docs/fork-setup.md` documenting: `git revert <cleanup-commit-sha>` as the primary rollback method, and `git checkout pre-cleanup-002 -- .` as the alternative (FR-008)
- [x] T026 [US3] Verify the tag `pre-cleanup-002` is recorded and discoverable with `git tag -l` after all changes are committed
- [x] T027 [US3] Document the rollback verification: after rollback, `git ls-files .agents/ .claude/ .specify/scripts/ .specify/templates/` should return the pre-cleanup file count

**Checkpoint**: Rollback path is documented and the restore point is proven.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final commit, end-to-end verification, and cleanup

- [ ] T028 Stage all changes with `git add .gitignore README.md docs/fork-setup.md` and create a single atomic commit with the message from plan.md Phase E.1
- [ ] T029 Run full verification script from plan.md (runtime paths untracked, config files tracked, ponytail tracked, AGENTS.md tracked, local files on disk, restore tag exists)
- [ ] T030 Run upstream merge compatibility test: `git fetch upstream main && git merge upstream/main --no-commit --no-ff`, check for zero conflicts on runtime paths, then `git merge --abort` (SC-001)
- [ ] T031 Verify README fork-maintenance section is visible within one screen of the repository front page (SC-006)
- [ ] T032 Push branch to origin with `git push origin 002-clean-runtime-artifacts`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — MUST complete before any index operations
- **User Story 1 (Phase 3)**: Depends on Foundational phase — the `.gitignore` must be in place before `git rm --cached`
- **User Story 2 (Phase 4)**: Can start after Foundational — documentation can be written in parallel with Phase 3
- **User Story 3 (Phase 5)**: Depends on Phase 1 (tag must exist) — rollback docs can be written in parallel with Phase 3
- **Polish (Phase 6)**: Depends on ALL user stories being complete — the atomic commit includes all changes

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 (`.gitignore` update). No dependencies on other stories.
- **User Story 2 (P2)**: No dependency on US1 — documentation can be written before or after the index cleanup. Independent of US3.
- **User Story 3 (P3)**: Depends on Phase 1 (tag creation). Documentation depends on knowing the cleanup commit SHA (available after US1 commit in Phase 6).

### Within Each User Story

- US1: The `git rm --cached` commands (T007–T015) can run in parallel on different paths. Verification gates (T016–T020) must run after all removals.
- US2: Documentation tasks (T021–T022) can run in parallel. Verification tasks (T023–T024) must run after document creation.
- US3: Rollback documentation (T025) depends on knowing the rollback procedure. Tag verification (T026) depends on Phase 1.

### Parallel Opportunities

- T007–T015: All `git rm --cached` operations target different paths and can run in parallel
- T021 and T022: Fork setup guide and README update touch different files and can run in parallel
- Phase 4 (US2) and Phase 5 (US3) can run in parallel with Phase 3 (US1) for the documentation portions

---

## Parallel Example: User Story 1

```bash
# Launch all git rm --cached operations together:
Task: "Remove .agents/ from git index with git rm -r --cached .agents/"
Task: "Remove .claude/ from git index with git rm -r --cached .claude/"
Task: "Remove .specify/scripts/ from git index with git rm -r --cached .specify/scripts/"
Task: "Remove .specify/templates/ from git index with git rm -r --cached .specify/templates/"
Task: "Remove .specify/memory/ from git index with git rm -r --cached .specify/memory/"
Task: "Remove .specify/integrations/ from git index with git rm -r --cached .specify/integrations/"
Task: "Remove .specify/workflows/ from git index with git rm -r --cached .specify/workflows/"
Task: "Remove .specify/extensions/ from git index with git rm -r --cached .specify/extensions/"
Task: "Remove CLAUDE.md from git index with git rm --cached CLAUDE.md"

# Then run all verification gates:
Task: "Verify runtime paths return empty from git ls-files"
Task: "Verify config files return 3 from git ls-files"
Task: "Verify ponytail returns 6 from git ls-files"
Task: "Verify AGENTS.md tracked"
Task: "Verify files exist on disk"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (create tag)
2. Complete Phase 2: Foundational (update `.gitignore`)
3. Complete Phase 3: User Story 1 (remove files from index + verify)
4. **STOP and VALIDATE**: Run `git status` — runtime files should not appear as changes; config files should remain tracked
5. Proceed to documentation and commit

### Incremental Delivery

1. Complete Setup + Foundational → Safety net in place
2. Complete User Story 1 → Index is clean, merge conflicts eliminated (MVP!)
3. Complete User Story 2 → Developer setup guide published
4. Complete User Story 3 → Rollback documentation complete
5. Complete Polish → Atomic commit, push, and verify

### Single-Developer Strategy (Recommended)

This is a single-developer task best executed sequentially:

1. Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
2. All phases in one working session (~30 minutes)
3. Single atomic commit at the end

---

## Notes

- [P] tasks = different files/paths, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently verifiable via its checkpoint criteria
- Commit only once at Phase 6 — all changes are part of one atomic operation
- Verify local files exist on disk at every checkpoint (FR-007 / SC-004)
- Avoid: removing config files, removing ponytail extension files, removing AGENTS.md

# Progress: Clean Fork for Upstream Sync

## Spec-Driven Development Phases
- [x] **Phase 1: Constitution & Principles** (governed by `.specify/memory/constitution.md`)
- [x] **Phase 2: Feature Specification** ([spec.md](file:///d:/Developpement/Projets/WEB/spec-kit/specs/002-clean-runtime-artifacts/spec.md))
- [x] **Phase 3: Quality Checklist** ([requirements.md](file:///d:/Developpement/Projets/WEB/spec-kit/specs/002-clean-runtime-artifacts/checklists/requirements.md))
- [x] **Phase 4: Technical Design / Plan** ([implementation-plan.md](file:///d:/Developpement/Projets/WEB/spec-kit/memory-bank/implementation-plan.md))
- [/] **Phase 5: Execution & Implementation** (In Progress)
- [ ] **Phase 6: Verification & Testing**
- [ ] **Phase 7: Review & Merging**

---

## Detailed Task Breakdown (From Implementation Plan)

### Phase 1: Preparation
- [ ] **B1**: Create backup commit with tag `pre-cleanup-v0.10.3`
- [ ] **B2**: Update `.gitignore` with runtime artifact exclusions

### Phase 2: Untrack Runtime Artifacts
- [ ] **B3**: Untrack `.agents/` directory from Git (`git rm -r --cached`)
- [ ] **B4**: Untrack `.claude/` directory from Git (`git rm -r --cached`)
- [ ] **B5**: Untrack `.specify/` runtime subdirectories (`git rm -r --cached` on scripts, templates, extensions, workflows, integrations, feature.json, and memory/)

### Phase 3: Verification
- [ ] **B6**: Verify tracked files (runtime dirs empty, config files present, ponytail present)
- [ ] **B7**: Verify local environment runtime still works (files present on disk, specify command succeeds)

### Phase 4: Commit and Validate
- [ ] **B8**: Commit cleanup changes with descriptive commit message
- [ ] **B9**: Test upstream merge compatibility using dry-run merge

### Phase 5: Documentation
- [ ] **B10**: Create `docs/DEVELOPER-SETUP.md` with post-clone setup instructions
- [ ] **B11**: Update `README.md` to link to developer setup guide and describe the maintenance model

---

## Progress Metrics
- **Total Spec Implementation Tasks**: 11
- **Completed**: 0 (0%)
- **In Progress**: 0 (0%)
- **Not Started**: 11 (100%)
- **Blocked**: 0 (0%)

# Active Context: Clean Fork for Upstream Sync

## Current Active Spec
[002-clean-runtime-artifacts](file:///d:/Developpement/Projets/WEB/spec-kit/specs/002-clean-runtime-artifacts/spec.md)
- **Goal**: Clean the `a2mus/spec-kit` fork by untracking ~298 runtime-generated files to enable frictionless merges from upstream `github/spec-kit`.
- **Status**: Ready for implementation plan execution.

---

## Recent Accomplishments
1. Finalized the feature specification ([spec.md](file:///d:/Developpement/Projets/WEB/spec-kit/specs/002-clean-runtime-artifacts/spec.md)) mapping out requirements, user stories, edge cases, and success criteria.
2. Formulated the specification quality checklist ([requirements.md](file:///d:/Developpement/Projets/WEB/spec-kit/specs/002-clean-runtime-artifacts/checklists/requirements.md)) and verified all requirements are clean and ready.
3. Created a detailed technical implementation plan ([implementation-plan.md](file:///d:/Developpement/Projets/WEB/spec-kit/memory-bank/implementation-plan.md)) detailing the preparation, untracking, verification, and documentation phases.
4. Initialized the memory bank files: `productContext.md`, `systemPatterns.md`, `activeContext.md`, and `progress.md`.

---

## Current Focus & Challenges
- **Immediate Focus**: Execute Phase 1 of the implementation plan (Create a tagged backup commit and update `.gitignore` with the proper exclusions).
- **Key Challenges**:
  - Ensuring the git untrack operation (`git rm -r --cached`) does not delete the physical files from the workspace.
  - Ensuring config files (`extensions.yml`, `init-options.json`, `integration.json`) remain tracked and intact.

---

## Next Steps
1. Create backup commit and tag it as `pre-cleanup-v0.10.3`.
2. Edit `.gitignore` to add runtime artifact exclusions.
3. Execute cached untracking commands on `.agents/`, `.claude/`, and runtime `.specify/` subdirs.
4. Verify files on disk and git tracking state.
5. Create `docs/DEVELOPER-SETUP.md` setup instructions.
6. Update `README.md` to link to the new setup instructions.

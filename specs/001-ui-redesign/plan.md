# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: React 18, Node.js 20+  
**Primary Dependencies**: `react-leaflet`, `tailwind-merge`, `clsx`, `react-i18next`, `chart.js`  
**Storage**: N/A (Frontend display logic only)  
**Testing**: Jest / React Testing Library  
**Target Platform**: Web Browsers (Chrome, FF, Safari)  
**Project Type**: React Single Page Application (SPA)
**Performance Goals**: 60fps map panning, instant (<50ms) language toggle repaints  
**Constraints**: Map layer must remain interactive and z-indexed below floating HUDs  
**Scale/Scope**: Frontend redesign spanning ~10 core components and 1 global context

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Time-Series / Tenant Isolation**: The frontend redesign does not alter backend DB queries; RLS (`farm_id`) remains intact.
- [x] **Map-Centric DOM (Article 3.1)**: The design explicitly hoists `<MapContainer>` to a full-screen background layer, moving menus into compact floating HUDs.
- [x] **RTL/Bilingual Support (Article 3.2)**: `react-i18next` and HTML `dir` attribute toggling are central to the new architecture.
- [x] **Aesthetic Standards (Article 3.3)**: `tailwind-merge` and Tailwind's `backdrop-blur` will be used to enforce the Glassmorphism overlays without fully obscuring the map.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
### Source Code (repository root)

```text
frontend/
├── src/
│   ├── components/
│   │   ├── common/         # Language toggles, generic UI
│   │   ├── layout/         # Header, Sidebar, HUD Overlays
│   │   └── map/            # Contextual Cow Cards, Map Controls
│   ├── context/            # UIContext (Language, Selection state)
│   ├── hooks/              # i18n hooks, translation wrappers
│   └── i18n/               # i18next configuration and localales (ar, fr json)
```

**Structure Decision**: Option 2 (Web application). The redesign occurs exclusively within the isolated `frontend/` React SPA. New directories for `context/` and `i18n/` will be introduced to support the global state requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |

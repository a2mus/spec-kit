# Phase 0: Research & Technical Decisions (UI Redesign)

## 1. Technical Context Resolution

### 1.1 UI Tech Stack
- **Decision**: Tailwind CSS via `tailwind-merge` and `clsx` for dynamic utility classes, coupled with `react-i18next` for localization and layout direction control.
- **Rationale**: The product currently uses standard scoped CSS (`Header.css`, `Sidebar.css`). Transitioning to Tailwind allows for robust, rapid implementation of the "Glassmorphism" requirement (`backdrop-blur-md bg-white/10`) natively without writing complex overarching CSS variables. `react-i18next` is the industry standard for React localization.
- **Alternatives Considered**: Writing custom CSS modules was rejected as it scales poorly with highly dynamic RTL/LTR layout flipping.

### 1.2 Map-Centric DOM Execution
- **Decision**: The `react-leaflet` `<MapContainer>` will be hoisted to act as the primary `z-index: 0` background layer on the main route. All other overlays (Header, Sidebar, KPI HUD) will be rendered as absolutely positioned or fixed elements at `z-index: 10+` floating over the map.
- **Rationale**: This strictly satisfies the "Map-Centric DOM" principle defined in the Constitution (Article 3.1) by ensuring the map is never pushed out of the viewport by block-level elements.
- **Alternatives Considered**: Resizing the map dynamically using flexbox or CSS Grid was rejected because map tile engines often suffer rendering artifacts/stutters during rapid viewport resizes. A fixed full-screen canvas is much more performant.

### 1.3 RTL/LTR Bilingual Shifting
- **Decision**: Abstract the layout container into a `LanguageProvider` that binds the `i18n.language` state to the `<html dir="...">` attribute. Tailwind's native RTL modifiers (e.g., `rtl:ml-4`, `ltr:mr-4`) will be used on the floating components.
- **Rationale**: Relying on HTML `dir` naturally flips native flexbox rows and inline elements without requiring massive amounts of custom CSS overrides.

---

*All `NEEDS CLARIFICATION` items from the specification have been technically resolved here. The project is ready for Phase 1 Design.*

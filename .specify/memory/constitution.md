# Project Constitution: Virtual Fencing & Health Monitoring System

**Ratification Date**: 2026-03-04
**Last Amended**: 2026-03-04
**Version**: 1.0.0
**Derived From**: product-spec.md, ui-spec.md

---

## Preamble

This constitution establishes the governing principles, standards, and practices for the development of the Virtual Fencing & Health Monitoring System. It ensures that the transition from a prototype to a production-grade, multi-tenant SaaS platform remains consistent, secure, and maintainable. All development work MUST comply with this document. Amendments require explicit review and version increment.

---

## Article 1: Architecture

### 1.1 System Architecture
- **Pattern**: Multi-tenant distributed IoT architecture (Edge -> Node.js -> TimescaleDB -> React).
- **Rationale**: Separates concerns between high-throughput device telemetry and responsive user interfaces while maintaining strict tenant data boundaries.

### 1.2 Architecture Principles
1. **Time-Series Isolation**: MUST use TimescaleDB hypertables for telemetry, separated from standard relational tables. *Rationale: Ingestion performance for up to 10k collars requires optimized chunking.*
2. **Tenant Isolation**: MUST enforce Row-Level Security (RLS) via `farm_id` on all database queries. *Rationale: Failsafe prevention of cross-tenant data leakage in a shared DB.*
3. **Edge Tolerance**: MUST design backend endpoints to handle out-of-order or buffered telemetry batches. *Rationale: BeagleBones may lose connectivity and send bulk historical data upon reconnection.*

### 1.3 Technology Stack
| Layer | Technology | Version | Justification |
|-------|-----------|---------|---------------|
| Frontend | React + Tailwind | 18+ | robust ecosystem; Tailwind enables complex glassmorphism UI |
| Backend API | Node.js + Express | Latest LTS | Lightweight, fast asynchronous I/O |
| Database | PostgreSQL + TimescaleDB | 14+ | Native time-series optimizations |
| Auth | Passport.js (JWT) | - | No vendor lock-in; flexible strategy support |
| SMS Notifications | Sobersys | - | Cost-effective local Algerian provider |

---

## Article 2: Code Quality

### 2.1 Code Style & Linting
- **Linter**: ESLint (standard configuration).
- **Formatter**: Prettier.
- **Rules**: Enforce standard JS/React rules; require pure functional components with Hooks.

### 2.2 Application State & Patterns
- **State Management**: MUST use React Context for core global abstractions (e.g., Auth State, Language/RTL Direction). Avoid massive Redux stores if unnecessary.
- **Component Purity**: Components SHOULD be visually pure; side-effects must be contained within clearly defined hooks or service layers.

### 2.3 API Contracts
- MUST define and document clear request/response JSON schemas for all endpoints.
- MUST validate incoming data payloads (e.g., using Joi/Zod) before DB insertion.

---

## Article 3: Design & UI

### 3.1 Map-Centric DOM
- **Principle**: When a screen contains a map (like the Live Map or Fencing Zones), the map MUST occupy the main area. Other menus, KPI cards, and UI elements MUST occupy only a small area (e.g., via floating panels or sidebars) to maximize geospatial visibility.

### 3.2 RTL-First & Bilingual Support
- **Principle**: MUST support bilingual interfaces natively utilizing `react-i18next`.
- **Default**: Arabic (RTL). Setting `<html dir="rtl">` MUST automatically flip layout geometries (e.g., Sidebar moves to the right).
- **Secondary**: French (LTR).

### 3.3 Aesthetic Standards
- **Glassmorphism**: MUST use CSS blurring techniques (e.g., Tailwind `backdrop-blur`) for map overlays, ensuring the map tiles underneath are never completely obscured by thick solid walls of color.
- **Semantic Colors**: MUST strictly adhere to established semantic colors: Emerald (Safe/Healthy), Amber/Orange (Warning/Near-fence), Ruby (Critical/Breach).
- **Functional Elements**: MUST NOT include purely decorative "dead" space. Overlays or cards must act as active filters or display critical actionable data.

---

## Article 4: Security

### 4.1 Authentication & Authorization
- **Auth State**: MUST store JWT tokens securely (HttpOnly cookies preferred over localStorage) to mitigate XSS vulnerabilities.
- **Edge Auth**: MUST authenticate IoT ingestion endpoints with dedicated API keys/tokens per collar or farm gateway to prevent rogue telemetry injection.

### 4.2 Data Protection
- **Data Access**: MUST rely on Database-level RLS over application-layer filtering software logic wherever `farm_id` isolation is required.

### 4.3 Secrets Management
- MUST NOT hardcode any secrets (Sobersys API Keys, DB Passwords, JWT Secrets) in the repository.
- MUST use `.env` files locally and Docker Secrets/Environment configs in production.

---

## Article 5: DevOps & Deployment

### 5.1 Containerization
- **Principle**: MUST run all services (Node.js API, TimescaleDB, Frontend dev server/build) via Docker Compose for guaranteed environment parity.

### 5.2 Environment Management
- **Principle**: MUST maintain an up-to-date `.env.example` mapping all required variables for local development bootstrapping.

### 5.3 Database Versioning
- **Principle**: SHOULD use a programmatic migration tool (e.g., Node-pg-migrate, Knex migrations, or strict SQL init scripts) to manage schema changes over time.

---

## Article 6: Governance

### 6.1 Amendment Process
- Changes to this constitution require explicit documentation.
- Version MUST be incremented per semantic versioning.

### 6.2 Compliance
- All Pull Requests or direct commits MUST comply with this constitution.

---

## Appendix A: Reference Documents
- `product-spec.md` — Product requirements, features, and target audience.
- `ui-spec.md` — UI specification, color tokens, and navigation layout.

# Progress Log

## 2025-12-05 Session 2 - Collar Registration System
- Added database tables: Collars, Cattle, HealthThresholds
- Backend API: cattle CRUD, collar assignment, auto-discovery
- Frontend: CattleRoster page with add/edit/delete cattle
- Frontend: CollarManagement page with discovery and assignment flow
- Health Monitor: Now displays heart rate and SpO2 from collar sensors
- Reserved collar ID 9999 for unassigned/new collars
- Config delivery via polling: pending_config returned in POST response
- Health thresholds: body_temp (37.5-39.5°C), heart_rate (48-84 BPM), spo2 (95-100%)

## 2025-12-05 Session 1 - Major UI Overhaul
- Transformed single-page map app into multi-page dashboard application
- New pages: Dashboard, Live Map, Health Monitor, Fencing Zones
- Created comprehensive CSS design system
- Layout components: Sidebar (collapsible) and Header
- New dependencies: react-router-dom, chart.js, react-chartjs-2, lucide-react
- Fixed DrawControlNative callback stability issue

## 2025-11-09
- Initialized Memory Bank with full project context.
- Docker Compose setup for database, backend, frontend.
- Simulator posting telemetry successfully.
- Polygon drawing with native L.Control.Draw.
- Fence deletion implemented.

## Known Issues
- Path with `&` character causes npm issues on Windows; use Docker.
- Compose `version` key deprecation warning; safe to remove.
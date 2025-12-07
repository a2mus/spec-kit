# Progress Log

## 2025-12-07 - Virtual Fencing & Graduated Alert System
- Implemented geofence logic in BeagleBone simulator (`beaglebone_vm.py`)
- Added geofence utilities: `haversine_distance`, `point_in_polygon`, `distance_to_polygon_edge`
- Implemented graduated alert system:
  - Stage 1 (warning_1): 10-15m from boundary → Sound alert (🔊)
  - Stage 2 (warning_2): 5-10m from boundary → Intensified sound (🔊🔊)
  - Stage 3 (breach): <5m or outside fence → Electric shock (⚡)
- Added fence sync mechanism: BeagleBone fetches fences via `GET /api/fences/sync` (60s cache)
- Database: Added `alert_state` column to Collars, `is_active` column to Fences
- Backend: New `/api/fences/sync` and `/api/fences/:id/toggle` endpoints
- Backend: `POST /api/collars/data` now accepts and stores `alert_state`
- Frontend LiveMap: Blinking markers with speaker/lightning overlays for alert states
- Frontend: New `GeofenceAlertNotification.js` component for toast notifications
- Frontend Dashboard: Activity feed now prioritizes geofence alerts

## 2025-12-06 - BeagleBone Simulation & Backend Fixes
- Created `simulator/beaglebone_vm.py` to simulate BeagleBone-to-Backend communication
- Script parses raw LoRa packets, sends JSON to backend, handles pending config responses
- Fixed backend bug: collar ID 9999 was causing duplicate key errors on insert
- Fixed backend bug: pending_config was not returned for unassigned collar (9999)
- Verified full registration loop: Discovery → Assignment → Config Delivery → Confirmation
- Updated `GET /api/collars` to include collar 9999 (was incorrectly filtered out)

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
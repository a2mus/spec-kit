# Progress Log

- 2025-11-09
  - Initialized Memory Bank with full project context.
  - Started database (`cattle-db`) and backend (`cattle-backend`) via Docker Compose.
  - Simulator posting telemetry successfully (HTTP 201) to backend.
  - Frontend built/served via Docker on `http://localhost:8080` and opened preview.
  - Noted Compose `version` key deprecation warning.

## Known Issues / Observations
- Host `npm start` failed due to Node version path mismatch; Docker usage recommended.
- Consider adding simulator to Compose for full Dockerized workflow.
- 2025-11-09
  - Fixed polygon drawing by importing `leaflet-draw` and using native `L.Control.Draw` with `useMap`.
  - Rebuilt and restarted frontend container; preview reported no browser errors.
  - Verified DB and backend healthy; simulator continues posting telemetry.
  - Next: add UX feedback on fence saves and implement edit/delete flows.

## Known Issues / Observations
- Compose `version` key deprecation warning persists; safe to remove later.
- Occasional OSM tile fetch errors observed; do not block draw interactions.
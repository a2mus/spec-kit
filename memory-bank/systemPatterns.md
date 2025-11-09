# System Patterns

## Architecture
- Three-service Compose: DB → Backend → Frontend.
- Simulator runs outside Compose targeting Backend via `localhost:3001`.

## API Design
- RESTful endpoints with JSON request/response.
- Validation: required fields for telemetry (`collar_id`, `timestamp`).
- Error handling: 4xx for validation, 5xx for server/db failures.

## Data Ingestion Pattern
- Simulator produces semicolon-delimited payload → parser maps to structured JSON → backend inserts into `LocationHistory` and updates in-memory latest map for fast polling.

## Frontend UI Pattern
- React with Leaflet map.
- Fence drawing via native Leaflet Draw (`L.Control.Draw`) bound to a `FeatureGroup`.
- Import `leaflet-draw` JS and `leaflet.draw.css` to register the control.
- Pause polling while drawing to avoid re-render interruptions; resume after creation.
- Toolbar positioned `topright` to avoid overlay conflicts.

## Coding Standards
- Keep endpoints and schema names quoted to match SQL definitions.
- Use environment variable `DATABASE_URL` for DB connection.
- Containerized runtime preferred for consistency.
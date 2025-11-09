# Tech Context

## Stack
- Orchestration: Docker Compose (database, backend, frontend).
- Database: TimescaleDB (PostgreSQL 14).
- Backend: Node.js (container Node 16), Express, `pg`, CORS.
- Frontend: React 18, `react-leaflet`, `leaflet`, `leaflet-draw` (JS imported in `App.js`), served via `serve` on port 8080.
- Simulator: Python 3, `requests`.

## Services & Ports
- Database: `5432` (container), healthcheck with `pg_isready`.
- Backend: `3001` (Express). Env: `DATABASE_URL=postgres://user:password@database:5432/virtual_fencing_db`.
- Frontend: `8080` (static build served by `serve`).

## Key Endpoints
- `GET /api/fences` – list saved fences.
- `POST /api/fences` – save a new fence.
- `POST /api/collars/data` – ingest telemetry from simulator/collar.
- `GET /api/collars/latest` – latest telemetry for frontend polling.

## Data Model (from init.sql)
- Table `"Fences"`: `id`, `name`, `geo_json`, `created_at`, `updated_at`.
- Table `"LocationHistory"`: `timestamp`, `collar_id`, `latitude`, `longitude`, `battery_voltage`, `body_temp`, `env_temp`, `env_humidity`, `roll`, `pitch`, `yaw`, `activity`, `heart_rate` (optional), `spo2` (optional). Hypertable on `timestamp`.

## Build/Run
- Compose: `docker-compose up -d --build`.
- Frontend served at `http://localhost:8080`.
- Backend at `http://localhost:3001`.

## Constraints & Notes
- Host `npm start` may fail due to Node version differences; prefer Docker.
- Leaflet Draw: ensure `import 'leaflet-draw';` and `import 'leaflet-draw/dist/leaflet.draw.css';` in `App.js`.
- Compose `version` key is obsolete; safe to remove later.
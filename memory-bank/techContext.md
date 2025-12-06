# Tech Context

## Stack
- Orchestration: Docker Compose (database, backend, frontend)
- Database: TimescaleDB (PostgreSQL 14)
- Backend: Node.js 16, Express, pg, CORS
- Frontend: React 18, React Router, react-leaflet, Chart.js, Lucide React
- Simulator: Python 3, requests

## Database Schema
### Tables
- **Cattle**: id, name, tag_number, breed, birth_date, gender, weight_kg, notes
- **Collars**: id, collar_id (unique), cattle_id (FK), status, pending_new_id, last_seen
- **Fences**: id, name, geo_json, created_at, updated_at
- **LocationHistory**: timestamp, collar_id, lat/lon, battery, temps, roll/pitch/yaw, activity, heart_rate, spo2
- **HealthThresholds**: metric, min/max values, unit

### Reserved Values
- collar_id = 9999: Reserved for unassigned/new collars

## Collar Packet Format (from LoRa)
```
ID=9920;BATT=3.70;TEMP=45.0;HUM=54.9;TB=0.00;TA=0.00;DAT=011125;TIM=144411;LAT=54.071125N;LON=-1.995948W;R=27.96;P=-12.86;Y=0.00
```
Plus: heart_rate, spo2 (pending addition)

**Note**: Activity is NOT sent by collar - computed server-side.

## API Endpoints
### Fences
- `GET/POST /api/fences`, `DELETE /api/fences/:id`

### Cattle
- `GET/POST /api/cattle`, `PATCH/DELETE /api/cattle/:id`

### Collars
- `GET /api/collars` - List with status filter
- `POST /api/collars/data` - Ingest telemetry (returns pending_config if any)
- `PATCH /api/collars/:id/assign` - Assign to cattle, generate new ID
- `PATCH /api/collars/:id/unassign` - Remove cattle assignment
- `GET /api/collars/latest` - For frontend polling
- `POST /api/collars/:oldId/confirm-new-id` - Confirm ID change

### Dashboard
- `GET /api/dashboard/summary` - Stats overview
- `GET /api/health/thresholds` - Alert thresholds

## Services & Ports
- Database: 5432
- Backend: 3001
- Frontend (Docker): 8080
- Frontend (Dev): 3000
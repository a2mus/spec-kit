# Tech Context

## Stack
- **Orchestration**: Docker Compose (database, backend, frontend)
- **Database**: TimescaleDB (PostgreSQL 14)
- **Backend**: Node.js 16, Express, pg, CORS
- **Frontend**: React 18, React Router, react-leaflet, Chart.js, Lucide React
- **Hardware (Edge)**: BeagleBone Black, SX1276/RFM95 LoRa Module
- **Edge Software**: Python/C++ serial reader + HTTP client
- **Simulator**: Python 3 (`simulator/beaglebone_vm.py`)

## Database Schema
### Tables
- **Cattle**: id, name, tag_number, breed, birth_date, gender, weight_kg, notes
- **Collars**: id, collar_id (unique), cattle_id (FK), status, pending_new_id, **alert_state**, last_seen
- **Fences**: id, name, geo_json, **is_active**, created_at, updated_at
- **LocationHistory**: timestamp, collar_id, lat/lon, battery, temps, roll/pitch/yaw, activity, heart_rate, spo2
- **HealthThresholds**: metric, min/max values, unit

### Reserved Values
- collar_id = 9999: Reserved for unassigned/new collars

### Alert States (Collars.alert_state)
| Value | Description |
|-------|-------------|
| safe | Inside fence, > 15m from boundary |
| warning_1 | 10-15m from boundary - sound alert |
| warning_2 | 5-10m from boundary - intense sound |
| breach | < 5m or outside fence - electric shock |

## Collar Packet Format (from LoRa)
```
ID=9920;BATT=3.70;TEMP=45.0;HUM=54.9;TB=38.5;TA=25.0;DAT=011125;TIM=144411;LAT=54.071125N;LON=-1.995948W;R=27.96;P=-12.86;Y=0.00
```
Plus: heart_rate, spo2 (simulated in beaglebone_vm.py)

**Note**: Activity is NOT sent by collar - computed server-side.

## API Endpoints
### Fences
- `GET /api/fences` - List all fences (includes is_active)
- `POST /api/fences` - Create fence
- `DELETE /api/fences/:id` - Delete fence
- **`GET /api/fences/sync`** - Get active fences for BeagleBone (formatted for processing)
- **`PATCH /api/fences/:id/toggle`** - Toggle fence active status

### Cattle
- `GET/POST /api/cattle`, `PATCH/DELETE /api/cattle/:id`

### Collars
- `GET /api/collars` - List all collars (includes 9999 for discovery)
- `POST /api/collars/data` - Ingest telemetry **(accepts alert_state)**, returns pending_config
- `PATCH /api/collars/:id/assign` - Assign to cattle, generate new ID
- `PATCH /api/collars/:id/unassign` - Remove cattle assignment
- `GET /api/collars/latest` - For frontend polling **(includes alert_state)**
- `POST /api/collars/:oldId/confirm-new-id` - Confirm ID change after LoRa delivery

### Dashboard
- `GET /api/dashboard/summary` - Stats overview
- `GET /api/health/thresholds` - Alert thresholds

## Services & Ports
- Database: 5432
- Backend: 3001
- Frontend (Docker): 8080
- Frontend (Dev): 3000

## Simulator Script
`simulator/beaglebone_vm.py` simulates:
1. Receiving raw LoRa packet string
2. Parsing to JSON
3. **Checking geofence status** (fetches fences, computes alert_state)
4. POST to `/api/collars/data` with alert_state
5. Handling `pending_config` response
6. Calling `/api/collars/:oldId/confirm-new-id`

## Geofence Configuration Constants
```python
BUFFER_ZONE_BOUNDARY = 10  # 10m buffer from fence edge
WARNING_1_DISTANCE = 15    # Stage 1 alert zone
WARNING_2_DISTANCE = 10    # Stage 2 alert zone  
BREACH_DISTANCE = 5        # Stage 3 (shock) zone
FENCE_SYNC_INTERVAL = 60   # Seconds between fence sync
```
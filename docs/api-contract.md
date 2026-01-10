# BeagleBone ↔ Backend API Contract

This document defines the data format and API endpoints for communication between the BeagleBone edge device and the backend server.

---

## 1. Data Payload Schema

### Collar Telemetry (Sent Every ~30 seconds)

```json
{
  "collar_id": "COLLAR001",
  "timestamp": "2025-12-09T22:45:00.000Z",
  "gps": {
    "latitude": 36.7525,
    "longitude": 3.0420,
    "altitude": 150.5,
    "accuracy": 2.5
  },
  "battery": 85,
  "signal_strength": -70
}
```

| Field | Type | Description |
|-------|------|-------------|
| `collar_id` | string | Unique collar identifier |
| `timestamp` | ISO 8601 | UTC timestamp of reading |
| `gps.latitude` | float | Latitude in degrees |
| `gps.longitude` | float | Longitude in degrees |
| `gps.altitude` | float | Altitude in meters (optional) |
| `gps.accuracy` | float | GPS accuracy in meters |
| `battery` | int | Battery percentage (0-100) |
| `signal_strength` | int | LoRa RSSI in dBm |

---

### IMU Activity Window (Sent Every 5 minutes)

```json
{
  "collar_id": "COLLAR001",
  "window_start": "2025-12-09T22:40:00.000Z",
  "window_end": "2025-12-09T22:45:00.000Z",
  "activity_type": "GRAZING",
  "confidence": 0.92,
  "metrics": {
    "avg_accel_magnitude": 1.02,
    "step_count": 45,
    "orientation_changes": 12
  }
}
```

| Field | Type | Description |
|-------|------|-------------|
| `activity_type` | enum | `LYING`, `STANDING`, `WALKING`, `GRAZING`, `RUMINATING` |
| `confidence` | float | Classification confidence (0.0-1.0) |
| `metrics` | object | Raw metrics for debugging/ML |

---

## 2. API Endpoints

### `POST /api/collar-data` — Telemetry Ingestion
Receives GPS and status data from collars.

**Request Body:** Array of telemetry objects (batch upload)
```json
[
  { "collar_id": "COLLAR001", "timestamp": "...", "gps": {...}, ... },
  { "collar_id": "COLLAR002", "timestamp": "...", "gps": {...}, ... }
]
```

**Response:** `201 Created`

---

### `POST /api/imu-activity` — Activity Window Ingestion
Receives classified activity windows.

**Request Body:** Array of activity window objects
```json
[
  { "collar_id": "COLLAR001", "window_start": "...", "activity_type": "GRAZING", ... }
]
```

**Response:** `201 Created`

---

## 3. Error Responses

| Code | Meaning |
|------|---------|
| `400` | Invalid JSON or missing required fields |
| `401` | Unauthorized (API key required in future) |
| `500` | Server error |

---

## 4. Notes for Microcontroller ↔ BeagleBone

The microcontroller (STM32/ESP32) communicates with BeagleBone via **Serial/UART**:

```
<COLLAR_ID>,<LAT>,<LON>,<ALT>,<BATTERY>,<RSSI>\n
```

Example: `COLLAR001,36.7525,3.0420,150.5,85,-70\n`

The BeagleBone parses this and forwards to the backend as JSON.

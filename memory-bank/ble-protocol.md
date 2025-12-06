# BLE/LoRa Communication Protocol

This document defines the communication protocol between the collar, BeagleBone gateway, and backend server.

## Database Stack

- **PostgreSQL 14** with:
  - **TimescaleDB** extension for time-series data (LocationHistory)
  - **PostGIS** extension for geospatial queries (fences, locations)

---

## Overview

```
┌─────────────┐     LoRa RF      ┌─────────────────┐     HTTP/REST      ┌─────────────┐
│   Collar    │ ───────────────► │   BeagleBone    │ ─────────────────► │   Backend   │
│   (MCU)     │                  │   (Gateway)     │                    │   Server    │
└─────────────┘                  └─────────────────┘                    └─────────────┘
     │                                  │                                     │
     │ • Reads sensors                  │ • Parses packets                    │ • Stores in
     │ • Computes MOV                   │ • Basic classification              │   PostgreSQL/
     │ • Transmits data                 │ • Forwards to backend               │   TimescaleDB
     │                                  │                                     │ • ML classification
     │                                  │                                     │ • Alerts & health
```

---

## Collar → BeagleBone (LoRa Packet)

### Telemetry Packet Format

**String format (current implementation):**
```
ID=<collar_id>;BATT=<voltage>;TEMP=<env_temp>;HUM=<humidity>;TB=<body_temp>;TA=<ambient_temp>;DAT=<date>;TIM=<time>;LAT=<latitude>;LON=<longitude>;R=<roll>;P=<pitch>;Y=<yaw>;ACT=<activity>
```

**Example:**
```
ID=9920;BATT=3.70;TEMP=45.0;HUM=54.9;TB=38.5;TA=22.0;DAT=011125;TIM=144411;LAT=54.071125N;LON=-1.995948W;R=27.96;P=-12.86;Y=0.00;ACT=GRAZING
```

### Field Definitions

| Field | Type | Range | Unit | Description |
|-------|------|-------|------|-------------|
| ID | int | 100-9999 | - | Collar identifier (9999 = unassigned) |
| BATT | float | 2.5-4.2 | V | Battery voltage |
| TEMP | float | -40 to 85 | °C | Environmental temperature (sensor) |
| HUM | float | 0-100 | % | Environmental humidity |
| TB | float | 35-42 | °C | Body temperature |
| TA | float | -40 to 60 | °C | Ambient temperature |
| DAT | string | DDMMYY | - | Date |
| TIM | string | HHMMSS | - | Time |
| LAT | string | - | - | Latitude (e.g., "54.071125N") |
| LON | string | - | - | Longitude (e.g., "-1.995948W") |
| R | float | -180 to 180 | ° | Roll (IMU orientation) |
| P | float | -90 to 90 | ° | Pitch (IMU orientation) |
| Y | float | -180 to 180 | ° | Yaw (IMU orientation) |
| ACT | string | - | - | Activity state (from simulator, see note below) |
| HR | int | 30-150 | BPM | Heart rate (optional, simulated) |
| SPO2 | float | 0-100 | % | Blood oxygen saturation (optional, simulated) |

> **Note**: The `ACT` field in the current simulator is for demonstration purposes. In production, activity classification would be computed server-side based on IMU data patterns.

---

## MOV (Movement Intensity) - Future Enhancement

When implementing real collar firmware, a **MOV (Movement Intensity)** field can be added:

### What MOV Would Be
- A simple **motion magnitude** computed on the collar
- Represents "how much is the animal moving right now"
- Cheap to compute on low-power MCU

### How to Calculate MOV (Collar Firmware)
```c
// Read accelerometer
int16_t ax, ay, az;
imu_read_accel(&ax, &ay, &az);

// Convert to g-force (assuming ±2g range, 16-bit ADC)
float ax_g = ax / 16384.0f;
float ay_g = ay / 16384.0f;
float az_g = az / 16384.0f;

// Calculate magnitude (subtract 1g for gravity when at rest)
float magnitude = sqrtf(ax_g*ax_g + ay_g*ay_g + az_g*az_g);
float motion = fabsf(magnitude - 1.0f);  // Remove gravity baseline

// Scale to 0-255
uint8_t MOV = (uint8_t)(fminf(motion * 255.0f, 255.0f));
```

### MOV Value Interpretation

| MOV Range | Interpretation |
|-----------|----------------|
| 0-20 | Very still (lying, sleeping) |
| 20-60 | Minimal movement (resting, standing) |
| 60-120 | Moderate movement (slow walking, grazing) |
| 120-180 | Active movement (walking, normal activity) |
| 180-255 | High activity (running, agitated, distressed) |

---

## BeagleBone → Backend (HTTP API)

### Telemetry Endpoint

**POST** `/api/collars/data`

**Request Body:**
```json
{
  "collar_id": 9920,
  "battery_voltage": 3.70,
  "env_temp": 45.0,
  "env_humidity": 54.9,
  "body_temp": 38.5,
  "ambient_temp": 22.0,
  "timestamp": "2025-01-11T14:44:11Z",
  "latitude": 54.071125,
  "longitude": -1.995948,
  "roll": 27.96,
  "pitch": -12.86,
  "yaw": 0.00,
  "heart_rate": 72,
  "spo2": 98.0
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "pending_config": null
}
```

**Response with pending config:**
```json
{
  "success": true,
  "pending_config": {
    "new_id": 101
  }
}
```

---

## Activity Classification

Activity is computed **server-side**, not on the collar:

| Level | Where | What | Examples |
|-------|-------|------|----------|
| 0 - Raw | Collar (future) | MOV value | 0-255 motion magnitude |
| 1 - Basic | Backend | Simple thresholds | Moving, Resting, Standing, Lying |
| 2 - Advanced | Backend | ML models | Grazing, Ruminating, Sleeping, Walking, Distressed |

### Basic Classification Logic

```python
def classify_basic(pitch, roll, accel_std):
    """Classify activity based on IMU orientation and movement."""
    if accel_std < 0.1:  # Very little movement
        if pitch < -15:
            return "RESTING"  # Head down, still = lying
        else:
            return "STANDING"
    elif accel_std < 0.5:
        if pitch > 10:
            return "GRAZING"  # Head down + some movement
        else:
            return "WALKING"
    else:
        return "WALKING"  # High movement
```

---

## Reserved Values

| Value | Meaning |
|-------|---------|
| collar_id = 9999 | Unassigned/new collar |
| HR = 0 | Heart rate sensor not available |
| SPO2 = 0 | SpO2 sensor not available |

---

## Simulator

The project includes a Python simulator (`simulator/beaglebone_vm.py`) that:
1. Simulates a herd of cattle with realistic movement patterns
2. Generates LoRa-style packets
3. POSTs data to the backend API
4. Handles collar assignment (9999 → new ID) workflow

**Usage:**
```bash
# Continuous mode (default)
python beaglebone_vm.py --mode continuous --interval 5 --cattle 1001,1002,1003

# Single shot mode (for testing)
python beaglebone_vm.py --mode single
```

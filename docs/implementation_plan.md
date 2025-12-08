# Graduated Alert System for Virtual Fencing

Implement a humane, graduated alert system for cattle virtual fencing that follows animal welfare best practices: always start with audible warnings (low → high volume), only apply electric shock as a last resort, detect movement direction to differentiate exiting vs entering cattle, and suppress alerts for cattle returning to the safe zone.

## User Review Required

> [!IMPORTANT]
> **Local Storage Design**: This plan proposes storing position history and fence cache locally on the BeagleBone using SQLite. This enables offline operation but requires ~5MB storage per collar per day. Please confirm this is acceptable.

> [!WARNING]
> **Shock Disable Override**: The plan includes automatic shock disabling when cattle show stress indicators (elevated heart rate). This means some cattle may breach the fence without receiving a shock. Confirm this animal welfare priority is acceptable.

---

## Proposed Changes

### Database Schema

#### [MODIFY] [init.sql](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/database/init.sql)

Add `direction` column and `alert_state` to `LocationHistory` for tracking movement direction and alert state history:

```sql
-- Add to LocationHistory table
"direction" VARCHAR(20),          -- 'entering', 'exiting', 'stationary', 'parallel'
"alert_state" VARCHAR(20),        -- 'safe', 'warning_1', 'warning_2', 'breach'
"alert_action_taken" VARCHAR(50)  -- 'sound_low', 'sound_high', 'shock', 'suppressed', 'none'
```

---

### Simulator (BeagleBone)

#### [MODIFY] [beaglebone_vm.py](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/simulator/beaglebone_vm.py)

Major changes to the geofence logic:

1. **Direction Detection Module**: Add `DirectionTracker` class to track position history and calculate movement direction relative to fence boundary using velocity vectors.

2. **Graduated Escalation State Machine**: Modify `check_geofence_status()` to implement proper escalation:
   - Stage 1 (10-15m): Low-volume audible alert
   - Stage 2 (5-10m): High-volume audible alert (only after Stage 1)
   - Stage 3 (<5m or outside): Electric shock (only after Stages 1 & 2)
   - All stages require minimum 5-second dwell time before escalation

3. **Return Path Suppression (Hysteresis)**: If cattle is detected moving back toward safe zone, suppress all alerts regardless of zone. Only re-arm when cattle enters safe zone (>15m from boundary).

4. **Health Stress Override**: Integrate with health monitoring to disable shocks when `heart_rate > 100 BPM` or activity indicates distress.

5. **GPS Accuracy Buffer**: Add dynamic buffer expansion (+5-10m) when position accuracy is low.

#### [MODIFY] [local_database.py](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/simulator/local_database.py)

Add position history and direction tracking tables:

```python
# New tables for geofence tracking
CREATE TABLE IF NOT EXISTS position_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    collar_id INTEGER NOT NULL,
    latitude REAL,
    longitude REAL,
    distance_to_fence REAL,
    alert_state TEXT,
    direction TEXT,
    synced INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS fence_cache (
    id INTEGER PRIMARY KEY,
    fence_id INTEGER,
    polygon_json TEXT,
    cached_at TEXT,
    is_active INTEGER DEFAULT 1
);
```

#### [NEW] [direction_tracker.py](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/simulator/direction_tracker.py)

New module for direction detection:

- `DirectionTracker` class: Maintains sliding window of last 5 positions
- `calculate_direction()`: Determines if cattle is moving toward or away from fence
- `get_velocity_vector()`: Computes movement vector for direction arrow display
- `is_returning()`: Returns true if cattle is moving back toward safe zone

---

### Backend API

#### [MODIFY] [server.js](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/backend/server.js)

1. **Update `/api/collars/data`**: Accept and store new fields (`direction`, `alert_action_taken`)

2. **Update `/api/collars/latest`**: Include `direction` in response

3. **Update `LocationHistory` insert**: Include new fields

---

### Frontend

#### [MODIFY] [LiveMap.js](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/frontend/src/pages/LiveMap.js)

1. **Direction Arrows**: Add directional arrow overlay on markers showing cattle movement direction

2. **Visual Distinction for Outside Cattle**: Special marker style (⚠️ red outline pulsing) for cattle detected outside fence

3. **Suppress Blinking for Entering Cattle**: Only blink/alert icons for cattle exiting (moving toward boundary)

#### [MODIFY] [GeofenceAlertNotification.js](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/frontend/src/components/GeofenceAlertNotification.js)

1. **Outside Detection Notification**: High-priority toast when cattle is detected outside fence with "Cattle Outside Fence" message

2. **Return Notification**: Success toast when cattle returns to safe zone

3. **Direction-Aware Messages**: Show if cattle is "approaching boundary" (exiting) vs "detected outside" (already breached)

#### [MODIFY] [Dashboard.js](file:///f:/Developpement/Projets/Web/Virtual-Fencing---Health-Monitoring-System/frontend/src/pages/Dashboard.js)

1. **Activity Feed Enhancement**: Add direction icons (↗️ exiting, ↙️ entering)

2. **Outside Detection Priority**: Show "Cattle Outside Fence" events with high priority

3. **Return Events**: Log when cattle successfully returns to safe zone

---

## Verification Plan

### Manual Verification

The verification will be performed manually by observing the simulator logs and frontend UI:

1. **Start the system**:
   ```bash
   docker-compose down -v && docker-compose up --build
   ```

2. **Observe simulator logs** for:
   - Direction detection messages (e.g., "Cattle 1001 direction: EXITING")
   - Graduated escalation (warning_1 → warning_2 → breach with delays)
   - Return path suppression ("Alerts suppressed - cattle returning")
   - Health stress override ("Shock disabled - elevated heart rate")

3. **Check frontend LiveMap**:
   - Verify direction arrows appear on cattle markers
   - Verify blinking only occurs for exiting cattle
   - Verify toast notifications differentiate entering vs exiting

4. **Test scenarios**:
   - Cattle approaching boundary: Should see Stage 1 → Stage 2 → Stage 3 with ~5s delays
   - Cattle reversing direction: Should see alerts suppressed
   - Cattle outside fence: Should see "Outside" notification, no alerts on entry

> [!TIP]
> The simulator naturally moves cattle randomly, so breach/warning scenarios will occur periodically. Watch for the graduated escalation in the logs.

# Active Context

## Current Focus
- Graduated Alert System verification and testing
- GeofenceAlertNotification component enhancement for outside detection
- Dashboard activity feed updates for direction events
- Docker rebuild to apply recent changes from walkthrough session

## Recent Changes (2025-12-09 - Walkthrough Session)
### Geofencing Logic Improvements (beaglebone_vm.py)
- "Max Safety" nested fence logic - uses max distance across containing fences
- Intersection handling: No alerts inside any valid fence
- Entering cattle: Silent farmer notification instead of alerts
- New functions: `calculate_polygon_area()`, `point_in_any_fence()`, `get_largest_containing_fence()`

### UI Improvements
- Health Monitor: Decimal formatting, Locate buttons, filter bar
- Live Map: Satellite imagery toggle (Esri World Imagery), URL param zoom (`?collar=123`)
- Navigation: "Locate on Map" buttons in CattleRoster and CollarManagement

### Verified
- Python syntax check passed
- Backend fence filtering (only active fences in sync)

## Recent Changes (2025-12-08)
### Direction-Aware Alerts (beaglebone_vm.py)
- Added `DirectionTracker` class for cattle movement analysis
- Movement directions: `entering`, `exiting`, `stationary`, `parallel`
- Alerts suppressed when cattle is returning to safe zone
- Graduated escalation (never skip stages, 5s delay between levels)
- Shock disabled when cattle stressed (`heart_rate > 100 BPM`)

### Automatic Cattle Spawning
- New cattle spawns every 60 seconds (12 cycles at 5s interval)
- Unique collar IDs assigned starting from 2001, 2002, etc.
- Cattle spawn within defined bounding box (Reghaïa area)

### Multi-Fence Geofencing Fix
- BREACH only if outside ALL fences (not any single one)
- Uses minimum distance across all fences for graduated alerts
- Added error handling for invalid fence geometries

### New Telemetry Fields
- `direction` - cattle movement direction relative to fence
- `alert_action_taken` - actual collar action (sound_low, sound_high, shock, suppressed)
- `heart_rate` - simulated based on activity for stress detection

## Geofence Alert System (Enhanced)
| Alert State | Distance | Collar Action | Direction Check |
|-------------|----------|---------------|-----------------|
| safe | > 15m | Normal | N/A |
| warning_1 | 10-15m | Sound (🔊) | Only if exiting |
| warning_2 | 5-10m | Intense sound (🔊🔊) | Only if exiting |
| breach | < 5m or outside | Shock (⚡) | Disabled if stressed |

## Key Files Modified
- `simulator/beaglebone_vm.py` - Direction tracking, auto-spawn, humane alerts
- `simulator/direction_tracker.py` - New DirectionTracker class
- `backend/server.js` - Handles direction/action fields
- `frontend/src/pages/LiveMap.js` - Direction-aware visualization

## Next Steps
1. **Docker rebuild**: Run `docker-compose down -v && docker-compose up --build` to apply all changes
2. **Verify UI features in browser**: Test Health Monitor filters, Locate buttons, satellite toggle
3. **Observe simulator logs**: Watch for nested fence handling and direction detection
4. **Complete remaining frontend tasks**:
   - Update `GeofenceAlertNotification.js` for outside detection
   - Finish `Dashboard.js` activity feed direction events
5. **Verification testing**: Test graduated escalation, direction detection, return path suppression, offline caching, health stress override
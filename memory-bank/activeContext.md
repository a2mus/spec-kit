# Active Context

## Current Focus
- Buffer zone visualization testing and validation
- Movement trails feature refinement
- Docker compose running with latest changes

## Recent Changes (2025-12-10 - Buffer Zones & Bug Fixes)
### Critical Bug Fix (beaglebone_vm.py)
- Fixed `valid_fence_count` undefined variable in `check_geofence_status_advanced()`
- Bug caused all fence checks to be skipped, triggering false breach alerts for cattle inside fences
- Root cause: `NameError` silently caught by `except Exception:` block

### Buffer Zone Visualization (LiveMap.js)
- Added `@turf/turf` dependency for geographic polygon operations
- Created `createBufferZones()` using `turf.difference()` for ring-shaped zones (donuts, not overlapping fills)
- Zones: Breach (red 0-5m), Warning 2 (orange 5-10m), Warning 1 (yellow 10-15m), Safe (green center)
- Eye toggle button to show/hide buffer zones
- Legend panel showing zone colors and distances

### Movement Trails (LiveMap.js)
- Position history fetched from `/api/collars/position-history?limit=20`
- Dashed polylines connecting historical positions
- CircleMarker dots with opacity fading by age
- Trail segments break when consecutive points >100m apart
- Navigation toggle button to show/hide trails

## Recent Changes (2025-12-09 - Walkthrough Session)
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
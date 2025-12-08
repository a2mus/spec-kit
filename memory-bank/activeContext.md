# Active Context

## Current Focus
- Direction-aware humane alert system with return path suppression
- Automatic cattle spawning every 60 seconds in simulator
- Graduated escalation with stress-based shock prevention
- Multi-fence geofencing with proper inside/outside logic

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
- Verify direction suppression logic in simulator
- Add breach history logging with direction context
- Test stress-based shock prevention with elevated heart rate simulation with direction data
- Consider implementing return path prediction
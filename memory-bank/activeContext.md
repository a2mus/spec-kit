# Active Context

## Current Focus
- Collar registration system implemented
- Cattle management with CRUD operations
- Health monitoring with heart rate and SpO2 sensors
- Activity will be computed server-side (not from collar)

## Recent Changes (2025-12-05)
- Added Collars table with auto-discovery and assignment workflow
- Added Cattle table for herd registry
- Added HealthThresholds table for configurable alert levels
- Backend API extended with cattle CRUD, collar assignment, dashboard summary
- Frontend: new Cattle Roster and Collar Management pages
- Health Monitor updated to display heart rate and SpO2
- Polling-based config delivery: collar receives new ID in POST response

## Collar Registration Flow
1. New collar sends data with ID=9999 (reserved unassigned ID)
2. Backend registers as "discovered" collar
3. Farmer assigns collar to cattle via UI
4. Backend generates unique collar ID (100+)
5. Next collar POST returns pending_config with new_id
6. BeagleBone sends new ID to collar in RX window
7. Collar stores ID in EEPROM for future use

## Next Steps
- Implement activity computation module on backend
- Add collar history/tracking visualization
- Test with real LoRa hardware integration
- Add WebSocket for real-time collar sync status
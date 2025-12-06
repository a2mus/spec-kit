# Active Context

## Current Focus
- BeagleBone simulation script created and verified
- Collar registration flow fully tested end-to-end
- Backend API stabilized for collar discovery and assignment

## Recent Changes (2025-12-06)
- Created `simulator/beaglebone_vm.py` - simulates BeagleBone reading LoRa and posting to backend
- Fixed server.js: pending_config now correctly returned for collar ID 9999
- Fixed server.js: upsert logic for unassigned collar prevents duplicate key errors
- Verified: New collar discovery → Assignment → Config delivery → ID confirmation

## Collar Registration Flow (Verified Working)
1. New collar sends data with ID=9999 (reserved unassigned ID)
2. Backend registers as "discovered" collar, updates last_seen
3. Farmer assigns collar to cattle via UI (`PATCH /api/collars/:id/assign`)
4. Backend generates unique collar ID (100+), stores in `pending_new_id`
5. Next collar POST returns `pending_config: { new_id: 102 }`
6. BeagleBone sends new ID to collar via LoRa RX window
7. BeagleBone confirms via `POST /api/collars/:oldId/confirm-new-id`
8. Backend updates collar_id from 9999 to assigned ID

## Simulation Script Location
`simulator/beaglebone_vm.py` - Run with `python beaglebone_vm.py`

## Next Steps
- Implement activity computation module on backend (ML-based)
- Add collar history/tracking visualization
- Test with real LoRa hardware integration
- Update simulator to continuously stream data for stress testing
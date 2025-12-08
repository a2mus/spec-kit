# Graduated Alert System Implementation

## Overview
Implement a humane, graduated alert system for cattle virtual fencing with direction detection, return path encouragement, and offline capability.

---

## Tasks

### 1. Database Schema Updates
- [x] Add `direction` field to `LocationHistory` table
- [x] Expand `alert_state` options in `Collars` table if needed
- [x] Add migration/update script for existing data

### 2. Simulator (BeagleBone) Enhancements
- [x] Add local position history tracking (SQLite)
- [x] Implement direction detection (entering vs exiting fence)
- [x] Implement graduated escalation logic with time delays
- [x] Implement return path suppression (hysteresis)
- [x] Add health monitoring integration (stress detection disables shocks)
- [x] Add GPS accuracy buffer adjustment
- [x] Add fence cache with offline fallback

### 3. Backend API Updates
- [x] Modify `/api/collars/data` to store direction data
- [x] Add direction field to latest collar endpoint
- [ ] Add endpoint for dynamic buffer adjustments (optional)

### 4. Frontend Updates
- [x] Update `LiveMap.js` markers to show direction arrows
- [ ] Update `GeofenceAlertNotification.js` for outside detection
- [/] Update `Dashboard.js` activity feed for direction events
- [x] Add visual distinction for entering vs exiting cattle

### 5. Verification
- [ ] Test graduated escalation order
- [ ] Test direction detection accuracy
- [ ] Test return path suppression
- [ ] Test offline fence caching
- [ ] Test health stress override

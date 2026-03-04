# Task List: Health Alert Notification System

- [ ] **Backend/API**
    - [ ] (Optional) Add a "mark as read" endpoint for alerts in `server.js`.
- [ ] **Frontend - Logic**
    - [ ] Create `src/hooks/useHealthAlerts.js`.
    - [ ] Implement polling for `/api/activity/alerts`.
- [ ] **Frontend - UI**
    - [ ] Refactor `GeofenceAlertNotification` into a generic `AlertToastManager`.
    - [ ] Add `HealthAlertItem` component for detailed health anomaly display.
    - [ ] Implement a "Recent Alerts" list in the main dashboard sidebar.
- [ ] **Simulator**
    - [ ] Update `simulator.py` to support "Sick Mode" for a random cattle to test health alerts.

# Technical Plan: Health Alert Notification System

## Overview
This plan outlines the integration of backend-detected health anomalies into the frontend UI.

## Phases

### Phase 1: Frontend Infrastructure
- Create a new hook `useHealthAlerts` to poll the `/api/activity/alerts` endpoint every 30-60 seconds.
- Implement a global `AlertContext` to manage both geofence and health alerts in a unified way.

### Phase 2: UI Components
- Update `GeofenceAlertNotification` to handle generic alert objects.
- Add a "Health Dashboard" component that shows a summary of recent health alerts and trends.
- Implement a notification badge on the "Health" tab of the dashboard.

### Phase 3: Simulator Enhancements
- Update `simulator/alert_manager.py` to occasionally trigger health-related anomalies (e.g., simulated "extended lying" by staying in the same position and activity state for too long).

## Verification
- Verify that health alerts appear as toast notifications when the simulator triggers a health anomaly.
- Check that the "Health Dashboard" correctly displays the historical alerts from the API.

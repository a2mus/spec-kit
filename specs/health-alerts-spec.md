# Specification: Health Alert Notification System

## Goal
Provide real-time (or near real-time) visibility into health-related anomalies detected by the system, ensuring the farmer is immediately aware of potential cattle health issues.

## Requirements
- Fetch health alerts from the `/api/activity/alerts` endpoint.
- Integrate these alerts into the existing `GeofenceAlertNotification` component or create a new `HealthAlertNotification` component.
- Support alert types:
    - `extended_lying`: Critical/Warning based on duration.
    - `no_recent_data`: Warning for potential collar failure or animal out of range.
    - `low_confidence_patterns`: Informational/Warning for IMU noise.
- Display severity using color coding:
    - Critical (Red): immediate intervention needed.
    - Warning (Orange): investigation recommended.
    - Info (Blue): general awareness.
- Alerts should persist until dismissed or a new "safe" status is detected.

## UI/UX
- Toast notifications for new alerts.
- A "Health Sidebar" or "Alert History" tab to view all active anomalies.

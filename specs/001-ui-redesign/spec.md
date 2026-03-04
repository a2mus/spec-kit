# Feature Specification: UI Redesign

**Feature Branch**: `001-ui-redesign`
**Created**: 2026-03-04
**Status**: Draft
**Input**: User description: "because the project have already a working ui , give me a prompt to redesign the actual ui while preserving the working fonctionalities instead of الخريطة المباشرة use الخريطة الحية add french"

## Purpose & Business Value
The system currently uses generic, space-consuming dashboard elements that obscure its core geospatial nature. The purpose of this feature is to redesign the User Interface to be "Map-Centric," where the map occupies the primary viewport space. Additionally, this redesign introduces native bilingual support (Arabic default, French secondary) with RTL (Right-to-Left) layout mechanics, improving usability for the target demographic (Algerian farmers) while retaining all existing underlying functionalities (Leaflet map engine, time-series data polling, drawing fences). 

Business value includes higher user engagement, better situational awareness through maximized map views, and localized accessibility for the core user base.

## Functional Requirements
- **FR-001**: The system MUST render the primary data visualization map (e.g., Live Map, Fencing Zones) across the full width and height of the inner viewport (`100vw`/`100vh` equivalent), acting as the canvas background for other components.
- **FR-002**: The system MUST support a global language toggle allowing users to switch between Arabic (ar) and French (fr).
- **FR-003**: When the active language is Arabic, the system MUST apply `dir="rtl"` to the document root, causing the main navigation sidebar to dock to the right side of the screen and text to align right.
- **FR-004**: When the active language is French, the system MUST apply `dir="ltr"` to the document root, causing the main navigation sidebar to dock to the left side of the screen and text to align left.
- **FR-005**: All existing map interactions (real-time marker updates, drawing new geofence polygons, viewing movement trails) MUST remain fully functional.
- **FR-006**: Statistical KPIs (Total Cattle, Active Alerts, Health Score) MUST be displayed in a compact, floating, semi-transparent overlay (HUD) situated over the map, rather than pushing the map down in the document flow.
- **FR-007**: When a cow marker is clicked on the map, the system MUST display the detailed health telemetry (Heart Rate, Temp, SpO2 trends) in a floating contextual card near the marker or on the screen edge, rather than navigating away from the map.
- **FR-008**: The navigation menu MUST use the translated terms provided: لوحة التحكم (Tableau de bord), الخريطة الحية (Carte en direct), مراقبة الصحة (Suivi de santé), مناطق السياج (Zones de clôture), قائمة الماشية (Registre du bétail), الإعدادات (Paramètres).

## User Scenarios & Testing *(mandatory)*
- **Scenario 1: Language Switch**
  - **Given** a user is logged into the dashboard with the default Arabic setting
  - **When** the user clicks the language toggle to "FR"
  - **Then** all textual elements translate to French, the sidebar instantly snaps from the right edge to the left edge, and the text alignment shifts to Left-to-Right.
- **Scenario 2: Contextual Map Data**
  - **Given** a user is viewing the "الخريطة الحية" (Live Map)
  - **When** the user clicks on a specific cow marker demonstrating a "Warning" state
  - **Then** a floating card appears over the map displaying the cow's recent Health trend charts without forcing the user to leave the map view.
- **Scenario 3: Preserved Fencing Logic**
  - **Given** a user is viewing the "مناطق السياج" (Fencing Zones)
  - **When** the user uses the polygon draw tool to create a new fence and saves it
  - **Then** the polygon is successfully saved to the backend and rendered immediately on the map, confirming that existing Leaflet integration was not broken by the new CSS overlays.

## Success Criteria
- **SC-001**: 100% of the core navigation items and static dashboard text successfully pivot between Arabic and French without layout breakages.
- **SC-002**: Map visibility area increases significantly (e.g., from ~60% of viewport height to 100% of viewport height).
- **SC-003**: Zero regressions in the existing data polling: cow markers still update every 5 seconds.
- **SC-004**: Zero regressions in existing map interactions: users can still draw and edit polygons via Leaflet draw controls.

## Out of Scope
- Rewriting the backend API endpoints.
- Migrating the database schema.
- Implementing new machine learning analytics.
- Introducing a third language natively (e.g., English) beyond FR/AR for this specific release.

## Assumptions
- The existing React architecture can support `react-i18next` for translation management.
- The existing `react-leaflet` implementation can be styled via CSS to behave as a fixed background canvas.

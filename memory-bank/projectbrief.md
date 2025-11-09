# Project Brief

Virtual Fencing & Health Monitoring System that enables drawing virtual fences on a map, simulating cattle collar telemetry, ingesting and storing time-series health/location data, and visualizing recent collar states.

## Core Scope
- Draw and persist virtual geofences.
- Ingest collar telemetry (location, battery, temps, activity, orientation).
- Store data efficiently with TimescaleDB for time-series queries.
- Display latest collar positions and status on a map UI.

## Users
- Farm managers and researchers monitoring herd movement and health.

## Deliverables
- Backend API (Express) for fences and telemetry ingestion.
- Frontend (React + Leaflet) for drawing and monitoring.
- Database schema (TimescaleDB) for fences and location history.
- Simulator script to generate realistic collar payloads.
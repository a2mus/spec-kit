# Active Context

## Current Focus
- Map drawing fixed via native Leaflet Draw; ensure geofence creation works end-to-end.
- Confirm frontend posts fences to backend and re-fetch shows saved polygons.
- Keep telemetry polling responsive while pausing during drawing interactions.

## Recent Changes
- Switched from wrapper to native `L.Control.Draw` using `useMap`.
- Added `leaflet-draw` JS import to register the Draw control.
- Rebuilt frontend container and verified no browser errors in preview.
- Database and backend remain healthy under Docker Compose.

## Next Steps
- Add UI feedback for fence save success/failure.
- Implement edit/delete flows and sync edits to backend endpoints.
- Surface fence names and timestamps in the UI list.
- Review Compose file to remove obsolete `version` key warning later.
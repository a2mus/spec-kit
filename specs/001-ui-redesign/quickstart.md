# Quickstart: UI Redesign

To run the UI Redesign locally:

1. Ensure Docker is running.
2. Build and start the compose stack:
   ```bash
   docker-compose up -d --build
   ```
3. Navigate to `http://localhost:3000` (assuming default frontend port).
4. **Language Testing**: Use the global navigation toggle to switch between `AR` and `FR` to verify the RTL/LTR layout flips.
5. **Map Interactions**: Verify that drawing a fence polygon on the "مناطق السياج" screen saves correctly without layout jumping.

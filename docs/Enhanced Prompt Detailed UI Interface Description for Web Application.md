### Enhanced Prompt: Detailed UI Interface Description for Web Application

**Prompt for AI IDE:**  
Create a responsive web application using modern frameworks like React.js for the frontend, Node.js/Express for the backend, and PostgreSQL with PostGIS for spatial data storage (as referenced in system architecture documents). The app manages and tracks cattle via a virtual fencing and health monitoring system, integrating GPS-enabled collars, biosensors, cloud-based analytics, and real-time alerts. Ensure the UI is intuitive for farmers, with a clean, modern design using a color scheme of earth tones (greens, browns, blues) for an agricultural feel. Implement role-based access (e.g., admin/farmer views). Include interactive elements like drag-and-drop for boundary creation, real-time updates via WebSockets/MQTT, and data visualizations using libraries like Leaflet for maps, Chart.js for graphs, and Material-UI for components.

The application logic should handle:
- Authentication: JWT-based login/register.
- Data Fetching: API endpoints for real-time GPS data, health metrics, alerts.
- Interactions: Real-time polling (every 10-30 seconds) for updates; error handling for offline collars or GPS signal loss.
- Security: HTTPS, input validation, role-based permissions.
- Responsiveness: Mobile-friendly design for field use.

Below is a very detailed UI interface description, broken down by key screens/pages. For each screen, describe the layout, components, user interactions, and logic flows. Where relevant, include placeholders for images (e.g., from searched references) to illustrate concepts—the AI IDE should generate similar visuals or integrate stock images if needed.

#### 1. Login/Register Screen
- **Layout:** Full-screen centered card with background image of a pastoral farm landscape (fade to overlay). Top: App logo ("CattleGuard Pro") and tagline ("Smart Virtual Fencing & Health Monitoring"). Bottom: Footer with links to "Privacy Policy" and "Contact Support".
- **Components:**
  - Email/Username input field (required, email validation).
  - Password input (with show/hide toggle, min 8 chars).
  - "Login" button (primary green color, disabled until fields valid).
  - "Forgot Password?" link (triggers modal for email reset).
  - "Register" tab/switch (swaps to registration form with additional fields: Full Name, Farm Name, Phone Number).
  - Social login options (Google/Facebook) for quick farmer signup.
- **Interactions & Logic:**
  - On submit: Validate inputs client-side; POST to /api/auth/login endpoint. On success, redirect to Dashboard and store JWT in localStorage.
  - Error handling: Display red toast notifications (e.g., "Invalid credentials") using a library like react-toastify.
  - Register flow: Similar POST to /api/auth/register; auto-login on success.
- **Illustrative Image:** Reference a simple login UI for farm apps.




#### 2. Dashboard Overview Screen
- **Layout:** Sidebar navigation on left (collapsible on mobile: Home, Map/Fencing, Health Monitoring, Alerts, Herd Management, Reports, Settings, Logout). Header: User avatar, farm name dropdown (for multi-farm support), search bar for quick cattle ID lookup, notification bell (with badge count). Main content: Grid of cards/widgets for quick insights.
- **Components:**
  - **Summary Cards:** 4-6 metric cards (e.g., "Total Cattle: 150" with icon of cow; "Active Alerts: 3" with warning icon; "Battery Low Collars: 5%" with battery gauge; "Containment Rate: 99.3%" based on NoFence data from sources).
  - **Recent Activity Feed:** Scrollable list of events (e.g., "Cow #45 crossed boundary at 10:15 AM" with timestamp and link to map).
  - **Quick Stats Chart:** Line chart showing daily grazing hours (from solar-powered collar data, referencing 700M+ hours in sources) over the past week.
  - **Herd Status Pie Chart:** Breakdown of health statuses (Healthy: 80%, Monitoring: 15%, Critical: 5%) using biosensor data.
- **Interactions & Logic:**
  - Cards clickable to drill down (e.g., click "Active Alerts" to navigate to Alerts page).
  - Real-time updates: Use WebSockets to push new events to the activity feed without refresh.
  - Search: Filter cattle by ID/name; on enter, redirect to individual cattle profile.
  - Logic: Fetch data on mount via GET /api/dashboard/summary; poll every 30s for updates.
- **Illustrative Image:** Reference a livestock monitoring dashboard.




#### 3. Map View for Virtual Fencing Screen
- **Layout:** Full-width interactive map as main content. Toolbar on top for tools (e.g., draw boundary, edit zones, zoom controls). Right sidebar for selected boundary details or cattle list.
- **Components:**
  - **Interactive Map:** Leaflet.js map with Google Maps integration (as in NoFence sources). Overlay: Virtual boundaries as polygons (editable via drag-and-drop vertices); Real-time cattle markers (icons with IDs, color-coded by status: green=inside, yellow=near boundary, red=breached).
  - **Boundary Tools:** Buttons for "Create New Boundary" (polygon draw mode), "Exclusion Zone" (red shaded areas), "Buffer Zone" (15-20m auto-generated buffers from GPS accuracy docs).
  - **Cattle List Panel:** Table with columns (ID, Location, Status, Battery). Filterable/searchable; click row to center map on that cattle.
  - **Zoom/Search:** Search by address/coords to set farm center; layers toggle (satellite/terrain view).
- **Interactions & Logic:**
  - Draw boundary: Enter draw mode, click to add points, double-click to close polygon; save to backend via POST /api/boundaries/create (store as GeoJSON).
  - Real-time tracking: WebSockets push GPS updates; if breach detected (based on boundary checking algo), trigger audio/electric stimulus log and alert.
  - Handle GPS errors: Display warning overlays in rugged terrain areas (from environmental factors docs).
  - Logic: GET /api/map/data on load; subscribe to MQTT for live positions.
- **Illustrative Image:** Reference a GPS tracking map UI.




#### 4. Health Monitoring Dashboard Screen
- **Layout:** Tabbed view (Overview, Individual Cattle, Analytics). Main grid with charts and tables.
- **Components:**
  - **Overview Tab:** Heatmap of herd health (color-coded by anomaly detection); Bar chart for average metrics (temp, heart rate, activity) over time.
  - **Individual Cattle Tab:** Dropdown to select cattle ID; Display cards for current readings (Body Temp: 38.5°C with gauge; Heart Rate: 70 bpm; Activity Level: Normal). Timeline graph for 24h history.
  - **Analytics Tab:** Custom reports (e.g., rumination patterns via accelerometers); Anomaly alerts table (e.g., "High Temp Detected" with timestamp, severity).
  - **Sensor Status:** List of collars with health sensor data (integrate biosensors like temp, HR from docs).
- **Interactions & Logic:**
  - Select cattle: Fetch GET /api/health/:id; render charts with Chart.js.
  - Anomaly detection: Backend ML model flags issues (e.g., high cortisol from welfare docs); push notifications.
  - Export: Button to download CSV/PDF reports.
  - Logic: Real-time via WebSockets; threshold-based alerts (e.g., temp >39°C triggers red highlight).
- **Illustrative Image:** Reference a livestock health monitoring interface.




#### 5. Alerts and Notifications Screen
- **Layout:** Full-page table with filters; Modal for alert details.
- **Components:**
  - **Alerts Table:** Columns (Type: Boundary Breach/Health Issue; Cattle ID; Time; Severity: Low/Med/High; Status: Open/Resolved). Pagination and sort.
  - **Filters:** Dropdowns for type, date range, severity.
  - **Notification Settings:** Toggle switches for email/SMS/push alerts.
  - **Map Integration:** Click alert to open mini-map showing location.
- **Interactions & Logic:**
  - Mark as resolved: PATCH /api/alerts/:id/resolve; update table in real-time.
  - Auto-refresh: Poll every 10s for new alerts.
  - Logic: GET /api/alerts; integrate with risk analysis (e.g., GPS loss alerts).
- **Illustrative Image:** Reference a farm alerts dashboard.




#### 6. Herd Management Screen
- **Layout:** Table-centric with add/edit modals.
- **Components:**
  - **Herd Table:** Columns (ID, Breed, Age, Collar ID, Last Location, Health Status). Search/filter by breed/age (from variability docs).
  - **Add Cattle Button:** Modal form (ID, Breed, Assign Collar, etc.).
  - **Bulk Actions:** Select multiple for group assignment to boundaries.
- **Interactions & Logic:**
  - Edit: Inline editable rows or modals; POST /api/herd/update.
  - Logic: Sync with fencing/health data; validate collar assignments.

#### 7. Reports and Settings Screens
- **Reports:** Custom date-range selector; Generate charts/tables for grazing hours, welfare metrics (cortisol stability from sources). Export options.
- **Settings:** User profile edit, subscription management (reference SuperGrok plans), API integrations, theme toggle (light/dark).
- **General Logic:** All pages include loading spinners, error modals, and accessibility (ARIA labels).

This description is comprehensive and self-contained for the AI IDE to implement the full app, drawing from system specs like solar collars, GPS accuracy, welfare considerations, and NoFence-inspired features. If needed, expand with wireframes or Figma prototypes.
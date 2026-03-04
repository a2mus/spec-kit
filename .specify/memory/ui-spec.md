# UI Specification: Virtual Fencing & Health Monitoring System

**Generated**: 2026-03-04
**Version**: 1.0.0
**Companion**: product-spec.md

## 1. Core UX Principles
1. **Map-Centric**: The system is geospatial by definition. The map must be the absolute center of attention, filling the viewport. All other data (statistics, alerts, controls) must exist as transparent or floating overlays *above* the map, not pushing it down.
2. **Functional UI**: No purely decorative dashboards. Forms, buttons, and cards must actively filter, locate, or toggle data on the map or in the backend. 
3. **Bilingual RTL-First**: The UI defaults to Right-to-Left (Arabic) but fully supports Left-to-Right (French) via a global toggle.

## 2. Design System

### 2.1 Color Palette
- **Background Base**: `#121826` (Deep Navy / Carbon for dark mode panels)
- **Surface (Glassmorphism)**: `rgba(18, 24, 38, 0.7)` with `backdrop-filter: blur(12px)`
- **Border/Divider**: `rgba(255, 255, 255, 0.1)`
- **Primary Accent / Safe**: `#10B981` (Emerald Green - Safe zones, Healthy status)
- **Warning 1**: `#FBBF24` (Amber - 10-15m from boundary)
- **Warning 2**: `#F97316` (Orange - 5-10m from boundary)
- **Critical / Breach**: `#EF4444` (Ruby Red - Breach, Critical health alerts)
- **Text Primary**: `#F8FAFC` (Off-white)
- **Text Secondary**: `#94A3B8` (Slate gray)

### 2.2 Typography
- **Primary Font**: `Cairo` or `Tajawal` (optimised for Arabic legibility and modern Latin text).
- **Fallback**: `Inter` or `system-ui`.
- **Base Size**: 16px (scalable for accessibility).

### 2.3 Visual Style
- **Glassmorphism**: Heavy use of blurred, semi-transparent backgrounds for cards and sidebars to ensure the map underneath is never fully obscured.
- **Corners**: Rounded (e.g., `8px` to `12px` border radius).
- **Shadows**: Soft, deep shadows (`0 8px 32px rgba(0, 0, 0, 0.3)`) to lift floating elements off the map canvas.

## 3. Bilingual Dictionary & Layout Toggles

| Feature / Element | Arabic (RTL Default) | French (LTR Mode) |
|-------------------|----------------------|-------------------|
| **Dashboard** | لوحة التحكم | Tableau de bord |
| **Live Map** | الخريطة الحية | Carte en direct |
| **Health Monitor** | مراقبة الصحة | Suivi de santé |
| **Fencing Zones** | مناطق السياج | Zones de clôture |
| **Cattle Roster** | قائمة الماشية | Registre du bétail |
| **Settings** | الإعدادات | Paramètres |
| **Total Cattle** | إجمالي الماشية | Bétail total |
| **Active Alerts** | تنبيهات نشطة | Alertes actives |
| **Health Score** | درجة الصحة | Score de santé |

**Layout Shift Rule**: 
- When Arabic is selected: `dir="rtl"`. Sidebar docks to the **Right**. Text aligns Right. Icons lead on the Right.
- When French is selected: `dir="ltr"`. Sidebar docks to the **Left**. Text aligns Left. Icons lead on the Left.

## 4. Screen Specifications

### 4.1 Global Skeleton (Applies to all map-based views)
- **Canvas**: Full-screen `react-leaflet` map spanning `100vw` and `100vh`.
- **Sidebar**: Fixed, slim vertical bar (docked based on language dir). Contains only icons by default, expands on hover to show text labels.
- **Top Bar**: Floating glass panel spaced 16px from the top edge. Contains:
  - Global Search (searches cattle IDs or Fence paths).
  - Language Toggle (AR / FR button).
  - Notifications Bell (with unread badge).
  - User Profile dropdown.

### 4.2 The Command Center (Main Dashboard / Live Map)
Because the map is central, the "Dashboard" and current "Live Map" merge visually into a single powerful interface.

#### Overlay 1: The KPI HUD (Heads-Up Display)
- **Position**: Top Center, floating just below the Top Bar.
- **Structure**: A single, wide, horizontal glass card divided into 4 segments, replacing the massive colored blocks from the old UI.
  - **Segment A**: Total Cattle (e.g., 8 Units, 7 Active / 1 Offline).
  - **Segment B**: Active Alerts (e.g., 2 Critical, 1 Warning). *Clicking this filters the map to only show alert cows.*
  - **Segment C**: Herd Activity Ratio (e.g., 80% Grazing, 20% Resting).
  - **Segment D**: Global Health Score (e.g., 9.2/10).
- **Click Actions**: Clicking any segment acts as a quick filter for the map below it.

#### Overlay 2: Recent Activity Feed
- **Position**: Bottom corner (Opposite side of the sidebar).
- **Structure**: Vertical glass card, max-height 300px, scrollable.
- **Content**: Real-time event log (e.g., "Collar #1001 breached Alpha Fence", "Collar #2004 temp dropping").
- **Action**: Clicking an event instantly pans and zooms the map (`flyTo`) to the associated cow or fence.

#### Overlay 3: Contextual Biomterics Card
- **Trigger**: Clicks a Cow Icon on the map.
- **Position**: Floating near the clicked cow (or fixed to the screen edge if screen is small).
- **Structure**: 
  - Header: Cow ID, Status (Safe/Warning/Breach), Battery %.
  - Body: Mini Chart.js sparklines showing last 2 hours of HR, SpO2, and Temp.
  - Footer: "View History" button navigating to the full Health Monitor page.

#### Map Layer Controls
- **Position**: Bottom corner (Sidebar side).
- **Actions**: Floating buttons to toggle Satellite/Street view, show/hide Buffer Zones (visual rings), and show/hide Movement Trails.

### 4.3 Fencing Zones Page
- retains the full map background.
- **Sidebar Panel**: A wide glass panel slides open containing the drawn fences list.
- **Functional UI**: Clicking a fence in the list focuses the map on that polygon. Toggling the "Active" switch immediately changes the polygon style on the map (e.g., Solid Green = Active, Dashed Gray = Inactive) and sends the PATCH request to the backend.
- **Drawing Tools**: The Leaflet draw controls remain visible and functional for creating new zones.

### 4.4 Health Monitor & Cattle Roster Pages
- For heavy data-table views, the map can blur out or shift to a 30% background opacity.
- **Tables**: Use standard data tables with sticky headers. 
- **Actions**: Every row must have a "Locate" button (📍) that immediately drops the user back to the Live Map view focused on that specific animal.

## 5. Responsive Strategy
- **Desktop (>1024px)**: Full glassmorphism HUD, expanded sidebar.
- **Tablet (768px - 1024px)**: Sidebar defaults to icon-only. KPI HUD shrinks font sizes or stacks 2x2.
- **Mobile (<768px)**: 
  - Sidebar becomes a bottom navigation bar. 
  - Top Bar and KPI HUD collapse into a single "Summary" button that opens a bottom sheet. 
  - Map takes absolute priority for touch interactions.

## 6. Implementation Notes for Developer
- **Tailwind Integration**: Modify the existing `backend`/`frontend` React structure to use Tailwind CSS for the glassmorphism (`backdrop-blur-md bg-white/10` or similar).
- **i18n**: Integrate `react-i18next` to handle the AR/FR string translations and dynamic `dir` attribute injection on the `html` tag.
- **Map Focus**: Ensure the `MapControls.js` component is cleanly untethered from rigid DOM flows so it can float over the map tiles.

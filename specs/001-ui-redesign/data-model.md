# Phase 1: Data Model (UI Redesign)

Since the UI Redesign does not change the core backend relational models, this document specifies the **Frontend Application State Model** required to manage the new HUD, language toggles, and contextual alerts.

## 1. Global UI Context (`UIContext.tsx` or similar)

```typescript
interface GlobalUIState {
  language: 'ar' | 'fr';
  direction: 'rtl' | 'ltr';
  activeFilter: 'all' | 'alert' | 'warning';
  selectedCowId: string | null;
}
```

## 2. Cow Selection Contextual Data
When `selectedCowId` is active, the frontend must fetch or derive the following from the existing Redux/API state to display the floating card:

```typescript
interface CowContextCard {
  cowId: string;
  status: 'safe' | 'warning' | 'breach';
  batteryPct: number;
  recentTelemetry: {
    timestamps: string[];
    heartRate: number[];
    temperature: number[];
    spO2: number[];
  }
}
```

## 3. KPI HUD State
The 4-segment floating HUD aggregates data from the raw telemetry stream:
- `totalCattle`: Length of known active devices array.
- `activeAlerts`: Count of devices where `status === 'breach' || status === 'warning'`.
- `healthScore`: Averaged synthetic score based on standard deviations from normal vitals across the herd.

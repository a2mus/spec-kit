# Product Specification: Virtual Fencing & Health Monitoring System

**Generated**: 2026-03-04
**Version**: 1.0.0

## 1. Executive Summary
The Virtual Fencing & Health Monitoring System is evolving from a single-farm prototype into a production-grade, multi-tenant SaaS platform. Built on top of its existing robust IoT infrastructure (BeagleBone + LoRa + TimescaleDB), the platform empowers farmers and administrators to manage virtual fences, monitor cattle location and health in real-time, and analyze historical data across multiple herds. The expansion prioritizes comprehensive analytics, reliable multi-channel notifications (including local Algerian SMS via Sobersys), and scalable multi-tenancy.

## 2. Problem Statement
Managing cattle across open grazing areas is labor-intensive and lacks real-time visibility. Traditional physical fences are expensive and inflexible. Furthermore, detecting health issues (like fever or stress) or battery depletion in monitoring collars currently relies on manual observation or lacks historical trend analysis. Without automated alerts and aggregate analytics, farmers may miss critical events, leading to delayed interventions or lost equipment.

## 3. Target Audience
- **System Administrators**: Manage the platform infrastructure, oversee global statistics across all herds, and ensure system uptime.
- **Farmers / Herd Managers (Users)**: Day-to-day users who define fences, monitor their specific cattle's health and location, review historical analytics, and receive critical alerts.

## 4. Product Type & Platform
- **Type**: Web Application (SaaS Platform) with Edge IoT Integration
- **Target Platforms**: Responsive Web Application (optimized for Desktop and robust enough for field use on Mobile)
- **Architecture**: Multi-tenant distributed architecture (Edge Device -> Node.js Backend -> TimescaleDB -> React Frontend).

## 5. Functional Requirements

### 5.1 Core Features
1. **Advanced Analytics & Reports**:
   - Health trend charts (Body temp, HR, SpO2) over time (hourly/daily/weekly).
   - Geofence breach history and heatmap visualization over time.
   - Battery drain curves, collar uptime %, and last-seen gap reporting.
   - Aggregate herd activity patterns and movement intensity ratios.
   - Custom date range picker for all charts and tables.
   - Comparison views (e.g., compare two animals or two time periods).
   - Exportable periodic summaries and reports (PDF/CSV).
2. **Comprehensive Notification System**:
   - **Channels**: In-app notifications (bell icon + dropdown), SMS alerts (via Sobersys API), and Web Push notifications.
   - **Triggers**: 
     - Geofence breach (already detected via simulator)
     - Health anomaly (out of range thresholds for temp, HR, SpO2)
     - Low battery warning
     - Collar offline (no data for X minutes)
     - New collar discovered (ID 9999)
     - Daily/weekly summary digests
3. **Multi-Tenancy & Authentication**:
   - Authentication via Email + Password and Google OAuth2.
   - Role-Based Access Control (Admin / User).
   - Full multi-tenant model allowing global statistics for Admins and isolated farm data for Users.

### 5.2 Secondary Features
- Automated Edge device (collar) configuration and auto-discovery.
- Offline-resilient edge buffering (on BeagleBone).

### 5.3 Feature Prioritization (MoSCoW)
| Feature | Priority | Rationale |
|---------|----------|-----------|
| **Multi-Tenancy & Auth** | Must Have | Foundational for onboarding real users and securing farm data. |
| **Multi-Channel Notifications** | Must Have | Immediate SMS/Push alerts are critical for breach and illness response. |
| **Core Analytics (Health, Battery)** | Must Have | Transforms raw telemetry into actionable insights. |
| **In-App Notifications** | Should Have | Enhances the active dashboard experience. |
| **Advanced Analytics (Comparisons)** | Should Have | Deepens product value but isn't critical for initial release. |
| **Exportable Reports (PDF/CSV)** | Could Have | Useful for record-keeping and veterinary visits. |
| **Automated Digests** | Could Have | Keeps farmers engaged passively. |

## 6. Technical Decisions

### 6.1 Technology Stack
| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | React 18, Chart.js, date-fns | Builds on existing robust foundation; open-source and free. |
| **Backend** | Node.js, Express, node-cron | Existing lightweight API with scheduled jobs for digests. |
| **Database** | TimescaleDB (PostgreSQL 14) | Excellent for time-series telemetry; native analytical functions. |
| **Auth** | Passport.js (JWT + Google OAuth2) | Free, open-source, avoids external vendor lock-in. |
| **Multi-Tenancy**| PostgreSQL RLS (Row-Level Security) | Efficient data isolation within a shared database (`farm_id`). |
| **Notifications (In-App)** | PostgreSQL LISTEN/NOTIFY + SSE | Real-time updates without heavy message brokers. |
| **Notifications (Push)** | Web Push API + Service Worker | Free, open-source browser standard. |
| **Notifications (SMS)** | Sobersys REST API | Cost-effective local provider for Algeria (~5-8 DZD/SMS); Fallback: eliteSMS. |
| **Exports** | PDFKit + json2csv | Free, lightweight Node.js libraries. |

### 6.2 Data Architecture
- **Storage**: Self-hosted PostgreSQL with TimescaleDB extension.
- **Analytics DB Capabilities**: Utilize `time_bucket()` and materialized continuous aggregates for performant dashboard queries.
- **Isolation**: `tenant_id` (or `farm_id`) enforced via RLS across all relevant tables.

### 6.3 Authentication & Authorization
- **Method**: JWT-based stateless session management.
- **Roles**: 
  - `Admin`: Global access across all herds (useful for system-wide stats).
  - `User`: Restricted strictly to their own farm's data.

### 6.4 Deployment & Infrastructure
- **Hosting**: Docker Compose on VPS (e.g., 207.180.251.82).
- **CI/CD**: GitHub Actions (planned).
- **Scale Target**: Medium scale (up to 10k users/collars).

## 7. Non-Functional Requirements
- **Performance**: High ingestion throughput required; dashboard charts must load in < 2 seconds for 30-day aggregations.
- **Security**: Strict tenant data isolation via RLS; secure JWT handling; HTTPS transmission.
- **Reliability**: SMS delivery fallback mechanisms; reliable edge-to-cloud sync.
- **Maintainability**: Clear separation of concerns; extensive use of free/open-source libraries.

## 8. Constraints & Assumptions
- Operational target includes Algerian farmers (primary driver for choosing Sobersys for SMS).
- Strong adherence to free and open-source solutions where possible to minimize operational costs.
- Requires reliable backend uptime to process incoming BeagleBone telemetry and webhooks.

## 9. Success Metrics
- Successful notification delivery rate > 95%.
- Analytics dashboard queries complete under SLA (< 2s).
- Seamless onboarding of new tenant farms without data leakage.

## 10. Out of Scope
- Fully Native Mobile App (iOS/Android) — relying on responsive web/PWA for now.
- Advanced Server-side Machine Learning classification (deferred to future ML phase).
- UI/UX layout specifics (to be defined in `ui-spec.md`).

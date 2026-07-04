# Scenario Builder Platform

**Author:** Netcompany — Research & Innovation Development  
**Date:** 03/03/2026

---

## Overview

The Scenario Builder Platform is a reusable, real-time training and assessment frontend designed to address recurring integration and user-experience challenges across scenario-based learning environments. Rather than building isolated training UIs per project, the platform provides a modular and reusable architecture that serves as a digital backbone adaptable across training domains—from incident response exercises to assignment tracking and cohort analytics.

---

## Context & Challenge

Across training and operational environments, the following challenges were consistently encountered:

- **Fragmented and siloed training tools** — scenario catalogues, exercise flows, and analytics scattered across disconnected systems or spreadsheets
- **Heterogeneous scenario types and backend services** — diverse scenario structures, grading engines, and identity providers requiring unified integration
- **Real-time exercise and decision requirements** — time-bound incident flows demanding countdown timers, draft persistence, and immediate submission on completion or expiry
- **Need for scalability and operational reliability** — growing numbers of users, assignments, and scenarios requiring a consistent, fault-tolerant frontend that works with existing APIs

*"Instead of building isolated integrations per project, we designed a modular and reusable platform architecture."*

---

## Platform Capabilities

The platform delivers the following core capabilities:

- **Integrates heterogeneous data sources** — backend API for scenarios, assignments, and analytics; Keycloak for identity and access
- **Enables real-time exercise workflows** — scenario selection → create assignment → incident-by-incident flow with timer, draft save, and submit
- **Supports monitoring, analytics, and reporting** — assignment lists with overall scores, per-assignment grade breakdowns, user and cohort analytics with percentile ranking and PDF export
- **Secure-by-design architecture** — identity-based access (Keycloak login-required, PKCE S256), Bearer token injection and refresh on every API request
- **Operates across training and pilot environments** — configurable Keycloak realm and API base; simulation mode for focused exercise UX
- **Scales with backend capacity** — stateless SPA; state and resume logic in browser (localStorage) and server-side data via REST API

---

## Technology Stack

### Infrastructure & Operations

- **Build & dev:** Vite 7, React 19, ES modules; dev server with `--host` for Docker and network access
- **Container:** Docker (Node base image); copy-and-run for dev server
- **Quality:** ESLint 9 (flat config), Prettier; React StrictMode in production bundle

### Integration & Ingestion

- **HTTP client:** Axios instance with configurable base URL; single `api_client.js` used across the app
- **Identity:** Keycloak (keycloak-js); configurable URL, realm, and clientId; login-required, PKCE S256
- **API surface:** REST endpoints for scenarios, create assignment, solve, user assignments, assignment details, and user analytics

### State & Exercise Flow

- **Routing:** react-router-dom v7; routes for Home, Start Exercise, My Assignments, User Analytics
- **Application state:** React useState; no global store; `simulationMode` in App with localStorage sync
- **Exercise state:** Current exercise, incident index, and draft answers; persisted in localStorage (`exerciseState`, `exerciseDraft`) for resume across refresh or disconnect

### Processing & Data Pipelines

- **Exercise lifecycle:** Create assignment (POST) → store response → incident loop (next/confirm, draft save) → submit (POST solve) or auto-submit on timer expiry
- **Token handling:** Request interceptor calls `keycloak.updateToken(30)` and attaches `Authorization: Bearer`; response interceptor handles 401
- **Draft and answers:** Per-incident draft saved on change; “Next” persists `expected_actions` into exercise state and localStorage

### Storage & Analytics

- **Client-side:** localStorage for exercise state and draft; no local DB
- **Server-side data:** Scenarios, assignments, and analytics fetched via API; grading and cohort data from backend
- **Analytics logic:** jstat for normal distribution (CDF/PDF) in CumulativePercentile; Recharts for bar and pie charts; grade-per-incident and percentile ranking

### Applications & Interfaces

- **Shell:** NavBar (Flowbite), SideBar with route links (Home, Start Exercise, My Assignments, User Guide, User Analytics); main content area; simulation mode hides shell for full-screen exercise
- **Scenario & assignment tables:** AG Grid (ag-grid-react) with filters, pagination, and custom cell renderers (Start Simulation, Details, Progress bar)
- **Exercise UI:** IncidentCard (title, timestamp, description, inject), Flowbite Textarea, ClockCountDown (days/hours/min/sec), SweetAlert2 for confirmations and loading
- **Analytics UI:** BarChartGrades (Recharts), PiechartComparison (completed vs total scenarios), CumulativePercentile (SVG normal curve and percentile band), react-to-pdf for user and assignment reports
- **Styling:** Tailwind CSS 3, PostCSS, Autoprefixer, DaisyUI plugin, Flowbite React components, component-level CSS files

---

## Validation Across Domains

The platform has been validated in operational environments across multiple domains using the same core architecture.

### Exercise Execution & Scenario-Based Training

- Real-time scenario and incident data ingestion from the backend API
- Step-by-step incident response workflows with countdown timers and decision-support (confirm next step, save draft)
- Scenario selection (AG Grid), incident cards and injects, and automated submission on completion or time expiry
- Deployment in training and pilot environments with Keycloak-secured access
- Resume-from-localStorage for in-progress exercises across sessions

### Assignment Tracking & Assessment Analytics

- Integration of assignment history and per-attempt grading
- Secure, token-based API access for assignment list and detailed results
- Grade-per-incident comparison, overall score progress bars, and validation analytics
- Support for trainers and trainees viewing assignment details and analytics
- Per-assignment PDF export for reporting and review

### User Analytics & Cohort Reporting

- User and cohort performance data integration (assignments analytics API)
- Completion and performance monitoring (completed vs. total scenarios, percentile ranking)
- Interoperable data exchange with backend APIs and consistent auth (Keycloak + Bearer token)
- Support for decision-making on training effectiveness and individual progress
- User-level PDF export for portfolios or reviews

---

## Strategic Value

The Scenario Builder Platform delivers significant strategic advantages:

- **Reduces technical reinvention across projects** — Reusable React components (Flowbite, AG Grid, Recharts), shared API client, and a single auth model (Keycloak) can be extended to new scenario types or clients without rebuilding from scratch.
- **Builds reusable intellectual property** — Core flows (scenario list → create assignment → incident loop → submit → analytics) and UI patterns (tables, charts, PDF export) form a consistent IP base for future training products.
- **Strengthens EU leadership credibility** — A single, coherent frontend for scenarios, assignments, and analytics demonstrates capability to deliver end-to-end training solutions.
- **Positions Netcompany as platform architects** — Not only system integrators: the same SPA architecture, routing, and state/resume logic apply across exercise types and domains.
- **Accelerates onboarding of future pilots and clients** — New scenarios or realms can be added via backend and configuration; the frontend adapts through existing APIs and components.
- **Improves consistency in security and compliance** — Centralised Keycloak integration, token refresh, and a single API client reduce auth drift and simplify audit and compliance alignment.

*"Transforms project execution capability into strategic digital leverage."*

---

## What This Demonstrates

The platform goes beyond project participation to demonstrate:

- **Production-ready digital architectures** — React 19, Vite 7, and a clear separation of auth, API, routing, and components support maintainable and deployable (including Docker) frontends.
- **Cross-domain reusable solutions** — The same frontend serves scenario browsing, exercise execution, assignment management, and user/cohort analytics across different training use cases.
- **Secure and compliance-aware system design** — Keycloak with login-required and PKCE, Bearer token injection and refresh, and a single point of configuration for identity and API base.
- **Innovation translated into operational environments** — Timed exercises, draft persistence, percentile and comparison charts, and PDF export show features designed for real training and assessment workflows.
- **Solutions validated beyond laboratory level** — Integration with a live backend API, role-aware assignment views, and analytics endpoints indicate validation in environments beyond proof-of-concept.

*"We are building scalable digital foundations."*

---

*For detailed technical implementation and component reference, see TECHNICAL_DOCUMENTATION.md.*

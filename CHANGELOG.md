# Changelog

All notable changes to the Scenario Builder platform are documented here.

---

## [1.0.0] — 2026-06-23 · First Stable Release

### What's New

#### Policy Draft Generator
Trainers can now generate a formal, structured policy document directly from the platform.
After a scenario has been run by trainees, the trainer selects it from the **Policy Drafts** page and clicks **Generate**. The system analyses aggregated trainee performance and produces a ready-to-review LEA policy document covering identified risks, recommended procedures, controls, and resource requirements. The document can be downloaded as a Markdown file.

#### Trainer Dashboard
A dedicated **Policy Drafts** page is now available in the sidebar for users with the Trainer role. It lists all scenarios created by the trainer along with:
- **Phases** — number of incident phases in the scenario
- **Runs** — how many times the scenario has been completed by trainees (trainer self-tests excluded)
- **Trainees** — number of unique trainees who have completed the scenario

#### Role-Based Access
The interface now adapts based on your role:
- **Trainers** see the Policy Drafts page and the Generate button.
- **Trainees** see a clear "Access Restricted" message if they navigate to a trainer-only page.
- The sidebar automatically hides trainer-only items for trainee accounts.
- The navbar now correctly shows your role (Trainer / Trainee).

#### AI-Powered Step Grading
Each response submitted during a simulation is now evaluated by the AI model, providing richer, more contextual feedback compared to the previous keyword-matching approach.

#### Debrief Report
At the end of a simulation, trainees receive an AI-generated debrief summarising their overall performance, strengths, and areas for improvement across all phases.

#### Predictive Threat Analysis
The Next Step panel now includes calibrated threat predictions — a confidence-weighted forecast of likely follow-on attack vectors based on the current simulation state.

#### User Analytics
A dedicated analytics view shows multi-dimensional performance breakdowns by threat type, attack vector, and response quality over time.

#### Configurable Branding
The platform name and subtitle shown throughout the interface (navbar, sidebar, homepage, policy document footers, browser tab) are now controlled by a single environment variable. Deployers can rename the platform per project without touching any code.

---

### Bug Fixes

- **Sign-out redirect** — logging out no longer shows an "Invalid redirect URI" error.
- **User session continuity** — returning users are now correctly matched to their existing data across sessions.

---

### Notes for Administrators

- The `VITE_APP_NAME` and `VITE_APP_SUBTITLE` variables in `.env.local` (or the server `.env`) control the platform display name.
- Keycloak post-logout redirect URIs have been updated to support both local development (`localhost:5173`) and production deployments.

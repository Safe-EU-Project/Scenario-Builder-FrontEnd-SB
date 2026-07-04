# Scenario Builder Frontend — Technical Documentation

This document describes the **Scenario-Builder-FrontEnd-SB** (package name: `gaandalf`) repository in detail: technology stack, architecture, components, data flow, API integration, authentication, and configuration.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Technology Stack](#2-technology-stack)
3. [Project Structure](#3-project-structure)
4. [Application Bootstrap & Entry Points](#4-application-bootstrap--entry-points)
5. [Authentication (Keycloak)](#5-authentication-keycloak)
6. [API Layer](#6-api-layer)
7. [Routing & Layout](#7-routing--layout)
8. [State Management](#8-state-management)
9. [Components Reference](#9-components-reference)
10. [Styling & Theming](#10-styling--theming)
11. [Build, Lint & Deployment](#11-build-lint--deployment)
12. [Data Flow & User Journeys](#12-data-flow--user-journeys)
13. [Configuration & Environment](#13-configuration--environment)
14. [Known Gaps & Recommendations](#14-known-gaps--recommendations)

---

## 1. Overview

The application is a **Scenario Builder** frontend: a React SPA where authenticated users can:

- **Start exercises**: Browse scenarios, start a simulation, answer incident-by-incident with a countdown timer, then submit for grading.
- **View assignments**: See a list of their assignments with overall scores and open per-assignment analytics.
- **View analytics**: See user-wide statistics (average grade, assignments completed, percentile vs. others, pie chart of completed vs. total scenarios) with PDF export.

The app requires **Keycloak** login before any content is shown. It talks to a backend API for scenarios, assignments, and analytics.

---

## 2. Technology Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js (ES modules) |
| **Framework** | React 19 |
| **Build tool** | Vite 7 |
| **Language** | JavaScript (JSX); no TypeScript in source |
| **Routing** | react-router-dom v7 |
| **HTTP client** | Axios |
| **Auth** | keycloak-js, @react-keycloak/web (latter in package.json; init uses raw keycloak-js) |
| **UI components** | Flowbite React, AG Grid (ag-grid-react), Recharts |
| **Icons** | react-icons |
| **Alerts / modals** | SweetAlert2 |
| **PDF export** | react-to-pdf |
| **Statistics** | jstat (normal distribution, CDF, PDF for percentile chart) |
| **Styling** | Tailwind CSS 3, PostCSS, Autoprefixer, DaisyUI (plugin), component-level CSS files |
| **Linting** | ESLint 9 (flat config), Prettier (devDep, no repo config) |
| **Container** | Docker (Node image, dev server with `--host`) |

**Dependencies (excerpt from package.json):**

- **React**: `react`, `react-dom` ^19.2.0  
- **Router**: `react-router-dom` ^7.9.6  
- **Keycloak**: `keycloak-js` ^26.2.2, `@react-keycloak/web` ^3.4.0  
- **HTTP**: `axios` ^1.13.2  
- **UI**: `flowbite` ^4.0.1, `flowbite-react` ^0.12.10, `ag-grid-react` ^35.0.0, `recharts` ^3.6.0  
- **Other**: `@mui/material`, `@mui/icons-material`, `@mui/x-charts`, `@emotion/react`, `@emotion/styled`, `@fontsource/roboto` (in package.json; MUI/Emotion not used in the files reviewed), `jstat` ^1.9.6, `react-to-pdf` ^3.0.0, `sweetalert2` ^11.26.10, `react-icons` ^5.5.0  

**Dev dependencies:** Vite ^7.2.4, @vitejs/plugin-react, vite-plugin-mkcert, ESLint, Tailwind, PostCSS, Autoprefixer, DaisyUI, Prettier, globals, @types/react, @types/react-dom.

---

## 3. Project Structure

```
Scenario-Builder-FrontEnd-SB/
├── index.html                 # SPA entry; mounts #root, loads /src/main.jsx
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── eslint.config.js
├── Dockerfile
├── .gitignore
├── .flowbite-react/
│   ├── config.json
│   └── init.tsx                # Flowbite theme init (dark, no prefix)
├── .vscode/
│   └── extensions.json         # Recommends Tailwind extension
└── src/
    ├── main.jsx                # Keycloak init → React root
    ├── App.jsx                 # Router, layout, simulation mode, routes
    ├── index.css               # Tailwind directives
    ├── App.css                 # Tailwind + DaisyUI plugin
    ├── Main.css                # Layout: .main, .main-simulation, .side-bar
    ├── keycloak.js             # Keycloak instance config
    ├── BarChartGrades.jsx      # Recharts bar chart (grade per incident)
    ├── service/
    │   └── api_client.js       # Axios instance + Keycloak interceptors
    ├── components/
    │   ├── NavBar.jsx
    │   ├── SideBar.jsx
    │   ├── HomePage.jsx
    │   ├── SearchExercise.jsx  # Scenario list → exercise → incidents → submit
    │   ├── TableScenario.jsx   # AG Grid of scenarios; Start Simulation
    │   ├── TableAssignment.jsx # AG Grid of assignments; Details → AssignmentAnalytics
    │   ├── IncidentCard.jsx
    │   ├── ClockCountDown.jsx
    │   ├── UserStats.jsx       # Default export: AssignmentStats (user analytics)
    │   ├── AssignmentAnalytics.jsx
    │   ├── CumulativePercentile.jsx
    │   ├── PiechartComparison.jsx
    │   ├── config/
    │   │   └── config.js       # TOKENS.bearer (hardcoded JWT; legacy)
    │   └── styles/
    │       ├── NavBar.css
    │       ├── TableComponent.css
    │       ├── IncidentCard.css
    │       ├── ClockCountDown.css
    │       ├── SearchExercise.css
    │       ├── AssignmentAnalytics.css
    │       └── UserStats.css
    └── assets/
        ├── hacker-cat-svgrepo-com.svg
        ├── data-breach-svgrepo-com.svg
        └── tup.svg
```

There is no `public/` folder, no `tsconfig.json`, and no test files or test runner.

---

## 4. Application Bootstrap & Entry Points

### 4.1 HTML entry

- **index.html**: Single `<div id="root">` and `<script type="module" src="/src/main.jsx">`. Title: "gaandalf".

### 4.2 JavaScript entry (main.jsx)

1. Imports: `StrictMode`, `createRoot` from `react-dom/client`, `App`, `./index.css`, `keycloak` from `./keycloak`.
2. **Keycloak init**:
   - `keycloak.init({ onLoad: "login-required", pkceMethod: "S256", checkLoginIframe: false })`.
   - On success: logs token, then `createRoot(document.getElementById("root")).render(<StrictMode><App /></StrictMode>)`.
   - On failure: logs "Keycloak init failed". The app does not render if init fails.
3. No `ReactDOM.createRoot` is run until Keycloak has successfully initialized; thus the app is behind login.

### 4.3 Root component (App.jsx)

- **Router**: Wraps the app in `<BrowserRouter>`.
- **Layout**:
  - **NavBar**: Rendered only when `!simulationMode` (hidden during simulation).
  - **Main area**: A flex container with:
    - **Sidebar** (`.side-bar`): Rendered only when `!simulationMode`; contains navigation links.
    - **Main content** (`.main`): Renders `<Routes>`.
- **State**: `simulationMode` is stored in React state and synced to `localStorage` key `simulationMode` (read on mount, updated by `handleSimulationMode`).
- **Routes**:
  - `/` → `HomePage`
  - `/start-exercise` → `SearchExercise` with prop `handleSimulationStart={handleSimulationMode}`
  - `/my-assignments` → `TableAssignment`
  - `/user-stats` → `UserStats` with `data` and `highlightValue` props (static demo data from App)
- **Note**: Sidebar links to `/guide`, but there is **no route** for `/guide` (navigating there would show no matched route content).

---

## 5. Authentication (Keycloak)

### 5.1 Configuration (src/keycloak.js)

- **Keycloak instance** created with configurable url, realm, and clientId (e.g. for local or deployed identity providers).

### 5.2 Init options (main.jsx)

- **onLoad: "login-required"**: User must log in before the app loads.
- **pkceMethod: "S256"**: PKCE with S256.
- **checkLoginIframe: false**: No iframe-based token refresh check.

### 5.3 Usage in the app

- **api_client.js**: For every request, if `keycloak.authenticated` is true, calls `keycloak.updateToken(30)` (refresh if token expires in &lt;30s), then sets `Authorization: Bearer ${keycloak.token}`. On refresh failure the request is rejected; there is no automatic logout in the request interceptor.
- **Response interceptor**: On 401 and `keycloak.authenticated`, only logs "in here - 401"; logout is commented out.
- **NavBar**: Shows a user dropdown with placeholder text ("Bonnie Green", "name@flowbite.com"); "Sign out" is not wired to Keycloak logout.

So: **login is required**, tokens are attached and refreshed for API calls, but **logout and user display are not fully implemented**.

---

## 6. API Layer

### 6.1 Client (src/service/api_client.js)

- **Axios instance**: `axios.create({ baseURL })` with configurable base URL. All requests go through this client (typically via dev proxy or same-origin API).
- **Request interceptor**:
  - If not authenticated, returns config unchanged (no token).
  - Otherwise: `await keycloak.updateToken(30)`, then `config.headers.Authorization = \`Bearer ${keycloak.token}\``. On error, rejects the promise and does not logout.
- **Response interceptor**: On 401 and authenticated, logs and rejects; logout is commented out.
- **Export**: Default export is the axios instance (imported as `apiFetch` in components).

### 6.2 Endpoints used

| Area | Used in | Purpose |
|------|---------|---------|
| List scenarios | SearchExercise | Load scenario catalogue |
| Create assignment | SearchExercise | Start exercise for a scenario |
| Submit solution | SearchExercise | Submit completed or timed-out exercise |
| List user assignments | TableAssignment | Load user's assignments |
| Assignment details | TableAssignment | Load one assignment for analytics |
| User analytics | UserStats | Load cohort/analytics data |

### 6.3 Inconsistency: raw fetch in UserStats

- **UserStats.jsx** also uses a direct `fetch` to a scenario/solved endpoint with a hardcoded JWT from `config.js`. This bypasses the axios client. All other API usage goes through `apiFetch` with Keycloak. This should be unified (use `apiFetch` and remove hardcoded token).

---

## 7. Routing & Layout

### 7.1 Route table

| Path | Component | Notes |
|------|------------|--------|
| `/` | HomePage | Welcome text |
| `/start-exercise` | SearchExercise | Receives `handleSimulationStart` |
| `/my-assignments` | TableAssignment | — |
| `/user-stats` | UserStats | Receives `data`, `highlightValue` from App |
| `/guide` | (none) | Linked in sidebar; no route defined |

### 7.2 Layout behavior

- **Simulation mode off**: NavBar + Sidebar + main content. Main area height `calc(100vh - 64px)`.
- **Simulation mode on**: No NavBar, no Sidebar; main content only; height `calc(100vh - 0px)`. Content is driven by SearchExercise (incidents or finish screen).

### 7.3 NavBar (components/NavBar.jsx)

- Flowbite `Navbar`: logo (hacker-cat SVG), "Scenario Builder" brand, user dropdown (Avatar with placeholder "Bonnie Green" / "name@flowbite.com"), and collapse links (Home, About, Project Tools, Contact). Links are `href="#"`, not router links. "Sign out" has no handler.

### 7.4 SideBar (components/SideBar.jsx)

- Flowbite `Sidebar`; uses `useLocation()` to set active item by path.
- Map: `/` → home, `/start-exercise` → start-exercise, `/my-assignments` → my-assignments, `/guide` → guide, `/user-stats` → user-stats.
- Items: Home (`/`), Start Exercise (`/start-exercise`), My Assignments (`/my-assignments`), User Guide (`/guide`), User Analytics (`/user-stats`). Active style: green background, white text, bold.
- Uses React Router `Link` for navigation.

---

## 8. State Management

- **No global store**: No Redux, Zustand, or global Context for app state.
- **App-level state**:
  - `simulationMode`: boolean; toggled by SearchExercise (start/exit); persisted in `localStorage` under key `simulationMode`.
- **SearchExercise state** (and persistence):
  - **exercise**: Current assignment/exercise object (from create or restored from storage).
  - **scenarios**: List from scenarios API.
  - **incidentIndex**: Current incident index in `exercise.context_solution`.
  - **draft**: Object mapping incident index → draft text; persisted in `localStorage` as `exerciseDraft`.
  - **exerciseState**: Full exercise object persisted in `localStorage` under `exerciseState` for resume after refresh.
- **Resume logic**: On mount, SearchExercise reads `exerciseState` and `exerciseDraft`. If present, it restores `exercise`, `draft`, and sets `incidentIndex` to either the max draft index or the first unanswered incident (or end if all answered).
- **TableAssignment**: Local state for `rowData` (assignments list) and `assignmentData` (selected assignment for analytics).
- **UserStats**: Local state for `userStats`, `allUsersData`, `completedScenarios` (from API / fetch).

---

## 9. Components Reference

### 9.1 HomePage

- Simple welcome text: "Welcome to the Home Page" and a short description.

### 9.2 SearchExercise

- **Props**: `handleSimulationStart` (function to toggle simulation mode).
- **Behavior**:
  1. On mount: Fetches scenarios and optionally restores exercise/draft from `localStorage`.
  2. **No exercise**: Renders `TableScenario` with scenarios and `simulationActivator={handleSetExercise}`.
  3. **handleSetExercise(scenario)**: POSTs create-assignment with scenario id, saves response to state and `exerciseState`, sets `incidentIndex = 0`, calls `handleSimulationStart()`.
  4. **During exercise**: Renders `ClockCountDown`, `IncidentCard` for `exercise.context_solution[incidentIndex]`, a Flowbite `Textarea` for the answer, and a "Next" button. Draft is saved on change to `exerciseDraft` and localStorage.
  5. **Next**: SweetAlert confirms "Step into next incident". On confirm, if the text is not empty/placeholder, updates `exercise.context_solution[incidentIndex].expected_actions` and saves to state and localStorage, clears draft for that index, increments `incidentIndex`. Otherwise just increments index.
  6. **When incidentIndex >= length**: Shows "You have completed the quiz!" and a "Submit" button. Submit calls `handleExit`.
  7. **handleExit**: Shows loading SweetAlert, POSTs solve with full exercise, clears localStorage (`exerciseState`, `exerciseDraft`, `simulationMode`), resets state, calls `handleSimulationStart(true)`, closes popup, navigates to `/`.
- **ClockCountDown** triggers `handleTimeFinish` when timer reaches zero; that calls `handleExit` (submit on time expiry).

### 9.3 TableScenario

- **Props**: `scenarios` (array), `simulationActivator` (function receiving scenario row data).
- AG Grid with columns: `_id`, `scenario_name`, and a "Start Simulation" column with a play button. Click shows SweetAlert "The simulation is going to start"; on confirm calls `simulationActivator(parameters.data)`.
- Uses `ag-theme-material`, pagination 10/25/50, text filter and floating filter.

### 9.4 TableAssignment

- Fetches assignments on mount.
- AG Grid columns: `scenario_name`, "Details" (button that calls `doTheAnalytics(params)`), "Overall Score" (Progress bar from Flowbite; color by score &lt;50 red, &lt;80 blue, else green).
- **Details**: Fetches one assignment by id, sets `assignmentData`; when set, renders `AssignmentAnalytics` with `assignmentData`.

### 9.5 IncidentCard

- **Props**: `exercise` — one element of `context_solution` (incident object).
- Renders: title, message_timestamp, description, inject. Styled with IncidentCard.css.

### 9.6 ClockCountDown

- **Props**: `handleTimeFinish` (callback when countdown reaches zero).
- Initial state: `{ days: 0, hours: 1, minutes: 0, seconds: 0 }`. Every second decrements time; when all zero, calls `handleTimeFinish()` and shows alert. Renders days/hours/min/sec with icon.

### 9.7 UserStats (file UserStats.jsx, default export AssignmentStats)

- **Props**: `data`, `highlightValue` (from App; used as fallback for percentile highlight).
- Fetches:
  - User analytics API → all users; finds `me === true` and sets `userStats` (email, average_grade, assignments_count).
  - Scenario/solved endpoint (via raw fetch and hardcoded token) → sets `completedScenarios` (e.g. `{ solved_by_current_user, total_scenarios }`).
- Renders: title "User Overall Statistics", PDF download (react-to-pdf), current user, average grade, average time (hardcoded "2h 30m"), assignments completed, `PieChartComparison` (scenarios completed by you vs other), and `CumulativePercentile` with grades data and highlight value. Uses ref for PDF target.

### 9.8 AssignmentAnalytics

- **Props**: `assignmentData` (array from specific assignment endpoint).
- Filters to `element.me == true`, takes first as `questionsInfo`. Renders: scenario name, average grade, user email, and `BarChartGrades` with `grade_per_incident`. PDF download button (react-to-pdf).

### 9.9 BarChartGrades

- **Props**: `gradePerIncident` (array of objects like `[{ "Incident 1": 85 }, ...]`), `isAnimationActive`.
- Transforms to Recharts format `{ name, value }`, renders Recharts `BarChart` with XAxis (name), YAxis, Tooltip, Bar with alternating colors. Handles empty data with message "No grades assigned yet".

### 9.10 CumulativePercentile

- **Props**: `data` (array of numeric grades), `highlightValue` (user’s grade).
- Uses **jstat** for normal CDF/PDF. Computes empirical percentile (share of values below highlight), mean, stdDev, z-score. Renders an SVG normal curve with colored bands (Very Poor → Elite), highlights the band containing the user’s percentile, and a vertical line/circle at the user’s value. Summary text: "Your Score", "scored better than X%", and rank name.

### 9.11 PiechartComparison

- **Props**: `scenariosCompleted` (e.g. `{ solved_by_current_user, total_scenarios }`), `isAnimationActive`, `defaultIndex`.
- Builds two segments: "Scenarios Completed By You" (solved_by_current_user), "Scenarios Completed By Other" (total_scenarios). Recharts PieChart with inner radius 50%, labels, legend. If `scenariosCompleted` is undefined, this can throw; callers should pass a default object.

### 9.12 Config (components/config/config.js)

- Exports `TOKENS.bearer`: a long-lived hardcoded JWT. Used only in UserStats for the `fetch` to scenario/solved. Should be removed in favor of api_client + Keycloak.

---

## 10. Styling & Theming

### 10.1 Global

- **index.css**: `@tailwind base; @tailwind components; @tailwind utilities;`
- **App.css**: `@import "tailwindcss"; @plugin "daisyui";`
- **Main.css**: Resets (box-sizing, margin, padding); `.main` (flex, overflow-y auto, background, border-radius); `.main-simulation` (purple background); `.side-bar` hidden below 768px.

### 10.2 Tailwind

- **tailwind.config.js**: content includes `index.html`, `src/**/*.{js,ts,jsx,tsx}`, and Flowbite node_modules. Plugin: `require("flowbite/plugin")`. No DaisyUI in this file (DaisyUI is loaded via App.css plugin).

### 10.3 Flowbite

- **.flowbite-react/init.tsx**: Exports `ThemeInit` with `CONFIG = { dark: true, prefix: "", version: 3 }`. Not imported in the read files; may be used elsewhere or by Flowbite React internally.
- **Vite**: `flowbiteReact()` plugin in vite.config.js.

### 10.4 Component CSS

- Component-specific files in `components/styles/`: NavBar, TableComponent, IncidentCard, ClockCountDown, SearchExercise, AssignmentAnalytics, UserStats. Imported by the corresponding component.

---

## 11. Build, Lint & Deployment

### 11.1 Scripts (package.json)

- **dev**: `vite --host` — dev server, listen on all interfaces (for Docker).
- **build**: `vite build` — production build.
- **lint**: `eslint .`
- **preview**: `vite preview` — preview production build.

### 11.2 Vite (vite.config.js)

- Plugins: `react()`, `flowbiteReact()`. mkcert is imported but not used in the active config. Server: `host: true`, `https: false`.

### 11.3 ESLint (eslint.config.js)

- Flat config: global ignore `dist`, files `**/*.{js,jsx}`, extends JS recommended, react-hooks, react-refresh (Vite). Browser globals, ES2020, JSX. Rule: `no-unused-vars` with `varsIgnorePattern: '^[A-Z_]'`.

### 11.4 Docker

- **Dockerfile**: `FROM node:latest`, WORKDIR `/app`, copy package.json and run `npm install`, copy source, `CMD ["npm", "run", "dev", "--", "--host"]`. Runs the dev server, not a production build.

### 11.5 Testing

- No test runner, no `*.test.*` or `*.spec.*` files.

---

## 12. Data Flow & User Journeys

### 12.1 Startup

1. index.html loads main.jsx.
2. Keycloak init (login-required, PKCE). On success → render App.
3. App reads `simulationMode` from localStorage, sets layout (NavBar, Sidebar, main). Renders route by path.

### 12.2 Start and complete an exercise

1. User goes to `/start-exercise`. SearchExercise fetches scenarios, shows TableScenario.
2. User clicks "Start Simulation" on a row → SweetAlert → confirm → POST create-assignment with scenario id → save response to state and `exerciseState` in localStorage → `handleSimulationStart()` → simulation mode on (NavBar/Sidebar hide).
3. SearchExercise shows incident 0: ClockCountDown, IncidentCard, Textarea. User types (draft saved to state and `exerciseDraft`). "Next" → confirm → if answer not empty/placeholder, update `context_solution[0].expected_actions` and save to state and localStorage; increment incidentIndex.
4. Repeat for each incident. When incidentIndex >= length, show completion screen; "Submit" → loading → POST solve with full exercise → clear storage and state → `handleSimulationStart(true)` → navigate to `/`.
5. If timer hits zero, ClockCountDown calls `handleTimeFinish` → same submit flow.

### 12.3 Assignments and analytics

1. **My Assignments**: TableAssignment loads user assignments, shows grid. "Details" → fetches one assignment → set assignmentData → render AssignmentAnalytics (scenario name, grade, user, BarChartGrades).
2. **User Analytics**: UserStats loads user analytics and scenario/solved data. Renders stats, PieChartComparison, CumulativePercentile. User can export PDF.

### 12.4 Auth in requests

- Every `apiFetch` request goes through the request interceptor: if authenticated, refresh token if exp &lt; 30s, then set `Authorization: Bearer <token>`. Only UserStats’ scenario/solved call uses raw fetch + hardcoded token.

---

## 13. Configuration & Environment

- **.env**: Listed in .gitignore; no `.env` or `.env.example` in the repo. API base and Keycloak are hardcoded.
- **Keycloak**: URL, realm, clientId in `src/keycloak.js`.
- **API base**: Configurable in api_client (e.g. relative path; dev proxy or same host serves the API).
- **Secrets**: `TOKENS.bearer` in `src/components/config/config.js` is a hardcoded JWT; used only for the scenario/solved fetch. Not suitable for production.

---

## 14. Known Gaps & Recommendations

1. **/guide route**: Sidebar links to `/guide` but no route exists. Add a route and a Guide component or remove the link.
2. **UserStats API**: Replace raw fetch to scenario/solved with `apiFetch` and remove dependency on `TOKENS.bearer`.
3. **Config**: Move Keycloak URL/realm/clientId and API base URL to environment variables (e.g. `VITE_KEYCLOAK_URL`, `VITE_API_BASE`) and remove hardcoded JWT.
4. **NavBar**: Wire "Sign out" to Keycloak logout; optionally show real user name/email from Keycloak token.
5. **401 handling**: Consider re-enabling Keycloak logout or redirect to login when the backend returns 401.
6. **Tests**: Add a test runner and basic unit/integration tests for critical flows (e.g. SearchExercise, api_client).
7. **Docker**: For production, build with `npm run build` and serve static files (e.g. nginx) instead of running the dev server.
8. **PiechartComparison**: Ensure `scenariosCompleted` is always an object (default `{ solved_by_current_user: 0, total_scenarios: 0 }`) to avoid runtime errors.
9. **CumulativePercentile**: `scenariosCompleted` is passed in props in UserStats but the component signature only uses `data` and `highlightValue`; confirm if `scenariosCompleted` is needed and document or remove.

This document reflects the repository as of the stated review. For the latest behavior, refer to the source code.

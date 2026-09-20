# Development Guide: GenshinDPS — Combat Analytics & Telemetry Archive

**Version:** 1.1.0  
**Target Environment:** Node.js 22+ (LTS) · React 19.2 · Vite 8 · MySQL 8.0+ / Prisma ORM

> [!NOTE]
> This document details **Version 1.1.0** of the GenshinDPS architecture and development workflow.  
> To view the historical baseline development guide for the initial release, refer to [DEVELOPMENT_v1.0.md](DEVELOPMENT_v1.0.md).

---

## 1. Overview & Architecture

**GenshinDPS** is an end-to-end combat telemetry and simulation analytics platform. It captures, stores, audits, and visualizes combat data from damage simulators, test dummy sessions (such as *DPS Test Dummy++*), and rotation benchmarks.

|**Frontend (Client)**|**Backend & Persistence**|
|---|---|
|React 19.2 + Vite 8|Node.js / Express 5 API Server|
|React Router v8|Prisma ORM 5.22|
|Redux Toolkit State|MySQL 8.0+ / MariaDB Database|
|Bootstrap 5.3 + Sass Theme|Multimodal AI Telemetry Engine|
|ApexCharts, Chart.js, Recharts|(Gemini 2.5 Flash / GPT-4o / OCR)|

### 1.1. Version Release Evolution

#### Version 1.0 (Foundation & Telemetry MVP)
- **Run Explorer (`/runs`)**: Filter and inspect logged benchmark combat runs by DPS, preset, enemy type, and verification status.
- **Combat Analytics Dashboard (`/dashboard`)**: Rotation timeline cadence, DPS trajectory, party damage contribution (%), and elemental damage share distribution.
- **Character Attribute Cards (`/characters`)**: In-depth character sheets tracking Base ATK, Total ATK, DEF, HP, Crit Rate, Crit DMG, ER, EM, and elemental damage bonuses.
- **Target Dummy Profiles**: 8-element resistance matrix (`pyro`, `hydro`, `electro`, `cryo`, `anemo`, `geo`, `dendro`, `physical`) with enemy level scaling.
- **Multimodal AI Telemetry Ingestion (`/upload`)**: Automated screenshot extraction converting image watermarks, rotation tables, and stat sheets directly into validated SQL records via Gemini 2.5 Flash / GPT-4o / local OCR.
- **Relational Persistence (MySQL & Prisma)**: Master-detail schema covering `dps_runs`, `run_characters`, `run_rotations`, and `run_elemental_shares`.
- **Theme & State Infrastructure**: Redux Toolkit store slices with live dark/light mode synchronization and local storage persistence.

#### Version 1.1 (Combat Metadata, Scoped Graphify & CI Hardening)
- **Manual Team & Build Metadata**:
  - Custom team naming and customizable run notes displayed directly on run cards and detail drawer.
  - Character build labeling with constellation tags (`[C0]`–`[C6]`) and weapon refinement ranks (`[R1]`–`[R5]`).
  - Formatted card badge summary: e.g., `[C3] [R1] Zibai 56% (39.44M) [C2R1] Linnea 24% (16.90M)`.
  - In-drawer rotation notes and party build inspector view.
  - Interactive run edit modal (`EditRunModal.jsx`) supporting live telemetry metadata updates.
  - Schema extension: Added `teamName`, `notes`, `rotationNotes`, `weapon`, `refinement`, `constellation`, and `artifactSet` across `gi-dps-stat-db.sql`, `prisma/schema.prisma`, and Zod `extractionSchema.js`.
- **Graphify Selective Index Scoping (`.graphifyignore`)**:
  - Implemented [.graphifyignore](.graphifyignore) to filter out 320+ legacy ArchitectUI demo page modules and 230+ asset/style files.
  - Scoped knowledge graph to capture strictly custom business logic, Redux data states, and core routing.
  - Reduced graph footprint from 2,127 nodes down to 623 nodes (824 edges, 124 communities).
  - Formalized `.gitignore` rules for committed deliverables (`GRAPH_REPORT.md`, `graph.json`, `manifest.json`, `graph.html`) vs ignored machine caches (`cache/`, `.graphify_*`, `cost.json`, dated snapshots).
- **CI / Pipeline Hardening**:
  - GitHub Actions CI workflow updated to target Node.js 22 LTS.
  - Refreshed Playwright E2E smoke tests aligned with actual production routes (`/runs`, `/dashboard`, `/upload`, `/analytics`, `/characters`, `/settings`).

### 1.2. Version Feature & Architecture Comparison

| Capability Area | Version 1.0 (MVP Baseline) | Version 1.1 (Current) |
| :--- | :--- | :--- |
| **Combat Run Metadata** | Auto-extracted DPS, stage GUID, player UID, preset | Added custom team names, run notes, weapon refines (R1-R5), constellation marks (C0-C6), rotation notes, and interactive edit modal (`EditRunModal.jsx`) |
| **Database & Schema** | 4-table schema (`dps_runs`, `run_characters`, `run_rotations`, `run_elemental_shares`) | Extended schema with team naming, notes, and character build metadata across Prisma, SQL, and Zod schemas |
| **Knowledge Graph** | Full unscoped repository scan (2,127 nodes including 320+ template demo pages) | Scoped via `.graphifyignore` to 623 domain nodes; formalized commit vs. ignore policies in `.gitignore` |
| **CI & E2E Testing** | Initial test scaffolding | Aligned Playwright E2E suite with core GenshinDPS routes; upgraded GitHub Actions CI to Node.js 22 |


---

## 2. Prerequisites

| Tool | Minimum Version | Recommended | Notes |
| :--- | :--- | :--- | :--- |
| **Node.js** | `v22.0.0` | `v22.x LTS` | Defined in [.nvmrc](.nvmrc) |
| **npm** | `v10.0.0` | `v10.9.x` | Bundled with Node 22 |
| **MySQL** | `8.0+` | `8.0` / MariaDB `10.5+` | Required for live database persistence |
| **Python** | `3.10+` | `3.12+` / `3.14` | Required for Graphify knowledge graph generation |

---

## 3. Installation & Setup

### 3.1. Clone and Install Dependencies

```bash
# Clone the repository
git clone https://github.com/xetriel/GI-DPS-Test-Data.git
cd GI-DPS-Test-Data

# Install node dependencies
npm install --legacy-peer-deps
```

> [!NOTE]
> `--legacy-peer-deps` is required during installation because select legacy component packages declare peer dependencies for `react@^18` while this project runs on React 19. Runtime compatibility is handled via the `overrides` block in [package.json](package.json).

### 3.2. Environment Configuration (`.env`)

Create or update your local `.env` file in the project root:

```env
# Database Connection (MySQL / MariaDB)
DATABASE_URL="mysql://root:password@localhost:3306/genshin_dps"

# Telemetry Server Configuration
SERVER_PORT=5001

# AI Vision Engine API Keys (Optional - for Multimodal Screenshot Ingestion)
# GEMINI_API_KEY="your-google-gemini-api-key"
# OPENAI_API_KEY="your-openai-api-key"
```

---

## 4. Database Setup & Migrations

The database consists of four core relational tables:
1. `dps_runs`: Master combat runs, DPS metrics, stage GUID, player UID, and target dummy resistances.
2. `run_characters`: Party member slots (1 to 4), stat sheets, and individual damage contributions.
3. `run_rotations`: Sequential rotation cycles (1 to N) with cycle duration and DPS.
4. `run_elemental_shares`: 8-element damage distribution percentage breakdown.

### Option A: Direct SQL Initialization (Recommended for Quickstart)
Import the schema and seed data from [gi-dps-stat-db.sql](gi-dps-stat-db.sql):

```bash
# MySQL CLI
mysql -u root -p < gi-dps-stat-db.sql
```

### Option B: Prisma ORM Setup
Synchronize the Prisma schema defined in [prisma/schema.prisma](prisma/schema.prisma):

```bash
# Generate Prisma Client
npx prisma generate

# Push schema directly to the configured database
npx prisma db push

# (Optional) Open Prisma Studio visual inspector
npx prisma studio
```

---

## 5. Running the Application

### 5.1. Start the Vite Frontend Server
```bash
npm run dev
# Or: npm start
```
- The frontend will be available at `http://localhost:3001` (or next open port, e.g. `http://localhost:3002`).

### 5.2. Start the Telemetry API Backend Server
```bash
npm run server
```
- Starts the Express ingestion server at `http://localhost:5001`.
- Provides endpoints:
  - `GET /api/telemetry/health` — Engine status and active vision backend.
  - `GET /api/telemetry/runs` — Fetch all recorded DPS runs.
  - `GET /api/telemetry/runs/:id` — Fetch complete run details with party, rotations, and elemental share.
  - `POST /api/telemetry/extract` — Upload screenshot for AI vision OCR extraction.
  - `POST /api/telemetry/commit` — Persist validated run telemetry into MySQL via Prisma.

---

## 6. Development Scripts Reference

| Command | Purpose | Notes |
| :--- | :--- | :--- |
| `npm run dev` | Starts the Vite development server with HMR | Default port: `3001` |
| `npm run server` | Starts Express backend API server | Default port: `5001` |
| `npm run build` | Builds production bundle into `build/` | Production verification |
| `npm run build:analyze` | Analyzes Rollup bundle size distribution | Visualizer bundle map |
| `npm run preview` | Serves production build locally | Preview `build/` |
| `npm run lint` | Runs ESLint 9 checks across all JS/JSX files | Statically validates code |
| `npm run lint:fix` | Automatically fixes autofixable ESLint errors | Formats & cleans imports |
| `npm run format` | Runs Prettier write on all project files | Code style uniformity |
| `npm run format:check` | Checks code formatting against Prettier config | CI verification |
| `npm test` | Runs unit tests using Vitest 4 | Fast test execution |
| `npm run test:ui` | Runs Vitest with browser UI explorer | Interactive test view |
| `npm run test:coverage` | Generates unit test code coverage report | Coverage metrics |
| `npm run test:e2e` | Runs Playwright end-to-end test suite | Browser integration |

---

## 7. Multimodal Ingestion Pipeline

When processing combat test dummy screenshots:
1. An uploaded screenshot is passed through `src/server/services/visionParser.js`.
2. The vision parser queries **Gemini 2.5 Flash** (or fallback to **GPT-4o** / local OCR) using the system prompt specified in [prompts/extract_combat_sql_prompt.md](prompts/extract_combat_sql_prompt.md).
3. The response is validated against [src/server/schemas/extractionSchema.js](src/server/schemas/extractionSchema.js) using Zod.
4. Extracted metrics are reviewed in the UI before committing to the database.

---

## 8. Graphify Knowledge Graph Architecture

This repository uses [Graphify](https://github.com/Graphify-Labs/graphify) to generate and maintain a structural knowledge graph of components, modules, dependencies, and database schemas.

### 8.1. Artifacts in `graphify-out/`
- [GRAPH_REPORT.md](graphify-out/GRAPH_REPORT.md): Architectural report detailing core abstractions ("god nodes"), community modules, cohesion metrics, and suggested exploration questions.
- [graph.html](graphify-out/graph.html): Interactive graph visualization openable in any browser.
- [graph.json](graphify-out/graph.json): Persistent graph dataset containing all extracted nodes and edges.
- [manifest.json](graphify-out/manifest.json): Relative file hashes for incremental analysis.

### 8.2. Selective Index Scoping with `.graphifyignore`
Because GenshinDPS integrates an enterprise dashboard template foundation (ArchitectUI / Bootstrap), the raw codebase contains over 320+ legacy demo page modules (`src/DemoPages/`) and 230+ asset/style files. Left unscoped, these template boilerplate files flood the knowledge graph with irrelevant nodes and edges.

A [.graphifyignore](.graphifyignore) file is placed in the project root to selectively scope AST and semantic analysis strictly to **custom business logic**, **data states**, and **core routing**:

```gitignore
# Template Demo Sections (ArchitectUI Boilerplate)
src/DemoPages/Applications/
src/DemoPages/Charts/
src/DemoPages/Components/
src/DemoPages/Dashboards/
src/DemoPages/Elements/
src/DemoPages/Forms/
src/DemoPages/Tables/
src/DemoPages/Widgets/
src/DemoPages/routes.jsx

# Template Static Assets (Stock photos, sample avatars, SCSS styles)
src/assets/

# Unused Template Component Widgets
src/components/CircleProgress.jsx
src/components/LiquidGauge.jsx
src/components/Loader.jsx
src/components/ResponsiveTabs/
src/components/Sparklines/

# Build Tooling & Legacy Overrides
config-overrides.js
patch-finddomnode.js
startlog.txt
```

#### Scoped Captures
- **Custom Business Logic**:
  - `src/components/GenshinDPS/`: Combat run cards, run detail inspection drawer, dual resistance badges, elemental mini-bars, team/build metadata edit modal (`EditRunModal.jsx`), and verification modal.
  - `src/pages/`: Route page containers (`Dashboard`, `DpsRuns`, `Characters`, `Upload`, `Analytics`, `Settings`).
  - `src/services/api.js`: Telemetry ingestion and query API client.
  - `src/hooks/`: Custom state and observer hooks (`useDarkModeSync.js`, `useInView.js`).
  - `src/server/`: Node.js Express telemetry backend, OCR engine (`ocrEngine.js`), multimodal AI vision parser (`visionParser.js`), Zod extraction schemas (`extractionSchema.js`), and database services (`telemetryService.js`).
  - Data definitions: `prisma/schema.prisma`, `gi-dps-stat-db.sql`, `prompts/extract_combat_sql_prompt.md`.
- **Data States**:
  - `src/reducers/`: Redux Toolkit slices (`ThemeOptions.jsx`, store root).
  - `src/config/`: App store configuration (`configureStore.jsx`) and local storage sync (`persistThemeOptions.js`).
- **Core Routing & Layout**:
  - `src/Layout/AppMain/`: React Router definitions (`index.jsx`) mapping `/runs`, `/dashboard`, `/upload`, `/analytics`, `/characters`, `/settings`.
  - `src/Layout/AppNav/`: Main sidebar navigation configuration and items.
  - `src/Layout/AppHeader/` & `src/Layout/AppSidebar/`: Application shell header, search, and layout controls.
  - `src/DemoPages/Main/index.jsx`: Application shell wrapper mounting navigation, theme classes, and layout providers.
  - `src/index.jsx`: React 19 mounting root, Redux Provider, and HashRouter wrapper.

### 8.3. Commit vs. Ignore Policy (`.gitignore`)
To prevent bloating git history and committing machine-specific paths:

| File / Folder | Git Status | Reason |
| :--- | :---: | :--- |
| `graphify-out/GRAPH_REPORT.md` | **Committed** | High-level architectural audit report for PRs and team reviews |
| `graphify-out/graph.json` | **Committed** | Knowledge graph dataset for AI agents (`/graphify query` / GraphRAG) |
| `graphify-out/manifest.json` | **Committed** | Portable file hashes for fast incremental `--update` |
| `graphify-out/graph.html` | **Committed** | Standalone browser visualization |
| `graphify-out/cache/` | **Ignored** | Local machine/version-specific AST parser caches |
| `graphify-out/.graphify_*` | **Ignored** | Machine runtime state (`.graphify_python`, `.graphify_root`, scratch files) |
| `graphify-out/cost.json` | **Ignored** | Local developer token usage counters and execution timestamps |
| `graphify-out/[0-9]*/`, `*-backup/` | **Ignored** | Local dated backup snapshot directories |

### 8.4. Regenerating the Scoped Graph
To re-extract and update the knowledge graph after code or schema modifications:
```powershell
# Run incremental update using the Python interpreter configured in graphify-out:
& (Get-Content graphify-out\.graphify_python) -m graphify.cli --update

# Or run full rebuild with selective scoping
/graphify .
```

---

## 9. Codebase Directory Structure

```
GI-DPS-Test-Data/
├── DEVELOPMENT.md             # Canonical developer guide (v1.1.0)
├── DEVELOPMENT_v1.1.md        # Version 1.1.0 developer guide (combat metadata, scoped Graphify)
├── DEVELOPMENT_v1.0.md        # Version 1.0.0 developer guide (archival MVP baseline)
├── CONTRIBUTING.md            # Community contribution guidelines
├── README.md                  # Project overview and quick start
├── Changelog.md               # Version changelog and security advisories
├── .graphifyignore            # Scoping rules for Graphify knowledge graph extraction
├── gi-dps-stat-db.sql         # MySQL schema definitions & reference seed data
├── prompts/
│   └── extract_combat_sql_prompt.md # Multimodal AI screenshot extraction prompt
├── prisma/
│   └── schema.prisma          # Prisma ORM schema & entity relations
├── graphify-out/              # Graphify knowledge graph outputs & report
│   ├── GRAPH_REPORT.md        # Architectural report (623 nodes, 824 edges, 124 communities)
│   ├── graph.html             # Standalone interactive browser visualizer
│   ├── graph.json             # Queryable graph dataset (scoped AST)
│   └── manifest.json          # Incremental scan file hashes
├── public/                    # Static assets & sample run screenshots
├── src/
│   ├── index.jsx              # Client entry point
│   ├── pages/                 # Route pages (Dashboard, Runs, Characters, Upload, Analytics, Settings)
│   ├── components/            # Reusable UI & GenshinDPS components
│   │   ├── GenshinDPS/        # Badges, resistance bars, edit modal, telemetry widgets
│   │   ├── ErrorBoundary.jsx  # React error boundary
│   │   ├── Rating.jsx         # Star rating component (used by RunDetailDrawer)
│   │   └── Sticky.jsx         # Sticky header component (used by VerificationModal)
│   ├── Layout/                # Application shell layout
│   │   ├── AppMain/           # React Router route registry (Dashboard, Runs, etc.)
│   │   ├── AppNav/            # Sidebar navigation items
│   │   ├── AppHeader/         # Header bar with search and profile controls
│   │   └── ThemeOptions/      # Live theme customizer drawer
│   ├── reducers/              # Redux Toolkit store slices & theme configuration
│   ├── config/                # Redux store configuration & theme persistence
│   ├── hooks/                 # Custom React hooks (useDarkModeSync, useInView)
│   ├── services/              # Frontend API client (api.js)
│   ├── server/                # Node.js Express telemetry backend
│   │   ├── index.js           # Server entry point
│   │   ├── services/          # Vision parser, OCR engine, telemetry database services
│   │   └── schemas/           # Zod extraction schema validators
│   ├── DemoPages/             # Template demo pages (scoped out via .graphifyignore)
│   │   └── Main/index.jsx     # Root app shell wrapper mounting Layout & AppMain
│   └── assets/                # SCSS stylesheets, themes, and icon sets
└── vite.config.js             # Vite 8 build & bundler configuration
```

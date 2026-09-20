# Development Guide: GenshinDPS — Combat Analytics & Telemetry Archive

**Version:** 1.0.0  
**Target Environment:** Node.js 22+ (LTS) · React 19.2 · Vite 8 · MySQL 8.0+ / Prisma ORM

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

### Core Features
- **Run Explorer (`/runs`)**: Filter and inspect logged benchmark combat runs by DPS, preset, enemy type, and verification status.
- **Combat Analytics Dashboard (`/dashboard`)**: Rotation timeline cadence, DPS trajectory, party damage contribution (%), and elemental damage share distribution.
- **Character Attribute Cards (`/characters`)**: In-depth character sheets tracking Base ATK, Total ATK, DEF, HP, Crit Rate, Crit DMG, ER, EM, and elemental damage bonuses.
- **Target Dummy Profiles**: 8-element resistance matrix (`pyro`, `hydro`, `electro`, `cryo`, `anemo`, `geo`, `dendro`, `physical`) with enemy level scaling.
- **Multimodal AI Telemetry Ingestion (`/upload`)**: Automated screenshot extraction converting image watermarks, rotation tables, and stat sheets directly into validated SQL records.
- **Graphify Knowledge Graph**: Machine-extracted codebase map and architecture report in `graphify-out/`.

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

### 8.2. Regenerating the Graph
To re-extract and update the knowledge graph after code or schema modifications:
```powershell
# Run incremental update
& (Get-Content graphify-out\.graphify_python) -m graphify.cli --update

# Or run full rebuild
/graphify .
```

---

## 9. Codebase Directory Structure

```
GI-DPS-Test-Data/
├── DEVELOPMENT.md             # This developer guide (v1.0.0)
├── CONTRIBUTING.md            # Community contribution guidelines
├── README.md                  # Project overview and quick start
├── Changelog.md               # Version changelog and security advisories
├── gi-dps-stat-db.sql         # MySQL schema definitions & reference seed data
├── prompts/
│   └── extract_combat_sql_prompt.md # Multimodal AI screenshot extraction prompt
├── prisma/
│   └── schema.prisma          # Prisma ORM schema & entity relations
├── graphify-out/              # Graphify knowledge graph outputs & report
│   ├── GRAPH_REPORT.md
│   ├── graph.html
│   ├── graph.json
│   └── manifest.json
├── public/                    # Static assets & sample run screenshots
├── src/
│   ├── index.jsx              # Client entry point
│   ├── pages/                 # Route pages (Dashboard, Runs, Characters, Upload, Analytics)
│   ├── components/            # Reusable UI & GenshinDPS components
│   │   └── GenshinDPS/        # Badges, resistance bars, telemetry widgets
│   ├── reducers/              # Redux Toolkit store slices & theme configuration
│   ├── server/                # Node.js Express telemetry backend
│   │   ├── index.js           # Server entry point
│   │   ├── services/          # Vision parser, telemetry database services
│   │   └── schemas/           # Zod extraction schema validators
│   └── assets/                # SCSS stylesheets, themes, and icon sets
└── vite.config.js             # Vite 8 build & bundler configuration
```

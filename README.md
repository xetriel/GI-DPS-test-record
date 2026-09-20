# GenshinDPS — Combat Analytics & Telemetry Archive

> An end-to-end combat telemetry, rotation benchmark logging, and simulation analytics platform for Genshin Impact.

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D22.0.0-brightgreen.svg)](.nvmrc)
[![React Version](https://img.shields.io/badge/react-19.2.8-blue.svg)](package.json)
[![Vite Version](https://img.shields.io/badge/vite-8.2.0-purple.svg)](vite.config.js)
[![Prisma ORM](https://img.shields.io/badge/prisma-5.22.0-teal.svg)](prisma/schema.prisma)
[![MySQL Support](https://img.shields.io/badge/mysql-8.0%2B-orange.svg)](gi-dps-stat-db.sql)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Overview

**GenshinDPS** is a full-stack combat telemetry archive and analytics suite designed to capture, store, audit, and visualize combat performance data. Whether logging test dummy combat sessions (such as _DPS Test Dummy++_), rotation benchmarks, or theorycraft simulations, GenshinDPS transforms raw combat records and screenshots into structured, queryable data.

The platform combines a **multimodal AI vision ingestion pipeline** (powered by Google Gemini 2.5 Flash / OpenAI GPT-4o / local OCR fallback) with an interactive **React 19.2 + Bootstrap 5.3 + Vite 8** dashboard and an **Express 5 + Prisma ORM + MySQL** persistence layer.

---

## Key Features

- **Combat Analytics Dashboard (`/dashboard`)**:
  - Live aggregate statistics (highest DPS, average party DPS, strongest single hit, total runs logged).
  - Elemental damage share distributions via interactive donut charts.
  - Rotation timeline cadence, DPS progression curves, and party member damage contribution breakdown.
- **DPS Runs Archive & Explorer (`/runs`)**:
  - Filter and inspect logged benchmark combat runs by DPS range, test preset, elemental archetype, and verification status.
  - Interactive Run Detail Drawer with cycle-by-cycle rotation timing and stat sheet cards.
  - Side-by-side run comparison and modal verification for audited telemetry integrity.
- **Multimodal AI Telemetry Ingestion (`/upload`)**:
  - Drag-and-drop combat dummy screenshots or benchmark logs.
  - Automated vision extraction using **Gemini 2.5 Flash** (or fallback to **GPT-4o-mini** / **Tesseract.js**).
  - Strict [Zod](src/server/schemas/extractionSchema.js) schema parsing with live review and one-click commit to MySQL.
- **Character Attribute Cards & Rankings (`/characters`)**:
  - Full party member stat sheets: Base ATK, Total ATK, DEF, HP, Crit Rate, Crit DMG, Energy Recharge, Elemental Mastery, and elemental damage bonuses.
  - Cross-run character contribution rankings and damage share comparisons.
- **Deep-Dive Combat Analytics (`/analytics`)**:
  - Comparative rotation analysis across teams and cycle durations.
  - Elemental share distributions and party synergy metrics.
- **Target Dummy Resistance Matrix**:
  - 8-element resistance profiling (`Pyro`, `Hydro`, `Electro`, `Cryo`, `Anemo`, `Geo`, `Dendro`, `Physical`).
  - Enemy level defense scaling calculations (default Level 100 benchmark dummy).
- **Automated Telemetry Audit Engine**:
  - Mathematical integrity verification: verifies that rotation damage sums equal total damage, party damage percentages add up to 100%, and calculated DPS matches `total_damage / time_elapsed`.
- **Settings & API Key Management (`/settings`)**:
  - Live configuration of Gemini and OpenAI API keys stored securely in `.env`.
  - Real-time engine health indicator and MySQL connection status.

---

## Technology Stack

| Layer                  | Technologies                                                                                                                                                                |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend Framework** | [React 19.2](https://react.dev/) + [Vite 8](https://vite.dev/) + [React Router v8](https://reactrouter.com/)                                                                |
| **State & Theming**    | [Redux Toolkit 2.11](https://redux-toolkit.js.org/) + Bootstrap 5.3 + Sass/SCSS + Dark Mode Sync                                                                            |
| **Data Visualization** | [ApexCharts](https://apexcharts.com/) + [Recharts](https://recharts.org/) + [Chart.js](https://www.chartjs.org/)                                                            |
| **UI Components**      | Reactstrap 9.2, Framer Motion 12, FontAwesome 7, React Icons 5                                                                                                              |
| **Backend Server**     | [Node.js 22+](https://nodejs.org/) + [Express 5](https://expressjs.com/) + [Multer](https://github.com/expressjs/multer)                                                    |
| **Database & ORM**     | [MySQL 8.0+](https://www.mysql.com/) / [MariaDB 10.5+](https://mariadb.org/) + [Prisma ORM 5.22](https://www.prisma.io/)                                                    |
| **AI Vision & OCR**    | Google Gemini 2.5 Flash, OpenAI GPT-4o-mini, Tesseract.js 7.0                                                                                                               |
| **Testing & Quality**  | [Vitest 4](https://vitest.dev/) + React Testing Library 16, [Playwright 1.62](https://playwright.dev/), [ESLint 9](https://eslint.org/), [Prettier 3](https://prettier.io/) |

---

## Project Structure

```text
GI-DPS-test-record/
├── DEVELOPMENT.md             # In-depth technical development guide
├── CONTRIBUTING.md            # Community contribution guidelines & PR workflow
├── Changelog.md               # Version history and security advisories
├── gi-dps-stat-db.sql         # MySQL schema definitions & seed dataset
├── prompts/
│   └── extract_combat_sql_prompt.md # Multimodal AI screenshot extraction prompt
├── prisma/
│   └── schema.prisma          # Prisma schema & relational models
├── graphify-out/              # Graphify architectural knowledge graph
│   ├── GRAPH_REPORT.md        # Architecture, community modules & god nodes
│   ├── graph.html             # Interactive browser visualization
│   └── graph.json             # Persistent graph nodes & relationships
├── public/                    # Static assets, fonts & sample runs
│   ├── sample-runs/           # Reference combat screenshots
│   └── uploads/               # Uploaded run screenshots
├── src/
│   ├── index.jsx              # Client entry point
│   ├── pages/                 # Application route views
│   │   ├── Dashboard/         # Overview metrics & elemental share donut
│   │   ├── DpsRuns/           # Combat runs archive, search & filters
│   │   ├── Upload/            # AI screenshot scan & verification commit
│   │   ├── Analytics/         # Rotation timeline & comparative charts
│   │   ├── Characters/        # Character stat cards & rankings
│   │   └── Settings/          # Vision API keys & database status
│   ├── components/            # Shared & domain components
│   │   ├── GenshinDPS/        # RunCard, RunDetailDrawer, VerificationModal,
│   │   │                      # DualResistanceBadge, FilterToolbar, ElementalBadge
│   │   └── ErrorBoundary.jsx  # App crash protection wrapper
│   ├── Layout/                # Shell header, sidebar, footer & nav
│   ├── reducers/              # Redux slices (ThemeOptions, persistence)
│   ├── services/              # Frontend API client (src/services/api.js)
│   └── server/                # Express 5 Telemetry Backend
│       ├── index.js           # Express API server entry point
│       ├── services/          # visionParser.js, telemetryService.js
│       └── schemas/           # extractionSchema.js (Zod validators)
└── vite.config.js             # Vite 8 bundler configuration & API proxy
```

---

## Quick Start

### 1. Prerequisites

Ensure the following are installed on your environment:

- **Node.js**: `v22.0.0+` (LTS recommended, see [.nvmrc](.nvmrc))
- **npm**: `v10.0.0+`
- **MySQL**: `8.0+` (or MariaDB `10.5+`)
- **Python**: `3.10+` (Optional, only needed if regenerating the Graphify knowledge graph)

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/xetriel/GI-DPS-test-record.git
cd GI-DPS-test-record

# Install dependencies
npm install --legacy-peer-deps
```

> [!NOTE]
> `--legacy-peer-deps` is required during installation because certain third-party React component packages declare peer ranges for `react@^18` while this project runs natively on **React 19.2**. Runtime compatibility is handled via the `overrides` block in [package.json](package.json).

### 3. Environment Configuration (`.env`)

Create a `.env` file in the project root (or copy [.env.example](.env.example)):

```env
# Database Connection (MySQL / MariaDB)
DATABASE_URL="mysql://root:password@localhost:3306/genshin_dps"

# Telemetry Backend Server Port
SERVER_PORT=5001

# AI Vision Engine API Keys (Optional - enables automated screenshot extraction)
GEMINI_API_KEY="your-google-gemini-api-key"
OPENAI_API_KEY="your-openai-api-key"

# Vite Frontend Settings
VITE_PORT=3001
VITE_BASE="./"
```

### 4. Database Setup

Choose either direct SQL initialization or Prisma ORM synchronization:

#### Option A: Direct SQL Initialization (Recommended Quickstart)

Import the schema and initial seed data using [gi-dps-stat-db.sql](gi-dps-stat-db.sql):

```bash
mysql -u root -p < gi-dps-stat-db.sql
```

#### Option B: Prisma ORM Synchronization

Synchronize the Prisma models defined in [prisma/schema.prisma](prisma/schema.prisma):

```bash
# Generate Prisma Client
npx prisma generate

# Push schema directly to your configured database
npx prisma db push

# (Optional) Launch Prisma Studio visual inspector
npx prisma studio
```

### 5. Running the Application

You can run both the frontend and the telemetry backend:

#### Start Frontend Client (Vite Dev Server)

```bash
npm run dev
# Or: npm start
```

- Available at: `http://localhost:3001`
- The Vite development server automatically proxies all `/api/*` requests to `http://localhost:5001`.

#### Start Telemetry Backend API (Express Server)

```bash
npm run server
```

- Available at: `http://localhost:5001`
- Handles screenshot parsing, AI vision extraction, audit checks, and database persistence.

---

## Telemetry API Reference

The Node.js Express backend exposes the following REST endpoints:

| Method   | Endpoint                  | Description                                                                                    |
| :------- | :------------------------ | :--------------------------------------------------------------------------------------------- |
| `GET`    | `/api/telemetry/health`   | Service health status, game version (`7.0`), and active AI vision engine.                      |
| `GET`    | `/api/telemetry/config`   | Retrieve current API key configuration status (masked).                                        |
| `POST`   | `/api/telemetry/config`   | Update Gemini and OpenAI API keys dynamically in `.env`.                                       |
| `POST`   | `/api/telemetry/scan`     | Upload a screenshot (multipart/form-data) or sample run for AI extraction.                     |
| `POST`   | `/api/telemetry/commit`   | Validate (via Zod) and commit verified combat telemetry record to MySQL.                       |
| `GET`    | `/api/telemetry/runs`     | Fetch paginated, filterable combat runs (supports `testPreset`, `element`, `character`, etc.). |
| `GET`    | `/api/telemetry/runs/:id` | Fetch full run details with party members, rotation cycles, and elemental share.               |
| `DELETE` | `/api/telemetry/runs/:id` | Remove a combat run record from the archive.                                                   |

---

## Multimodal AI Ingestion Pipeline

```mermaid
flowchart LR
    A["Combat Screenshot\n(DPS Test Dummy++)"] --> B["Express Server\n(/api/telemetry/scan)"]
    B --> C{"AI Vision Engine"}
    C -->|"Primary"| D["Gemini 2.5 Flash\n(Multimodal API)"]
    C -->|"Fallback 1"| E["GPT-4o-mini\n(Vision API)"]
    C -->|"Fallback 2"| F["Tesseract.js\n(Local OCR)"]
    D --> G["Zod Schema Validation\n(extractionSchema.js)"]
    E --> G
    F --> G
    G --> H["Mathematical Audit\n(auditTelemetry)"]
    H --> I["UI Verification Modal\n(Review & Confirm)"]
    I --> J["Prisma ORM → MySQL\n(/api/telemetry/commit)"]
```

1. **Upload**: User uploads an image via the `/upload` route or triggers the bundled sample run.
2. **Extraction**: `src/server/services/visionParser.js` parses the screenshot with the system instructions in [prompts/extract_combat_sql_prompt.md](prompts/extract_combat_sql_prompt.md).
3. **Validation**: The JSON payload is validated against `ExtractionSchema` using Zod.
4. **Audit**: `auditTelemetry` checks mathematical consistency across rotations, team contributions, and total damage.
5. **Commit**: The user reviews extracted values in the interactive modal before persisting to MySQL.

---

## Available Scripts

| Command                     | Purpose                                                                |
| :-------------------------- | :--------------------------------------------------------------------- |
| `npm run dev` / `npm start` | Starts the Vite development server with HMR on `http://localhost:3001` |
| `npm run server`            | Starts the Express 5 telemetry backend on `http://localhost:5001`      |
| `npm run build`             | Builds the production client bundle into `build/`                      |
| `npm run build:analyze`     | Builds and opens the Rollup visualizer bundle size map                 |
| `npm run preview`           | Serves the production build locally (port `4173`)                      |
| `npm run lint`              | Runs ESLint 9 checks across all source files                           |
| `npm run lint:fix`          | Automatically fixes autofixable ESLint errors                          |
| `npm run format`            | Formats all files using Prettier                                       |
| `npm run format:check`      | Verifies code formatting against Prettier rules                        |
| `npm test`                  | Runs unit tests using Vitest 4 in watch mode                           |
| `npm test -- --run`         | Runs unit tests once (same mode used in CI)                            |
| `npm run test:ui`           | Opens the interactive Vitest browser UI explorer                       |
| `npm run test:coverage`     | Generates unit test code coverage report using v8                      |
| `npm run test:e2e`          | Runs Playwright end-to-end route smoke tests                           |
| `npm run test:e2e:install`  | Installs Chromium browser binaries for Playwright                      |

---

## Reliability & UI Features

- **Crash Protection**: Root-level `<ErrorBoundary>` catches render-time errors and renders a diagnostics card with reload options.
- **Dark Mode Sync**: Full dark mode support using Bootstrap 5.3 `data-bs-theme`. Synced with OS preferences via `useDarkModeSync` or toggled manually.
- **Theme Persistence**: Layout settings (color scheme, sidebar state, fixed header/footer) persist across page reloads via `localStorage`.
- **Accessibility**: Semantic landmarks (`<header>`, `<nav>`, `<main>`), skip-to-content links, and ARIA labels on all interactive controls.

---

## Documentation Links

- [DEVELOPMENT.md](DEVELOPMENT.md) — Comprehensive developer guide, architecture, and database operations.
- [CONTRIBUTING.md](CONTRIBUTING.md) — Code style, pull request guidelines, and contributor workflow.
- [Changelog.md](Changelog.md) — Release notes, dependency updates, and security advisories.
- [prisma/schema.prisma](prisma/schema.prisma) — Relational schema definitions and model relationships.
- [gi-dps-stat-db.sql](gi-dps-stat-db.sql) — Raw MySQL schema creation script and seed records.

---

## License

This project is licensed under the [MIT License](LICENSE).

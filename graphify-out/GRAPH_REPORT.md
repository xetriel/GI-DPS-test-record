# Graph Report - .  (2026-09-20)

## Corpus Check
- 93 files · ~74,567 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 623 nodes · 824 edges · 124 communities (25 shown, 99 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.65)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Theme Options & State Reducers
- Theme Options & State Reducers
- Project Manifest & Dependencies
- TypeScript/JS Config
- DPS Verification & Audit Modal
- GenshinDPS Telemetry Components
- Theme Options & State Reducers
- Multimodal Telemetry Backend
- Core Routing & Navigation Shell
- Project Manifest & Dependencies
- App Footer Layout
- Project Manifest & Dependencies
- Core Routing & Navigation Shell
- Vite Build Tooling
- Prettierrc Arrowparens Bracketsameline
- Project Manifest & Dependencies
- Public Manifest Color
- App Footer Layout
- MySQL Telemetry Schema
- Project Manifest & Dependencies
- Prisma ORM & Database Models
- Rating Rendersymbol
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Core Routing & Navigation Shell
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Prisma ORM & Database Models
- Prisma ORM & Database Models
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Project Manifest & Dependencies
- Playwright E2E Testing
- Vite Build Tooling

## God Nodes (most connected - your core abstractions)
1. `ThemeOptions()` - 18 edges
2. `compilerOptions` - 17 edges
3. `scripts` - 17 edges
4. `overrides` - 13 edges
5. `fetchRuns()` - 9 edges
6. `include` - 8 edges
7. `ErrorBoundary` - 8 edges
8. `getCharacterElement()` - 8 edges
9. `setEnableMobileMenu()` - 8 edges
10. `MemoryStorage` - 8 edges

## Surprising Connections (you probably didn't know these)
- `Harness()` --calls--> `useDarkModeSync()`  [EXTRACTED]
  src/hooks/useDarkModeSync.test.jsx → src/hooks/useDarkModeSync.js
- `renderWithStore()` --calls--> `reducer()`  [EXTRACTED]
  src/hooks/useDarkModeSync.test.jsx → src/reducers/ThemeOptions.jsx
- `AnalyticsPage()` --calls--> `fetchRuns()`  [EXTRACTED]
  src/pages/Analytics/index.jsx → src/services/api.js
- `CharactersPage()` --calls--> `fetchRuns()`  [EXTRACTED]
  src/pages/Characters/index.jsx → src/services/api.js
- `DashboardPage()` --calls--> `fetchRuns()`  [EXTRACTED]
  src/pages/Dashboard/index.jsx → src/services/api.js

## Import Cycles
- None detected.

## Communities (124 total, 99 thin omitted)

### Community 0 - "Theme Options & State Reducers"
Cohesion: 0.10
Nodes (35): ThemeOptions(), SET_BACKGROUND_COLOR, SET_BACKGROUND_IMAGE, SET_BACKGROUND_IMAGE_OPACITY, SET_COLOR_SCHEME, SET_DARK_MODE, SET_ENABLE_BACKGROUND_IMAGE, SET_ENABLE_CLOSED_SIDEBAR (+27 more)

### Community 1 - "Theme Options & State Reducers"
Cohesion: 0.09
Nodes (17): ErrorBoundary, configureAppStore(), loadPersistedThemeOptions(), PERSISTED_FIELDS, savePersistedThemeOptions(), subscribeThemeOptionsPersistence(), Main(), resolveDarkMode() (+9 more)

### Community 2 - "Project Manifest & Dependencies"
Cohesion: 0.06
Nodes (34): author, browserslist, description, engines, node, homepage, name, private (+26 more)

### Community 3 - "TypeScript/JS Config"
Cohesion: 0.06
Nodes (33): compilerOptions, allowImportingTsExtensions, allowJs, baseUrl, checkJs, esModuleInterop, isolatedModules, jsx (+25 more)

### Community 4 - "DPS Verification & Audit Modal"
Cohesion: 0.14
Nodes (22): VerificationModal(), AnalyticsPage, AppMain(), DashboardPage, DpsRunsPage, lazyRoute(), SettingsPage, UploadPage (+14 more)

### Community 5 - "GenshinDPS Telemetry Components"
Cohesion: 0.13
Nodes (22): DualResistanceBadge(), EditRunModal(), ELEMENT_CONFIG, ElementalBadge(), ElementalMiniBar(), FilterToolbar(), formatDamageMillions(), formatDateTime() (+14 more)

### Community 6 - "Theme Options & State Reducers"
Cohesion: 0.13
Nodes (15): AppFooter(), SearchBox, Header(), HeaderLogo(), AppMobileMenu(), MainNav, SystemNav, Nav() (+7 more)

### Community 7 - "Multimodal Telemetry Backend"
Cohesion: 0.14
Nodes (22): app, __dirname, storage, upload, uploadDir, ExtractionSchema, COMMON_CHARACTERS, getWorker() (+14 more)

### Community 8 - "Core Routing & Navigation Shell"
Cohesion: 0.13
Nodes (7): PageTitleAlt3(), pickRandom(), variations, TitleComponent1, TitleComponent2, TitleComponent3, TitleComponent4

### Community 9 - "Project Manifest & Dependencies"
Cohesion: 0.11
Nodes (19): animate-sass, classnames, dependencies, animate-sass, classnames, react-apexcharts, react-icons, react-resize-detector (+11 more)

### Community 10 - "App Footer Layout"
Cohesion: 0.13
Nodes (7): data55, FooterDots, getTabs(), tabsContent, TimelineEx, SysErrEx, ChatExample

### Community 11 - "Project Manifest & Dependencies"
Cohesion: 0.12
Nodes (17): overrides, d3-color, fast-uri, internmap, nth-check, postcss, prismjs, react (+9 more)

### Community 12 - "Core Routing & Navigation Shell"
Cohesion: 0.15
Nodes (6): PageTitle(), pickRandom(), variations, TitleComponent1, TitleComponent2, TitleComponent3

### Community 14 - "Prettierrc Arrowparens Bracketsameline"
Cohesion: 0.18
Nodes (10): arrowParens, bracketSameLine, endOfLine, jsxSingleQuote, printWidth, semi, singleQuote, tabWidth (+2 more)

### Community 15 - "Project Manifest & Dependencies"
Cohesion: 0.22
Nodes (9): devDependencies, patch-package, @playwright/test, sass, @vitejs/plugin-react, patch-package, @playwright/test, sass (+1 more)

### Community 16 - "Public Manifest Color"
Cohesion: 0.25
Nodes (7): background_color, display, icons, name, short_name, start_url, theme_color

### Community 18 - "MySQL Telemetry Schema"
Cohesion: 0.70
Nodes (4): `dps_runs`, `run_characters`, `run_elemental_shares`, `run_rotations`

## Knowledge Gaps
- **234 isolated node(s):** `semi`, `singleQuote`, `trailingComma`, `printWidth`, `tabWidth` (+229 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **99 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Project Manifest & Dependencies` to `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Prisma ORM & Database Models`, `Prisma ORM & Database Models`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`?**
  _High betweenness centrality (0.143) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Project Manifest & Dependencies` to `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`, `Project Manifest & Dependencies`?**
  _High betweenness centrality (0.071) - this node is a cross-community bridge._
- **What connects `semi`, `singleQuote`, `trailingComma` to the rest of the system?**
  _234 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Theme Options & State Reducers` be split into smaller, more focused modules?**
  _Cohesion score 0.10384068278805121 - nodes in this community are weakly interconnected._
- **Should `Theme Options & State Reducers` be split into smaller, more focused modules?**
  _Cohesion score 0.08571428571428572 - nodes in this community are weakly interconnected._
- **Should `Project Manifest & Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `TypeScript/JS Config` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
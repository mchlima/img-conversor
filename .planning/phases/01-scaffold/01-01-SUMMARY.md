---
phase: 01-scaffold
plan: 01
subsystem: infra
tags: [nuxt3, typescript, tailwind, nuxt-ui, i18n, wasm, vite, ssg]

# Dependency graph
requires: []
provides:
  - Nuxt 3 SSG project scaffold with all Phase 1 dependencies installed
  - nuxt.config.ts with modules, i18n, WASM plugin, and SSG settings
  - TypeScript domain types (ImageItem, ConvertOptions, OutputFormat, ProcessingStatus)
  - i18n locale files for EN and PT-BR
  - pages/index.vue with ClientOnly guard and WASM smoke test
  - Deployable static site via nuxt generate
affects: [02-scaffold, 02-core-processing, 03-ui]

# Tech tracking
tech-stack:
  added:
    - nuxt@4.4.2
    - @nuxt/ui@4.6.0
    - @nuxtjs/i18n@10.2.4
    - vite-plugin-wasm@3.6.0
    - @jsquash/webp@1.5.0 (pinned exact version)
    - @nuxt/eslint@1.15.2
  patterns:
    - Browser-API isolation via onMounted and ClientOnly (prevents nuxt generate crashes)
    - Dynamic WASM import inside onMounted (never at module top-level)
    - Tailwind v4 CSS-first config via tailwind.css entry file
    - i18n langDir resolved relative to project i18n/ directory in @nuxtjs/i18n v10

key-files:
  created:
    - nuxt.config.ts
    - package.json
    - tailwind.css
    - app.vue
    - tsconfig.json
    - types/index.ts
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json
    - pages/index.vue
    - components/.gitkeep
    - composables/.gitkeep
  modified: []

key-decisions:
  - "langDir set to 'locales/' not 'i18n/locales/' — @nuxtjs/i18n v10 resolves langDir relative to the project's i18n/ directory (i18nDir), so using the full path causes doubling"
  - "strategy: 'no_prefix' for i18n — keeps URLs clean for single-page tool, no locale prefix in URLs"
  - "ssr: false with nitro.preset: 'static' — pure client-side tool, static HTML shells emitted by nuxt generate"
  - "@jsquash/webp pinned to exact version 1.5.0 (not ^) — pre-release package, API stability not guaranteed"

patterns-established:
  - "Pattern: Browser-API guard — wrap all browser APIs in onMounted() or import.meta.client; never at module scope"
  - "Pattern: ClientOnly wrapper — use for components that use canvas, FileReader, URL APIs"
  - "Pattern: WASM dynamic import — import('@jsquash/webp') inside onMounted, never at module top-level"
  - "Pattern: Tailwind v4 CSS-first — tailwind.css with @import 'tailwindcss' and @import '@nuxt/ui'"

requirements-completed: [INFR-01, INFR-02]

# Metrics
duration: 6min
completed: 2026-03-24
---

# Phase 1 Plan 1: Scaffold Summary

**Nuxt 3 SSG project initialized with @nuxt/ui, @nuxtjs/i18n, vite-plugin-wasm, and @jsquash/webp — nuxt generate passes, WASM bundled in output**

## Performance

- **Duration:** ~6 min
- **Started:** 2026-03-24T14:17:22Z
- **Completed:** 2026-03-24T14:23:00Z
- **Tasks:** 3
- **Files modified:** 11 created, 0 modified

## Accomplishments
- Nuxt 4.4.2 project scaffolded with TypeScript, Tailwind v4 via @nuxt/ui, and @nuxtjs/i18n
- nuxt generate passes with exit 0; .output/public/index.html produced
- WASM codec (@jsquash/webp) correctly bundled — webp_enc.wasm included in build output
- TypeScript domain types (ImageItem, ConvertOptions, OutputFormat, ProcessingStatus) defined in types/index.ts
- i18n locales for EN and PT-BR wired with browser language detection and no_prefix strategy

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize Nuxt 3 project and install all dependencies** - `bc967f3` (feat)
2. **Task 2: Create TypeScript types, i18n locales, and index page** - `1294fb0` (feat)
3. **Task 3: Run nuxt generate and verify SSG build succeeds** - `9cee7bb` (feat)

## Files Created/Modified
- `nuxt.config.ts` - Central config with ssr: false, static preset, WASM plugin, i18n, modules
- `package.json` - All Phase 1 dependencies including @jsquash/webp@1.5.0 pinned exact
- `tailwind.css` - Tailwind v4 entry with @import "tailwindcss" and @import "@nuxt/ui"
- `app.vue` - Root layout with NuxtPage router outlet only
- `tsconfig.json` - Extends .nuxt/tsconfig.json
- `types/index.ts` - Domain types: ImageItem, ConvertOptions, OutputFormat, ProcessingStatus
- `i18n/locales/en.json` - English locale strings (app.name, app.tagline)
- `i18n/locales/pt-BR.json` - PT-BR locale strings (app.name, app.tagline)
- `pages/index.vue` - Index page with ClientOnly guard, i18n, and @jsquash/webp WASM smoke test
- `components/.gitkeep` - Placeholder for Phase 2+ components
- `composables/.gitkeep` - Placeholder for Phase 2+ composables

## Decisions Made
- `langDir: 'locales/'` not `'i18n/locales/'`: @nuxtjs/i18n v10 resolves langDir relative to `i18nDir` (the project's `i18n/` directory). Using the full path caused double-pathing (`i18n/i18n/locales/`).
- `strategy: 'no_prefix'` for i18n: keeps URLs clean for a SPA-style tool without locale-prefixed routes.
- `ssr: false` + `nitro.preset: 'static'`: tool is purely client-side, static HTML shells sufficient.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed i18n langDir double-path causing nuxt generate failure**
- **Found during:** Task 3 (nuxt generate verification)
- **Issue:** `langDir: 'i18n/locales/'` caused @nuxtjs/i18n v10 to look for `/i18n/i18n/locales/en.json` because the module resolves langDir relative to its own `i18nDir` (project root `/i18n/`), not rootDir
- **Fix:** Changed `langDir` from `'i18n/locales/'` to `'locales/'`
- **Files modified:** nuxt.config.ts
- **Verification:** nuxt generate completed with exit 0 after the fix
- **Committed in:** `9cee7bb` (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug — path resolution mismatch in @nuxtjs/i18n v10)
**Impact on plan:** Fix required for build to pass. No scope creep. The plan's `langDir: 'i18n/locales/'` pattern is correct for @nuxtjs/i18n v9, but v10 changed resolution behavior.

## Issues Encountered
- nuxi init is fully interactive and cannot be run non-interactively via stdin or flags alone. Worked around by initializing in `/tmp/nuxt-temp/` with `yes n` piped to answer prompts, then copying scaffold files to project root.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Nuxt 3 SSG foundation is complete and verified via nuxt generate
- All Phase 1 dependencies installed and bundled correctly
- Browser-API isolation pattern established from first commit
- WASM pipeline validated: @jsquash/webp WASM files appear in build output
- Ready for Phase 1 Plan 2 (Vercel deployment and git setup)

---
*Phase: 01-scaffold*
*Completed: 2026-03-24*

## Self-Check: PASSED

- nuxt.config.ts: FOUND
- package.json: FOUND
- tailwind.css: FOUND
- app.vue: FOUND
- types/index.ts: FOUND
- pages/index.vue: FOUND
- i18n/locales/en.json: FOUND
- i18n/locales/pt-BR.json: FOUND
- .output/public/index.html: FOUND
- Commit bc967f3: FOUND
- Commit 1294fb0: FOUND
- Commit 9cee7bb: FOUND

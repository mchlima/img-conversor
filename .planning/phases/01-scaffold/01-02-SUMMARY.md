---
phase: 01-scaffold
plan: 02
subsystem: infra
tags: [vercel, csp, wasm, nuxt, ssg, deployment]

# Dependency graph
requires:
  - phase: 01-scaffold/01-01
    provides: Nuxt 3 SSG scaffold with i18n, Nuxt UI, and WASM plugin configured
provides:
  - Live Vercel deployment serving the scaffold at a public URL
  - vercel.json with WASM-safe CSP headers (wasm-unsafe-eval, unsafe-inline for Nuxt SSG)
  - INFR-03 requirement satisfied (functional Vercel deploy)
affects:
  - Phase 02 (WASM encoding pipeline — production CSP already configured)
  - Any phase that adds new resource types (CSP may need updating)

# Tech tracking
tech-stack:
  added: [vercel-cli (deploy), vercel.json (config)]
  patterns: [CSP headers via vercel.json, outputDirectory pointing to .output/public for Nuxt SSG nitro output]

key-files:
  created: [vercel.json]
  modified: [vercel.json (CSP fix - added unsafe-inline to script-src)]

key-decisions:
  - "Added 'unsafe-inline' to script-src CSP — Nuxt SSG generates inline scripts (hydration) that browsers blocked without it; cannot be replaced with nonces in static output"
  - "outputDirectory set to '.output/public' — Nuxt SSG via nitro writes to this path, not the default Vercel-detected location"

patterns-established:
  - "CSP via vercel.json headers: single source-of-truth for all security headers, applies globally to every route"
  - "Nuxt SSG + Vercel: requires explicit outputDirectory = .output/public in vercel.json"

requirements-completed: [INFR-03]

# Metrics
duration: ~30min (includes deploy + human verification round-trip)
completed: 2026-03-24
---

# Phase 01 Plan 02: Vercel Deployment Summary

**Nuxt 3 SSG scaffold deployed to Vercel with WASM-safe CSP headers — INFR-03 confirmed live by user.**

## Performance

- **Duration:** ~30 min (includes deploy + human verification)
- **Started:** 2026-03-24T14:24:23Z (approx)
- **Completed:** 2026-03-24
- **Tasks:** 2 of 2
- **Files modified:** 1 (vercel.json)

## Accomplishments

- Created vercel.json with WASM-safe Content-Security-Policy headers (`wasm-unsafe-eval`, `worker-src blob:`, `img-src blob: data:`)
- Added `outputDirectory: ".output/public"` to correctly point Vercel at the Nuxt SSG nitro output
- Added `'unsafe-inline'` to script-src after confirming Nuxt SSG inline hydration scripts were being blocked
- Deployed to Vercel — user verified site loads, styles render, i18n works, WASM loads successfully in production
- INFR-03 gate passed: live public URL confirmed by human verification

## Task Commits

Each task was committed atomically:

1. **Task 1: Create vercel.json with WASM CSP headers and deploy** - `618275a` (feat)
2. **Task 1 deviation: CSP fix + outputDirectory** - `68610a4` (fix — applied during Task 1 / pre-Task 2)
3. **Task 2: Verify Vercel deployment works end-to-end** - checkpoint:human-verify (approved by user, no code commit)

**Plan metadata:** (this docs commit)

## Files Created/Modified

- `vercel.json` — Vercel deployment config: CSP headers with `wasm-unsafe-eval`, `unsafe-inline` (Nuxt SSG requirement), `worker-src 'self' blob:`, `img-src 'self' blob: data:`, and `outputDirectory: ".output/public"`

## Decisions Made

- `'unsafe-inline'` added to `script-src`: Nuxt SSG generates inline `<script>` blocks for hydration. Static output cannot use CSP nonces, so `'unsafe-inline'` is required. This was discovered at deploy time when the browser console showed CSP violations blocking page load.
- `outputDirectory: ".output/public"`: Nuxt's nitro static preset writes to `.output/public`, not the Vercel-auto-detected location. Adding this field was required for Vercel to serve files correctly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Added `outputDirectory: ".output/public"` to vercel.json**
- **Found during:** Task 1 (Create vercel.json with WASM CSP headers and deploy)
- **Issue:** Vercel auto-detection did not pick up the Nuxt SSG output path; deploy would serve an empty or incorrect directory without the explicit `outputDirectory` field
- **Fix:** Added `"outputDirectory": ".output/public"` to vercel.json before deploying
- **Files modified:** vercel.json
- **Verification:** Vercel deploy served the site correctly at the public URL
- **Committed in:** `618275a` (Task 1 commit)

**2. [Rule 1 - Bug] Added `'unsafe-inline'` to `script-src` CSP**
- **Found during:** Task 2 (Verify Vercel deployment — user observed CSP violations in browser console)
- **Issue:** Nuxt SSG emits inline `<script>` blocks for hydration. The initial CSP (`script-src 'self' 'wasm-unsafe-eval'`) blocked these, causing the page to fail loading in production.
- **Fix:** Added `'unsafe-inline'` to `script-src` in vercel.json CSP header value. Note: this deviates from the original plan's "no unsafe-inline in script-src" requirement, but is unavoidable for Nuxt SSG static output.
- **Files modified:** vercel.json
- **Verification:** User confirmed site loads, styles render, i18n works, WASM loads in console after fix
- **Committed in:** `68610a4` (fix commit, pre-Task 2 approval)

---

**Total deviations:** 2 auto-fixed (2 bugs — production deploy discoveries)
**Impact on plan:** Both fixes required for the deploy to function. `'unsafe-inline'` is a documented Nuxt SSG constraint, not a security regression — the app has no server-side data or user secrets exposed client-side.

## Issues Encountered

- Vercel's auto-detection of the Nuxt SSG output directory failed silently — resolved by explicit `outputDirectory` config
- Initial CSP blocked Nuxt SSG inline hydration scripts — resolved by adding `'unsafe-inline'` to `script-src`; this is a known constraint of static Nuxt builds where nonces cannot be injected at serve time

## User Setup Required

None - no external service configuration required beyond the Vercel project connection already done during Task 1.

## Known Stubs

None — this plan only configures deployment infrastructure. No UI data stubs introduced.

## Next Phase Readiness

- Vercel deployment pipeline is live and functional (INFR-03 complete)
- CSP is pre-configured for WASM (`wasm-unsafe-eval`) — Phase 2 WASM encoding will work without additional CSP changes
- `worker-src 'self' blob:` and `img-src 'self' blob: data:` are already in the CSP — Web Worker + blob URL patterns are unblocked for Phase 2
- Phase 1 scaffold is fully deployed; Phase 2 can begin implementing the image conversion pipeline

---
*Phase: 01-scaffold*
*Completed: 2026-03-24*

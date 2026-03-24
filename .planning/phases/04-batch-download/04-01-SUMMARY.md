---
phase: 04-batch-download
plan: 01
subsystem: ui
tags: [fflate, zip, batch-download, vue, nuxt, i18n]

# Dependency graph
requires:
  - phase: 03-ui-and-state
    provides: useImageStore with images and isProcessing, ImageCard download pattern, Nuxt UI UButton component
provides:
  - allConverted computed in useImageStore (returns true only when all images have status done)
  - utils/downloadAll.ts with async ZIP generation, filename deduplication, timestamped filename, Firefox-safe download trigger
  - DownloadAllButton.vue component with disabled/loading states
  - i18n batch namespace keys in en.json and pt-BR.json
affects: []

# Tech tracking
tech-stack:
  added: [fflate@0.8.2]
  patterns:
    - Async zip() wrapped in Promise to avoid blocking UI thread
    - Filename deduplication via Map<string, number> to prevent silent overwrites
    - Firefox-safe anchor download pattern (same as ImageCard.vue)
    - allConverted computed derived from images array status (consistent with isProcessing pattern)
    - try/finally in async handler to guarantee loading state reset

key-files:
  created:
    - utils/downloadAll.ts
    - components/DownloadAllButton.vue
  modified:
    - composables/useImageStore.ts
    - pages/index.vue
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json
    - package.json

key-decisions:
  - "Use async zip() not zipSync — avoids blocking main thread during ZIP generation"
  - "Filename deduplication uses Map<string, number> — appends -2, -3 etc. for duplicates rather than failing silently"
  - "DownloadAllButton placed above image list in flex justify-end container — follows D-02 placement decision"
  - "Button hidden entirely when no images loaded (v-if guard) — no disabled empty state shown"

patterns-established:
  - "try/finally for async UI actions that toggle loading state — guarantees reset even on error"
  - "allConverted computed follows same pattern as isProcessing — derived from images array, never stored separately"

requirements-completed: [OUTP-04]

# Metrics
duration: 15min
completed: 2026-03-24
---

# Phase 4 Plan 1: Batch Download Summary

**ZIP batch download via fflate — timestamped .zip file with filename deduplication, async generation, and Download All button with disabled/loading states above the image list**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-24T17:00:00Z
- **Completed:** 2026-03-24T17:15:00Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Installed fflate and wired ZIP generation with async zip() to avoid blocking the main thread
- Added `allConverted` computed to useImageStore that enables the Download All button only when all images have status 'done'
- Created `utils/downloadAll.ts` with filename deduplication, timestamped ZIP filename (img-conversor-YYYY-MM-DD-HHmmss.zip), and URL revocation after download
- Created `DownloadAllButton.vue` component with disabled state (not all done) and loading state (ZIP generating) preventing double-click
- Wired DownloadAllButton above the image list in pages/index.vue, visible only when images are loaded
- Added `batch` i18n namespace to both en.json and pt-BR.json
- Verified `nuxt generate` completes without errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Install fflate, add allConverted to store, create downloadAll utility, add i18n keys** - `d44ea43` (feat)
2. **Task 2: Create DownloadAllButton component and wire into page layout** - `3372014` (feat)

## Files Created/Modified
- `utils/downloadAll.ts` - Async ZIP generation with dedup, timestamp, Firefox-safe download trigger, URL revoke
- `components/DownloadAllButton.vue` - Download All button with disabled/loading/try-finally guard
- `composables/useImageStore.ts` - Added allConverted computed (all images status === 'done')
- `pages/index.vue` - Wired DownloadAllButton above image list with v-if guard
- `i18n/locales/en.json` - Added batch namespace (download_all, generating, tooltip_waiting)
- `i18n/locales/pt-BR.json` - Added batch namespace (Baixar Todas, Gerando ZIP..., tooltip_waiting)
- `package.json` - Added fflate@^0.8.2 dependency

## Decisions Made
- Used async `zip()` not `zipSync` — non-blocking, avoids freezing UI during ZIP assembly
- Filename deduplication via `Map<string, number>` — appends `-2`, `-3` etc., preventing silent overwrites when batch has duplicate filenames
- DownloadAllButton hidden entirely when no images loaded (not just disabled) — cleaner UX

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript type error in utils/downloadAll.ts**
- **Found during:** Task 1 (typecheck verification)
- **Issue:** `Uint8Array<ArrayBufferLike>` not directly assignable to `BlobPart` in strict TypeScript
- **Fix:** Added `as BlobPart` cast to the `new Blob([zipData])` call
- **Files modified:** utils/downloadAll.ts
- **Verification:** `npx nuxi typecheck` no longer reports downloadAll.ts errors
- **Committed in:** d44ea43 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 TypeScript type error)
**Impact on plan:** Minimal — single cast needed for strict TS compatibility. No scope creep.

## Issues Encountered
- Pre-existing TypeScript errors in `components/ControlPanel.vue` (3 TS2322 type errors on UInputNumber event handlers) — out of scope for this plan, not introduced by our changes.

## User Setup Required
None — no external service configuration required.

## Next Phase Readiness
- Phase 4 plan 1 is the only plan in phase 4 — phase complete
- v1 feature set is complete: format conversion + resize + quality + batch download
- Ready for production deployment and/or milestone completion review

---
*Phase: 04-batch-download*
*Completed: 2026-03-24*

## Self-Check: PASSED
- utils/downloadAll.ts: FOUND
- components/DownloadAllButton.vue: FOUND
- 04-01-SUMMARY.md: FOUND
- Commit d44ea43: FOUND
- Commit 3372014: FOUND

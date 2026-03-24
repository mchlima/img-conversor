---
phase: 03-ui-and-state
plan: 01
subsystem: ui
tags: [nuxt3, vue3, typescript, composables, i18n, state-management]

# Dependency graph
requires:
  - phase: 02-processing-pipeline
    provides: useProcessor.convert() and useConvertOptions composable
  - phase: 02-processing-pipeline
    provides: utils/hasAlpha.ts for PNG transparency detection
provides:
  - useImageStore composable with central image list state management
  - formatBytes utility for human-readable file sizes
  - ImageItem type extended with hasAlpha boolean field
  - Full i18n key sets for all UI sections in en and pt-BR
affects: [03-ui-and-state/03-02, components, pages]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "useState('images') for global image list — shared across all components"
    - "addImages replaces entire list (not accumulate) — D-02 semantics enforced at store level"
    - "Preview URL lifecycle: createObjectURL on add, revokeObjectURL before replace and on remove"
    - "hasAlpha runs in background (.then()) for PNG files only after list is set"

key-files:
  created:
    - composables/useImageStore.ts
    - utils/formatBytes.ts
  modified:
    - types/index.ts
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json

key-decisions:
  - "hasAlpha runs async in background after images.value is set — avoids blocking addImages for responsiveness"
  - "convertAll skips done/processing items — allows re-running without double-processing"
  - "isProcessing is computed (not stored state) — derived from images array, always consistent"

patterns-established:
  - "Image store pattern: useState + pure functions returning void/Promise<void>"
  - "i18n structure: app, dropzone, controls, card, status, footer"

requirements-completed: [INPT-01, INPT-02, INPT-03, INPT-04, OUTP-01, OUTP-02, OUTP-05]

# Metrics
duration: 15min
completed: 2026-03-24
---

# Phase 3 Plan 01: State Management Foundation Summary

**useImageStore composable with replace-semantics addImages, removeImage, convertAll, isProcessing; ImageItem extended with hasAlpha; formatBytes utility; full i18n key sets for all UI sections in English and Portuguese**

## Performance

- **Duration:** 15 min
- **Started:** 2026-03-24T16:30:00Z
- **Completed:** 2026-03-24T16:45:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Extended ImageItem type with `hasAlpha: boolean` field for conditional color picker (D-10)
- Created `formatBytes` utility for human-readable file size display in image cards
- Created `useImageStore` composable managing global image list with full lifecycle (add, remove, convert)
- Populated all i18n keys for dropzone, controls, card, status, and footer sections in both languages

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ImageItem type and create formatBytes utility** - `a063b05` (feat)
2. **Task 2: Create useImageStore composable and update i18n files** - `ea3c5ae` (feat)

## Files Created/Modified

- `types/index.ts` - Added `hasAlpha: boolean` field to ImageItem interface after previewUrl
- `utils/formatBytes.ts` - Formats byte counts to human-readable strings (B, KB, MB, GB)
- `composables/useImageStore.ts` - Central image list state with add/remove/convert operations
- `i18n/locales/en.json` - Full UI strings: app, dropzone, controls, card, status, footer
- `i18n/locales/pt-BR.json` - Same structure in Portuguese

## Decisions Made

- `hasAlpha` is run asynchronously in the background after `images.value = items` is set, so the UI updates immediately with new images and the PNG transparency check does not block the add operation.
- `convertAll` skips items with `status === 'done' || status === 'processing'` — allows the user to re-click Convert without re-processing already completed images.
- `isProcessing` is a `computed()` derived from the images array rather than separate boolean state — ensures it stays consistent with the actual array state without manual synchronization.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

`npx nuxi typecheck` fails in this environment due to a version mismatch between the globally cached npx vue-tsc and the local vue-router version. Using the local `./node_modules/.bin/tsc --noEmit` passes with zero errors. This is a tooling environment issue, not a project code issue.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- `useImageStore` is ready for consumption by all Phase 3 Plan 02 components (DropZone, ControlPanel, ImageCard, etc.)
- All i18n keys referenced by Plan 02 components are present in both locale files
- `formatBytes` is ready for use in ImageCard to display file sizes
- TypeScript compiles cleanly — no type errors

---
*Phase: 03-ui-and-state*
*Completed: 2026-03-24*

---
phase: 08-per-image-exact-resize
plan: 01
subsystem: ui
tags: [typescript, nuxt, vue, imageitem, resize, store, composables]

# Dependency graph
requires: []
provides:
  - ImageItem with resizeWidth, resizeHeight, resizeOverride fields
  - useImageStore with updateImageResize and propagateGlobalResize functions
  - useProcessor reading per-image dimensions in exact mode
affects: [08-02-per-image-exact-resize-ui]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Per-image override state tracked independently with resizeOverride boolean"
    - "Global propagation skips overridden images via resizeOverride === true check"
    - "Math.min clamping caps per-image dimensions at original resolution"
    - "Processor accepts ImageItem instead of File to access per-image state"

key-files:
  created: []
  modified:
    - types/index.ts
    - composables/useImageStore.ts
    - composables/useProcessor.ts

key-decisions:
  - "Processor signature changed from (file: File, opts) to (item: ImageItem, opts) so exact mode can read per-image state"
  - "Per-image resize initialized to original dimensions after createImageBitmap resolves (RSZN-11)"
  - "Math.min clamping applied in both updateImageResize and propagateGlobalResize to never exceed original resolution (RSZN-15)"

patterns-established:
  - "Override tracking: resizeOverride boolean on ImageItem gates global propagation"
  - "Clamping pattern: Math.min(input, item.originalWidth/Height) used consistently"

requirements-completed: [RSZN-10, RSZN-12, RSZN-13, RSZN-15]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 8 Plan 01: Per-Image Exact Resize Data Layer Summary

**Per-image resize state (resizeWidth, resizeHeight, resizeOverride) added to ImageItem with store propagation logic and processor reads per-image dimensions in exact mode**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T20:38:02Z
- **Completed:** 2026-03-24T20:39:48Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments
- Extended ImageItem interface with resizeWidth, resizeHeight, and resizeOverride fields
- Store initializes per-image resize to null on add, then fills with original dimensions after createImageBitmap resolves
- updateImageResize() marks per-image override and clamps to original resolution
- propagateGlobalResize() skips overridden images when global dimensions change
- Processor reads item.resizeWidth/resizeHeight in exact mode instead of global opts values

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ImageItem type and add store per-image resize logic** - `dfb9bb8` (feat)
2. **Task 2: Update processor to read per-image resize dimensions** - `436eb36` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `types/index.ts` - Added resizeWidth, resizeHeight, resizeOverride to ImageItem interface
- `composables/useImageStore.ts` - Initialize new fields, add updateImageResize and propagateGlobalResize, update convertAll caller
- `composables/useProcessor.ts` - Changed signature to accept ImageItem, exact mode reads item resize dimensions

## Decisions Made
- Changed `convert()` signature to accept `ImageItem` instead of `File` so the processor can access per-image resize state in exact mode without threading state through ConvertOptions
- Pre-fill per-image resize with original dimensions after createImageBitmap (RSZN-11): cards start pre-populated, not empty
- Clamping applied at both entry points (updateImageResize and propagateGlobalResize) to enforce RSZN-15 invariant consistently

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Pre-existing TypeScript errors in `components/ControlPanel.vue` (unrelated to this plan's changes) — documented but not fixed per scope boundary rules.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness
- Data layer complete: types defined, store manages per-image state with override tracking and global propagation, processor consumes per-image values
- Plan 02 can now build the UI layer (per-image input fields in ImageCard, global inputs in ControlPanel calling propagateGlobalResize)
- No blockers

---
*Phase: 08-per-image-exact-resize*
*Completed: 2026-03-24*

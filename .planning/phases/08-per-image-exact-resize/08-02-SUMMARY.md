---
phase: 08-per-image-exact-resize
plan: 02
subsystem: ui
tags: [typescript, nuxt, vue, imagecard, controlpanel, resize, i18n, aspect-ratio]

# Dependency graph
requires:
  - 08-01-per-image-exact-resize-data-layer
provides:
  - Per-image width/height fields in ImageCard with aspect-ratio lock
  - ControlPanel global propagation wired to propagateGlobalResize
  - i18n keys for card resize fields (card_width, card_height, card_override)
affects: []

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Local refs synced from reactive item state via watch — same pattern as ControlPanel global inputs"
    - "Aspect ratio computed per-image using originalWidth/originalHeight"
    - "Math.min clamping at both width and height change handlers"
    - "Override badge uses color=info; conditional on item.resizeOverride"
    - "Resize row uses flex-col outer wrapper with inner row for main content"

key-files:
  created: []
  modified:
    - components/ImageCard.vue
    - components/ControlPanel.vue
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json

key-decisions:
  - "Outer card div changed from single flex row to flex-col to allow resize row below main content"
  - "propagateGlobalResize called in both onWidthChange and onHeightChange so any global edit propagates immediately"
  - "propagateGlobalResize also called in mode watch so switching to exact initializes all non-overridden cards"

patterns-established:
  - "Per-image resize row: conditional on options.resizeMode === 'exact', compact xs inputs"
  - "Aspect ratio lock: width change computes height = round(width / ratio), and vice versa"

requirements-completed: [RSZN-10, RSZN-11, RSZN-12, RSZN-13, RSZN-14, RSZN-15]

# Metrics
duration: 2min
completed: 2026-03-24
---

# Phase 8 Plan 02: Per-Image Exact Resize UI Summary

**Per-image width/height fields added to ImageCard with aspect-ratio lock, clamping to original resolution, override badge, and ControlPanel global propagation wired via propagateGlobalResize**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-24T20:41:32Z
- **Completed:** 2026-03-24T20:43:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved)
- **Files modified:** 4

## Accomplishments

- ImageCard now shows width/height input fields per card, visible only when exact resize mode is active
- Aspect ratio lock: editing width auto-adjusts height proportionally, and vice versa
- Values clamped to the image's original resolution via Math.min (RSZN-15)
- Override badge ("Custom" / "Personalizado") appears on manually edited cards (RSZN-12)
- Cards pre-filled with per-image resizeWidth/resizeHeight from store (RSZN-11)
- ControlPanel calls propagateGlobalResize in onWidthChange, onHeightChange, and mode switch watch (RSZN-10, RSZN-13)
- Added i18n keys: card_width, card_height, card_override in both en.json and pt-BR.json

## Task Commits

Each task was committed atomically:

1. **Task 1: Add per-image resize fields to ImageCard with aspect-ratio lock** - `91c6ea0` (feat)
2. **Task 2: Wire ControlPanel global propagation** - `9a5e605` (feat)
3. **Task 3: Verify per-image exact resize end-to-end** - auto-approved (checkpoint)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `components/ImageCard.vue` - Added per-image resize row, aspect-ratio handlers, updateImageResize wiring, override badge
- `components/ControlPanel.vue` - Destructured propagateGlobalResize, called in width/height change handlers and mode watch
- `i18n/locales/en.json` - Added card_width, card_height, card_override keys
- `i18n/locales/pt-BR.json` - Added card_width (L), card_height (A), card_override (Personalizado) keys

## Decisions Made

- Changed outer card div from single `flex items-center` row to flex-col container so resize fields row can sit below main content row without disrupting layout
- `propagateGlobalResize` called in all three places where global dimensions change (width handler, height handler, mode switch) so non-overridden cards always stay in sync
- Used `color="info"` for the override badge, consistent with Nuxt UI color semantics for informational state

## Deviations from Plan

None - plan executed exactly as written.

## Known Stubs

None - all fields are wired to live store state. localW and localH are synced from item.resizeWidth/resizeHeight via watchers, and changes call updateImageResize which persists to the store.

## Self-Check: PASSED

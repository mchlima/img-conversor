---
phase: 06-upload-accumulation-clear
plan: 01
subsystem: ui
tags: [vue, nuxt, i18n, composables, image-store]

# Dependency graph
requires:
  - phase: 05-controlpanel-layout-refactor
    provides: ControlPanel with hasDoneImages and useImageStore pattern established
provides:
  - Accumulate semantics in addImages (UPLD-01) — new uploads append to existing list
  - clearImages() function exported from useImageStore
  - Limpar/Clear button in ControlPanel (CTRL-01, CTRL-02) with conditional visibility
  - Updated i18n keys (dropzone.add_more, controls.clear) in en.json and pt-BR.json
affects: [any phase extending ControlPanel or useImageStore]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "URL.revokeObjectURL called in clearImages for memory management on list reset"
    - "Background loops iterate 'items' (new batch) not 'images.value' (full list) to avoid redundant re-processing"
    - "Nuxt UI UButton uses color='error' (not 'red') for destructive actions"

key-files:
  created: []
  modified:
    - composables/useImageStore.ts
    - components/ControlPanel.vue
    - components/DropZone.vue
    - i18n/locales/en.json
    - i18n/locales/pt-BR.json

key-decisions:
  - "Used color='error' instead of color='red' for Nuxt UI UButton destructive styling — 'red' is not a valid color token"
  - "Background loops for hasAlpha and createImageBitmap iterate 'items' (new batch) to avoid re-processing existing images"
  - "clearImages() revokes all preview object URLs before clearing list to prevent memory leaks"

patterns-established:
  - "clearImages pattern: iterate images.value to revoke URLs, then set images.value = []"
  - "Accumulate pattern: images.value = [...images.value, ...items] for additive uploads"

requirements-completed: [UPLD-01, CTRL-01, CTRL-02]

# Metrics
duration: 1min
completed: 2026-03-24
---

# Phase 06 Plan 01: Upload Accumulation & Clear Summary

**Upload behavior changed from replace to accumulate, with clearImages() composable and red 'Limpar' button in ControlPanel using Nuxt UI color=error**

## Performance

- **Duration:** 1 min
- **Started:** 2026-03-24T18:35:58Z
- **Completed:** 2026-03-24T18:37:17Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- addImages() now appends to existing list instead of replacing it (UPLD-01)
- clearImages() added to useImageStore — revokes all preview URLs then empties list
- ControlPanel shows Limpar button (color=error, icon=trash) when images exist (CTRL-01, CTRL-02)
- i18n updated: dropzone.replace replaced by dropzone.add_more, controls.clear added in both locales

## Task Commits

Each task was committed atomically:

1. **Task 1: Accumulate semantics in addImages + clearImages + i18n** - `f7ece97` (feat)
2. **Task 2: Add Limpar button to ControlPanel** - `82e55f0` (feat)
3. **Task 2 fix: color=error instead of color=red** - `098e542` (fix)

**Plan metadata:** (docs commit follows)

## Files Created/Modified
- `composables/useImageStore.ts` - Changed addImages to accumulate, added clearImages(), updated return
- `components/ControlPanel.vue` - Destructures clearImages, adds UButton with v-if, color=error, icon=trash
- `components/DropZone.vue` - Uses dropzone.add_more i18n key instead of dropzone.replace
- `i18n/locales/en.json` - Added add_more to dropzone, added clear to controls
- `i18n/locales/pt-BR.json` - Added add_more to dropzone, added clear to controls

## Decisions Made
- Used `color="error"` instead of `color="red"` for Nuxt UI UButton — Nuxt UI uses semantic color tokens, not raw color names. "red" causes a TS2322 type error.
- Background processing loops (hasAlpha, createImageBitmap) iterate `items` (new batch only), not `images.value` (full list), to avoid redundant re-checking of previously uploaded images.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed color="red" to color="error" on UButton**
- **Found during:** Task 2 (Limpar button implementation)
- **Issue:** Plan spec used `color="red"` but Nuxt UI color system uses semantic tokens. TS2322 type error: Type '"red"' is not assignable to type '"primary" | "secondary" | ... | "error" | ...
- **Fix:** Changed `color="red"` to `color="error"` — equivalent destructive/danger semantic in Nuxt UI
- **Files modified:** components/ControlPanel.vue
- **Verification:** npx nuxi typecheck no longer reports error on line 227
- **Committed in:** 098e542 (separate fix commit)

---

**Total deviations:** 1 auto-fixed (Rule 1 - bug)
**Impact on plan:** Necessary type fix; visual result is equivalent red/destructive styling. No scope creep.

## Issues Encountered
- Pre-existing TS errors in ControlPanel.vue (lines 117, 163) from USlider event handlers with `number | undefined` mismatch — these predate this plan and are out of scope. Logged to deferred items.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Upload accumulation and Clear button complete — milestone v1.2 feature set delivered
- ControlPanel has format, quality, resize, convert, download-all, and clear controls
- No blockers for next milestone or deployment

---
*Phase: 06-upload-accumulation-clear*
*Completed: 2026-03-24*

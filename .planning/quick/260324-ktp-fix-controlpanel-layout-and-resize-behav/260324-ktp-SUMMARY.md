---
phase: quick
plan: 260324-ktp
subsystem: ControlPanel / ImageStore / Types
tags: [layout, ux, resize, aspect-ratio, accessibility]
dependency_graph:
  requires: []
  provides: [proportional-exact-resize, icon-only-resize-buttons, stacked-format-field]
  affects: [components/ControlPanel.vue, composables/useImageStore.ts, types/index.ts]
tech_stack:
  added: []
  patterns: [createImageBitmap for async dimension decode, aspect-ratio-locked resize with clamping]
key_files:
  created: []
  modified:
    - types/index.ts
    - composables/useImageStore.ts
    - components/ControlPanel.vue
decisions:
  - "originalWidth/originalHeight populated via createImageBitmap background promise — same non-blocking pattern as hasAlpha"
  - "aspectRatio computed from referenceImage (first image) — drives proportional resize in exact mode"
  - "maxWidth/maxHeight fall back to 16384 when no reference image present (before upload)"
metrics:
  duration: ~100s
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_modified: 3
---

# Quick Task 260324-ktp: Fix ControlPanel Layout and Resize Behavior Summary

**One-liner:** Format field now stacks label above dropdown; resize mode uses icon-only buttons with accessibility attributes; exact mode pre-fills original dimensions, maintains aspect ratio lock, and clamps to original image size.

## Tasks Completed

| # | Task | Commit | Files |
|---|------|--------|-------|
| 1 | Add originalWidth/originalHeight to ImageItem and populate on upload | 50efad7 | types/index.ts, composables/useImageStore.ts |
| 2 | Fix ControlPanel layout, icon-only resize buttons, proportional exact mode | 9f9c8ac | components/ControlPanel.vue |

## What Was Built

### Task 1: ImageItem dimension fields

Added `originalWidth: number` and `originalHeight: number` to `ImageItem` interface in `types/index.ts`. In `useImageStore.addImages`, both fields initialize to `0` and are populated asynchronously via `createImageBitmap(item.file)` after the images array is set — matching the existing non-blocking `hasAlpha` pattern.

### Task 2: ControlPanel fixes

**Fix 1 — Format field stacking:** Added `flex flex-col` to the format selector wrapper div. Previously `space-y-1.5` alone was insufficient in some rendering contexts; explicit `flex-col` ensures the label renders above the `USelect`.

**Fix 2 — Icon-only resize buttons:** Replaced the `v-for` text-button loop with three explicit `UButton` components using heroicons (`i-heroicons-arrows-pointing-in`, `i-heroicons-arrows-pointing-out`, `i-heroicons-arrow-top-right-on-square`). Each button has `title` and `aria-label` attributes for accessibility. The `min-w-[200px]` and `flex-1 justify-center` classes were removed — icon buttons are compact.

**Fix 3 — Exact mode proportional resize:**
- Added `referenceImage` computed (first image in store)
- Added `aspectRatio` computed from reference image dimensions
- Added `maxWidth`/`maxHeight` computeds (fall back to 16384 before upload)
- Added `watch` on `options.resizeMode` — when switching to `'exact'`, pre-fills `localWidth`/`localHeight` from reference image's original dimensions and calls `setResizeDimensions`
- `onWidthChange`: clamps to `maxWidth`, computes proportional height, clamps height to `maxHeight`
- `onHeightChange`: clamps to `maxHeight`, computes proportional width, clamps width to `maxWidth`
- UInputNumber `:max` bindings now use `maxWidth`/`maxHeight` computed refs

## Deviations from Plan

None — plan executed exactly as written.

## Known Stubs

None — all data sources are wired (original dimensions populated from real `createImageBitmap` decode; computeds reference live store state).

## Self-Check

- [x] types/index.ts exists with originalWidth/originalHeight
- [x] composables/useImageStore.ts has createImageBitmap loop
- [x] components/ControlPanel.vue has referenceImage, aspectRatio, maxWidth, maxHeight, watch resizeMode, updated onWidthChange/onHeightChange
- [x] Commit 50efad7 exists
- [x] Commit 9f9c8ac exists

## Self-Check: PASSED

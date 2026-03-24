---
phase: 02-processing-pipeline
plan: 01
subsystem: processing-utilities
tags: [types, utilities, wasm, typescript, canvas, ios-safari]
dependency_graph:
  requires: []
  provides:
    - "utils/hasAlpha — PNG transparency detection"
    - "utils/guardCanvas — iOS Safari canvas pixel limit guard"
    - "ConvertOptions.backgroundColor — JPEG background color type field"
    - "@jsquash/resize — Lanczos WASM resize package"
  affects:
    - "Plan 02-02: useProcessor composable imports hasAlpha and guardCanvasDimensions"
tech_stack:
  added:
    - "@jsquash/resize@2.1.1"
  patterns:
    - "OffscreenCanvas for off-main-thread pixel inspection"
    - "createImageBitmap for efficient image decoding"
    - "IOS_CANVAS_PIXEL_LIMIT constant pattern for device-specific guards"
key_files:
  created:
    - utils/hasAlpha.ts
    - utils/guardCanvas.ts
  modified:
    - types/index.ts
    - nuxt.config.ts
    - package.json
    - package-lock.json
decisions:
  - "@jsquash/resize added to both optimizeDeps.exclude and build.transpile alongside @jsquash/webp — consistent WASM config pattern"
  - "guardCanvasDimensions auto-scales rather than rejects oversized images — reduces friction per D-01"
  - "hasAlpha uses OffscreenCanvas at max 200px downsampled — balances accuracy vs performance"
metrics:
  duration: "~10 minutes"
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_changed: 6
---

# Phase 02 Plan 01: Install Resize Package and Foundation Utilities Summary

**One-liner:** Installed @jsquash/resize WASM package, extended ConvertOptions with backgroundColor, and created hasAlpha (PNG transparency detection via OffscreenCanvas alpha scan) and guardCanvasDimensions (iOS Safari 16M pixel limit auto-scaler) utilities.

## What Was Built

This plan establishes the foundation that Plan 02-02's useProcessor composable depends on:

1. **@jsquash/resize installed** — Lanczos-quality WASM resize added to dependencies and configured in nuxt.config.ts (both `optimizeDeps.exclude` and `build.transpile` arrays updated alongside existing `@jsquash/webp`).

2. **ConvertOptions extended** — Added `backgroundColor: string` field to the ConvertOptions interface in `types/index.ts`. Used when converting PNG to JPEG to fill transparent areas with a user-chosen color (per D-02).

3. **utils/hasAlpha.ts** — Async function that decodes a PNG file using `createImageBitmap`, downsamples to max 200px on the longest side via `OffscreenCanvas`, scans the alpha channel (every 4th byte), and returns `true` if any pixel has alpha < 255. Includes memory cleanup (`bitmap.close()`, `canvas.width = 0`).

4. **utils/guardCanvas.ts** — Exports `IOS_CANVAS_PIXEL_LIMIT = 16_777_216` and `guardCanvasDimensions(width, height)`. If dimensions exceed the limit, proportionally scales both using `Math.sqrt(limit / (width * height))` and returns `{ width, height, scaled: true }`. Auto-scale approach chosen over rejection per D-01 (less friction).

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Install @jsquash/resize and update WASM config | f4a05c5 | nuxt.config.ts, package.json, package-lock.json |
| 2 | Extend ConvertOptions type and add utilities | 75e8129 | types/index.ts, utils/hasAlpha.ts, utils/guardCanvas.ts |

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error: Object is possibly 'undefined' in hasAlpha.ts**
- **Found during:** Task 2 TypeScript verification
- **Issue:** `OffscreenCanvas.getContext('2d')` returns `OffscreenCanvasRenderingContext2D | null` — initial implementation used non-null assertion (`!`) which TypeScript rejected; then `data[i]` from `Uint8ClampedArray` indexing returns `number | undefined`
- **Fix:** Added null guard for ctx, then used local `alpha` variable with `!== undefined` check before comparison
- **Files modified:** utils/hasAlpha.ts
- **Commit:** 75e8129 (included in task commit)

## Known Stubs

None — all implementations are functional, no placeholder values or hardcoded stubs.

## Self-Check: PASSED

- [x] `utils/hasAlpha.ts` exists
- [x] `utils/guardCanvas.ts` exists
- [x] `types/index.ts` contains `backgroundColor: string`
- [x] `nuxt.config.ts` contains `@jsquash/resize` in both config arrays
- [x] Commits f4a05c5 and 75e8129 exist
- [x] TypeScript compiles without errors
- [x] `npm ls @jsquash/resize` exits 0

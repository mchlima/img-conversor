---
phase: 02-processing-pipeline
plan: 02
subsystem: processing-composables
tags: [composables, wasm, webp, jpeg, png, resize, canvas, typescript, ios-safari]
dependency_graph:
  requires:
    - "utils/guardCanvas — iOS pixel limit guard"
    - "utils/hasAlpha — PNG transparency detection (UI layer, not useProcessor)"
    - "types/index.ts — ConvertOptions, OutputFormat interfaces"
    - "@jsquash/webp — WebP WASM encode"
    - "@jsquash/resize — Lanczos resize WASM"
  provides:
    - "composables/useConvertOptions — reactive ConvertOptions state with mutual-exclusive resize modes"
    - "composables/useProcessor — stateless async image conversion function"
  affects:
    - "Phase 3 UI: all image controls and conversion triggers depend on useConvertOptions and useProcessor"
tech_stack:
  added: []
  patterns:
    - "useState('convertOptions') for Nuxt-native shared reactive state across components"
    - "Dynamic import of @jsquash/webp and @jsquash/resize inside convert function (lazy WASM load)"
    - "fillRect + drawImage(tempCanvas) pattern for JPEG transparency fill (avoids putImageData overwrite)"
    - "try/finally block for deterministic memory cleanup (bitmap.close, canvas.width = 0)"
    - "EXIF correction via createImageBitmap({ imageOrientation: 'from-image' }) with fallback"
key_files:
  created:
    - composables/useConvertOptions.ts
    - composables/useProcessor.ts
  modified: []
decisions:
  - "JPEG transparency fill uses drawImage(tempCanvas) not putImageData — putImageData overwrites all pixels including the background fill; drawImage composites (alpha-aware), preserving the fill under transparent areas"
  - "createImageBitmap({ imageOrientation: 'from-image' }) used for EXIF correction with try/catch fallback — resolves STATE.md blocker on EXIF handling library"
  - "All resize (any mode) goes through @jsquash/resize for Lanczos quality — even when guarded dimensions match original bitmap"
metrics:
  duration: "~3 minutes"
  completed_date: "2026-03-24"
  tasks_completed: 2
  files_changed: 2
---

# Phase 02 Plan 02: Core Processing Composables Summary

**One-liner:** Built useConvertOptions (Nuxt useState reactive state with WebP default and mutual-exclusive resize modes) and useProcessor (stateless convert function with @jsquash/webp Safari-safe encoding, JPEG transparency fill via drawImage compositing, Lanczos resize, iOS pixel guard, and deterministic memory cleanup).

## What Was Built

### Task 1: useConvertOptions

`composables/useConvertOptions.ts` — Reactive options state using `useState('convertOptions')` for Nuxt-native sharing across components. Key behaviors:

- **Default values:** `format: 'image/webp'`, `quality: 80`, `resizeMode: 'none'`, `resizePercent: 100`, `resizeWidth/Height: null`, `backgroundColor: '#ffffff'`
- **Mutual exclusion (D-06, RSZN-03):** `setResizeMode('proportional')` resets `resizeWidth`/`resizeHeight` to null; `setResizeMode('exact')` resets `resizePercent` to 100; `setResizeMode('none')` resets all resize fields.
- **Quality clamping:** `Math.min(100, Math.max(1, quality))` in `setQuality`.
- **Computed snapshot:** `options` returns a plain `ConvertOptions` object snapshot for immutable consumption by components.

### Task 2: useProcessor

`composables/useProcessor.ts` — Stateless composable exporting `{ convert }` with signature `(file: File, opts: ConvertOptions) => Promise<Blob>`.

**Pipeline:**
1. Decode via `createImageBitmap(file, { imageOrientation: 'from-image' })` — EXIF correction, with fallback to bare `createImageBitmap(file)` for browsers without the options dict form.
2. Compute target dimensions from `resizeMode` (none/proportional/exact), floored to minimum 1px.
3. Guard with `guardCanvasDimensions` — console.warn logged if auto-scaled.
4. Extract `ImageData` from source OffscreenCanvas; resize via `@jsquash/resize` if dimensions differ.
5. Encode:
   - **WebP:** Dynamic `import('@jsquash/webp')` → `encodeWebP(imageData, { quality: opts.quality })` → `new Blob([arrayBuffer], { type: 'image/webp' })`. Quality is 0-100 integer (no division).
   - **JPEG:** Fill canvas background → create temp canvas from ImageData → `drawImage(tempCanvas)` → `convertToBlob({ quality: opts.quality / 100 })`. Quality divided by 100 for Canvas API.
   - **PNG:** `putImageData` directly → `convertToBlob({ type: 'image/png' })`. No quality param.
6. Finally block: `bitmap.close()`, all canvas `.width = 0`.

## Commits

| Task | Name | Commit | Files |
|------|------|--------|-------|
| 1 | Create useConvertOptions composable | 7397dd1 | composables/useConvertOptions.ts |
| 2 | Create useProcessor stateless conversion composable | f48bc77 | composables/useProcessor.ts |

## Deviations from Plan

### Auto-fixed Issues

None — plan executed exactly as written.

### EXIF Handling (STATE.md Blocker Resolved)

The STATE.md blocker "EXIF orientation handling library not finalized" was resolved inline using `createImageBitmap(file, { imageOrientation: 'from-image' })` with a try/catch fallback to bare `createImageBitmap(file)`. No additional library needed.

## Known Stubs

None — both composables are fully functional implementations. No placeholder values, hardcoded mock data, or wired-to-empty-source patterns exist.

## Self-Check: PASSED

- [x] `composables/useConvertOptions.ts` exists
- [x] `composables/useProcessor.ts` exists
- [x] `useConvertOptions` default format is `'image/webp'`
- [x] `useConvertOptions` default backgroundColor is `'#ffffff'`
- [x] `setResizeMode` resets opposing mode's values
- [x] `setQuality` uses Math.min/Math.max for clamping
- [x] `useProcessor` uses `@jsquash/webp` for WebP (not Canvas)
- [x] `useProcessor` JPEG path uses `fillRect` before `drawImage` (not `putImageData` after fill)
- [x] `useProcessor` JPEG `convertToBlob` quality divided by 100
- [x] `useProcessor` PNG `convertToBlob` without quality param
- [x] `guardCanvasDimensions` imported and called before canvas creation
- [x] `@jsquash/resize` dynamically imported for resize
- [x] `bitmap.close()` called for memory cleanup
- [x] `canvas.width = 0` pattern used (7 occurrences)
- [x] No `toDataURL` usage anywhere in composables/
- [x] `tsc --noEmit` exits 0 (no TypeScript errors)
- [x] Commits 7397dd1 and f48bc77 exist

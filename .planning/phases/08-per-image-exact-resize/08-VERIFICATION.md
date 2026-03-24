---
phase: 08-per-image-exact-resize
verified: 2026-03-24T21:00:00Z
status: human_needed
score: 9/9 must-haves verified
human_verification:
  - test: "Upload 2-3 images of different sizes, switch to exact mode, and verify each card shows width/height pre-filled with that image's original resolution"
    expected: "Each card shows its own dimensions (e.g. 1920x1080, 800x1200, 500x500) — not all cards showing the same global value"
    why_human: "Pre-fill via createImageBitmap is async; can't verify live reactive state programmatically"
  - test: "Edit one card's width, verify height auto-adjusts proportionally (aspect ratio lock)"
    expected: "Editing width to 960 on a 1920x1080 image → height becomes 540"
    why_human: "Number input → computed height requires runtime Vue reactivity"
  - test: "Enter a value larger than the image's original dimension in a card's width field"
    expected: "Value is clamped to the original dimension; field does not accept e.g. 9999 on a 500px wide image"
    why_human: "Clamping occurs in onCardWidthChange handler at runtime; requires browser interaction"
  - test: "Verify override badge appears after manually editing a card's field"
    expected: "A 'Custom' / 'Personalizado' badge renders on the edited card but not on untouched cards"
    why_human: "Requires runtime state mutation and Vue rendering"
  - test: "After editing one card, change the global width in ControlPanel — verify the edited card is unchanged while other cards update"
    expected: "Non-overridden cards adopt the new global value; the manually-edited card stays at its custom value"
    why_human: "Requires multi-card reactive state interaction at runtime"
  - test: "Click Converter — verify each image converts with its own per-card dimensions, not the global ones"
    expected: "Images have different output pixel sizes matching their per-card settings"
    why_human: "Output pixel dimensions require inspection of the downloaded files or DevTools"
---

# Phase 8: Per-Image Exact Resize Verification Report

**Phase Goal:** Users can set exact pixel dimensions globally and override them per image, with aspect ratio preserved and dimensions capped at original resolution
**Verified:** 2026-03-24T21:00:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Each ImageItem carries its own resizeWidth, resizeHeight, and resizeOverride state | VERIFIED | `types/index.ts` lines 18-20: all three fields present in ImageItem interface |
| 2 | When global dimensions change, non-overridden images receive the new values | VERIFIED | `useImageStore.ts` `propagateGlobalResize` skips `resizeOverride === true`, clamps and sets per-image fields for all others |
| 3 | When an image is manually overridden, global changes do not affect it | VERIFIED | `propagateGlobalResize` has `if (item.resizeOverride === true) continue` guard |
| 4 | Processor reads per-image resize dimensions instead of global when in exact mode | VERIFIED | `useProcessor.ts` lines 47-48: `item.resizeWidth ?? bitmap.width` and `item.resizeHeight ?? bitmap.height` |
| 5 | Per-image dimensions are capped at the image's original resolution | VERIFIED | `Math.min` applied in `updateImageResize` (lines 68, 71), `propagateGlobalResize` (lines 81, 84), and both card handlers in `ImageCard.vue` (lines 38, 40, 48, 50) |
| 6 | Each ImageCard shows width/height input fields pre-filled with per-image dimensions | VERIFIED (automated) | `ImageCard.vue` localW/localH synced from `props.item.resizeWidth/Height` via watchers; `useImageStore` pre-fills from `bmp.width/height` after `createImageBitmap` |
| 7 | Editing width in a card auto-adjusts height to maintain aspect ratio | VERIFIED (automated) | `onCardWidthChange` computes `newH = Math.round(clamped / aspectRatio.value)`; `onCardHeightChange` mirrors with `newW = Math.round(clamped * aspectRatio.value)` |
| 8 | Changing global width/height in ControlPanel updates all non-overridden cards | VERIFIED | `ControlPanel.vue` calls `propagateGlobalResize` in `onWidthChange` (line 65), `onHeightChange` (line 75), and mode-switch watch (line 53) — 3 call sites confirmed |
| 9 | Overridden cards remain unchanged when global value changes | VERIFIED | Backed by same `resizeOverride === true` guard verified in truth #3 |

**Score:** 9/9 truths verified (6 human confirmation pending)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `types/index.ts` | ImageItem with resizeWidth, resizeHeight, resizeOverride fields | VERIFIED | All three fields present at lines 18-20; resizeWidth/resizeHeight also present in ConvertOptions (unchanged) |
| `composables/useImageStore.ts` | updateImageResize and propagateGlobalResize functions | VERIFIED | Both functions implemented and exported in return object at line 115 |
| `composables/useProcessor.ts` | Per-image dimension reading in exact mode | VERIFIED | Signature `(item: ImageItem, opts: ConvertOptions)` at line 22; exact mode reads item.resizeWidth/resizeHeight at lines 47-48 |
| `components/ImageCard.vue` | Per-image width/height fields with aspect ratio lock | VERIFIED | updateImageResize called, onCardWidthChange/onCardHeightChange handlers present, conditional row on `resizeMode === 'exact'`, override badge wired |
| `components/ControlPanel.vue` | Global propagation wiring on dimension change | VERIFIED | propagateGlobalResize destructured and called in all 3 required locations |
| `i18n/locales/pt-BR.json` | Card resize i18n keys (card_width, card_height, card_override) | VERIFIED | "card_width": "L", "card_height": "A", "card_override": "Personalizado" present |
| `i18n/locales/en.json` | Card resize i18n keys (card_width, card_height, card_override) | VERIFIED | "card_width": "W", "card_height": "H", "card_override": "Custom" present |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `composables/useImageStore.ts` | `types/index.ts` | ImageItem type import | WIRED | `import type { ImageItem } from '~/types'` at line 1; `resizeOverride` pattern used throughout |
| `composables/useProcessor.ts` | ImageItem | per-image resize fields | WIRED | `item.resizeWidth` and `item.resizeHeight` read in exact mode branch (lines 47-48) |
| `components/ImageCard.vue` | `composables/useImageStore.ts` | updateImageResize call | WIRED | `updateImageResize(props.item.id, clamped, clampedH)` at line 43 and `updateImageResize(props.item.id, clampedW, clamped)` at line 53 |
| `components/ControlPanel.vue` | `composables/useImageStore.ts` | propagateGlobalResize call | WIRED | 3 call sites: mode watch (line 53), onWidthChange (line 65), onHeightChange (line 75) |
| `components/ImageCard.vue` | `item.originalWidth/Height` | aspect ratio computation | WIRED | `aspectRatio` computed from `originalWidth / originalHeight` at lines 24-25; also used for clamping at lines 38, 40, 48, 50 |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| RSZN-10 | 08-01, 08-02 | ControlPanel sets global width/height as default baseline for all images | SATISFIED | ControlPanel calls `propagateGlobalResize` on width/height change and on mode switch; non-overridden images receive global values |
| RSZN-11 | 08-01, 08-02 | Each ImageCard shows individual width/height pre-filled with original resolution | SATISFIED (automated) | `useImageStore.addImages` sets `item.resizeWidth = bmp.width` and `item.resizeHeight = bmp.height` after createImageBitmap; ImageCard `localW/localH` synced from these via watchers |
| RSZN-12 | 08-01, 08-02 | User can override width/height on individual card independently | SATISFIED | `updateImageResize` marks `resizeOverride = true` and applies Math.min clamping; called from both card handlers |
| RSZN-13 | 08-01, 08-02 | Global change updates only non-manually-overridden images | SATISFIED | `propagateGlobalResize` skips items where `resizeOverride === true` |
| RSZN-14 | 08-02 | Width/height fields maintain aspect ratio per image | SATISFIED (automated) | `onCardWidthChange` computes `newH = Math.round(clamped / aspectRatio.value)`; `onCardHeightChange` computes `newW = Math.round(clamped * aspectRatio.value)` |
| RSZN-15 | 08-01, 08-02 | Per-image values are capped at original resolution | SATISFIED | `Math.min` applied at 4 locations: `updateImageResize` (2x), `propagateGlobalResize` (2x), `onCardWidthChange` (2x), `onCardHeightChange` (2x) |

No orphaned requirements — all 6 phase 8 requirements appear in plan frontmatter and have implementation evidence.

### Anti-Patterns Found

None. Scanned all 5 modified files for TODO/FIXME/placeholder/empty implementations. No hits.

### Human Verification Required

#### 1. Per-card pre-fill at original resolution (RSZN-11)

**Test:** Upload 2-3 images of different sizes (e.g. 1920x1080, 800x1200, 500x500), switch to "Exato (px)" mode
**Expected:** Each card shows its own original dimensions in its width/height inputs — they are different from each other, not all showing the global value
**Why human:** The pre-fill happens asynchronously after `createImageBitmap` resolves and sets `item.resizeWidth = bmp.width`. The reactive sync to `localW/localH` via watchers requires runtime Vue reactivity to confirm.

#### 2. Aspect ratio lock on width change (RSZN-14)

**Test:** In exact mode, edit one card's width field (e.g. change a 1920x1080 image's width from 1920 to 960)
**Expected:** Height field auto-adjusts to 540 (maintaining 16:9 ratio)
**Why human:** The computed height update flows through `onCardWidthChange` → `aspectRatio` computed → `localH.value = clampedH` → Vue template update. Requires browser interaction.

#### 3. Max-resolution clamping on card inputs (RSZN-15)

**Test:** In exact mode, try typing a value larger than the image's original dimension into a card's width field (e.g. 9999 on a 500px-wide image)
**Expected:** The field value is clamped — it shows 500 (or the original dimension), not 9999
**Why human:** Clamping occurs in the `onCardWidthChange` handler which fires on `@update:model-value`. Requires user interaction with the input.

#### 4. Override badge visibility (RSZN-12)

**Test:** In exact mode with multiple cards, edit one card's dimension manually
**Expected:** A "Custom" / "Personalizado" badge appears on that card; untouched cards show no badge
**Why human:** The badge is conditional on `item.resizeOverride` which gets set to `true` by `updateImageResize`. Requires runtime state mutation.

#### 5. Global propagation skips overridden cards (RSZN-13)

**Test:** After editing one card (making it overridden), change the global width in ControlPanel
**Expected:** All non-edited cards update to match the new global width; the edited card remains at its custom value
**Why human:** Requires multi-card reactive state visible in the UI; cannot be traced statically once override state is set at runtime.

#### 6. Conversion uses per-image dimensions end-to-end (RSZN-10)

**Test:** With cards set to different dimensions, click "Converter" and inspect downloaded output files
**Expected:** Each downloaded image has pixel dimensions matching what was shown on its card, not the global value
**Why human:** Output verification requires inspecting binary file metadata or browser DevTools after download.

### Gaps Summary

No gaps found. All 9 observable truths are verified at the code level. All 7 required artifacts exist with substantive implementations and are fully wired. All 6 requirements (RSZN-10 through RSZN-15) have clear implementation evidence. Zero anti-patterns detected.

The only outstanding items are 6 human verification tests covering runtime behavior that cannot be confirmed through static code analysis: async pre-fill reactivity, live aspect ratio computation, input clamping interaction, badge state rendering, cross-card propagation filtering, and end-to-end output dimensions.

---

_Verified: 2026-03-24T21:00:00Z_
_Verifier: Claude (gsd-verifier)_

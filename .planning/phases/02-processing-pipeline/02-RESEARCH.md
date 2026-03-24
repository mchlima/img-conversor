# Phase 2: Processing Pipeline - Research

**Researched:** 2026-03-24
**Domain:** Browser-native image conversion pipeline (Canvas API, OffscreenCanvas, jSquash WASM, transparency detection)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-02:** When PNG with transparency is converted to JPEG, the user chooses background color via a color picker
- **D-03:** Color picker only appears when necessary — when at least one PNG with transparency is being converted to JPEG
- **D-04:** Default color: white (#FFFFFF)
- **D-05:** Process images sequentially (one at a time) — prioritize stability and memory use over speed
- **D-06:** Two mutually exclusive resize modes as per REQUIREMENTS.md: proportional (slider %) and exact (width x height px). Activating one disables the other. (Inherited from PROJECT.md)

### Claude's Discretion

- Internal architecture of the `useProcessor` composable
- Use of Canvas API vs jSquash WASM for each format
- Memory cleanup strategy (canvas.width = 0, URL.revokeObjectURL)
- Transparency detection in PNGs
- Implementation of the iOS Safari pixel guard

### iOS Safari Canvas Limit (D-01)

- **D-01:** Claude's discretion — choose between auto-resizing to fit the limit or rejecting with a clear message. The important thing is that the image is NOT silently corrupted (black/blank output).

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| CONV-01 | User can choose output format: JPEG, PNG, WebP | Format routing: Canvas toBlob for JPEG/PNG, jSquash encode for WebP. ConvertOptions.format already typed. |
| CONV-02 | WebP is the pre-selected output format (recommended) | Default value in useConvertOptions state initialization; no conversion logic needed. |
| CONV-03 | User can adjust output quality via 1-100% slider | Quality slider maps to 0.0–1.0 for Canvas toBlob and 0–100 for jSquash. Explicit mapping function required. |
| CONV-04 | Conversion works correctly in Chrome, Firefox, Safari | jSquash WASM for WebP (all browsers); Canvas toBlob for JPEG/PNG (universally supported); OffscreenCanvas widely available since March 2023. |
| CONV-05 | No image is sent to servers — 100% client-side | Entire pipeline uses Canvas + WASM in browser; no fetch/XHR to external URLs. |
| RSZN-01 | User can resize proportionally via 1-100% slider | resizeMode:'proportional' + resizePercent: apply scale to original bitmap dimensions before drawImage. |
| RSZN-02 | User can set exact pixel dimensions (width x height) | resizeMode:'exact' + resizeWidth/resizeHeight: pass directly as drawImage target dimensions. |
| RSZN-03 | Two resize modes are mutually exclusive | UI concern: enabling one mode resets/disables the other. useConvertOptions enforces this. |
| RSZN-04 | Proportional resize maintains aspect ratio | Scale both dimensions by the same percent factor from original bitmap width/height. |
| INFR-04 | Transparent PNG to JPEG renders with white background (not black) | Fill canvas with user-selected color before drawImage when outputFormat === 'image/jpeg'. |
| INFR-05 | Images > iOS Safari canvas limit (16M pixels) handled without silent corruption | Guard: if width * height > 16_777_216, either scale down proportionally or reject with error message. |
</phase_requirements>

---

## Summary

Phase 2 builds the core `useProcessor` composable — the single function that takes a `File` and `ConvertOptions` and returns a `Blob`. All the hard problems in this phase are well-understood: they are documented edge cases with known solutions, not design unknowns.

The pipeline is: `File → createImageBitmap → OffscreenCanvas drawImage (with optional fill for JPEG) → encode (Canvas convertToBlob or jSquash encode) → Blob`. This flow handles all three formats across all three target browsers. The critical insight from prior research is that `OffscreenCanvas.convertToBlob('image/webp')` silently degrades to PNG in Safari — so WebP must always go through `@jsquash/webp` WASM encode, never through Canvas.

The user decided on a color picker for JPEG background (default white). This means `useProcessor` must accept a `backgroundColor` string parameter and transparency must be detectable before rendering the color picker (not inside the conversion function itself). Transparency detection uses a downsampled canvas scan — scan a 200px-wide version of the source image's alpha channel rather than the full resolution.

**Primary recommendation:** Build `useProcessor` as a stateless async function. Keep transparency detection as a separate utility. All Canvas work goes through `OffscreenCanvas`. Never use `toDataURL`. Clean up with `bitmap.close()` after drawImage and `canvas.width = 0` after convertToBlob.

---

## Standard Stack

### Core (already installed in project)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| OffscreenCanvas (browser native) | — | Off-main-thread canvas draw + encode | Widely available since March 2023; avoids main thread blocking; works in Workers |
| createImageBitmap (browser native) | — | Decode File/Blob to bitmap | Async, efficient; avoids creating an `<img>` element for decode |
| @jsquash/webp | 1.5.0 (pinned) | WebP encode via WASM | Required: Safari/iOS do not support canvas WebP encode |
| Canvas toBlob / convertToBlob | — | JPEG and PNG encode | Universally supported in all target browsers for these two formats |

### To Install This Phase

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @jsquash/resize | 2.1.1 (latest) | Lanczos image resizing via WASM | Use for all proportional and exact resize operations |
| @jsquash/jpeg | 1.6.0 (latest) | JPEG encode via MozJPEG WASM | Optional: better compression than Canvas JPEG; install if quality matters |

**Decision for JPEG encoding:** Use Canvas `convertToBlob('image/jpeg', quality)` for v1. It is universally supported, simpler, and avoids adding another WASM bundle. Install `@jsquash/jpeg` only if users report JPEG file sizes are too large compared to competitor tools.

**Decision for resize:** Use `@jsquash/resize` for higher-quality Lanczos resampling, since jSquash WASM is already in the project. Canvas `drawImage` alone performs bilinear/bicubic downsampling that is visibly worse for significant size reductions (>50%).

**Installation:**
```bash
npm install @jsquash/resize
```

**nuxt.config.ts additions needed:**
```ts
vite: {
  optimizeDeps: {
    exclude: ['@jsquash/webp', '@jsquash/resize'],
  },
},
build: {
  transpile: ['@jsquash/webp', '@jsquash/resize'],
},
```

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @jsquash/resize | drawImage only | Faster to implement, lower bundle size, but visibly lower quality on large downscales |
| Canvas JPEG encode | @jsquash/jpeg (MozJPEG) | MozJPEG produces ~15-25% smaller files at same perceptual quality; add in v2 if needed |
| OffscreenCanvas | HTMLCanvasElement | OffscreenCanvas is async, works in Workers, no DOM required; preferred for composable |

---

## Architecture Patterns

### Recommended Project Structure for This Phase

```
composables/
├── useProcessor.ts       # Core conversion function (this phase)
├── useConvertOptions.ts  # Reactive ConvertOptions state (this phase)
└── useImageStore.ts      # Image list state (Phase 3, but types used here)
types/
└── index.ts              # Extend: add backgroundColor to ConvertOptions
utils/
└── hasAlpha.ts           # Transparency detection utility (this phase)
```

### Pattern 1: jSquash WebP Pipeline (File → ArrayBuffer → Blob)

jSquash `encode()` accepts `ImageData` and returns `Promise<ArrayBuffer>`. The caller must convert the ArrayBuffer to a Blob manually.

```typescript
// Source: @jsquash/webp encode.d.ts (verified from installed package)
import { encode as encodeWebP } from '@jsquash/webp'

// Step 1: Decode file to bitmap
const bitmap = await createImageBitmap(file)

// Step 2: Draw to OffscreenCanvas (apply fill if needed for JPEG)
const canvas = new OffscreenCanvas(targetW, targetH)
const ctx = canvas.getContext('2d')!
ctx.drawImage(bitmap, 0, 0, targetW, targetH)
bitmap.close()

// Step 3: Extract ImageData for jSquash
const imageData = ctx.getImageData(0, 0, targetW, targetH)

// Step 4: Encode to WebP — quality is 0–100 (not 0.0–1.0)
const arrayBuffer = await encodeWebP(imageData, { quality: qualityPercent })

// Step 5: Convert to Blob
const blob = new Blob([arrayBuffer], { type: 'image/webp' })
```

**Critical:** jSquash `quality` option is 0–100 (integer), NOT 0.0–1.0. The UI slider value (1–100) maps directly to jSquash quality without division.

### Pattern 2: Canvas JPEG/PNG Pipeline (File → Blob)

```typescript
// Source: MDN HTMLCanvasElement.toBlob(), PITFALLS.md
const bitmap = await createImageBitmap(file)
const canvas = new OffscreenCanvas(targetW, targetH)
const ctx = canvas.getContext('2d')!

// CRITICAL: Fill background BEFORE drawImage when encoding to JPEG
if (outputFormat === 'image/jpeg') {
  ctx.fillStyle = backgroundColor  // e.g. '#ffffff' from user color picker
  ctx.fillRect(0, 0, targetW, targetH)
}

ctx.drawImage(bitmap, 0, 0, targetW, targetH)
bitmap.close()

// convertToBlob quality is 0.0–1.0 for JPEG; ignored for PNG
const blob = await canvas.convertToBlob({
  type: outputFormat,
  quality: qualityPercent / 100,  // map UI 1-100 → 0.0-1.0
})
```

### Pattern 3: Resize via jSquash/resize

`@jsquash/resize` accepts `ImageData` and returns `Promise<ImageData>`. It fits between canvas decode and jSquash encode.

```typescript
// Source: @jsquash/resize README (verified from GitHub)
import resize from '@jsquash/resize'

// After drawImage, extract ImageData
const imageData = ctx.getImageData(0, 0, originalW, originalH)

// Resize with Lanczos (default method: 'lanczos3')
const resizedData = await resize(imageData, { width: targetW, height: targetH })

// Then pass resizedData to jSquash encode or create a new canvas from it
```

**Note for JPEG/PNG path:** When using `@jsquash/resize` with Canvas encode (not jSquash encode), you need to put the resized `ImageData` back on a canvas. Use `ctx.putImageData(resizedData, 0, 0)` on a new `OffscreenCanvas` sized to `targetW × targetH`, then call `convertToBlob`.

### Pattern 4: Transparency Detection (hasAlpha utility)

Used to determine whether the color picker should be shown — checked before conversion, not during.

```typescript
// Source: MDN getImageData + javaspring.net pattern (verified logic)
// utils/hasAlpha.ts
export async function hasAlpha(file: File): Promise<boolean> {
  const bitmap = await createImageBitmap(file)
  const MAX = 200  // scan at low resolution for performance

  const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height))
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, h)
  bitmap.close()

  const { data } = ctx.getImageData(0, 0, w, h)
  // Alpha channel is every 4th byte starting at index 3
  for (let i = 3; i < data.length; i += 4) {
    if (data[i] < 255) return true
  }
  return false
}
```

**Important:** Only call `hasAlpha` on PNG files. JPEG and WebP files are opaque by nature (JPEG has no alpha; WebP can have alpha but is unlikely to need background fill when converting to another format). Check `file.type === 'image/png'` before calling.

### Pattern 5: iOS Safari Pixel Guard

```typescript
// Source: PITFALLS.md — iOS Safari hard limit 16,777,216 pixels
const IOS_CANVAS_PIXEL_LIMIT = 16_777_216

function guardCanvasDimensions(
  width: number,
  height: number
): { width: number; height: number } | null {
  if (width * height <= IOS_CANVAS_PIXEL_LIMIT) {
    return { width, height }
  }
  // Auto-scale down to fit (Claude's discretion: scale rather than reject)
  const scale = Math.sqrt(IOS_CANVAS_PIXEL_LIMIT / (width * height))
  return {
    width: Math.floor(width * scale),
    height: Math.floor(height * scale),
  }
}
```

**Recommendation (D-01 discretion):** Auto-scale down rather than reject. Rationale: the user's goal is to get a converted image. Silently capping dimensions to ~4096×4096 produces a valid output. Rejection forces the user to manually resize the source before trying again, which is friction for a tool designed to be frictionless. Log a warning to console. Optionally surface a non-blocking info message in the UI ("Large image auto-scaled to fit browser limits").

### Pattern 6: Memory Cleanup

```typescript
// After each image is processed:
bitmap.close()                   // free ImageBitmap memory immediately after drawImage
canvas.width = 0                 // release GPU-backed canvas memory
canvas.height = 0
// let canvas go out of scope
```

### ConvertOptions Extension

The existing `ConvertOptions` type in `types/index.ts` needs `backgroundColor` added for the color picker:

```typescript
// types/index.ts — add to existing ConvertOptions interface
export interface ConvertOptions {
  format: OutputFormat
  quality: number           // UI: 1–100
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number     // 1–100
  resizeWidth: number | null
  resizeHeight: number | null
  backgroundColor: string   // hex color, e.g. '#ffffff' — used when PNG → JPEG
}
```

### Recommended useProcessor Signature

```typescript
// composables/useProcessor.ts
export function useProcessor() {
  const convert = async (
    file: File,
    opts: ConvertOptions
  ): Promise<Blob> => {
    // 1. Decode
    // 2. Compute target dimensions (resize guard + resize mode)
    // 3. Draw to OffscreenCanvas (with fill if JPEG)
    // 4. Encode (WebP → jSquash; JPEG/PNG → convertToBlob)
    // 5. Cleanup
    // 6. Return Blob
  }

  return { convert }
}
```

`useProcessor` is stateless — it takes inputs, returns output, owns no reactive state.

### Anti-Patterns to Avoid

- **toDataURL:** Never use. Always `convertToBlob` or jSquash → `new Blob([arrayBuffer])`.
- **canvas.toBlob for WebP:** Never use. Safari/iOS silently falls back to PNG.
- **Processing all images concurrently:** Never use `Promise.all` on the full batch. Sequential loop only (D-05).
- **Storing ImageData in reactive state:** Never. Store only `Blob` reference and `size`.
- **Drawing before background fill:** Always fill (with user color) before `drawImage` when output is JPEG.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| High-quality image downscaling | Custom bilinear/bicubic interpolation | @jsquash/resize (Lanczos3) | WASM is 10–50x faster for large images; correct algorithm not trivial |
| WebP encoding | Manual WASM bindings to libwebp | @jsquash/webp | Already installed and verified working in project |
| Transparency detection algorithm | Sampling heuristics | Canvas getImageData alpha scan (utils/hasAlpha.ts) | Standard approach; 20-line utility is sufficient — no library needed |
| iOS pixel limit calculation | Ad-hoc dimension capping | guardCanvasDimensions() pure function | Simple math; no library needed |
| Quality parameter mapping | Ad-hoc conversions | Explicit `mapQuality(q: number)` utility | The trap is forgetting the 100x difference between jSquash (0–100) and Canvas API (0.0–1.0) |

**Key insight:** The jSquash ecosystem covers all encoding needs. The only custom logic required is the coordination layer (order of operations, guard functions, cleanup).

---

## Common Pitfalls

### Pitfall 1: JPEG Background Is Black for Transparent PNGs

**What goes wrong:** PNG with transparency → JPEG outputs black where transparency was.
**Why it happens:** Canvas composites alpha against black by default. JPEG has no alpha channel.
**How to avoid:** `ctx.fillStyle = backgroundColor; ctx.fillRect(0, 0, w, h)` BEFORE `ctx.drawImage(...)`, only when outputFormat === 'image/jpeg'.
**Warning signs:** Test with a transparent PNG logo (not a solid-white PNG). Chrome may hide the bug on solid-color source images.

### Pitfall 2: WebP Silently Downgraded to PNG in Safari

**What goes wrong:** `canvas.convertToBlob({ type: 'image/webp' })` returns a PNG in Safari. File size is larger, format is wrong. No error thrown.
**Why it happens:** Safari does not implement WebP encode in Canvas API (verified via caniuse, ~80.9% global support only).
**How to avoid:** Route ALL WebP encoding through `@jsquash/webp` regardless of browser. Never use Canvas for WebP.

### Pitfall 3: iOS Silent Black Image from Canvas Overflow

**What goes wrong:** Canvas > 16,777,216 pixels returns blank/black on iOS Safari. No error thrown.
**Why it happens:** iOS Safari enforces a hard pixel limit. Desktop browsers have much higher or no practical limits.
**How to avoid:** Call `guardCanvasDimensions()` before creating the OffscreenCanvas. Verify target dimensions are within limit after applying resize options.

### Pitfall 4: Quality Parameter 100x Off

**What goes wrong:** jSquash `quality: 0.8` instead of `quality: 80` — output is extremely low quality. Or Canvas `quality: 80` instead of `0.8` — extremely low quality.
**Why it happens:** jSquash quality is 0–100; Canvas convertToBlob quality is 0.0–1.0. Easy to mix up.
**How to avoid:** Define explicit type-safe mapping: `jSquashQuality(q: number) = q` (no-op); `canvasQuality(q: number) = q / 100`.

### Pitfall 5: Canvas Memory Accumulation

**What goes wrong:** Processing 10+ images causes memory to grow, UI slows, eventual tab crash.
**Why it happens:** OffscreenCanvas holds GPU memory until GC, which is deferred. Creating a new canvas per image without cleanup multiplies the leak.
**How to avoid:** After `convertToBlob` or jSquash encode, explicitly set `canvas.width = 0; canvas.height = 0`. Close `ImageBitmap` with `.close()` immediately after `drawImage`.

### Pitfall 6: resize + JPEG path requires ImageData → OffscreenCanvas round-trip

**What goes wrong:** After `@jsquash/resize` returns `ImageData`, developer tries to pass it directly to Canvas API for JPEG encoding. Canvas encode requires a canvas element, not ImageData.
**Why it happens:** @jsquash/resize returns `ImageData`. Canvas `convertToBlob` is called on `OffscreenCanvas` objects.
**How to avoid:** After resize, create a new `OffscreenCanvas(resizedData.width, resizedData.height)`, call `ctx.putImageData(resizedData, 0, 0)`, then call `canvas.convertToBlob(...)`.

---

## Code Examples

### Complete JPEG conversion path with background fill and resize

```typescript
// Source: PITFALLS.md + ARCHITECTURE.md + jSquash README patterns
import resize from '@jsquash/resize'

async function convertToJpeg(
  file: File,
  quality: number,        // 1–100
  backgroundColor: string, // e.g. '#ffffff'
  targetW: number,
  targetH: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  // Guard iOS limit before creating canvas
  const dims = guardCanvasDimensions(targetW, targetH)
  const w = dims?.width ?? targetW
  const h = dims?.height ?? targetH

  // Resize via jSquash if needed
  let imageData: ImageData | null = null
  if (w !== bitmap.width || h !== bitmap.height) {
    const srcCanvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const srcCtx = srcCanvas.getContext('2d')!
    srcCtx.drawImage(bitmap, 0, 0)
    bitmap.close()
    const srcData = srcCtx.getImageData(0, 0, bitmap.width, bitmap.height)
    imageData = await resize(srcData, { width: w, height: h })
    srcCanvas.width = 0; srcCanvas.height = 0
  } else {
    bitmap.close()
  }

  // Final canvas with background fill
  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, w, h)
  if (imageData) {
    ctx.putImageData(imageData, 0, 0)
  } else {
    ctx.drawImage(bitmap, 0, 0, w, h)
  }

  const blob = await canvas.convertToBlob({ type: 'image/jpeg', quality: quality / 100 })
  canvas.width = 0; canvas.height = 0
  return blob
}
```

### Complete WebP conversion path via jSquash

```typescript
// Source: @jsquash/webp encode.d.ts (verified) + ARCHITECTURE.md
import { encode as encodeWebP } from '@jsquash/webp'
import resize from '@jsquash/resize'

async function convertToWebP(
  file: File,
  quality: number,  // 1–100, maps directly to jSquash quality
  targetW: number,
  targetH: number
): Promise<Blob> {
  const bitmap = await createImageBitmap(file)

  const dims = guardCanvasDimensions(targetW, targetH)
  const w = dims?.width ?? targetW
  const h = dims?.height ?? targetH

  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0)
  bitmap.close()

  let imageData = ctx.getImageData(0, 0, bitmap.width, bitmap.height)
  canvas.width = 0; canvas.height = 0

  if (w !== imageData.width || h !== imageData.height) {
    imageData = await resize(imageData, { width: w, height: h })
  }

  // jSquash quality: 0–100 integer (NOT 0.0–1.0)
  const arrayBuffer = await encodeWebP(imageData, { quality })
  return new Blob([arrayBuffer], { type: 'image/webp' })
}
```

### Sequential batch processing loop

```typescript
// Source: ARCHITECTURE.md + D-05 decision (sequential for stability)
async function processAll(images: ImageItem[], opts: ConvertOptions) {
  for (const item of images) {
    item.status = 'processing'
    try {
      item.convertedBlob = await convert(item.file, opts)
      item.convertedSize = item.convertedBlob.size
      item.status = 'done'
    } catch (err) {
      item.error = err instanceof Error ? err.message : 'Processing failed'
      item.status = 'error'
    }
    // Next iteration begins after previous fully completes — sequential by design
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `canvas.toDataURL()` | `OffscreenCanvas.convertToBlob()` | ~2019, widely available 2023 | Async, returns Blob, no base64 inflation, works in Workers |
| `HTMLCanvasElement` for off-screen work | `OffscreenCanvas` | Stable since 2023 (Safari 17+) | No DOM required; can be used in Workers; OffscreenCanvas is the standard for composables |
| JSZip for ZIP | fflate | Project decision (Init) | Already out of scope for this phase; noted for Phase 4 |
| Canvas WebP encode | @jsquash/webp WASM | Project decision (Init) | Universal cross-browser WebP; eliminates Safari/iOS branching |

**Deprecated/outdated for this project:**
- `canvas.toDataURL()`: Never use — base64 overhead, synchronous, no Worker support
- `canvas.toBlob('image/webp')`: Never use — Safari silent PNG fallback

---

## Open Questions

1. **@jsquash/resize ImageData round-trip with JPEG fill**
   - What we know: resize returns `ImageData`; the background fill must happen on a canvas. `putImageData` does NOT composite over an existing fill — it overwrites.
   - What's unclear: `putImageData` writes raw RGBA including alpha. If the resized `ImageData` has transparent pixels, those will overwrite the fill color. The fill effectively disappears.
   - Recommendation: For the JPEG path with transparency, do the fill AFTER `putImageData` using `ctx.globalCompositeOperation = 'destination-over'` (paints fill behind existing pixels), OR use `drawImage(offscreenCanvasWithResizedContent)` instead of `putImageData` so compositing is preserved.

2. **EXIF orientation handling**
   - What we know: STATE.md blocker notes "EXIF orientation handling library not finalized — evaluate exifr vs createImageBitmap({ imageOrientation: 'from-image' })"
   - What's unclear: `createImageBitmap(file, { imageOrientation: 'from-image' })` would auto-correct rotation without any library. Browser support needs verification for the option dict form.
   - Recommendation: Use `createImageBitmap(file, { imageOrientation: 'from-image' })` as first attempt. If this does not work in all three target browsers, add `exifr` for EXIF read + manual canvas rotate transform.

3. **@jsquash/resize initialization**
   - What we know: jSquash packages use lazy WASM init. For `@jsquash/webp`, WASM loads automatically on first call. `@jsquash/resize` follows the same pattern.
   - What's unclear: Whether pre-warming the resize WASM in `onMounted` (as done for webp in pages/index.vue) is needed or if lazy init is sufficient.
   - Recommendation: Add `@jsquash/resize` to the `onMounted` pre-warm in `pages/index.vue` alongside webp. This front-loads the 300ms WASM init cost before the user clicks "Convert".

---

## Sources

### Primary (HIGH confidence)
- `node_modules/@jsquash/webp/encode.d.ts` — Verified encode signature: `encode(data: ImageData, options?: Partial<EncodeOptions>): Promise<ArrayBuffer>`; quality is integer 0–100
- `node_modules/@jsquash/webp/meta.js` — Verified defaultOptions including `quality: 75` confirming 0–100 scale
- `node_modules/@jsquash/webp/index.js` — Exports `encode` and `decode`
- [MDN: OffscreenCanvas.convertToBlob()](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob) — quality param is 0.0–1.0; baseline widely available since March 2023
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) — Safari 17+ full support; partial (2D only) from 16.2
- `.planning/research/PITFALLS.md` — iOS 16M pixel limit, JPEG black background, canvas cleanup patterns — HIGH confidence, pre-verified
- `.planning/research/ARCHITECTURE.md` — useProcessor composable design, data flow — HIGH confidence
- `.planning/research/STACK.md` — jSquash ecosystem, Safari WebP gap — HIGH confidence

### Secondary (MEDIUM confidence)
- [jSquash resize README (GitHub)](https://raw.githubusercontent.com/jamsinclair/jSquash/main/packages/resize/README.md) — resize(data: ImageData, options: { width, height, method }) → Promise<ImageData>; default method 'lanczos3'
- [caniuse: OffscreenCanvas](https://caniuse.com/offscreencanvas) — 96.34% global support; Safari 17+ full, 16.2 partial
- [javaspring.net: hasAlpha pattern](https://www.javaspring.net/blog/javascript-file-upload-check-if-image-has-transparent-background/) — getImageData alpha scan at 200px

### Tertiary (LOW confidence)
- None — all critical claims verified from installed package source or official docs

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified from installed package files + MDN
- Architecture: HIGH — based on pre-existing research + verified API signatures
- Pitfalls: HIGH — from pre-verified PITFALLS.md + confirmed against MDN
- jSquash resize API: MEDIUM — verified from GitHub README (not installed yet)

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (90 days — jSquash pre-release, check for breaking changes before implementation)

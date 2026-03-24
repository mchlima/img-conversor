# Pitfalls Research

**Domain:** Client-side image conversion tool (Canvas API, Nuxt 3 SSG, JSZip)
**Researched:** 2026-03-24
**Confidence:** HIGH

---

## Critical Pitfalls

### Pitfall 1: Transparent PNG exported to JPEG renders with black background

**What goes wrong:**
When a PNG with transparency (alpha channel) is drawn onto a canvas and then exported as JPEG, transparent areas render as solid black. JPEG has no alpha channel — if no background is painted before `drawImage()`, the browser composites transparency against black (per the spec: "source-over" against opaque black).

**Why it happens:**
Developers assume `canvas.toBlob('image/jpeg')` handles alpha compositing automatically. Firefox is especially strict about this: it keeps alpha in memory but renders transparent pixels black on JPEG export. Chrome may appear to work in testing but is still spec-compliant — the black is always there, just not always visible on the test images used.

**How to avoid:**
Before calling `drawImage()`, always fill the canvas with a white rectangle when the target format is JPEG:
```typescript
if (outputFormat === 'image/jpeg') {
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
}
ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
```
When converting to WebP with transparency, no fill is needed (WebP supports alpha). Only apply the fill for JPEG.

**Warning signs:**
- Test images with solid white backgrounds pass QA but transparent logos/screenshots go black in production
- No visible issue in Chrome on solid-color source images
- Users report "my image has a black border/background"

**Phase to address:** Core image processing phase (when `canvas.toBlob` is first wired up)

---

### Pitfall 2: Nuxt 3 SSR/SSG accessing browser APIs (`canvas`, `FileReader`, `window`) causes build crashes

**What goes wrong:**
Nuxt 3 with SSG pre-renders pages at build time in a Node.js environment. Any code that directly references `window`, `document`, `HTMLCanvasElement`, `FileReader`, or `URL.createObjectURL` outside of lifecycle hooks will crash the build with `window is not defined` or similar errors.

**Why it happens:**
Developers write image processing logic at module scope or in `setup()` without guarding for SSR. The Canvas API and File API simply do not exist in Node.js. Even importing a library that references `window` at the module level (e.g., some JSZip builds) can silently fail or crash.

**How to avoid:**
- Wrap all canvas/File API logic in `onMounted()` or inside `<ClientOnly>` components
- Use `.client.vue` suffix for components that use browser-only APIs
- For composables, guard with `if (process.client) { ... }` or `if (import.meta.client) { ... }` (preferred in Nuxt 3.x)
- Lazy-import browser-only libraries inside `onMounted`:
  ```typescript
  onMounted(async () => {
    const JSZip = (await import('jszip')).default
  })
  ```
- Test the SSG build (`nuxt generate`) early — SSR errors often only surface at build time, not during `nuxt dev`

**Warning signs:**
- `nuxt generate` fails while `nuxt dev` works fine
- `window is not defined` or `document is not defined` in build output
- Canvas element created at component setup rather than in a lifecycle hook

**Phase to address:** Project scaffolding / first component phase — establish the pattern before any browser APIs are added

---

### Pitfall 3: iOS Safari canvas pixel limit crashes processing silently

**What goes wrong:**
iOS Safari enforces a hard canvas area limit of **16,777,216 pixels** (e.g., ~4096×4096). If a canvas exceeds this, Safari silently returns a black/blank image instead of throwing an error. Additionally, the total canvas memory limit across all canvases on the page is ~384 MB on Safari 15+, less on older versions.

A 12 MP smartphone photo (4000×3000 = 12M pixels) is just under the limit, but 5000×4000 (20M pixels) will silently fail. Users will download a black image with no error message.

**Why it happens:**
Desktop Chrome and Firefox have much higher (or no practical) canvas size limits, so desktop-tested tools appear to work fine. iOS users uploading high-resolution photos from their camera roll hit this limit invisibly.

**How to avoid:**
- Validate canvas dimensions before creating the canvas element:
  ```typescript
  const MAX_CANVAS_PIXELS = 16_777_216
  if (width * height > MAX_CANVAS_PIXELS) {
    // scale down proportionally before processing
    const scale = Math.sqrt(MAX_CANVAS_PIXELS / (width * height))
    width = Math.floor(width * scale)
    height = Math.floor(height * scale)
  }
  ```
- Reuse and destroy canvas elements after each image — don't accumulate open canvases
- Test on real iOS hardware or BrowserStack with large photos (not placeholder images)

**Warning signs:**
- Processing works on desktop but users on iPhone report blank/black downloaded images
- No JS error visible in the browser console (Safari fails silently here)
- Only occurs with high-resolution source images (>4096×4096)

**Phase to address:** Core image processing phase, specifically when testing cross-browser behavior

---

### Pitfall 4: `toDataURL()` used instead of `toBlob()` causes memory overflow and URL length issues

**What goes wrong:**
`canvas.toDataURL()` encodes the full image as a base64 string in memory and returns it synchronously. For a 4 MP image at high quality, this string can be 5–15 MB. Assigning this to `img.src` or storing multiple results doubles memory usage. Browsers also have limits on URL lengths, which a large base64 string can exceed.

**Why it happens:**
`toDataURL()` is simpler and synchronous, which makes it the first thing developers reach for. The async callback of `toBlob()` feels like added complexity. However, `toBlob()` returns a `Blob` — a native browser object managed separately from the JS heap — with no string inflation.

**How to avoid:**
Use `canvas.toBlob()` for all output:
```typescript
canvas.toBlob((blob) => {
  const url = URL.createObjectURL(blob!)
  // use url for download link
  // later: URL.revokeObjectURL(url)
}, mimeType, quality)
```
Use the `Promise`-wrapped version for async/await ergonomics:
```typescript
const blob = await new Promise<Blob>((resolve) =>
  canvas.toBlob((b) => resolve(b!), mimeType, quality)
)
```

**Warning signs:**
- `toDataURL()` used anywhere in image processing code
- Tab memory grows proportionally with number of images processed
- `img.src = canvas.toDataURL(...)` pattern

**Phase to address:** Core image processing phase — establish `toBlob()` as the only allowed export path

---

### Pitfall 5: Canvas elements not destroyed after processing, accumulating memory

**What goes wrong:**
Each off-screen `canvas` element created for image processing holds onto GPU memory (and sometimes WebGL backing store) until the garbage collector runs. Creating a new canvas per image without explicit cleanup causes memory to grow linearly with the number of images processed. With 20 large images, this can consume hundreds of MB.

**Why it happens:**
Developers create canvas elements as local variables expecting GC to clean them up promptly. In practice, browsers defer canvas memory reclamation, and GPU-backed canvases are especially slow to release.

**How to avoid:**
After processing each image, explicitly resize the canvas to 0×0 before discarding the reference:
```typescript
canvas.width = 0
canvas.height = 0
// then let the variable go out of scope
```
Alternatively, use a single reusable canvas element and resize it per image instead of creating new ones.

**Warning signs:**
- Memory profile in DevTools shows growing heap after processing multiple images
- Performance degrades after processing 10+ images in a session
- Each image creates a new `document.createElement('canvas')` without matching cleanup

**Phase to address:** Core image processing phase, and batch processing phase

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Use `toDataURL()` instead of `toBlob()` | Synchronous, simpler code | Memory overflow with large/multiple images; URL length crashes | Never — `toBlob()` is always the right choice |
| Process all images concurrently with `Promise.all` | Simpler code | All images decoded + canvases open simultaneously; tab OOM on 10+ large files | Never for large batches — use sequential or limited concurrency queue |
| Skip `URL.revokeObjectURL()` after download | Faster development | Blob objects held in memory for the entire session | Never — always revoke after use |
| Create canvas per image without cleanup | No shared state concerns | Memory grows unboundedly with batch size | Never — reuse or explicit cleanup required |
| Skip EXIF orientation check | Simpler code | Photos from mobile phones display rotated 90° | Never — nearly all real-world user photos have EXIF orientation |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| JSZip | Loading all image Blobs into memory simultaneously before zipping | Process images sequentially and stream Blobs into JSZip one-by-one; call `generateAsync({ type: 'blob' })` after all are added |
| JSZip | Importing at module level in Nuxt (causes SSR build failure) | Dynamic import inside `onMounted()` or use `.client.vue` component |
| Canvas + Nuxt SSG | Referencing canvas in component `setup()` | All canvas operations inside `onMounted()` or `<ClientOnly>` wrapper |
| `URL.createObjectURL` | Not revoking after download anchor click | Call `URL.revokeObjectURL(url)` immediately after programmatic `.click()` — the download continues even after revocation |
| `canvas.toBlob` | Calling it synchronously after `ctx.drawImage` assumes image is decoded | Use the `Image` load event: draw only inside `img.onload` callback |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Processing all images concurrently | Tab freeze, OOM on large batches | Sequential processing with progress indicator, or concurrency limit of 2–3 | ~5 large photos (>3 MP each) processed at once |
| No canvas reuse in batch | Steady memory climb, eventual crash | Reuse single canvas or resize to 0 after each | ~10 images in a single session |
| Displaying full-resolution canvas as preview | UI layout jank, slow scroll | Scale preview to display size only; keep full-res processing off-screen | First large image (>1 MP) |
| Drawing original image then resizing | Two-step process doubles peak memory | Pass target dimensions to `drawImage(img, 0, 0, targetW, targetH)` directly | Every image — avoid always |
| JSZip holding all processed Blobs in RAM | Memory spike at zip generation step | Cap batch size with user warning, or generate zip incrementally | ~20 images at 2 MB each |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Trusting `file.type` MIME type from File API | Malicious filename mismatch (e.g., `.exe` renamed to `.png`) | Validate by attempting to load the file as an image: only proceed if `img.onload` fires; reject on `img.onerror` |
| Rendering user-provided filenames directly into the DOM | XSS if filename contains HTML | Sanitize or use `textContent` instead of `innerHTML` for filename display |
| Using blob: URLs for preview without cleanup | Accumulating blob references per session | Revoke previous preview URL before assigning new one |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress feedback during batch processing | User thinks the tool is frozen; closes tab and loses work | Show per-image progress (e.g., "Processing 3 of 10...") — even a simple counter prevents this |
| Download zip button available before all images are processed | Partial zip with missing images, confusing outcome | Disable zip button until all processing is complete; show count of ready images |
| JPEG output quality slider from 1–100 but Canvas API uses 0.0–1.0 | Off-by-100x quality error if conversion is forgotten | Map slider value to `quality / 100` explicitly and add a type-safe converter function |
| No feedback when a file is rejected (e.g., non-image file dropped) | User assumes it was accepted silently | Show inline error per rejected file with specific reason |
| Mutually exclusive resize modes without clear visual state | User applies both by accident, confused by which wins | One mode should visually disable/gray out the other on selection, not just "ignore" the other's value |
| Showing "before" file size from `file.size` but "after" size only after processing | Users expect after-size immediately — long processing feels like a bug | Show processing indicator in the "after" column; reveal size only when `toBlob` resolves |

---

## "Looks Done But Isn't" Checklist

- [ ] **JPEG export:** Verify transparent PNGs do not produce black backgrounds — test with a PNG that has a transparent logo on a transparent background, not a solid white PNG
- [ ] **Batch download:** Verify zip contains all N images when N > 1 — single-image tests pass trivially
- [ ] **iOS Safari:** Test with a photo taken on an actual iPhone (>4 MP) — not a 300×200 placeholder — verify canvas size guard fires correctly
- [ ] **EXIF orientation:** Test with a portrait photo taken on Android or iPhone (most will have orientation tag 6 or 8) — verify output is upright, not sideways
- [ ] **Memory cleanup:** Open DevTools Memory tab, process 15 images, verify heap does not grow unboundedly after processing
- [ ] **Blob revocation:** Confirm `URL.revokeObjectURL` is called after each individual download and after zip generation
- [ ] **SSG build:** Run `nuxt generate` and confirm it completes without `window is not defined` errors — dev server masks this entirely
- [ ] **Quality mapping:** Confirm that JPEG quality slider at "80" results in `toBlob(..., 0.8)` — not `0.08` or `80`
- [ ] **Filename collision:** Drop two files with identical filenames into the batch — verify zip does not silently overwrite one

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Black JPEG backgrounds discovered post-launch | LOW | Add `ctx.fillStyle = '#fff'; ctx.fillRect(...)` before `drawImage` in the processing function — one-line fix, no architecture change |
| SSR build crash from browser API access | MEDIUM | Identify all `window`/`canvas` references outside lifecycle hooks; wrap in `onMounted` or `<ClientOnly>`; re-run `nuxt generate` to verify |
| iOS silent black image from canvas overflow | MEDIUM | Add dimension guard before canvas creation; requires testing on real iOS hardware to confirm fix |
| JSZip OOM on large batch | LOW | Add a per-batch file-count or total-size cap with a user warning — prevents the failure path |
| `toDataURL` memory bloat | LOW | Swap all `toDataURL` calls for `toBlob` — straightforward refactor, well-isolated |
| Canvas accumulation memory leak | MEDIUM | Audit all canvas creation sites; add `canvas.width = 0` cleanup; profile in DevTools to confirm resolution |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Transparent PNG → black JPEG | Core image processing | Manual test: convert transparent PNG to JPEG; inspect output for black background |
| Nuxt SSG + browser APIs | Project scaffolding (first phase) | Run `nuxt generate`; confirm zero `window is not defined` errors |
| iOS canvas pixel limit | Core image processing | BrowserStack iOS test with >4 MP photo |
| `toDataURL` memory overflow | Core image processing | Code review: zero `toDataURL` calls allowed in processing pipeline |
| Canvas element accumulation | Core image processing + batch phase | DevTools memory profiling after 15 images processed |
| JSZip OOM on large batch | Batch download phase | Test zip generation with 20 × 2 MB images; verify no tab crash |
| EXIF orientation ignored | Core image processing | Test with portrait mobile photo; verify output orientation |
| Blob URL not revoked | Core image processing + batch phase | DevTools Memory > Heap Snapshot; confirm no unrevoked blob: URLs after downloads |
| Quality slider mapping error | UI/form phase | Verify `quality === 0.8` when slider reads 80 via unit test or console assertion |

---

## Sources

- [MDN: HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob)
- [MDN: HTMLCanvasElement.toDataURL()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toDataURL)
- [MDN: URL.revokeObjectURL()](https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL_static)
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas)
- [PQINA: Canvas Area Exceeds The Maximum Limit](https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/)
- [PQINA: Total Canvas Memory Use Exceeds The Maximum Limit](https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit)
- [Konva: iOS Safari canvas limits explainer (2024)](https://longviewcoder.com/2024/02/09/konva-canvas-limits-in-safari-ios-explainer/)
- [JSZip: Limitations documentation](https://stuk.github.io/jszip/documentation/limitations.html)
- [JSZip Issue #446: Out of memory with 20,000 files](https://github.com/Stuk/jszip/issues/446)
- [JSZip Issue #530: 3.5 GB file causes low memory error](https://github.com/Stuk/jszip/issues/530)
- [Firefox Support: Canvas black image on JPEG export](https://support.mozilla.org/en-US/questions/1528694)
- [Bugzilla: WebP toDataURL support in Firefox](https://bugzilla.mozilla.org/show_bug.cgi?id=1559743)
- [Nuxt 3: Hydration node mismatch (GitHub issue #12266)](https://github.com/nuxt/nuxt/issues/12266)
- [Harlan Wilton: Nuxt 3 Hydration Mismatch Errors](https://harlanzw.com/blog/nuxt3-hydration-node-mismatch)
- [web.dev: OffscreenCanvas — speed up canvas operations with a web worker](https://web.dev/articles/offscreen-canvas)
- [xjavascript.com: Downloading Large Canvas Images with toBlob](https://www.xjavascript.com/blog/downloading-canvas-image-using-toblob/)
- [Copyprogramming: HTML Canvas and Memory Usage Complete Guide](https://copyprogramming.com/howto/html-canvas-and-memory-usage)

---
*Pitfalls research for: client-side image conversion tool (Canvas API + Nuxt 3 SSG + JSZip)*
*Researched: 2026-03-24*

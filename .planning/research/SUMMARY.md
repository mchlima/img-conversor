# Project Research Summary

**Project:** img-conversor
**Domain:** Client-side browser-based image conversion tool (Nuxt 3, SSG, Vercel)
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

This is a fully client-side image conversion tool — no backend, no server-side processing, no user accounts. The research-validated approach uses Nuxt 3 in SSG mode (static output via `nuxt generate`) deployed to Vercel, with the Canvas API and OffscreenCanvas for image processing, and jSquash WASM codecs for format-accurate encoding. The core value proposition is doing three things simultaneously — format conversion, quality compression, and resize — in a single pipeline pass, which no existing competitor does. The clearest architectural constraint is that processing stays entirely in the browser for privacy reasons, meaning the Canvas API and WASM codecs are the only acceptable encoding paths.

The most important technical decision from research: do not rely on `canvas.toBlob('image/webp')` for WebP output. Safari and iOS fail silently without throwing an error, producing PNG instead. The correct solution is `@jsquash/webp` as a universal WebP encoder for all browsers, paired with OffscreenCanvas for drawing and resizing. For JPEG, native `canvas.toBlob('image/jpeg')` is acceptable in v1 (universally supported); upgrade to `@jsquash/jpeg` (MozJPEG) if file size quality becomes a concern. PNG uses native canvas encoding.

The primary risks are all memory and browser-compatibility related: iOS Safari silently produces black images when canvas dimensions exceed 16M pixels, transparent PNGs produce black backgrounds when exported to JPEG without a white fill, and processing multiple large images concurrently causes tab crashes. Every one of these failures is silent — no error is thrown — making the "works on my machine" problem severe. These pitfalls must be addressed in the core processing pipeline, not deferred.

## Key Findings

### Recommended Stack

The stack is constrained by the project: Nuxt 3 (4.4.2) with SSG mode, Vue 3 Composition API, TypeScript, deployed to Vercel. `ssr: false` is appropriate here since no pages require SEO indexing — static HTML shells are generated at build time. The WASM layer (`@jsquash/webp`, `@jsquash/resize`) requires `vite-plugin-wasm` and specific `optimizeDeps.exclude` config in `nuxt.config.ts` to avoid Vite pre-bundle errors. Batch ZIP download uses `fflate` (actively maintained, ~8 kB gzipped, 3× faster than JSZip in benchmarks). Tailwind CSS 4 via `@nuxtjs/tailwindcss` rounds out the UI layer.

**Core technologies:**
- **Nuxt 3 (4.4.2):** App framework — non-negotiable per project scope, SSG mode via `nuxt generate`, zero-config Vercel deploy
- **Canvas API / OffscreenCanvas:** Draw and resize — use only for drawing; never for WebP encoding (Safari gap)
- **@jsquash/webp (1.5.0):** WebP encoding via WASM — required for cross-browser WebP (Safari/iOS fix); use for all browsers
- **@jsquash/resize (latest):** Lanczos-quality resizing via WASM — pairs with jsquash pipeline, sharper than `drawImage` alone
- **fflate (0.8.2):** ZIP batch download — maintained, fast, ESM-native
- **vite-plugin-wasm:** Required for jSquash WASM imports in Vite/Nuxt

**What NOT to use:** `sharp` (Node.js only), `jimp` (no browser WASM path), `Compressor.js` or `browser-image-compression` (both inherit the Safari WebP canvas gap), `canvas.toDataURL` (synchronous, 33% larger output, blocks main thread).

### Expected Features

This tool is differentiated by combining format conversion + quality control + resize into a single pipeline. Competitors do at most two of these. The full MVP feature set is well-defined with low ambiguity.

**Must have (table stakes):**
- Drag-and-drop + file picker input — mandatory entry point; file picker is required for accessibility
- Format selection (JPEG, PNG, WebP) with WebP pre-selected as default
- Quality slider (1–100%) mapped to `quality / 100` for encoding APIs
- Proportional resize via percentage slider
- Exact dimension resize (width × height px) — mutually exclusive with proportional
- Image preview (original) per file — batch identification requires it
- File size before / after display — validates the tool's purpose immediately
- Individual file download
- ZIP batch download — essential when users load multiple files
- Per-image processing status (idle / converting / done / error)
- "Files never leave your browser" trust signal visible on the page

**Should have (competitive):**
- Clipboard paste input (Ctrl+V / Cmd+V) — low effort, high delight, v1.x
- "Apply settings to all" for format/quality/resize — power user need once batch use is validated
- Re-convert on settings change — keeps source File in memory; users tweak quality post-conversion
- File size savings percentage display (e.g., "-67%") — more motivating than raw bytes

**Defer (v2+):**
- Saved localStorage presets — episodic tool usage; users won't miss this initially
- Per-image format/quality overrides (vs. global settings) — significant UI complexity, validate global first
- HEIC/HEIF input — ~500 KB WASM dependency; validate demand before adding
- Before/after visual comparison slider — high complexity, doubles memory, low marginal value over size delta display

**Anti-features to avoid:** AVIF output (Chrome-only encoder as of 2026), server-side fallbacks (violates privacy constraint), GIF animation support (Canvas strips animation silently — must reject animated GIFs at input with clear error), real-time canvas re-render on slider change (jank in batch mode).

### Architecture Approach

The architecture follows a strict separation: UI components emit events and render state; composables own all business logic and state; browser APIs are accessed only inside composables and lifecycle hooks. Three components map to three UI regions (DropZone, ImageCard, ControlPanel), three composables handle state, conversion, and download. `useImageStore` is the single source of truth for the `ImageItem[]` list. `useProcessor` is a stateless function that takes a `File` and `ConvertOptions` and returns a `Blob` — it has no knowledge of the store, making it independently testable. All Canvas / OffscreenCanvas operations live exclusively in `useProcessor.ts`.

**Major components:**
1. **DropZone** — file input via drag-drop, click, or paste; validates file types before adding to store
2. **ImageCard** — per-image presentational component; receives `ImageItem` as prop; shows preview, sizes, status, download button
3. **ControlPanel** — global format/quality/resize controls; reads/writes shared `ConvertOptions` ref; no local state

**Major composables:**
1. **useImageStore** — owns `ImageItem[]` list; tracks status per item; manages object URL lifecycle (create on add, revoke on remove)
2. **useProcessor** — pure async function: `createImageBitmap` → `OffscreenCanvas` draw → `convertToBlob`; handles resize dimensions and JPEG white-fill
3. **useDownload** — single file download via `URL.createObjectURL` + anchor; batch ZIP via `fflate.zipAsync`

**Build order (bottom-up):** types → useProcessor → useImageStore → useDownload → DropZone → ImageCard → ControlPanel → pages/index.vue

### Critical Pitfalls

1. **Transparent PNG to JPEG produces black background** — Before `drawImage()`, always fill canvas with white (`ctx.fillStyle = '#fff'; ctx.fillRect(...)`) when target format is JPEG. No fill needed for WebP (supports alpha). This must be in `useProcessor` from day one — retrofitting it later requires finding every export path.

2. **Nuxt SSG build crashes on browser API access** — Any code referencing `window`, `canvas`, `FileReader`, or `URL.createObjectURL` at module scope or in `setup()` crashes `nuxt generate` with `window is not defined`. Guard all browser APIs inside `onMounted()`, `<ClientOnly>`, or `import.meta.client` checks. Run `nuxt generate` in CI from the first commit — `nuxt dev` masks this entirely.

3. **iOS Safari silently returns black images when canvas exceeds 16,777,216 pixels** — A 5000×4000 image (20MP) exceeds the iOS limit and produces a blank output without throwing any error. Add a dimension guard before canvas creation that proportionally scales down to stay under the limit. Test on real iOS hardware with high-resolution photos; placeholder images will never trigger this.

4. **`toDataURL` causes memory overflow and is synchronous** — Never use `canvas.toDataURL()`. A 4MP image becomes a 5–15MB string in the JS heap. Use `OffscreenCanvas.convertToBlob()` (async, returns a binary `Blob`, works in Web Workers). This is a non-negotiable architectural rule.

5. **Canvas elements accumulate GPU memory without explicit cleanup** — After processing each image, set `canvas.width = 0; canvas.height = 0` before releasing the reference, or reuse a single canvas across images. Without this, processing 10+ large images causes steadily growing memory and eventual tab crash. Profile with DevTools Memory tab during batch processing.

**Additional pitfall:** EXIF orientation is ignored by Canvas — photos from phones are often rotated 90°. Detect and apply EXIF rotation in the processing pipeline. This is not optional for a tool targeting real-world photos.

## Implications for Roadmap

Based on combined research, the architecture and pitfall data strongly suggest a 4-phase build order. The key insight is that `useProcessor` is the dependency center — nothing else can be validated until it exists and handles all edge cases. Build the pipeline before the UI.

### Phase 1: Project Scaffold and SSG Safety

**Rationale:** The Nuxt SSG + browser API pitfall (Pitfall 2) must be addressed before any feature code is written. Establishing the pattern — `onMounted` guards, `<ClientOnly>`, `import.meta.client` — at scaffold time prevents a category of bugs that are expensive to find and fix later. `nuxt generate` must pass in CI from the first commit.

**Delivers:** Working Nuxt 3 SSG project; Vercel deploy pipeline; TypeScript types (`ImageItem`, `ConvertOptions`, status enums); nuxt.config.ts with jSquash WASM config; ESLint; Tailwind CSS 4; placeholder index page.

**Addresses:** SSG/browser-API isolation pattern established before any Canvas code exists.

**Avoids:** Pitfall 2 (Nuxt SSG + browser APIs). If this pattern is established in Phase 1, it cannot be introduced as technical debt later.

**Research flag:** Standard patterns — no additional phase research needed. Nuxt 3 docs are authoritative and complete.

---

### Phase 2: Core Image Processing Pipeline

**Rationale:** `useProcessor` is the dependency root for all other features. ImageCard, download, and ZIP all depend on having a reliable `Blob` output. The critical pitfalls (black JPEG from transparency, iOS canvas size limit, memory cleanup, EXIF orientation) must all be addressed here — they are all in `useProcessor`. This phase has zero UI polish; it is validated by unit tests and console assertions.

**Delivers:** `useProcessor.ts` with full pipeline: `createImageBitmap` → OffscreenCanvas draw + resize → `convertToBlob`; JPEG white-fill for transparency; iOS dimension guard; canvas cleanup (`canvas.width = 0`); EXIF orientation handling; `@jsquash/webp` integration for cross-browser WebP; `@jsquash/resize` for Lanczos resampling.

**Addresses:** Format conversion (JPEG/PNG/WebP), quality control, proportional resize, exact-px resize — all simultaneously in one pipeline pass.

**Avoids:** Pitfalls 1 (black JPEG), 3 (iOS canvas overflow), 4 (`toDataURL`), 5 (canvas memory accumulation).

**Uses:** `@jsquash/webp`, `@jsquash/resize`, `vite-plugin-wasm`, OffscreenCanvas API.

**Research flag:** Well-documented patterns. jSquash GitHub and MDN cover the integration. No additional phase research needed. The jSquash packages are in active development (MEDIUM confidence on API stability) — check changelogs before pinning versions.

---

### Phase 3: State Management and Core UI

**Rationale:** With `useProcessor` proven, wire it into the full application: `useImageStore` managing the image list, `DropZone` for file input, `ImageCard` for display, `ControlPanel` for settings. This phase produces a working end-to-end flow: drop files → convert → see results → download individually. Object URL lifecycle management (`revokeObjectURL` on remove) must be correct in this phase.

**Delivers:** `useImageStore.ts` (image list, status tracking, object URL lifecycle); `DropZone.vue` (drag-drop + file picker + paste); `ImageCard.vue` (preview, before/after sizes, processing status, individual download); `ControlPanel.vue` (format selector, quality slider, resize mode toggle + inputs); `useDownload.ts` (single file download); pages/index.vue assembled.

**Addresses:** Drag-drop input, batch processing UI, file size display, individual download, processing status per image, privacy trust signal.

**Avoids:** Anti-Pattern 3 (object URLs not revoked); Anti-Pattern 1 (processing logic inside components); UX pitfall of quality slider mapping (slider 80 → `quality: 0.8`, not `0.08`).

**Research flag:** Standard Vue/Nuxt composition patterns. No additional research needed.

---

### Phase 4: Batch Download and Polish

**Rationale:** ZIP download depends on all conversions completing and all output Blobs being available — it is a consumer of Phase 3. Polish (clipboard paste, settings-apply-to-all, file savings %, output filename suffix) is v1.x and can be layered on after the core flow is validated.

**Delivers:** `useDownload.ts` — ZIP generation via `fflate.zipAsync` (non-blocking, off main thread); sequential Blob collection to avoid OOM; "Download All" button disabled until all processing completes; per-item count display ("8 of 10 ready"); then: clipboard paste (Ctrl+V), "apply to all" for settings, file savings % display, output filename with quality/format suffix.

**Addresses:** ZIP batch download (table stakes), per-image processing status (polish), clipboard paste, apply-to-all, savings %.

**Avoids:** Pitfall: JSZip OOM on large batch (use `fflate`, process sequentially not concurrently); UX pitfall: ZIP available before processing completes.

**Research flag:** `fflate` ZIP API is straightforward; standard patterns. No additional phase research needed.

---

### Phase Ordering Rationale

- **Types and scaffold before code:** `ImageItem` and `ConvertOptions` types are the shared contract between composables and components. Defining them first (Phase 1) prevents drift as code grows.
- **Pipeline before UI:** `useProcessor` (Phase 2) is the dependency root. Nothing can be tested end-to-end without it. Building UI first creates components that cannot be wired to anything real.
- **State and UI before download:** `useDownload` is a pure consumer of `useImageStore`. Building it before the image list exists is wasteful.
- **ZIP last:** ZIP batch download is the most complex download operation and depends on all images having completed `outputBlob`. Validating individual download first (Phase 3) proves the `Blob` lifecycle before complicating it with ZIP assembly.
- **Pitfall avoidance is baked into build order:** Pitfalls 1–5 are all addressed in Phase 2 (core processing). This means they are never introduced as debt — they are solved as the pipeline is first built.

### Research Flags

Phases needing additional research during planning:
- **No phases require additional research.** The domain (Canvas API, Nuxt 3, WASM codecs) is well-documented with high-confidence sources. The jSquash packages are in active development — verify API compatibility against installed versions before starting Phase 2.

Phases with standard patterns (skip research-phase):
- **All phases:** Established patterns from MDN, Nuxt 3 docs, and jSquash GitHub cover the full implementation. The pitfalls are known and documented with prevention code.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Nuxt 3, Canvas API, and Vercel deploy verified via official docs and caniuse. jSquash is MEDIUM — active development, API may evolve, verify version compatibility at implementation time. |
| Features | HIGH | Verified against 5+ live tools (Squoosh, imageconvertwebp.com, Convertio, QuickImg). Feature gaps and anti-features are grounded in competitive analysis. |
| Architecture | HIGH | MDN-verified browser APIs, Nuxt 3 official composables patterns, OffscreenCanvas widely available since March 2023. Component boundaries are clear and map directly to UI regions. |
| Pitfalls | HIGH | Each pitfall documented with source links, code prevention patterns, and verification steps. iOS canvas limit, black JPEG, and SSR build failure are all well-reported with reproducible conditions. |

**Overall confidence:** HIGH

### Gaps to Address

- **EXIF orientation handling:** Research confirmed it is required but did not validate a specific WASM-based EXIF library for Nuxt 3 / Vite. At implementation time, evaluate `exifr` (ESM-compatible, widely used) or handle via `createImageBitmap` with `imageOrientation: 'from-image'` option (Chrome/Firefox supported; verify Safari support at build time).
- **jSquash API stability:** `@jsquash/webp` is listed as pre-release on GitHub (MEDIUM confidence). Pin to `1.5.0` at project start and audit the changelog before upgrading. The core `encode(imageData)` → `Uint8Array` API is stable in 1.5.0.
- **Concurrency limits for large batches:** Architecture research identifies a processing queue with 2–3 concurrent conversions as the right approach for 6–20 images, but the exact implementation (Promise queue, Web Worker pool) is not prescribed. Validate the simpler sequential approach first; add concurrency only if performance feedback requires it.

## Sources

### Primary (HIGH confidence)
- [caniuse: canvas toBlob WebP](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) — Safari/iOS WebP encoding gap, 80.9% global support
- [MDN: HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) — format support, quality parameter
- [MDN: OffscreenCanvas.convertToBlob()](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob) — async Blob output, widely available March 2023
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) — Web Worker compatibility
- [Nuxt 3 Deploy: Vercel](https://nuxt.com/deploy/vercel) — zero-config SSG deployment
- [Nuxt 3: State Management](https://nuxt.com/docs/getting-started/state-management) — `useState` patterns
- [Nuxt 3: Composables directory](https://nuxt.com/docs/guide/directory-structure/composables) — auto-import behavior
- [PQINA: Canvas Area Exceeds Maximum Limit](https://pqina.nl/blog/canvas-area-exceeds-the-maximum-limit/) — iOS 16.7M pixel limit
- [fflate npm](https://www.npmjs.com/package/fflate) — version, download count, API

### Secondary (MEDIUM confidence)
- [jSquash GitHub](https://github.com/jamsinclair/jSquash) — codec packages, Nuxt/Vite config requirements, pre-release status
- [vite-plugin-wasm GitHub](https://github.com/Menci/vite-plugin-wasm) — Vite 2–7 support
- [imageconvertwebp.com](https://www.imageconvertwebp.com/) — competitive feature reference, best UX for "apply to all" pattern
- [Squoosh](https://squoosh.app/) — competitive reference for quality slider and WASM codec patterns
- [DEV: Resize Images in JS FAST](https://dev.to/vipert/resize-images-in-js-fast-using-browser-multi-threading-3ocm) — Web Worker + OffscreenCanvas batch pattern

### Tertiary (supporting)
- [Konva: iOS Safari canvas limits explainer (2024)](https://longviewcoder.com/2024/02/09/konva-canvas-limits-in-safari-ios-explainer/) — corroborates iOS limit behavior
- [Firefox Support: Canvas black image on JPEG export](https://support.mozilla.org/en-US/questions/1528694) — confirms black JPEG from transparency
- [ImgConvert GitHub (bahihegazi)](https://github.com/bahihegazi/ImgConvert) — open source reference implementation

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*

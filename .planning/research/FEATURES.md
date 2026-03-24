# Feature Research

**Domain:** Client-side browser-based image conversion tool
**Researched:** 2026-03-24
**Confidence:** HIGH (verified across multiple live tools: Squoosh, imageconvertwebp.com, QuickImg, The Debuggers tool, Convertio)

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Drag-and-drop file input | Every modern image tool has it; clicking only feels archaic | LOW | Must coexist with a file picker button — drag-only is inaccessible |
| Multi-format output selection | Core reason user opens the tool (JPEG, PNG, WebP) | LOW | Canvas API encodes these natively; consistent cross-browser |
| Batch processing (multiple images) | Processing one image at a time defeats the purpose for most users | MEDIUM | Requires queue management, state per-image |
| Individual file download | User must be able to get each converted image | LOW | Standard anchor with blob URL |
| ZIP batch download | Users with 5+ files won't click download 10 times | MEDIUM | JSZip or fflate; runs in-browser without server |
| File size display (before / after) | Users open converters to reduce file size — they need to see the result | LOW | Calculate from File object and output Blob |
| No login / no account required | Public tool expectation; friction kills usage | — | Architectural, not a feature to build — just don't add it |
| Client-side privacy (files never leave browser) | Trust signal; many users are cautious about uploading personal photos | — | Architectural constraint already in PROJECT.md |
| Image preview (original) | Needed to identify which file is which in a batch | LOW | Use createObjectURL on the input File |
| Quality control slider | Standard in every serious image optimizer (Squoosh, TinyPNG, imageconvertwebp.com) | LOW | Range input 1–100 mapped to canvas toBlob quality param |
| Proportional resize | Common need — "make it smaller without distorting it" | LOW | One slider (%), maintain aspect ratio via canvas |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Combined format + resize + quality in single pass | Most tools do one thing. Squoosh compresses only. Convertio converts but no quality control. This tool does all three atomically. | MEDIUM | The core differentiator per PROJECT.md; requires orchestrating three operations in one pipeline |
| Exact dimension resize (px width × height) | Developers and e-commerce users need pixel-precise output, not just "smaller" | LOW | Second resize mode; Canvas drawImage to exact dimensions |
| Mutually exclusive resize modes (slider % vs exact px) | Prevents conflicting inputs; UX is unambiguous | LOW | Toggle between modes; only one active at a time |
| File size comparison display (percentage savings) | Showing "saved 67%" is more motivating than showing bytes | LOW | Compute ((before - after) / before) * 100 |
| "Apply to all" for quality / format / resize | Power users processing 10+ images want global settings with per-image override | MEDIUM | imageconvertwebp.com implements this well; needs state management |
| Clipboard paste input (Ctrl+V / Cmd+V) | Designers and devs frequently copy-paste screenshots; no save-to-disk step | LOW | Listen for paste event on document, read from ClipboardEvent.clipboardData |
| Processing status per image (idle / processing / done / error) | Batch tools need per-item state feedback, not just a spinner | LOW | State enum per queue item |
| Re-convert / tweak-and-redo | User changes quality from 80 to 60 and wants the new result without re-uploading | MEDIUM | Keep original File in memory; re-run pipeline on settings change |
| WebP as recommended default output | Educates users toward modern formats; reduces "what should I pick?" decision fatigue | LOW | Pre-select WebP in format selector; add tooltip explaining why |
| Output filename with quality suffix | imageconvertwebp.com feature — "photo-80q.webp" — useful for versioning | LOW | Configurable naming pattern at download time |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Before/after visual comparison slider (a la Squoosh) | Shows quality degradation visually; feels premium | Doubles memory usage (two canvases per image), high implementation complexity, low marginal value when quality slider + file size delta already communicates the tradeoff | Show file size delta + quality % label; sufficient signal at a fraction of complexity |
| AVIF output format | Modern format with best compression ratios | Encoding only works in Chrome; Firefox and Safari lack support as of 2026 — cross-browser inconsistency is a real bug | Recommend WebP as modern default; revisit AVIF when browser support stabilizes |
| GIF animation support | Users occasionally want to convert animated GIFs | Canvas API strips animation on draw; output is static first frame — silent data loss | Explicitly reject animated GIFs at input validation with a clear error message |
| Server-side fallback for unsupported formats | Would expand format coverage (BMP, TIFF, HEIC input) | Violates core privacy constraint; introduces backend infrastructure; destroys zero-friction positioning | Clearly document supported formats; fail fast with an informative error |
| Saved settings / localStorage presets | Power users want to reuse their settings | Not needed for v1; adds UI complexity for a tool most users use episodically | Manual re-selection is fast enough; deferred to v1.x if validated |
| Crop / rotate / flip operations | Logical to combine with resize | Different problem domain; users seeking these have established tools (e.g., browser-native editing); dilutes the conversion+optimization focus | Stay focused; link to recommended tools for editing if needed |
| Real-time live preview of output | Cool demo effect | For batch tools, re-rendering on every slider change causes jank; Canvas API quality output varies by browser | Show estimated file size delta in real-time (cheap) instead of re-rendering the canvas |
| HEIC/HEIF input | iPhone users export HEIC files | Requires a WASM library (heic2any); significant bundle size increase (~500KB); niche input format for a general converter | Support JPEG/PNG/WebP input; HEIC is out of scope for v1 |

---

## Feature Dependencies

```
[File input (drag-drop / picker / paste)]
    └──required-by──> [Image preview (original)]
    └──required-by──> [Quality slider]
    └──required-by──> [Format selector]
    └──required-by──> [Resize modes]

[File input] + [Quality slider] + [Format selector] + [Resize modes]
    └──all-feed-into──> [Conversion pipeline (Canvas API)]
                            └──produces──> [Output Blob]
                                               └──required-by──> [File size display (after)]
                                               └──required-by──> [Individual download]
                                               └──required-by──> [ZIP batch download]

[File size display (before)] ──requires──> [File input] (File.size available immediately)
[File size display (after)]  ──requires──> [Conversion pipeline output]

[ZIP batch download] ──requires──> [All images converted] (or at-least-one with partial support)

[Proportional resize (slider %)] ──conflicts-with──> [Exact dimension resize (px)]
    └── Only one active at a time; toggling one resets the other

[Re-convert] ──requires──> [Original File kept in memory] + [Conversion pipeline]
```

### Dependency Notes

- **File input is the root dependency.** Everything else flows from having a file loaded. Build this first.
- **Conversion pipeline is the integration point.** It consumes format, quality, and resize settings and produces a Blob. The pipeline must accept all three as inputs simultaneously.
- **ZIP download depends on all conversions completing.** Either implement a "download ready" state per image, or allow partial ZIP of completed items.
- **Proportional and exact-px resize conflict.** Toggling one must clear/disable the other. This is UX state management, not a separate feature — it lives in the same resize component.
- **Re-convert requires the original File to stay in memory.** If the queue evicts the source File, re-conversion is impossible. Memory management matters for large batches.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] Drag-and-drop + file picker input — without this, users can't start
- [ ] Format selection (JPEG, PNG, WebP) with WebP as default — core feature
- [ ] Quality slider (1–100%) — core feature, differentiates from plain converters
- [ ] Proportional resize via percentage slider — core feature
- [ ] Exact dimension resize (width × height px) — mutually exclusive with proportional; low complexity, high value for dev/ecommerce users
- [ ] Image preview (original) — required for batch identification
- [ ] File size before / after display — validates the tool's purpose instantly
- [ ] Individual file download — essential for any output to reach the user
- [ ] ZIP batch download — essential when multiple files are loaded
- [ ] Processing status per image (idle / converting / done / error) — required for batch UX clarity
- [ ] Privacy trust signal visible on page — "files never leave your browser"

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] "Apply settings to all" button for quality/format/resize — add when users process 5+ images regularly
- [ ] Clipboard paste input (Ctrl+V) — low effort, high delight; add in early iteration
- [ ] Re-convert on settings change — add when users report needing to tweak settings post-conversion
- [ ] Output filename with quality/format suffix option — add when power users request it
- [ ] File size savings percentage display (e.g., "-67%") — easy enhancement to existing size display

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Saved settings in localStorage — defer; episodic tool usage means users won't miss it initially
- [ ] Per-image format/quality overrides (vs. global settings) — adds significant UI complexity; validate global-settings demand first
- [ ] HEIC/HEIF input support — large WASM dependency; validate user demand before adding ~500KB to bundle
- [ ] Dark mode — useful but not core to conversion value prop

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Drag-drop + file picker input | HIGH | LOW | P1 |
| Format selection (JPEG/PNG/WebP) | HIGH | LOW | P1 |
| Quality slider | HIGH | LOW | P1 |
| Proportional resize (%) | HIGH | LOW | P1 |
| Exact px resize | HIGH | LOW | P1 |
| File size before/after display | HIGH | LOW | P1 |
| Individual download | HIGH | LOW | P1 |
| ZIP batch download | HIGH | MEDIUM | P1 |
| Image preview (original) | HIGH | LOW | P1 |
| Per-image processing status | MEDIUM | LOW | P1 |
| Clipboard paste input | MEDIUM | LOW | P2 |
| "Apply to all" settings | MEDIUM | MEDIUM | P2 |
| Re-convert on tweak | MEDIUM | MEDIUM | P2 |
| File savings % display | MEDIUM | LOW | P2 |
| Output filename with suffix | LOW | LOW | P2 |
| Saved localStorage presets | LOW | MEDIUM | P3 |
| Per-image format/quality overrides | MEDIUM | HIGH | P3 |
| HEIC/HEIF input | LOW | HIGH | P3 |
| Before/after visual comparison slider | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

| Feature | Squoosh | imageconvertwebp.com | Convertio | Our Approach |
|---------|---------|----------------------|-----------|--------------|
| Client-side processing | YES | YES | NO (server) | YES — architectural constraint |
| Batch processing | NO (1 at a time) | YES (up to 50) | YES (up to 10 free) | YES — core requirement |
| Format conversion | YES (7 formats + WASM codecs) | WebP only | YES (200+ formats) | JPEG/PNG/WebP — focused scope |
| Quality slider | YES | YES (per image + apply all) | NO | YES |
| Resize | NO | NO | YES (basic) | YES — key differentiator |
| Quality + resize + convert in one pass | NO | NO | NO | YES — core value proposition |
| ZIP download | NO | YES | YES | YES |
| File size before/after | YES (visual) | YES (numeric) | YES (numeric) | YES (numeric + %) |
| No account required | YES | YES | Partial (free tier) | YES |
| Clipboard paste | YES | YES | NO | YES (v1.x) |
| Before/after visual comparison | YES (Squoosh's signature feature) | NO | NO | NO — complexity too high vs value |
| Per-image settings override | N/A (1 image) | YES | YES | v1.x |
| WASM codecs (MozJPEG, etc.) | YES | NO (canvas only) | N/A (server) | NO for v1 — canvas sufficient for JPEG/PNG/WebP |
| WebP as default recommendation | NO | YES (it's the only output) | NO | YES |

---

## Sources

- [Squoosh (Google)](https://squoosh.app/) — live tool analysis
- [imageconvertwebp.com](https://www.imageconvertwebp.com/) — feature-rich client-side WebP converter; best UX reference for per-image settings and "apply to all"
- [Best Image Converter Tools Online in 2026 — The Debuggers](https://thedebuggersitsolutions.com/blog/best-image-converter-tools-online-2026) — comparative feature survey
- [Best Free Squoosh Alternatives in 2026 — QuickImg](https://www.quickimg.io/blog/best-free-squoosh-alternatives/) — user value analysis
- [ImgConvert GitHub (bahihegazi)](https://github.com/bahihegazi/ImgConvert) — open source reference implementation with drag-drop, preview, progress bar, ZIP
- [Online Image Compression Tools: Optimizilla vs Squoosh — DebugBear](https://www.debugbear.com/software/online-image-optimization-tools) — quality comparison reference
- [Drag-and-Drop UX Best Practices — Pencil & Paper](https://www.pencilandpaper.io/articles/ux-pattern-drag-and-drop) — accessibility and UX patterns
- [Client-Side Image Processing Canvas API — Halodoc Engineering](https://blogs.halodoc.io/optimizing-for-speed-image-compression/) — Canvas API limitations (16384px hard limit, toBlob inconsistency across browsers)

---
*Feature research for: client-side image conversion tool (Nuxt 3, browser-only)*
*Researched: 2026-03-24*

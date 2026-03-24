# Stack Research

**Domain:** Client-side image conversion tool (Nuxt 3 + TypeScript, SSG, Vercel)
**Researched:** 2026-03-24
**Confidence:** MEDIUM-HIGH (Canvas API behavior verified via MDN/caniuse; jSquash WASM details from GitHub; versions from npm registry)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Nuxt 3 | 4.4.2 (latest) | App framework | Non-negotiable per project constraints. SSG mode via `nuxt generate`. Zero-config Vercel integration via Nitro preset auto-detection. |
| Vue 3 | 3.5.x (bundled with Nuxt) | UI reactivity | Bundled with Nuxt — no separate install. Composition API with `<script setup>` is the standard pattern in 2025. |
| TypeScript | 5.x (bundled via Nuxt) | Type safety | Nuxt ships first-class TS support. No additional config needed beyond `nuxt.config.ts`. |
| Canvas API (browser native) | — | Image decode/draw/export | The canonical browser primitive for image processing. Handles JPEG, PNG, and WebP *encode* via `toBlob()` — but **not on Safari/iOS** for WebP (see critical note below). No install needed. |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @jsquash/webp | 1.5.0 | WebP encode via WASM (libwebp) | **Required.** Safari and iOS do not support `canvas.toBlob('image/webp')`. Use this WASM codec as the universal WebP encoder instead of relying on Canvas for any browser. This avoids Safari-specific branching entirely. |
| @jsquash/jpeg | 1.6.0 | JPEG encode via WASM (MozJPEG) | Optional but recommended. MozJPEG produces significantly smaller files than browser-native JPEG encoding at equivalent quality settings. Use for quality-sensitive JPEG output. |
| @jsquash/png | 3.1.1 | PNG encode via WASM | Optional. Canvas PNG encoding is universally supported, but jsquash/png offers better compression. Use only if PNG file size matters; skip if bundle size is a concern. |
| @jsquash/resize | latest | High-quality image resizing via WASM | Use for proportional and pixel-exact resize operations. Provides Lanczos resampling, which is sharper than `drawImage` downscaling on Canvas alone. Pairs naturally with jsquash encoders. |
| fflate | 0.8.2 | ZIP archive generation in browser | For batch download (.zip). ~8 kB gzipped. Off-main-thread capable. 30M+ weekly downloads. Preferred over JSZip (see Alternatives). |
| vite-plugin-wasm | latest | Enable WASM imports in Vite/Nuxt | Required when using jSquash packages. Configure via `nuxt.config.ts` under `vite.plugins`. Also add packages to `vite.optimizeDeps.exclude` to avoid Vite pre-bundle errors. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| Nuxt DevTools | In-browser dev experience | Ships with Nuxt 3, zero config. Enable via `devtools: { enabled: true }` in nuxt.config. |
| ESLint + @nuxt/eslint | Lint + Nuxt-specific rules | Use `@nuxt/eslint` which bundles the correct Vue and TS rules for Nuxt. |
| Tailwind CSS 4 | Utility CSS | v4 is the 2025 standard. Install via `@nuxtjs/tailwindcss` module (v6.14.x). No `tailwind.config.js` required in v4. |

---

## Critical Finding: Safari Does Not Encode WebP via Canvas

**Confidence: HIGH** — Verified via [caniuse.com](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp)

Safari (desktop and iOS) does not support `canvas.toBlob('image/webp')`. Global WebP-via-canvas support is ~80.9%, meaning ~19% of users (predominantly Safari/iOS) silently fall back to PNG when WebP is requested — **without any error thrown**.

**The recommended solution:** Use `@jsquash/webp` as the encoder for all browsers. This gives you consistent, cross-browser WebP output regardless of Safari, and the quality parameter works identically everywhere. The WASM binary is ~300 KB, which is acceptable for a tool where users are actively uploading images.

**Do not** rely on Canvas `toBlob` for format conversion. Use Canvas only for drawing and resizing, then pipe `ImageData` into jSquash encoders.

---

## Installation

```bash
# Core (Nuxt handles Vue, TS, Vite)
npx nuxi init img-conversor
cd img-conversor

# WASM codecs
npm install @jsquash/webp @jsquash/jpeg @jsquash/resize

# ZIP generation
npm install fflate

# Vite WASM plugin (required for jSquash)
npm install -D vite-plugin-wasm

# CSS (optional but standard)
npm install -D @nuxtjs/tailwindcss
```

### Required nuxt.config.ts additions for jSquash

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  ssr: false,           // Pure client-side SPA — no server rendering needed
  nitro: {
    preset: 'static',  // For `nuxt generate` → static output for Vercel
  },
  vite: {
    plugins: [
      // @ts-ignore — vite-plugin-wasm typings
      wasm(),
    ],
    optimizeDeps: {
      exclude: ['@jsquash/webp', '@jsquash/jpeg', '@jsquash/png', '@jsquash/resize'],
    },
  },
  build: {
    transpile: ['@jsquash/webp', '@jsquash/jpeg', '@jsquash/png', '@jsquash/resize'],
  },
})
```

> Note: `ssr: false` is appropriate here because this is a pure client-side tool — no pages need to be server-rendered or SEO-indexed at the route level. `nuxt generate` will still emit static HTML shells.

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @jsquash/webp (WASM encoder) | Canvas `toBlob('image/webp')` | Never for this project — Safari/iOS gap makes it unacceptable as the sole encoder. Acceptable only if you are targeting Chromium-only environments. |
| fflate | JSZip 3.10.1 | JSZip is fine if team already uses it and prefers its API. JSZip last published 2022; fflate is more actively maintained and ~3x faster in benchmarks. Either works for this use case. |
| @jsquash/resize | pica 9.0.1 | pica is stable and well-understood, last published ~2021. Use pica if you prefer a simpler API and don't need WASM for encoding (i.e., no jSquash). If you're already pulling in jSquash, `@jsquash/resize` keeps the image pipeline in one ecosystem. |
| @jsquash/jpeg (MozJPEG WASM) | Canvas `toBlob('image/jpeg')` | Canvas JPEG encoding works in all modern browsers including Safari. Use Canvas JPEG if bundle size is a priority and maximum compression quality is not required. |
| Tailwind CSS 4 | Tailwind CSS 3 + @nuxtjs/tailwindcss | Use Tailwind 3 if your team needs the stable, widely-documented config patterns. Tailwind 4's CSS-first config is a breaking change in DX. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| sharp | Node.js only — not available in the browser. Will throw at runtime in a client-side context. | Canvas API + jSquash WASM codecs |
| jimp | Node.js / Webpack-era library. Large bundle, no browser WASM path. Not suitable for Vite/ESM builds. | @jsquash codecs |
| Compressor.js | Thin Canvas wrapper that still uses Canvas `toBlob` — inherits the Safari/iOS WebP gap. Actively misleading for cross-browser WebP. | @jsquash/webp |
| browser-image-compression | Popular but relies on Canvas `toBlob` for format encoding. Same Safari WebP issue. Fine for JPEG/PNG compression-only use cases. | @jsquash/webp for WebP; acceptable for JPEG-only compression |
| html2canvas / dom-to-image | DOM rendering to canvas — for capturing screenshots, not for image file conversion. Irrelevant to this project. | Direct Canvas drawImage pipeline |
| AVIF encoding | Per project scope: browser AVIF encode is Chrome-only (no Safari, no Firefox). Excluded from scope. | WebP is the modern default |

---

## Stack Patterns by Variant

**If the user selects WebP as output format:**
- Use `@jsquash/webp` encode, regardless of browser
- Do not branch on `canvas.toBlob` WebP support — this avoids silent fallback bugs

**If the user selects JPEG as output format:**
- Option A: Use `@jsquash/jpeg` (MozJPEG WASM) for better compression at same quality
- Option B: Use `canvas.toBlob('image/jpeg', quality)` for simpler code with slightly larger files
- Recommendation: Use Canvas JPEG for v1 (universally supported, simpler); upgrade to MozJPEG if file size feedback is negative

**If the user selects PNG as output format:**
- Use `canvas.toBlob('image/png')` — universally supported, no WASM needed
- `@jsquash/png` is optional and only worth the complexity if PNG compression ratio matters

**If processing large images (>8 MP):**
- Use Web Workers to move Canvas draw + jSquash encode off the main thread
- jSquash codecs are designed to run in Web Workers
- Nuxt 3 + Vite supports `new Worker(new URL('./worker.ts', import.meta.url))`

**For batch ZIP download:**
- Use `fflate.zipAsync()` — non-blocking, off main thread
- Collect all encoded Blobs, pass as `{ 'filename.webp': arrayBuffer }` map, trigger download via `URL.createObjectURL`

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @jsquash/webp@1.5.0 | Nuxt 3 / Vite 5+ | Requires `vite-plugin-wasm` + `optimizeDeps.exclude`. ESM-only. |
| @jsquash/resize@latest | @jsquash/webp, @jsquash/jpeg | Same WASM pipeline — they share the ImageData format. |
| fflate@0.8.2 | Nuxt 3 / Vite 5 | Pure ESM, no config needed. Works in browser and Node. |
| vite-plugin-wasm | Vite 2.x–7.x | May also need `vite-plugin-top-level-await` for older browser targets. |
| Nuxt 4.4.2 | Vue 3.5.x, Vite 5 | Auto-bundled. No separate Vue or Vite install needed. |

---

## Sources

- [caniuse: canvas toBlob WebP support](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) — Safari/iOS gap confirmed, global 80.92% support — HIGH confidence
- [MDN: HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) — Format support rules, quality parameter behavior — HIGH confidence
- [jSquash GitHub](https://github.com/jamsinclair/jSquash) — Codec packages, Nuxt/Vite config requirements, Web Worker compatibility — MEDIUM confidence (pre-release, active development)
- [Nuxt Deploy: Vercel](https://nuxt.com/deploy/vercel) — Zero-config deployment, nitro preset auto-detection — HIGH confidence
- [fflate npm](https://www.npmjs.com/package/fflate) — Version 0.8.2, 30M+ weekly downloads — HIGH confidence
- [JSZip](https://stuk.github.io/jszip/) — Version 3.10.1, last published 2022 — HIGH confidence
- [pica npm](https://www.npmjs.com/package/pica) — Version 9.0.1, last published ~4 years ago — HIGH confidence (version verified via npm CLI)
- [vite-plugin-wasm GitHub](https://github.com/Menci/vite-plugin-wasm) — Vite 2–7 support — MEDIUM confidence

---

*Stack research for: img-conversor — client-side image conversion tool*
*Researched: 2026-03-24*

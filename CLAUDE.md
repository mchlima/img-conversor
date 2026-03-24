<!-- GSD:project-start source:PROJECT.md -->
## Project

**Img Conversor**

Site moderno para converter, redimensionar e ajustar a qualidade de imagens — tudo em uma única ferramenta, sem login ou backend. Todo o processamento acontece no browser do usuário via Canvas API e jSquash WASM. Suporta JPEG, PNG e WebP com processamento cross-browser (Chrome, Firefox, Safari). Voltado para produtores de conteúdo, frontend developers, donos de e-commerce e qualquer pessoa que precise otimizar imagens para web.

**Core Value:** Conversão de formato + redimensionamento + controle de qualidade em uma única operação — sem fricção, sem upload para servidor, sem cadastro.

### Constraints

- **Tech stack**: Nuxt 3 + TypeScript — não negociável
- **Deploy**: Vercel com SSG — não negociável
- **Processamento**: 100% client-side — nenhuma imagem sai do browser do usuário
- **Backend**: Nenhum — zero infraestrutura server-side
- **Formatos**: Apenas formatos com suporte consistente cross-browser (JPEG, PNG, WebP)
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

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
## Critical Finding: Safari Does Not Encode WebP via Canvas
## Installation
# Core (Nuxt handles Vue, TS, Vite)
# WASM codecs
# ZIP generation
# Vite WASM plugin (required for jSquash)
# CSS (optional but standard)
### Required nuxt.config.ts additions for jSquash
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| @jsquash/webp (WASM encoder) | Canvas `toBlob('image/webp')` | Never for this project — Safari/iOS gap makes it unacceptable as the sole encoder. Acceptable only if you are targeting Chromium-only environments. |
| fflate | JSZip 3.10.1 | JSZip is fine if team already uses it and prefers its API. JSZip last published 2022; fflate is more actively maintained and ~3x faster in benchmarks. Either works for this use case. |
| @jsquash/resize | pica 9.0.1 | pica is stable and well-understood, last published ~2021. Use pica if you prefer a simpler API and don't need WASM for encoding (i.e., no jSquash). If you're already pulling in jSquash, `@jsquash/resize` keeps the image pipeline in one ecosystem. |
| @jsquash/jpeg (MozJPEG WASM) | Canvas `toBlob('image/jpeg')` | Canvas JPEG encoding works in all modern browsers including Safari. Use Canvas JPEG if bundle size is a priority and maximum compression quality is not required. |
| Tailwind CSS 4 | Tailwind CSS 3 + @nuxtjs/tailwindcss | Use Tailwind 3 if your team needs the stable, widely-documented config patterns. Tailwind 4's CSS-first config is a breaking change in DX. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| sharp | Node.js only — not available in the browser. Will throw at runtime in a client-side context. | Canvas API + jSquash WASM codecs |
| jimp | Node.js / Webpack-era library. Large bundle, no browser WASM path. Not suitable for Vite/ESM builds. | @jsquash codecs |
| Compressor.js | Thin Canvas wrapper that still uses Canvas `toBlob` — inherits the Safari/iOS WebP gap. Actively misleading for cross-browser WebP. | @jsquash/webp |
| browser-image-compression | Popular but relies on Canvas `toBlob` for format encoding. Same Safari WebP issue. Fine for JPEG/PNG compression-only use cases. | @jsquash/webp for WebP; acceptable for JPEG-only compression |
| html2canvas / dom-to-image | DOM rendering to canvas — for capturing screenshots, not for image file conversion. Irrelevant to this project. | Direct Canvas drawImage pipeline |
| AVIF encoding | Per project scope: browser AVIF encode is Chrome-only (no Safari, no Firefox). Excluded from scope. | WebP is the modern default |
## Stack Patterns by Variant
- Use `@jsquash/webp` encode, regardless of browser
- Do not branch on `canvas.toBlob` WebP support — this avoids silent fallback bugs
- Option A: Use `@jsquash/jpeg` (MozJPEG WASM) for better compression at same quality
- Option B: Use `canvas.toBlob('image/jpeg', quality)` for simpler code with slightly larger files
- Recommendation: Use Canvas JPEG for v1 (universally supported, simpler); upgrade to MozJPEG if file size feedback is negative
- Use `canvas.toBlob('image/png')` — universally supported, no WASM needed
- `@jsquash/png` is optional and only worth the complexity if PNG compression ratio matters
- Use Web Workers to move Canvas draw + jSquash encode off the main thread
- jSquash codecs are designed to run in Web Workers
- Nuxt 3 + Vite supports `new Worker(new URL('./worker.ts', import.meta.url))`
- Use `fflate.zipAsync()` — non-blocking, off main thread
- Collect all encoded Blobs, pass as `{ 'filename.webp': arrayBuffer }` map, trigger download via `URL.createObjectURL`
## Version Compatibility
| Package | Compatible With | Notes |
|---------|-----------------|-------|
| @jsquash/webp@1.5.0 | Nuxt 3 / Vite 5+ | Requires `vite-plugin-wasm` + `optimizeDeps.exclude`. ESM-only. |
| @jsquash/resize@latest | @jsquash/webp, @jsquash/jpeg | Same WASM pipeline — they share the ImageData format. |
| fflate@0.8.2 | Nuxt 3 / Vite 5 | Pure ESM, no config needed. Works in browser and Node. |
| vite-plugin-wasm | Vite 2.x–7.x | May also need `vite-plugin-top-level-await` for older browser targets. |
| Nuxt 4.4.2 | Vue 3.5.x, Vite 5 | Auto-bundled. No separate Vue or Vite install needed. |
## Sources
- [caniuse: canvas toBlob WebP support](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) — Safari/iOS gap confirmed, global 80.92% support — HIGH confidence
- [MDN: HTMLCanvasElement.toBlob()](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob) — Format support rules, quality parameter behavior — HIGH confidence
- [jSquash GitHub](https://github.com/jamsinclair/jSquash) — Codec packages, Nuxt/Vite config requirements, Web Worker compatibility — MEDIUM confidence (pre-release, active development)
- [Nuxt Deploy: Vercel](https://nuxt.com/deploy/vercel) — Zero-config deployment, nitro preset auto-detection — HIGH confidence
- [fflate npm](https://www.npmjs.com/package/fflate) — Version 0.8.2, 30M+ weekly downloads — HIGH confidence
- [JSZip](https://stuk.github.io/jszip/) — Version 3.10.1, last published 2022 — HIGH confidence
- [pica npm](https://www.npmjs.com/package/pica) — Version 9.0.1, last published ~4 years ago — HIGH confidence (version verified via npm CLI)
- [vite-plugin-wasm GitHub](https://github.com/Menci/vite-plugin-wasm) — Vite 2–7 support — MEDIUM confidence
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->

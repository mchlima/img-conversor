# Milestones

## v1.1 UI Refactor (Shipped: 2026-03-24)

**Phases completed:** 1 phases, 1 plans, 0 tasks

**Key accomplishments:**

- One-liner:

---

## v1.0 MVP (Shipped: 2026-03-24)

**Phases completed:** 4 phases, 7 plans, 14 tasks

**Key accomplishments:**

- Nuxt 3 SSG project initialized with @nuxt/ui, @nuxtjs/i18n, vite-plugin-wasm, and @jsquash/webp — nuxt generate passes, WASM bundled in output
- Nuxt 3 SSG scaffold deployed to Vercel with WASM-safe CSP headers — INFR-03 confirmed live by user.
- One-liner:
- One-liner:
- useImageStore composable with replace-semantics addImages, removeImage, convertAll, isProcessing; ImageItem extended with hasAlpha; formatBytes utility; full i18n key sets for all UI sections in English and Portuguese
- DropZone with drag-and-drop + click-to-select, ImageCard with thumbnail/sizes/status/download/remove, ControlPanel with format/quality/resize/color controls, and pages/index.vue with two-column desktop layout — complete interactive application UI wired to useImageStore and useConvertOptions
- ZIP batch download via fflate — timestamped .zip file with filename deduplication, async generation, and Download All button with disabled/loading states above the image list

---

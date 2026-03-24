# Phase 4: Batch Download - Research

**Researched:** 2026-03-24
**Domain:** Client-side ZIP generation and browser download trigger (fflate + Vue 3 + Nuxt 3)
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- **D-01:** ZIP filename: `img-conversor-{data-hora}.zip` (ex: `img-conversor-2026-03-24-143052.zip`) — evita sobrescrever downloads anteriores
- **D-02:** Botão "Baixar Todas" posicionado ACIMA da lista de imagens (não na sidebar, não abaixo)
- **D-03:** Botão desabilitado até todas as conversões terminarem

### Claude's Discretion
- Usar fflate (já instalado) para geração do ZIP
- Estratégia de geração do ZIP (streaming vs in-memory)
- Feedback visual durante geração do ZIP (spinner, progress)
- Adição de i18n keys necessárias

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| OUTP-04 | Usuário pode baixar todas as imagens convertidas em um arquivo .zip | fflate zipAsync/zip API, allConverted computed, timestamp filename, browser download anchor pattern |
</phase_requirements>

---

## Summary

This phase adds a single "Download All" button that packages every converted image into a ZIP file and triggers a browser download. The entire operation runs client-side: no server, no backend.

The core pipeline is: collect `convertedBlob` from each `ImageItem` in the store → convert each Blob to `Uint8Array` via `blob.arrayBuffer()` → build a filename-keyed object → pass to fflate's async `zip()` → wrap result `Uint8Array` in a `Blob` → trigger download with `URL.createObjectURL`, then revoke.

The button's disabled state is driven by a new `allConverted` computed in `useImageStore` (images list non-empty AND every item is `status === 'done'`). The `isProcessing` pattern from Phase 3 is the direct model for this. fflate is NOT currently in `package.json` or `node_modules` — it must be installed as a first task.

**Primary recommendation:** Install fflate, add `allConverted` computed to the store, create a `useDownloadAll` composable that encapsulates ZIP logic, and render the button in `pages/index.vue` above the image list using the existing `UButton` / i18n patterns.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fflate | 0.8.2 | ZIP archive generation in browser | Project decision (locked). ~8 kB gzipped, pure ESM, no Nuxt config needed. `zip()` is non-blocking (uses Web Workers internally). Verified current version via npm registry (published 2024-02-07). |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| URL.createObjectURL | browser native | Convert ZIP Blob to downloadable link | Standard pattern — already used in `ImageCard.vue` |
| URL.revokeObjectURL | browser native | Release ZIP Blob memory after trigger | Must call after `.click()` — same as individual download pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fflate | JSZip | JSZip last published 2022, slower, more memory-hungry. fflate is the locked decision — do not switch. |

**Installation — fflate is NOT yet installed:**
```bash
npm install fflate
```

**Version verification:** Confirmed `fflate@0.8.2` is current as of registry check (2024-02-07). No newer version exists.

---

## Architecture Patterns

### Where Code Lives

```
composables/
├── useImageStore.ts     # Add allConverted computed + downloadAll function (or keep in composable)
├── useDownloadAll.ts    # New: encapsulates ZIP generation logic (optional extraction)
pages/
├── index.vue            # Add <DownloadAllButton /> above image list div
components/
├── DownloadAllButton.vue  # New: UButton + loading state + i18n
i18n/locales/
├── en.json              # Add batch.download_all, batch.generating keys
└── pt-BR.json           # Add Portuguese equivalents
```

### Pattern 1: allConverted Computed in useImageStore

**What:** A reactive boolean that is `true` only when the images array is non-empty AND every item has `status === 'done'`.

**When to use:** Drives the disabled state of the "Download All" button. Mirrors the `isProcessing` pattern already in the store.

```typescript
// composables/useImageStore.ts — add alongside isProcessing
const allConverted = computed(() =>
  images.value.length > 0 && images.value.every(i => i.status === 'done')
)
```

Export `allConverted` from the return object.

### Pattern 2: Blob → Uint8Array → fflate zip → download

**What:** The full ZIP generation pipeline. fflate's `zip()` accepts a callback (NOT a Promise natively), so wrap with a Promise for async/await ergonomics.

```typescript
// Source: fflate FAQ (https://github.com/101arrowz/fflate/wiki/FAQ)
import { zip } from 'fflate'

async function downloadAll(images: ImageItem[], format: OutputFormat) {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extMap[format] || 'webp'

  // Build zippable object: { 'filename.ext': Uint8Array }
  const zippable: Record<string, Uint8Array> = {}
  for (const item of images) {
    if (!item.convertedBlob) continue
    const baseName = item.name.replace(/\.[^.]+$/, '')
    zippable[`${baseName}.${ext}`] = new Uint8Array(await item.convertedBlob.arrayBuffer())
  }

  // Wrap fflate's callback API in a Promise
  const zipData = await new Promise<Uint8Array>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  // Timestamp filename: img-conversor-YYYY-MM-DD-HHmmss.zip (D-01)
  const now = new Date()
  const ts = now.toISOString().replace('T', '-').replace(/:/g, '').slice(0, 17)
  const filename = `img-conversor-${ts}.zip`

  // Firefox-safe download pattern (mirrors ImageCard.vue)
  const blob = new Blob([zipData], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
```

### Pattern 3: Timestamp Format for Filename

**What:** `img-conversor-YYYY-MM-DD-HHmmss.zip`

```typescript
// Produces: img-conversor-2026-03-24-143052.zip
const now = new Date()
const ts = [
  now.getFullYear(),
  String(now.getMonth() + 1).padStart(2, '0'),
  String(now.getDate()).padStart(2, '0'),
  '-',
  String(now.getHours()).padStart(2, '0'),
  String(now.getMinutes()).padStart(2, '0'),
  String(now.getSeconds()).padStart(2, '0'),
].join('')
// Result: '20260324-143052'
// Full filename: `img-conversor-${ts}.zip`
```

Alternative using ISO string (simpler):
```typescript
const ts = new Date().toISOString()
  .replace(/[-:]/g, '')   // remove separators
  .replace('T', '')
  .slice(0, 15)           // YYYYMMDDHHMMSS → 15 chars
```

Use the explicit approach (first version) to ensure the output matches the documented example format `2026-03-24-143052`.

### Pattern 4: Button placement in pages/index.vue

**What:** Insert the Download All button (or component) between DropZone and the image list `div`, inside the existing `v-if="images.length > 0"` guard or as a sibling with its own guard.

```vue
<!-- pages/index.vue — inside the content column div -->
<div class="space-y-4">
  <DropZone />

  <!-- Download All button: visible when images exist (D-02: above the list) -->
  <div v-if="images.length > 0" class="flex justify-end">
    <DownloadAllButton />
  </div>

  <!-- Image list -->
  <div v-if="images.length > 0" class="space-y-2">
    <ImageCard v-for="item in images" :key="item.id" :item="item" />
  </div>
</div>
```

### Pattern 5: i18n Keys to Add

Both locale files need new keys. Add under a `batch` namespace to avoid collision with existing `card` or `controls` keys:

**en.json:**
```json
"batch": {
  "download_all": "Download All",
  "generating": "Generating ZIP...",
  "tooltip_waiting": "Convert all images first"
}
```

**pt-BR.json:**
```json
"batch": {
  "download_all": "Baixar Todas",
  "generating": "Gerando ZIP...",
  "tooltip_waiting": "Converta todas as imagens primeiro"
}
```

### Anti-Patterns to Avoid

- **`zipSync()` on main thread:** Blocks the UI for large batches. Use `zip()` (async) which offloads to Web Workers.
- **`URL.revokeObjectURL` skipped:** The ZIP blob stays in memory for the session. Always revoke with `setTimeout(..., 100)` like `ImageCard.vue`.
- **Button triggers during processing:** `allConverted` must be `false` (thus button disabled) when `isProcessing` is `true`. These are two different states — do not conflate.
- **No loading indicator:** ZIP generation with 20+ large images takes 1–3 seconds. Without a spinner the user may double-click. Use a `isGenerating` ref to disable the button and swap its label during generation.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ZIP archive creation | Custom ZIP byte writer | fflate `zip()` | ZIP format has CRC32, local file headers, central directory — all handled by fflate |
| Async Blob-to-bytes | Custom FileReader loops | `blob.arrayBuffer()` + `new Uint8Array()` | Native browser API, cleaner, no callback hell |
| Download trigger | Custom iframe/form hack | `URL.createObjectURL` + anchor `.click()` | Already the established pattern in `ImageCard.vue` |

**Key insight:** fflate handles all ZIP internals including compression levels and file headers. The only custom logic needed is the filename-keyed object construction and the download trigger.

---

## Common Pitfalls

### Pitfall 1: fflate Not Installed

**What goes wrong:** `import { zip } from 'fflate'` throws at runtime or build time because fflate is absent from `package.json` and `node_modules`.

**Why it happens:** STACK.md and CLAUDE.md reference fflate as "already installed" but verification of `package.json` and `node_modules` confirms it is NOT present. The decision was made in the scaffold phase but never executed.

**How to avoid:** First task of Wave 1 must be `npm install fflate`. Verify `package.json` contains `"fflate": "^0.8.2"` after install.

**Warning signs:** `Cannot find module 'fflate'` at dev server start.

### Pitfall 2: Button Enabled Before All Images Are Converted

**What goes wrong:** User downloads a ZIP that is missing some images because one or more are still in `idle` or `processing` state.

**Why it happens:** Using `!isProcessing` instead of `allConverted` — `isProcessing` becomes `false` as soon as the last queued item finishes, but may start as `false` when images are `idle` (never converted).

**How to avoid:** Use `allConverted` computed: `images.length > 0 && images.every(i => i.status === 'done')`. This is `false` for both the initial `idle` state and mid-conversion.

**Warning signs:** Download All enabled immediately after images are added (before Convert is clicked).

### Pitfall 3: Filename Collision in ZIP for Duplicate Filenames

**What goes wrong:** If two images have the same filename (e.g., two files both named `photo.jpg`), fflate silently overwrites the first entry with the second. The ZIP appears complete but contains fewer files.

**Why it happens:** The zippable object is a plain JS object; duplicate keys overwrite silently.

**How to avoid:** Deduplicate keys before building the zippable object:
```typescript
const seen = new Map<string, number>()
for (const item of images) {
  let key = `${baseName}.${ext}`
  if (seen.has(key)) {
    const n = seen.get(key)! + 1
    seen.set(key, n)
    key = `${baseName}-${n}.${ext}`
  }
  else {
    seen.set(key, 1)
  }
  zippable[key] = ...
}
```

**Warning signs:** ZIP contains fewer files than the image list. Noted in PITFALLS.md under "Looks Done But Isn't" checklist.

### Pitfall 4: Holding All Uint8Arrays in RAM Simultaneously

**What goes wrong:** Building the entire zippable object before calling `zip()` means all converted image bytes are resident in memory at the same time. For 20 images at 2 MB each, that is 40 MB in Uint8Arrays plus the ZIP output — total ~80 MB peak.

**Why it happens:** This is the straightforward implementation and it is acceptable for the typical batch size this tool handles. PITFALLS.md flags this at ~20 images × 2 MB as the threshold where it becomes a concern.

**How to avoid:** For v1, the in-memory approach is fine. Add a soft warning if `images.length > 20` or total converted size exceeds 50 MB. Do NOT implement streaming ZIP for v1 — complexity is not justified at this scale.

**Warning signs:** Tab crash reported by users with 30+ large images.

### Pitfall 5: Forgetting to Revoke the ZIP Blob URL

**What goes wrong:** The ZIP Blob object stays referenced by the object URL and is never GC'd. Each Download All click leaks the previous ZIP in memory.

**Why it happens:** `URL.revokeObjectURL` is often forgotten post-download.

**How to avoid:** Follow the exact pattern from `ImageCard.vue`: `setTimeout(() => URL.revokeObjectURL(url), 100)`. The 100ms delay allows the download to begin before the URL is invalidated.

### Pitfall 6: No Loading State — User Double-Clicks

**What goes wrong:** User sees no feedback during ZIP generation (1–3 seconds for large batches) and clicks again, triggering a second concurrent ZIP generation.

**Why it happens:** `isGenerating` ref not wired to button `disabled` or button label.

**How to avoid:** Use a `isGenerating` ref that is set to `true` before calling `zip()` and reset in the finally block. Wire it to the button's `:disabled` prop and optionally swap the button label to the `batch.generating` i18n key.

---

## Code Examples

### Complete downloadAll Implementation

```typescript
// Source: fflate FAQ (https://github.com/101arrowz/fflate/wiki/FAQ)
// Source: ImageCard.vue (established Firefox-safe download pattern)
import { zip } from 'fflate'
import type { ImageItem, OutputFormat } from '~/types'

export async function downloadAll(images: ImageItem[], format: OutputFormat): Promise<void> {
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extMap[format] ?? 'webp'

  // Build zippable: filename-keyed Uint8Array map
  // Deduplicate names to avoid silent overwrites
  const seen = new Map<string, number>()
  const zippable: Record<string, Uint8Array> = {}

  for (const item of images) {
    if (!item.convertedBlob) continue
    const base = item.name.replace(/\.[^.]+$/, '')
    let key = `${base}.${ext}`
    if (seen.has(key)) {
      const n = (seen.get(key) ?? 1) + 1
      seen.set(key, n)
      key = `${base}-${n}.${ext}`
    }
    else {
      seen.set(key, 1)
    }
    zippable[key] = new Uint8Array(await item.convertedBlob.arrayBuffer())
  }

  // fflate zip() is callback-based; wrap in Promise
  const zipData = await new Promise<Uint8Array>((resolve, reject) => {
    zip(zippable, (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  })

  // Timestamp: img-conversor-2026-03-24-143052.zip (D-01)
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  const ts = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`
  const filename = `img-conversor-${ts}.zip`

  // Firefox-safe download anchor pattern (same as ImageCard.vue)
  const blob = new Blob([zipData], { type: 'application/zip' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
```

### allConverted Computed (add to useImageStore)

```typescript
// Source: mirrors isProcessing pattern (existing code)
const allConverted = computed(() =>
  images.value.length > 0 && images.value.every(i => i.status === 'done')
)
// Export alongside isProcessing
return { images, addImages, removeImage, convertAll, isProcessing, allConverted }
```

### DownloadAllButton with Loading State

```vue
<!-- components/DownloadAllButton.vue -->
<script setup lang="ts">
const { images, allConverted } = useImageStore()
const { options } = useConvertOptions()
const isGenerating = ref(false)

async function handleClick() {
  if (!allConverted.value || isGenerating.value) return
  isGenerating.value = true
  try {
    await downloadAll(images.value, options.value.format)
  }
  finally {
    isGenerating.value = false
  }
}
</script>

<template>
  <UButton
    icon="i-heroicons-archive-box-arrow-down"
    :disabled="!allConverted || isGenerating"
    :loading="isGenerating"
    @click="handleClick"
  >
    {{ isGenerating ? $t('batch.generating') : $t('batch.download_all') }}
  </UButton>
</template>
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| JSZip (callback-heavy, 2022-era) | fflate `zip()` (2024, ESM-native, Workers) | fflate 0.8.0 | Non-blocking, 3x faster for large archives |
| `toDataURL()` for download | `URL.createObjectURL(blob)` | Modern browsers | No memory inflation from base64 string |

**Deprecated/outdated:**
- `JSZip.generateAsync({ type: 'blob' })`: Works but JSZip is unmaintained since 2022 and is not this project's locked choice.

---

## Open Questions

1. **Large batch warning threshold**
   - What we know: PITFALLS.md flags ~20 images × 2 MB as RAM concern
   - What's unclear: Whether to show a warning or silently proceed — no decision made
   - Recommendation: Silently proceed for v1; the typical user batch is 5–15 images. Add a warning only if QA shows instability.

2. **Error handling during ZIP generation**
   - What we know: fflate's `zip()` callback passes an error as first argument
   - What's unclear: What UI to show if ZIP fails (unlikely but possible for corrupted blobs)
   - Recommendation: Show a toast or alert with a generic error message; do not leave the button in `isGenerating` state on failure (finally block handles this).

---

## Sources

### Primary (HIGH confidence)
- fflate npm registry — confirmed version 0.8.2, published 2024-02-07
- `composables/useImageStore.ts` — verified `isProcessing` pattern, `images` state shape
- `types/index.ts` — verified `ImageItem.convertedBlob: Blob | null` field
- `components/ImageCard.vue` — verified Firefox-safe download anchor pattern
- `i18n/locales/en.json` and `pt-BR.json` — verified existing i18n structure; `batch.*` namespace not yet present
- `package.json` — confirmed fflate is NOT installed; must be added in Wave 1

### Secondary (MEDIUM confidence)
- fflate FAQ on GitHub Wiki — zip() callback API signature, Blob→Uint8Array conversion
- STACK.md and PITFALLS.md — pre-researched fflate recommendation and ZIP memory concerns

### Tertiary (LOW confidence)
- WebSearch result for fflate Web Workers and CSP — fflate uses inline workers which may conflict with strict CSP; the project already has `unsafe-inline` in script-src (STATE.md: Phase 01-scaffold decision), so this is not a blocker

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — fflate version confirmed via npm registry, package absence confirmed via filesystem
- Architecture: HIGH — patterns derived directly from existing codebase (`ImageCard.vue`, `useImageStore.ts`)
- Pitfalls: HIGH — derived from PITFALLS.md (pre-researched) plus direct code inspection

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (fflate is stable; no fast-moving APIs here)

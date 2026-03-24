# Architecture Research

**Domain:** Client-side image processing tool (browser-only, no backend)
**Researched:** 2026-03-24
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        UI Layer (Nuxt 3 Pages + Components)      │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  DropZone    │  │  ImageCard   │  │  ControlPanel        │   │
│  │  Component   │  │  Component   │  │  (format/quality/    │   │
│  │              │  │  (per image) │  │   resize controls)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
├─────────┴─────────────────┴──────────────────────┴───────────────┤
│                    Composables Layer (Auto-imported)              │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ useImageStore│  │ useProcessor │  │  useDownload         │   │
│  │ (state)      │  │ (conversion) │  │  (single + zip)      │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
├─────────┴─────────────────┴──────────────────────┴───────────────┤
│                    Browser API Layer                              │
├──────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  File API    │  │  Canvas API  │  │  JSZip               │   │
│  │  (input)     │  │  (convert)   │  │  (batch download)    │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| DropZone | Accept file input via drag-drop or click; validate file types | Vue component with dragover/drop events + `<input type="file" multiple>` |
| ImageCard | Display one image: original preview, filename, before/after size, download button | Presentational component, receives ImageItem as prop |
| ControlPanel | Expose format selector, quality slider, resize mode toggle, resize inputs | Bound to shared composable state; no local state |
| useImageStore | Own the list of ImageItem objects; track processing status per item | `useState` or `ref` list; single source of truth |
| useProcessor | Convert one File to a Blob using Canvas API; apply format, quality, dimensions | Pure async function wrapping Canvas draw + `toBlob` / `convertToBlob` |
| useDownload | Trigger single-file download; assemble and trigger ZIP download via JSZip | Uses `URL.createObjectURL` + anchor click pattern |

## Recommended Project Structure

```
app/
├── components/
│   ├── DropZone.vue          # Drag-drop + file picker input
│   ├── ImageCard.vue         # Per-image card (preview, sizes, download)
│   └── ControlPanel.vue      # Global conversion settings
├── composables/
│   ├── useImageStore.ts      # Central state: list of images + processing status
│   ├── useProcessor.ts       # Canvas-based conversion logic
│   └── useDownload.ts        # Single download + JSZip batch download
├── types/
│   └── image.ts              # ImageItem interface, ProcessingStatus enum
├── pages/
│   └── index.vue             # Assembles layout; no business logic
└── app.vue                   # Root layout
nuxt.config.ts
```

### Structure Rationale

- **composables/**: All business logic lives here, not in components. Components stay presentational and thin. Nuxt auto-imports everything at the top level, so no barrel files needed.
- **types/**: A single `ImageItem` interface is the shared contract between composables and components. Defining it once prevents drift.
- **pages/index.vue**: Acts only as a layout orchestrator. No conversion logic should live in pages.
- **components/**: Three components map 1-to-1 with the three main UI regions. Avoids over-componentization for a tool this size.

## Architectural Patterns

### Pattern 1: Centralized Image List State

**What:** A single `useImageStore` composable owns the array of `ImageItem` objects. All components read from and write to this one source.
**When to use:** Any time multiple components need to display or modify the same list.
**Trade-offs:** Simple to reason about; no event bus or prop drilling needed. Risk of the composable growing too large — split processing out of it (see `useProcessor`).

**Example:**
```typescript
// types/image.ts
export interface ImageItem {
  id: string
  file: File
  originalSize: number
  previewUrl: string   // URL.createObjectURL(file)
  outputBlob: Blob | null
  outputSize: number | null
  status: 'pending' | 'processing' | 'done' | 'error'
}

// composables/useImageStore.ts
export const useImageStore = () => {
  const images = useState<ImageItem[]>('images', () => [])

  const addImages = (files: File[]) => {
    const newItems: ImageItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      originalSize: file.size,
      previewUrl: URL.createObjectURL(file),
      outputBlob: null,
      outputSize: null,
      status: 'pending',
    }))
    images.value.push(...newItems)
  }

  const removeImage = (id: string) => {
    images.value = images.value.filter(img => img.id !== id)
  }

  return { images, addImages, removeImage }
}
```

### Pattern 2: Pure Async Processor Composable

**What:** `useProcessor` is a stateless function that takes a `File` and conversion options, and returns a `Blob`. It does not touch state.
**When to use:** Keeps conversion logic independently testable. The store calls it and owns the before/after state.
**Trade-offs:** Clean separation, easy to unit test. Slightly more indirection — the store must coordinate the call.

**Example:**
```typescript
// composables/useProcessor.ts
export interface ConvertOptions {
  format: 'image/jpeg' | 'image/png' | 'image/webp'
  quality: number      // 0–1
  resize: { mode: 'percent'; value: number }
           | { mode: 'exact'; width: number; height: number }
           | null
}

export const useProcessor = () => {
  const convert = async (file: File, opts: ConvertOptions): Promise<Blob> => {
    const bitmap = await createImageBitmap(file)

    let targetW = bitmap.width
    let targetH = bitmap.height

    if (opts.resize?.mode === 'percent') {
      targetW = Math.round(bitmap.width * opts.resize.value)
      targetH = Math.round(bitmap.height * opts.resize.value)
    } else if (opts.resize?.mode === 'exact') {
      targetW = opts.resize.width
      targetH = opts.resize.height
    }

    const canvas = new OffscreenCanvas(targetW, targetH)
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, targetW, targetH)
    bitmap.close()

    return canvas.convertToBlob({ type: opts.format, quality: opts.quality })
  }

  return { convert }
}
```

### Pattern 3: Object URL Lifecycle Management

**What:** Use `URL.createObjectURL()` for previews and downloads, and revoke them explicitly when no longer needed.
**When to use:** Every time a File or Blob needs a URL for `<img src>` or anchor download.
**Trade-offs:** Efficient (no base64 encoding). Requires discipline to call `URL.revokeObjectURL()` on removal, or memory leaks accumulate across a long session.

**Example:**
```typescript
// In useImageStore — revoke preview URL on removal
const removeImage = (id: string) => {
  const img = images.value.find(i => i.id === id)
  if (img) URL.revokeObjectURL(img.previewUrl)
  images.value = images.value.filter(i => i.id !== id)
}
```

## Data Flow

### File Ingestion Flow

```
User drops files / clicks input
    ↓
DropZone.vue → emits File[]
    ↓
useImageStore.addImages(files)
    → creates ImageItem per file (status: 'pending')
    → stores preview URL (URL.createObjectURL)
    ↓
ImageCard.vue renders each item reactively
```

### Conversion Flow

```
User clicks "Convert All" (or per-item trigger)
    ↓
useImageStore reads current ConvertOptions from useProcessor scope
    ↓
per ImageItem:
  status → 'processing'
  useProcessor.convert(file, opts)
    → createImageBitmap(file)         [decodes image]
    → OffscreenCanvas.drawImage()     [resize]
    → OffscreenCanvas.convertToBlob() [encode to target format + quality]
  status → 'done'
  outputBlob + outputSize stored on ImageItem
    ↓
ImageCard.vue shows before/after sizes reactively
```

### Download Flow

```
Single download:
  useDownload.downloadOne(item)
    → URL.createObjectURL(item.outputBlob)
    → programmatic <a> click
    → URL.revokeObjectURL() after click

Batch download:
  useDownload.downloadAll(items)
    → JSZip instance
    → zip.file(name, blob) for each item
    → zip.generateAsync({ type: 'blob' })
    → programmatic <a> click on ZIP blob
```

### State Management Model

```
ConvertOptions (format, quality, resize settings)
    → owned by ControlPanel via composable ref
    → read by useImageStore at conversion time (passed as argument)

ImageItem[]
    → owned by useImageStore (useState — SSR-safe)
    → read by ImageCard (per-item) and useDownload (all items)
    → written only by useImageStore methods
```

## Scaling Considerations

This is a fully client-side tool — "scaling" means browser performance, not server load.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1–5 images | Current architecture — synchronous processing per item is fine |
| 6–20 images | Add a processing queue with concurrency limit (2–3 parallel conversions) to avoid memory spikes |
| 20+ images | Consider Web Worker for OffscreenCanvas processing to keep UI responsive; add progress indication per item |

### Scaling Priorities

1. **First bottleneck — memory:** Large images held as `File`, `ImageBitmap`, `OffscreenCanvas`, and `Blob` simultaneously per item. Revoke/close each after use. Close `ImageBitmap` with `.close()` immediately after `drawImage`.
2. **Second bottleneck — UI jank:** Multiple sequential `convertToBlob` calls on large images block the main thread. A microtask queue or Web Worker offload addresses this if the batch is large.

## Anti-Patterns

### Anti-Pattern 1: Processing Logic Inside Components

**What people do:** Put `canvas.drawImage`, `toBlob`, and quality logic directly in the component's `<script setup>`.
**Why it's wrong:** Untestable, impossible to reuse, mixes rendering concerns with processing concerns. The component becomes a 300-line blob.
**Do this instead:** Keep components to event emission and rendering. All Canvas work belongs in `useProcessor.ts`.

### Anti-Pattern 2: Using `toDataURL` Instead of `toBlob` / `convertToBlob`

**What people do:** `canvas.toDataURL('image/webp', 0.8)` is the first Google result — it's familiar.
**Why it's wrong:** `toDataURL` produces a base64 string which is ~33% larger than binary, blocks the main thread synchronously, and must be re-converted to a `Blob` for zip/download anyway. `toBlob` and `OffscreenCanvas.convertToBlob` return Promises with binary Blob directly.
**Do this instead:** Use `OffscreenCanvas.convertToBlob({ type, quality })` — async, returns a Blob, works in Workers (MDN verified, widely available since March 2023).

### Anti-Pattern 3: Not Revoking Object URLs

**What people do:** Create `URL.createObjectURL()` for previews and downloads but never call `revokeObjectURL`.
**Why it's wrong:** Each object URL holds a reference to the underlying Blob/File in memory. In a tool that processes many images per session, this accumulates into significant memory pressure.
**Do this instead:** Revoke preview URLs when an image is removed from the list. Revoke download URLs immediately after the anchor click is triggered (use `setTimeout(() => URL.revokeObjectURL(url), 100)`).

### Anti-Pattern 4: Storing Full ImageData or Base64 in Reactive State

**What people do:** Encode the output as a base64 string and store it in the Vue reactive state for display.
**Why it's wrong:** A 2MB image becomes a ~2.7MB string in memory, held in Vue's reactive system, serialized on every state change, and incompatible with SSR hydration.
**Do this instead:** Store only the `Blob` reference and its `size` in state. Generate a temporary object URL only when the `<img>` or download link needs it.

## Integration Points

### External Services

None. The constraint is zero server-side infrastructure. All processing is in-browser.

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Vercel (deploy) | SSG via `nuxt generate` — push to Git, Vercel auto-deploys | No serverless functions needed; static output only |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| DropZone → useImageStore | Direct composable call (`addImages`) | No event bus; composable is auto-imported |
| ControlPanel → conversion trigger | Reads shared `ConvertOptions` ref; passes to useProcessor | Options are not stored on ImageItem — they are passed at call time |
| useImageStore → useProcessor | Calls `convert(file, opts)` and writes result back to `ImageItem` | Processor has no knowledge of store; clean dependency direction |
| useImageStore → useDownload | useDownload reads `images` from useImageStore | Download composable is a consumer, not a writer |

## Build Order Implications

Dependencies flow in this order. Build from bottom up:

1. **Types** (`ImageItem`, `ConvertOptions`) — no dependencies; define first
2. **useProcessor** — depends only on Browser APIs; independently testable
3. **useImageStore** — depends on types and useProcessor
4. **useDownload** — depends on useImageStore (reads images list)
5. **DropZone** — depends on useImageStore (`addImages`)
6. **ImageCard** — depends on types (receives ImageItem prop) and useDownload
7. **ControlPanel** — depends on shared options ref (part of useImageStore or a dedicated `useConvertOptions`)
8. **pages/index.vue** — assembles all components; depends on everything above

## Sources

- [MDN: OffscreenCanvas.convertToBlob()](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob) — HIGH confidence
- [MDN: OffscreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) — widely available since March 2023
- [Chrome Developers: OffscreenCanvas with Web Workers](https://developer.chrome.com/blog/offscreen-canvas) — HIGH confidence
- [Nuxt 3: State Management docs](https://nuxt.com/docs/getting-started/state-management) — HIGH confidence
- [Nuxt 3: Composables directory](https://nuxt.com/docs/guide/directory-structure/composables) — HIGH confidence
- [DEV: Resize Images in JS FAST (Web Worker + OffscreenCanvas)](https://dev.to/vipert/resize-images-in-js-fast-using-browser-multi-threading-3ocm) — MEDIUM confidence
- [JSZip documentation](https://stuk.github.io/jszip/) — MEDIUM confidence

---
*Architecture research for: client-side image conversion tool (Nuxt 3 + Canvas API + SSG)*
*Researched: 2026-03-24*

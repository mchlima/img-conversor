# Phase 3: UI and State - Research

**Researched:** 2026-03-24
**Domain:** Vue 3 / Nuxt UI v4 component assembly, reactive state management, drag-and-drop file input, URL object lifecycle
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Drop Zone**
- D-01: Layout da drop zone a critério do Claude (tela inteira inicial que encolhe, ou área fixa — decisão técnica)
- D-02: Novo upload SUBSTITUI a lista existente (não acumula)
- D-03: Suporta drag-and-drop e clique para selecionar

**Image Cards**
- D-04: Cada card exibe: preview thumbnail, nome do arquivo, tamanho antes/depois (com economia em %), indicador de status (idle/processando/done/erro), botão de download
- D-05: Cards em lista vertical (um por linha, como tabela) — não grid
- D-06: Botão X por imagem para remover da lista antes de converter

**Painel de Controles**
- D-07: Posição do painel a critério do Claude (acima da lista ou sidebar lateral — baseado no layout full-width)
- D-08: Conversão disparada por botão "Converter" explícito (não automático)
- D-09: Controles globais: seletor de formato (JPEG/PNG/WebP), slider de qualidade, controles de resize (proporcional % ou exato px, mutuamente exclusivos)
- D-10: Color picker para cor de fundo do JPEG aparece condicionalmente (quando PNG→JPEG detectado, herdado Phase 2 D-03)

**Trust Signal**
- D-11: Mensagem de privacidade exibida em DOIS lugares: na drop zone (visível antes do primeiro uso) E no rodapé discreto da página

### Claude's Discretion

- Componentes Nuxt UI específicos para cada controle (UInput, URange, USelect, etc.)
- Implementação do useImageStore (gerenciamento de estado das imagens)
- Estilo dos cards e animações de status
- Layout responsivo específico
- Como exibir o feedback de economia de tamanho (ex: "-67%" em verde)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| INPT-01 | Usuário pode selecionar múltiplas imagens via clique no file picker | `<input type="file" multiple accept="image/*">` triggered by UButton click; hidden input pattern |
| INPT-02 | Usuário pode arrastar e soltar múltiplas imagens na área de drop | Native dragover/dragenter/dragleave/drop events; `event.dataTransfer.files` → `Array.from()` |
| INPT-03 | Usuário vê preview da imagem original para identificação | `URL.createObjectURL(file)` stored in `ImageItem.previewUrl`; revoke on removal |
| INPT-04 | Usuário vê o tamanho do arquivo original ao lado de cada imagem | `file.size` available immediately at ingestion; format via `formatBytes()` helper |
| OUTP-01 | Usuário vê o tamanho do arquivo convertido ao lado de cada imagem | `outputBlob.size` stored in `ImageItem.convertedSize` after conversion |
| OUTP-02 | Usuário vê comparação de tamanho antes/depois (economia em bytes e %) | Computed: `savings = ((originalSize - convertedSize) / originalSize * 100).toFixed(1)` |
| OUTP-03 | Usuário pode baixar cada imagem convertida individualmente | `URL.createObjectURL(blob)` + programmatic anchor click; revoke after 100ms |
| OUTP-05 | Cada imagem exibe status de processamento (idle / processando / concluído / erro) | `ProcessingStatus` type already in `types/index.ts`; render via UBadge with color mapping |
</phase_requirements>

---

## Summary

Phase 3 assembles the complete application UI by wiring three new components (DropZone, ImageCard, ControlPanel) to the existing composables (useProcessor, useConvertOptions) and a new `useImageStore` composable that owns the central image list state. The phase is primarily a wiring and presentation challenge — almost all the hard logic was built in Phases 1 and 2.

The key architectural decision this research validates: **use `useState` (not `ref`) for the image list** so it is SSR-safe (even though ssr:false, useState integrates cleanly with Nuxt's hydration model and DevTools). All browser APIs (`URL.createObjectURL`, `File`, drag events) must live inside `<ClientOnly>` or `onMounted`, but since `ssr: false` is set globally, components can use them directly without wrappers.

The Nuxt UI v4 library is already installed (`@nuxt/ui: ^4.6.0`). Component names changed from v3: `URange` is now `USlider`, `USelect` takes an `items` prop (no `USelectMenu` needed for simple dropdowns). `UInputNumber` handles exact-px dimension inputs cleanly with `min`/`max`/`step` props. Status indicators should use `UBadge` with color-coded variants.

**Primary recommendation:** Build in this order — `useImageStore` → `DropZone` → `ImageCard` → `ControlPanel` → wire `pages/index.vue`. Implement `hasAlpha` check inside `useImageStore.addImages()` so color picker visibility is known at ingestion time.

---

## Standard Stack

### Core (already installed — no new installs needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Nuxt UI | 4.6.0 | USlider, USelect, UInputNumber, UButton, UBadge, UCard, UIcon | Already installed; auto-imports all components |
| Vue 3 `useState` | bundled | SSR-safe reactive state for image list | Nuxt-idiomatic; key 'images' avoids state duplication |
| Tailwind CSS 4 | bundled with Nuxt UI v4 | Layout and utility styling | Already configured via `~/tailwind.css` |
| `URL.createObjectURL` | browser native | Preview URLs and download triggers | No base64 encoding; binary efficient |

### New (must install)

No new packages required. `fflate` is already planned for Phase 4 (ZIP batch download). This phase does not include ZIP.

### Nuxt UI v4 Component Name Map

| Purpose | v3 Name (outdated) | v4 Name (correct) |
|---------|-------------------|-------------------|
| Slider/range input | `URange` | `USlider` |
| Dropdown select | `USelect` + `USelectMenu` | `USelect` with `items` prop |
| Number input | `UInput type="number"` | `UInputNumber` |
| Status pill | `UBadge` | `UBadge` (unchanged) |
| Button | `UButton` | `UButton` (unchanged) |
| Card container | `UCard` | `UCard` (unchanged) |

> Confidence: HIGH — verified against https://ui.nuxt.com/docs/components on 2026-03-24

---

## Architecture Patterns

### Recommended Component Structure

```
components/
├── DropZone.vue          # File input (drag-drop + click); emits File[] to useImageStore
├── ImageCard.vue         # Per-image row: preview, name, sizes, status badge, download button, X button
└── ControlPanel.vue      # Global settings: format, quality, resize mode, bg color, Convert button
composables/
├── useImageStore.ts      # NEW: central state — ImageItem[], addImages(), removeImage(), convertAll()
├── useProcessor.ts       # EXISTING: stateless convert(file, opts) → Promise<Blob>
└── useConvertOptions.ts  # EXISTING: reactive ConvertOptions with all setters
pages/
└── index.vue             # Layout orchestrator: DropZone + ControlPanel + list of ImageCards + footer
```

### Pattern 1: useImageStore — Central Reactive State

**What:** Single composable owns `ImageItem[]` via `useState`. Provides `addImages`, `removeImage`, `convertAll`.
**When to use:** Any time multiple components need the same image list.

```typescript
// composables/useImageStore.ts
import type { ImageItem } from '~/types'
import { useProcessor } from '~/composables/useProcessor'
import { useConvertOptions } from '~/composables/useConvertOptions'
import { hasAlpha } from '~/utils/hasAlpha'

export function useImageStore() {
  const images = useState<ImageItem[]>('images', () => [])
  const { convert } = useProcessor()
  const { options } = useConvertOptions()

  // D-02: new upload REPLACES the existing list
  async function addImages(files: File[]) {
    // Revoke existing preview URLs before replacing
    for (const img of images.value) {
      if (img.previewUrl) URL.revokeObjectURL(img.previewUrl)
    }
    const items: ImageItem[] = files.map(file => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      originalSize: file.size,
      convertedSize: null,
      convertedBlob: null,
      status: 'idle',
      error: null,
      previewUrl: URL.createObjectURL(file),
      hasAlpha: false,  // populated below
    }))
    images.value = items
    // Run hasAlpha checks in background (for conditional color picker visibility)
    for (const item of images.value) {
      if (item.file.type === 'image/png') {
        hasAlpha(item.file).then(alpha => { item.hasAlpha = alpha })
      }
    }
  }

  function removeImage(id: string) {
    const img = images.value.find(i => i.id === id)
    if (img?.previewUrl) URL.revokeObjectURL(img.previewUrl)
    images.value = images.value.filter(i => i.id !== id)
  }

  // D-08: explicit Convert button triggers this
  async function convertAll() {
    for (const item of images.value) {
      if (item.status === 'done') continue  // skip already converted
      item.status = 'processing'
      try {
        const blob = await convert(item.file, options.value)
        item.convertedBlob = blob
        item.convertedSize = blob.size
        item.status = 'done'
      } catch (err) {
        item.status = 'error'
        item.error = err instanceof Error ? err.message : String(err)
      }
    }
  }

  return { images, addImages, removeImage, convertAll }
}
```

**Key detail:** `ImageItem` in `types/index.ts` does not yet have `hasAlpha`. Add `hasAlpha: boolean` to the interface during implementation.

### Pattern 2: DropZone — Native Drag Events

**What:** A `<div>` with drag event handlers + hidden `<input type="file" multiple>`. No external library.
**When to use:** This is the only correct approach for `ssr: false` + Nuxt 3 without third-party dropzone libs.

```vue
<!-- components/DropZone.vue -->
<script setup lang="ts">
const { addImages } = useImageStore()
const isDragOver = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')

function onDragOver(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = true
}
function onDragLeave() {
  isDragOver.value = false
}
function onDrop(e: DragEvent) {
  e.preventDefault()
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (files.length) addImages(files)
}
function onFileChange(e: Event) {
  const files = Array.from((e.target as HTMLInputElement).files ?? [])
  if (files.length) addImages(files)
}
function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    :class="['border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer',
      isDragOver ? 'border-primary bg-primary/5' : 'border-neutral-300']"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    @click="openPicker"
  >
    <!-- Trust signal D-11: shown here before first use -->
    <p class="text-sm text-neutral-500 mt-2">
      {{ $t('dropzone.privacy') }}
    </p>
    <input
      ref="fileInput"
      type="file"
      multiple
      accept="image/jpeg,image/png,image/webp"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>
```

**Critical:** `e.preventDefault()` MUST be called on both `dragover` AND `dragenter` events (or `dragover` with `.prevent` modifier). Without it the browser treats the drop as a navigation and opens the image file.

### Pattern 3: ImageCard — Row Layout

**What:** Displays one `ImageItem` as a horizontal row. Receives `ImageItem` as a prop.

```vue
<!-- components/ImageCard.vue -->
<script setup lang="ts">
import type { ImageItem } from '~/types'

const props = defineProps<{ item: ImageItem }>()
const { removeImage } = useImageStore()

const statusColor = computed(() => ({
  idle: 'neutral',
  processing: 'warning',
  done: 'success',
  error: 'error',
} as const)[props.item.status])

const savings = computed(() => {
  if (!props.item.convertedSize || !props.item.originalSize) return null
  const pct = ((props.item.originalSize - props.item.convertedSize) / props.item.originalSize * 100)
  return pct.toFixed(1)
})

function downloadImage() {
  if (!props.item.convertedBlob) return
  const url = URL.createObjectURL(props.item.convertedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = props.item.name.replace(/\.[^.]+$/, '') + '.' + getExt(props.item)
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
</script>
```

**Status badge mapping:**

| status | UBadge color | Label |
|--------|-------------|-------|
| `idle` | `neutral` | `status.idle` |
| `processing` | `warning` | `status.processing` |
| `done` | `success` | `status.done` |
| `error` | `error` | `status.error` |

### Pattern 4: ControlPanel — Reads from useConvertOptions

**What:** Bound directly to `useConvertOptions()` state. No local state in the component.

```vue
<!-- components/ControlPanel.vue — key bindings -->
<script setup lang="ts">
const { options, setFormat, setQuality, setResizeMode, setResizePercent, setResizeDimensions, setBackgroundColor } = useConvertOptions()
const { images, convertAll } = useImageStore()

// Conditional color picker: show when format is JPEG AND any loaded image has alpha
const showColorPicker = computed(() =>
  options.value.format === 'image/jpeg' &&
  images.value.some(img => img.hasAlpha)
)
</script>
```

**Nuxt UI v4 components to use:**

| Control | Component | Props |
|---------|-----------|-------|
| Format selector | `USelect` | `:items="formatItems"` with label/value objects |
| Quality slider | `USlider` | `:min="1" :max="100" :step="1"` |
| Resize % slider | `USlider` | `:min="1" :max="100" :step="1"` |
| Resize width/height | `UInputNumber` | `:min="1" :max="16384"` |
| Background color | native `<input type="color">` | bind to `options.backgroundColor` via `setBackgroundColor` |
| Convert button | `UButton` | `color="primary" @click="convertAll"` |

### Pattern 5: Download Without Polluting Reactive State

**What:** Single-file download triggered from `ImageCard`. Blob URL is ephemeral — created and revoked in one click handler. Never stored in reactive state.

```typescript
function downloadImage(item: ImageItem) {
  if (!item.convertedBlob) return
  const ext = item.file.type === 'image/jpeg' ? 'jpg'
    : item.file.type === 'image/png' ? 'png' : 'webp'
  const baseName = item.name.replace(/\.[^.]+$/, '')
  const url = URL.createObjectURL(item.convertedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
```

**Note:** `document.body.appendChild(a)` before `click()` is required in Firefox; Chrome works without it.

### Pattern 6: i18n Key Structure

All user-facing text must use `$t()`. The current `en.json` has only `app.name` and `app.tagline`. New keys needed:

```json
{
  "app": { "name": "...", "tagline": "..." },
  "dropzone": {
    "title": "Drop images here or click to browse",
    "subtitle": "Supports JPEG, PNG, and WebP",
    "privacy": "Images never leave your browser. All processing happens locally."
  },
  "controls": {
    "format": "Output Format",
    "quality": "Quality",
    "resize": "Resize",
    "resize_none": "No resize",
    "resize_proportional": "Proportional (%)",
    "resize_exact": "Exact (px)",
    "bg_color": "Background Color",
    "convert": "Convert"
  },
  "card": {
    "before": "Before",
    "after": "After",
    "savings": "saved",
    "download": "Download",
    "remove": "Remove"
  },
  "status": {
    "idle": "Idle",
    "processing": "Converting...",
    "done": "Done",
    "error": "Error"
  },
  "footer": {
    "privacy": "All images are processed locally. Nothing is uploaded to any server."
  }
}
```

Both `en.json` and `pt-BR.json` must be updated.

### Recommended Layout for pages/index.vue

**Decision: two-column layout (sidebar + content) on desktop, single column on mobile**

```
┌────────────────────────────────────────────────────────┐
│ header: app name                                        │
├─────────────────────┬──────────────────────────────────┤
│ ControlPanel        │ DropZone (collapses after upload) │
│ (sidebar, ~320px)   ├──────────────────────────────────┤
│                     │ ImageCard (row 1)                 │
│                     │ ImageCard (row 2)                 │
│                     │ ...                               │
├─────────────────────┴──────────────────────────────────┤
│ footer: privacy trust signal (D-11)                     │
└────────────────────────────────────────────────────────┘
```

On mobile: ControlPanel stacks above the image list. DropZone always visible at top.

The DropZone should visually shrink (reduce height) after images are loaded, but remain accessible for replacing the list (D-02). A `computed` based on `images.value.length > 0` controls the compact/expanded state.

### Anti-Patterns to Avoid

- **Storing output Blob as base64 in state:** The `ImageItem.convertedBlob` stores the `Blob` object — not a data URL. Only create a URL at download/display time.
- **Not revoking preview URLs on list replacement:** D-02 requires replacement semantics. Old `previewUrl` values must be revoked in `addImages()` before overwriting `images.value`.
- **Calling `hasAlpha` on non-PNG files:** `hasAlpha()` must only be called when `file.type === 'image/png'`. The utility itself is safe but wastes cycles on JPEG/WebP.
- **Mutating `ImageItem` via a local copy:** `images.value` is reactive via `useState`. Mutate items directly in the array (e.g., `item.status = 'processing'`). Do not spread-copy an item to mutate it.
- **Using `URange` instead of `USlider`:** Nuxt UI v4 renamed the component. `URange` does not exist.
- **Calling `convertAll()` twice (double-click):** Add a guard: `if (item.status === 'processing') return`. Also disable the Convert button while any item is processing.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Reactive image list with SSR safety | Custom `ref([])` in module scope | `useState('images', () => [])` | Module-scope refs don't reset between Nuxt navigations; useState is keyed and DevTools-visible |
| Status color mapping | Switch/if chain in template | Computed object map → UBadge `color` prop | Cleaner, type-safe, avoids template logic |
| Download trigger | Window.location or fetch | Object URL + anchor click pattern | Only pattern that works for Blob downloads cross-browser |
| Number input with min/max | `<input type="number">` with manual validation | `UInputNumber` with `:min` `:max` props | Built-in increment/decrement, Nuxt UI styling, validation built-in |
| Quality/resize slider | Raw `<input type="range">` | `USlider` | Theme-consistent, tooltip support, accessible |
| Image preview URL | Canvas `toDataURL` for preview | `URL.createObjectURL(file)` | No decode/re-encode cost; creates URL directly from File object |

**Key insight:** The entire download flow (create URL → anchor → click → revoke) is 6 lines of vanilla JS. Any abstraction library adds more overhead than it saves here.

---

## Common Pitfalls

### Pitfall 1: dragover Without preventDefault Causes Navigation
**What goes wrong:** User drops a file and the browser navigates to the image URL instead of running the drop handler.
**Why it happens:** The browser's default action for a drop is to open the dropped content. Only `e.preventDefault()` in `dragover` suppresses it.
**How to avoid:** Always call `e.preventDefault()` in BOTH `dragover` and `drop` handlers. Vue's `.prevent` modifier works: `@dragover.prevent`.
**Warning signs:** Browser URL bar changes when dropping.

### Pitfall 2: Preview URLs Accumulate as Memory Leaks
**What goes wrong:** After 10–20 image loads, the tab consumes unexpectedly high memory.
**Why it happens:** Each `URL.createObjectURL()` holds a reference to the File in memory until explicitly revoked. D-02 (list replacement) means prior preview URLs are orphaned.
**How to avoid:** In `addImages()`, iterate `images.value` and call `URL.revokeObjectURL(img.previewUrl)` on each existing item before replacing the array. Also revoke in `removeImage()`.
**Warning signs:** Chrome DevTools memory tab shows growing "Object URLs" count.

### Pitfall 3: Mutating ImageItem Fields Doesn't Trigger Reactivity
**What goes wrong:** `item.status = 'done'` inside a loop doesn't update the UI.
**Why it happens:** Vue 3 reactive tracking requires mutations to go through the proxy. If `item` is a plain copy (spread), it breaks reactivity.
**How to avoid:** Always mutate items via the array reference: `images.value[index].status = 'done'` OR use `images.value.find(i => i.id === id).status = 'done'`. Never do `const item = { ...images.value[i] }; item.status = 'done'`.
**Warning signs:** Status badge doesn't update in real-time during conversion.

### Pitfall 4: Conditional Color Picker Flickers on First Load
**What goes wrong:** Color picker appears briefly when PNG is selected, then hides, or vice versa.
**Why it happens:** `hasAlpha()` is async. If `showColorPicker` is computed before the check resolves, it starts false and flips.
**How to avoid:** Initialize `ImageItem.hasAlpha = false` and only set it after `hasAlpha()` resolves. The color picker appearing after a brief delay (while PNG alpha is detected) is acceptable UX — better than flickering or blocking. Document this as intentional.
**Warning signs:** Color picker visibility changes 100–200ms after image loads.

### Pitfall 5: File extension for download filename doesn't match output format
**What goes wrong:** User downloads a WebP-converted file with `.jpg` extension (original extension preserved).
**Why it happens:** Using `item.name` as the download filename without replacing the extension.
**How to avoid:** Strip the original extension and append the correct one based on `options.value.format`: `image/jpeg → .jpg`, `image/png → .png`, `image/webp → .webp`.
**Warning signs:** Downloaded file opens correctly but has wrong extension displayed.

### Pitfall 6: Convert button triggers on already-done items on re-click
**What goes wrong:** Clicking "Convert" a second time re-processes all images even if already done.
**Why it happens:** `convertAll()` iterates all items without status guard.
**How to avoid:** Skip items with `status === 'done'` in `convertAll()`. Add a disable condition: button is disabled if `images.value.length === 0` or if all items are `done` or `processing`.
**Warning signs:** Conversion runs again unnecessarily, overwriting already-correct output.

---

## Code Examples

### formatBytes helper (utility, not in codebase yet)

```typescript
// utils/formatBytes.ts
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}
```

### Savings percentage display

```typescript
// In ImageCard computed
const savings = computed(() => {
  const { originalSize, convertedSize } = props.item
  if (!convertedSize) return null
  const pct = ((originalSize - convertedSize) / originalSize * 100)
  // Negative savings (file grew) should still be shown
  return { pct: pct.toFixed(1), grew: pct < 0 }
})
// Template: show "-67%" in green (saved) or "+12%" in red (grew)
```

### USelect format items

```typescript
const formatItems = [
  { label: 'WebP (recommended)', value: 'image/webp' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
]
// Usage:
// <USelect :items="formatItems" :model-value="options.format" @update:model-value="setFormat" />
```

### USlider quality binding

```vue
<USlider
  :model-value="options.quality"
  :min="1"
  :max="100"
  :step="1"
  :tooltip="true"
  @update:model-value="setQuality"
/>
```

### Resize mode toggle (mutual exclusion already handled by useConvertOptions)

```vue
<!-- Three-option toggle: none | proportional | exact -->
<div class="flex gap-2">
  <UButton
    v-for="mode in ['none', 'proportional', 'exact']"
    :key="mode"
    :variant="options.resizeMode === mode ? 'solid' : 'outline'"
    size="sm"
    @click="setResizeMode(mode)"
  >
    {{ $t(`controls.resize_${mode}`) }}
  </UButton>
</div>
```

### Status badge rendering

```vue
<UBadge :color="statusColor" :label="$t(`status.${item.status}`)" />
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `URange` component name | `USlider` | Nuxt UI v4 (2025) | Breaks if v3 docs are referenced |
| `toDataURL` for preview/download | `URL.createObjectURL` | Best practice established ~2019 | 33% less memory, async-friendly |
| Storing base64 in reactive state | Storing `Blob` + ephemeral URL | Vue 3 era | Prevents reactive system bloat |
| JSZip for browser ZIP | fflate | ~2021 (fflate release) | 3x faster, actively maintained; not needed until Phase 4 |

---

## Open Questions

1. **hasAlpha field on ImageItem type**
   - What we know: `types/index.ts` defines `ImageItem` without `hasAlpha`
   - What's unclear: Whether to add `hasAlpha` to the shared type or keep it as a runtime annotation
   - Recommendation: Add `hasAlpha: boolean` to `ImageItem` in `types/index.ts` as a first-class field, initialized to `false`

2. **DropZone height behavior after upload**
   - What we know: D-01 leaves layout to Claude's discretion
   - What's unclear: Whether compact (header-strip) or just smaller area is better UX
   - Recommendation: Render two modes via conditional class: full-height with big icon when `images.length === 0`; compact strip (e.g., 60px) with "Drop more to replace" label when images exist

3. **Control panel placement on mobile**
   - What we know: D-07 leaves position to Claude's discretion; full-width layout
   - What's unclear: Sidebar vs. top panel for medium/small screens
   - Recommendation: Sidebar at `lg:` breakpoint (1024px+); stacked above image list on mobile; use Tailwind `lg:grid-cols-[320px_1fr]` grid layout

---

## Sources

### Primary (HIGH confidence)
- https://ui.nuxt.com/docs/components/slider — USlider API, min/max/step/tooltip props
- https://ui.nuxt.com/docs/components/select — USelect items prop, value-key, v-model
- https://ui.nuxt.com/docs/components/input-number — UInputNumber min/max/step
- https://ui.nuxt.com/docs/components/button — UButton color, variant, loading props
- https://ui.nuxt.com/docs/components/badge — UBadge color/variant for status indicators
- `composables/useProcessor.ts` — actual convert() signature and ConvertOptions usage
- `composables/useConvertOptions.ts` — actual state shape and setters
- `types/index.ts` — ImageItem, ProcessingStatus, ConvertOptions types
- `utils/hasAlpha.ts` — hasAlpha(file) signature and PNG-only constraint

### Secondary (MEDIUM confidence)
- https://www.smashingmagazine.com/2022/03/drag-drop-file-uploader-vuejs-3/ — Vue 3 drag-drop pattern (confirmed with MDN DataTransfer API)
- `.planning/research/ARCHITECTURE.md` — component structure, data flow, anti-patterns (project-specific prior research)
- `.planning/research/FEATURES.md` — UX patterns, competitor analysis

### Tertiary (LOW confidence)
- None applicable for this phase.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Nuxt UI v4 verified against live docs; all components confirmed
- Architecture: HIGH — Based on existing code in repo + prior architecture research
- Pitfalls: HIGH — Based on Vue 3 reactivity docs and existing codebase patterns

**Research date:** 2026-03-24
**Valid until:** 2026-06-24 (stable libraries; Nuxt UI v4 API unlikely to change rapidly)

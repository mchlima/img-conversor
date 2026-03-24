---
phase: quick
plan: 260324-ktp
type: execute
wave: 1
depends_on: []
files_modified:
  - types/index.ts
  - composables/useImageStore.ts
  - composables/useConvertOptions.ts
  - components/ControlPanel.vue
autonomous: true
requirements: []
must_haves:
  truths:
    - "Output format field renders below its label, not beside it (matching Quality layout)"
    - "Resize mode buttons show only icons (no text), with title and alt attributes for accessibility"
    - "When Exact (px) mode is selected, width/height fields display the first image's original dimensions"
    - "Changing width auto-adjusts height to maintain aspect ratio, and vice versa"
    - "Width and height inputs do not accept values larger than the original image dimensions"
  artifacts:
    - path: "types/index.ts"
      provides: "ImageItem with originalWidth/originalHeight fields"
      contains: "originalWidth"
    - path: "components/ControlPanel.vue"
      provides: "Fixed layout and proportional resize behavior"
  key_links:
    - from: "components/ControlPanel.vue"
      to: "composables/useImageStore.ts"
      via: "computed referenceImage for original dimensions"
      pattern: "images\\.value\\[0\\]|referenceImage"
---

<objective>
Fix three ControlPanel layout and behavior issues:
1. Output format field should stack label above input (not inline)
2. Resize mode buttons should be icon-only with accessibility attributes
3. Exact (px) mode should pre-fill image dimensions, maintain aspect ratio, and clamp to original size

Purpose: Improve UX consistency and add proper proportional resize constraints
Output: Updated ControlPanel.vue with supporting type/composable changes
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/execute-plan.md
@~/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@components/ControlPanel.vue
@composables/useConvertOptions.ts
@composables/useImageStore.ts
@types/index.ts

<interfaces>
From types/index.ts:
```typescript
export interface ImageItem {
  id: string
  file: File
  name: string
  originalSize: number
  convertedSize: number | null
  convertedBlob: Blob | null
  status: ProcessingStatus
  error: string | null
  previewUrl: string | null
  hasAlpha: boolean
}

export interface ConvertOptions {
  format: OutputFormat
  quality: number
  resizeMode: 'none' | 'proportional' | 'exact'
  resizePercent: number
  resizeWidth: number | null
  resizeHeight: number | null
  backgroundColor: string
}
```

From composables/useImageStore.ts:
```typescript
export function useImageStore() {
  // images is useState<ImageItem[]>
  // addImages creates ImageItem from File[] — this is where originalWidth/Height must be populated
  return { images, addImages, removeImage, convertAll, isProcessing, allConverted }
}
```

From composables/useConvertOptions.ts:
```typescript
export function useConvertOptions() {
  // setResizeMode('exact') currently resets resizePercent but does NOT pre-fill dimensions
  // setResizeDimensions(width, height) sets resizeWidth/resizeHeight
  return { options, setFormat, setQuality, setResizeMode, setResizePercent, setResizeDimensions, setBackgroundColor }
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add originalWidth/originalHeight to ImageItem and populate on upload</name>
  <files>types/index.ts, composables/useImageStore.ts</files>
  <action>
  1. In `types/index.ts`, add two fields to `ImageItem`:
     - `originalWidth: number` (default 0, populated after decode)
     - `originalHeight: number` (default 0, populated after decode)

  2. In `composables/useImageStore.ts` `addImages` function:
     - In the `files.map()` initializer, set `originalWidth: 0` and `originalHeight: 0`
     - After `images.value = items`, loop over `images.value` and for each item:
       ```typescript
       createImageBitmap(item.file).then(bmp => {
         item.originalWidth = bmp.width
         item.originalHeight = bmp.height
         bmp.close()
       })
       ```
     - This runs in background similar to the existing `hasAlpha` pattern already in addImages
  </action>
  <verify>
    <automated>cd /home/michel/projects/codebase/agencia201/img-conversor && npx nuxi typecheck</automated>
  </verify>
  <done>ImageItem has originalWidth/originalHeight, populated via createImageBitmap on upload. TypeScript compiles cleanly.</done>
</task>

<task type="auto">
  <name>Task 2: Fix ControlPanel layout — format field stacking, icon-only resize buttons, proportional exact mode</name>
  <files>components/ControlPanel.vue</files>
  <action>
  **Fix 1 — Format field layout (label above input):**
  The format selector section (lines 67-74) already uses `space-y-1.5` which should stack. The issue is the parent `div` uses `flex items-end` on line 65 which makes all children align horizontally. The format `USelect` is rendered beside label because `USelect` is a flex item. No change needed to the parent flex — the inner `div.space-y-1.5` already handles vertical stacking of label + input. Verify the `USelect` is NOT wrapped in an extra inline container. The current code looks correct structurally — the `min-w-[160px] space-y-1.5` div should produce label-above-input. If the USelect is rendering inline with the label, ensure there is no CSS override. Actually looking at the code more carefully, the structure IS correct (div > label + USelect with space-y-1.5). The issue might be that `flex items-end` on the parent is causing USelect to be on the same line. BUT `space-y-1.5` on the inner div means label and USelect are block-level children of a non-flex div — so they should stack. If the user reports it's beside the label, it means USelect might be rendering inline. Fix: ensure the inner div for format has `flex flex-col` explicitly:
  ```html
  <div class="min-w-[160px] flex flex-col space-y-1.5">
  ```

  **Fix 2 — Resize mode buttons (icon-only with accessibility):**
  Replace the text-based resize mode buttons with icon-only variants. Use heroicons:
  - `none`: `i-heroicons-arrows-pointing-in` (no resize)
  - `proportional`: `i-heroicons-arrows-pointing-out` (scale)
  - `exact`: `i-heroicons-arrow-top-right-on-square` (exact dimensions)

  Replace the v-for UButton block (lines 95-105) with three explicit UButton components:
  ```html
  <UButton
    :variant="options.resizeMode === 'none' ? 'solid' : 'outline'"
    icon="i-heroicons-arrows-pointing-in"
    size="xs"
    :title="$t('controls.resize_none')"
    :aria-label="$t('controls.resize_none')"
    @click="setResizeMode('none')"
  />
  <UButton
    :variant="options.resizeMode === 'proportional' ? 'solid' : 'outline'"
    icon="i-heroicons-arrows-pointing-out"
    size="xs"
    :title="$t('controls.resize_proportional')"
    :aria-label="$t('controls.resize_proportional')"
    @click="setResizeMode('proportional')"
  />
  <UButton
    :variant="options.resizeMode === 'exact' ? 'solid' : 'outline'"
    icon="i-heroicons-arrow-top-right-on-square"
    size="xs"
    :title="$t('controls.resize_exact')"
    :aria-label="$t('controls.resize_exact')"
    @click="setResizeMode('exact')"
  />
  ```
  Remove the `class="flex-1 justify-center"` from buttons — icon-only buttons should be compact. Keep `gap-1.5` on the parent flex div. Remove `min-w-[200px]` from the resize mode container — icon buttons need less space, use `space-y-1.5` only.

  **Fix 3 — Exact mode: pre-fill dimensions, aspect ratio lock, max clamping:**

  Add a computed `referenceImage` that gets the first image from the store (used for original dimensions):
  ```typescript
  const referenceImage = computed(() => images.value[0] ?? null)
  const aspectRatio = computed(() => {
    const img = referenceImage.value
    if (!img || !img.originalWidth || !img.originalHeight) return 1
    return img.originalWidth / img.originalHeight
  })
  const maxWidth = computed(() => referenceImage.value?.originalWidth ?? 16384)
  const maxHeight = computed(() => referenceImage.value?.originalHeight ?? 16384)
  ```

  Modify `setResizeMode` watcher or the existing mode-switch behavior: When switching to `'exact'`, pre-fill dimensions from the reference image. Add a `watch` on `options.resizeMode`:
  ```typescript
  watch(() => options.value.resizeMode, (mode) => {
    if (mode === 'exact' && referenceImage.value) {
      const img = referenceImage.value
      if (img.originalWidth && img.originalHeight) {
        localWidth.value = img.originalWidth
        localHeight.value = img.originalHeight
        setResizeDimensions(img.originalWidth, img.originalHeight)
      }
    }
  })
  ```

  Replace `onWidthChange` and `onHeightChange` to maintain aspect ratio:
  ```typescript
  function onWidthChange(val: number | null) {
    if (val == null) return
    const clamped = Math.min(val, maxWidth.value)
    localWidth.value = clamped
    const newHeight = Math.max(1, Math.round(clamped / aspectRatio.value))
    localHeight.value = Math.min(newHeight, maxHeight.value)
    setResizeDimensions(localWidth.value, localHeight.value)
  }

  function onHeightChange(val: number | null) {
    if (val == null) return
    const clamped = Math.min(val, maxHeight.value)
    localHeight.value = clamped
    const newWidth = Math.max(1, Math.round(clamped * aspectRatio.value))
    localWidth.value = Math.min(newWidth, maxWidth.value)
    setResizeDimensions(localWidth.value, localHeight.value)
  }
  ```

  Update the UInputNumber `:max` bindings to use the computed maxes:
  ```html
  <UInputNumber :model-value="localWidth" :min="1" :max="maxWidth" :step="1" @update:model-value="onWidthChange" />
  <UInputNumber :model-value="localHeight" :min="1" :max="maxHeight" :step="1" @update:model-value="onHeightChange" />
  ```
  </action>
  <verify>
    <automated>cd /home/michel/projects/codebase/agencia201/img-conversor && npx nuxi typecheck</automated>
  </verify>
  <done>
  - Format field label is above the USelect (vertical stack)
  - Resize buttons are icon-only with title and aria-label attributes
  - Switching to Exact mode pre-fills width/height from first image's original dimensions
  - Changing width auto-calculates height proportionally (and vice versa)
  - Width/height inputs max is clamped to original image dimensions
  </done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <what-built>ControlPanel layout fixes: format field stacking, icon-only resize buttons, and proportional exact resize mode with dimension pre-fill and clamping</what-built>
  <how-to-verify>
    1. Run `npm run dev` and open the app
    2. Verify "Formato de Saida" label is ABOVE the dropdown (not beside it)
    3. Verify resize mode shows 3 small icon buttons — hover each to see tooltip text
    4. Upload an image, then select "Exato (px)" resize mode
    5. Verify width/height fields auto-populate with the image's original dimensions
    6. Change the width — verify height auto-adjusts proportionally
    7. Change the height — verify width auto-adjusts proportionally
    8. Try entering a value larger than the original dimension — verify it gets clamped
  </how-to-verify>
  <resume-signal>Type "approved" or describe issues</resume-signal>
</task>

</tasks>

<verification>
- `npx nuxi typecheck` passes with no errors
- Format label renders above dropdown, matching Quality's vertical layout
- Resize buttons are icon-only, compact, with accessible title/aria-label
- Exact mode pre-fills original image dimensions and enforces proportional ratio
</verification>

<success_criteria>
- All three layout/behavior issues from the description are resolved
- TypeScript compiles cleanly
- Visual verification confirms correct behavior
</success_criteria>

<output>
After completion, create `.planning/quick/260324-ktp-fix-controlpanel-layout-and-resize-behav/260324-ktp-SUMMARY.md`
</output>

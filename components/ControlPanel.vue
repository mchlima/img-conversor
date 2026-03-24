<script setup lang="ts">
import { downloadAll } from '~/utils/downloadAll'

const {
  options,
  setFormat,
  setQuality,
  setResizeMode,
  setResizePercent,
  setResizeDimensions,
  setBackgroundColor,
} = useConvertOptions()

const { images, convertAll, isProcessing, clearImages, propagateGlobalResize, propagateGlobalResizePercent } = useImageStore()

const formatItems = [
  { label: 'WebP (recommended)', value: 'image/webp' },
  { label: 'JPEG', value: 'image/jpeg' },
  { label: 'PNG', value: 'image/png' },
]

// Show color picker only when output is JPEG and at least one image has alpha
const showColorPicker = computed(() =>
  options.value.format === 'image/jpeg'
  && images.value.some(img => img.hasAlpha),
)

// Computed reference image (first uploaded) for original dimensions
const referenceImage = computed(() => images.value[0] ?? null)
const aspectRatio = computed(() => {
  const img = referenceImage.value
  if (!img || !img.originalWidth || !img.originalHeight) return 1
  return img.originalWidth / img.originalHeight
})
const maxWidth = computed(() => referenceImage.value?.originalWidth || 16384)
const maxHeight = computed(() => referenceImage.value?.originalHeight || 16384)

// Local refs for exact resize inputs
const localWidth = ref<number | null>(options.value.resizeWidth)
const localHeight = ref<number | null>(options.value.resizeHeight)

watch(() => options.value.resizeWidth, v => { localWidth.value = v })
watch(() => options.value.resizeHeight, v => { localHeight.value = v })

// Pre-fill dimensions from reference image when switching to exact mode
watch(() => options.value.resizeMode, (mode) => {
  if (mode === 'exact' && referenceImage.value) {
    const img = referenceImage.value
    if (img.originalWidth && img.originalHeight) {
      localWidth.value = img.originalWidth
      localHeight.value = img.originalHeight
      setResizeDimensions(img.originalWidth, img.originalHeight)
      propagateGlobalResize(img.originalWidth, img.originalHeight)
    }
  }
})

function onWidthChange(val: number | null) {
  if (val == null) return
  const clamped = Math.min(val, maxWidth.value)
  localWidth.value = clamped
  const newHeight = Math.max(1, Math.round(clamped / aspectRatio.value))
  localHeight.value = Math.min(newHeight, maxHeight.value)
  setResizeDimensions(localWidth.value, localHeight.value)
  propagateGlobalResize(localWidth.value, localHeight.value)
}

function onHeightChange(val: number | null) {
  if (val == null) return
  const clamped = Math.min(val, maxHeight.value)
  localHeight.value = clamped
  const newWidth = Math.max(1, Math.round(clamped * aspectRatio.value))
  localWidth.value = Math.min(newWidth, maxWidth.value)
  setResizeDimensions(localWidth.value, localHeight.value)
  propagateGlobalResize(localWidth.value, localHeight.value)
}

// LAYT-04: visible when at least one image is done (not necessarily all)
const hasDoneImages = computed(() => images.value.some(i => i.status === 'done'))

// Absorbed from DownloadAllButton.vue
const isGenerating = ref(false)

async function handleDownload() {
  if (!hasDoneImages.value || isGenerating.value) return
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
  <div class="rounded-xl border border-neutral-200 bg-white p-4">
    <div class="flex flex-wrap items-start gap-4">
      <!-- Format selector -->
      <div class="min-w-[160px] flex flex-col justify-between self-stretch">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.format') }}</label>
        <USelect
          :items="formatItems"
          :model-value="options.format"
          @update:model-value="setFormat"
        />
      </div>

      <!-- Quality slider -->
      <div class="min-w-[160px] flex flex-col justify-between self-stretch">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-neutral-700">{{ $t('controls.quality') }}</label>
          <span class="text-sm text-neutral-500">{{ options.quality }}%</span>
        </div>
        <USlider
          :model-value="options.quality"
          :min="1"
          :max="100"
          :step="1"
          @update:model-value="setQuality"
        />
      </div>

      <!-- Resize mode toggle (icon-only buttons) -->
      <div class="flex flex-col justify-between self-stretch">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.resize') }}</label>
        <div class="flex gap-1.5">
          <UButton
            :variant="options.resizeMode === 'none' ? 'solid' : 'outline'"
            icon="i-heroicons-x-mark"
            size="xs"
            :title="$t('controls.resize_none')"
            :aria-label="$t('controls.resize_none')"
            @click="setResizeMode('none')"
          />
          <UButton
            :variant="options.resizeMode === 'proportional' ? 'solid' : 'outline'"
            icon="i-heroicons-percent-badge"
            size="xs"
            :title="$t('controls.resize_proportional')"
            :aria-label="$t('controls.resize_proportional')"
            @click="setResizeMode('proportional')"
          />
          <UButton
            :variant="options.resizeMode === 'exact' ? 'solid' : 'outline'"
            icon="i-heroicons-viewfinder-circle"
            size="xs"
            :title="$t('controls.resize_exact')"
            :aria-label="$t('controls.resize_exact')"
            @click="setResizeMode('exact')"
          />
        </div>
      </div>

      <!-- Proportional resize slider (shown only when mode === 'proportional') -->
      <div v-if="options.resizeMode === 'proportional'" class="min-w-[160px] flex flex-col justify-between self-stretch">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-neutral-700">{{ $t('controls.resize_proportional') }}</label>
          <span class="text-sm text-neutral-500">{{ options.resizePercent }}%</span>
        </div>
        <USlider
          :model-value="options.resizePercent"
          :min="1"
          :max="100"
          :step="1"
          @update:model-value="(v: number) => { setResizePercent(v); propagateGlobalResizePercent(v) }"
        />
      </div>

      <!-- Exact resize inputs (shown only when mode === 'exact') -->
      <div v-if="options.resizeMode === 'exact'" class="flex gap-2">
        <div class="flex flex-col justify-between self-stretch w-24">
          <label class="text-sm font-medium text-neutral-700">{{ $t('controls.width') }}</label>
          <UInput
            type="number"
            :model-value="localWidth"
            @update:model-value="v => onWidthChange(Number(v))"
          />
        </div>
        <div class="flex flex-col justify-between self-stretch w-24">
          <label class="text-sm font-medium text-neutral-700">{{ $t('controls.height') }}</label>
          <UInput
            type="number"
            :model-value="localHeight"
            @update:model-value="v => onHeightChange(Number(v))"
          />
        </div>
      </div>

      <!-- Background color picker (shown only when JPEG + any image has alpha) -->
      <div v-if="showColorPicker" class="min-w-[120px] flex flex-col justify-between self-stretch">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.bg_color') }}</label>
        <div class="flex items-center gap-2">
          <input
            type="color"
            :value="options.backgroundColor"
            class="h-8 w-12 rounded cursor-pointer border border-neutral-300"
            @input="e => setBackgroundColor((e.target as HTMLInputElement).value)"
          />
          <span class="text-sm text-neutral-500">{{ options.backgroundColor }}</span>
        </div>
      </div>

    </div>
  </div>
</template>

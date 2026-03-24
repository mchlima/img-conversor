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

const { images, convertAll, isProcessing } = useImageStore()

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

// Local refs for exact resize inputs
const localWidth = ref<number | null>(options.value.resizeWidth)
const localHeight = ref<number | null>(options.value.resizeHeight)

watch(() => options.value.resizeWidth, v => { localWidth.value = v })
watch(() => options.value.resizeHeight, v => { localHeight.value = v })

function onWidthChange(val: number | null) {
  localWidth.value = val
  setResizeDimensions(val, localHeight.value)
}

function onHeightChange(val: number | null) {
  localHeight.value = val
  setResizeDimensions(localWidth.value, val)
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
    <div class="flex flex-wrap items-end gap-4">
      <!-- Format selector -->
      <div class="min-w-[160px] space-y-1.5">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.format') }}</label>
        <USelect
          :items="formatItems"
          :model-value="options.format"
          @update:model-value="setFormat"
        />
      </div>

      <!-- Quality slider -->
      <div class="min-w-[160px] space-y-1.5">
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

      <!-- Resize mode toggle -->
      <div class="min-w-[200px] space-y-1.5">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.resize') }}</label>
        <div class="flex gap-1.5">
          <UButton
            v-for="mode in ['none', 'proportional', 'exact'] as const"
            :key="mode"
            :variant="options.resizeMode === mode ? 'solid' : 'outline'"
            size="xs"
            class="flex-1 justify-center"
            @click="setResizeMode(mode)"
          >
            {{ $t(`controls.resize_${mode}`) }}
          </UButton>
        </div>
      </div>

      <!-- Proportional resize slider (shown only when mode === 'proportional') -->
      <div v-if="options.resizeMode === 'proportional'" class="min-w-[160px] space-y-1.5">
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-neutral-700">{{ $t('controls.resize_proportional') }}</label>
          <span class="text-sm text-neutral-500">{{ options.resizePercent }}%</span>
        </div>
        <USlider
          :model-value="options.resizePercent"
          :min="1"
          :max="100"
          :step="1"
          @update:model-value="setResizePercent"
        />
      </div>

      <!-- Exact resize inputs (shown only when mode === 'exact') -->
      <div v-if="options.resizeMode === 'exact'" class="min-w-[200px] space-y-1.5">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.width') }} / {{ $t('controls.height') }}</label>
        <div class="flex gap-2">
          <UInputNumber
            :model-value="localWidth"
            :min="1"
            :max="16384"
            :step="1"
            @update:model-value="onWidthChange"
          />
          <UInputNumber
            :model-value="localHeight"
            :min="1"
            :max="16384"
            :step="1"
            @update:model-value="onHeightChange"
          />
        </div>
      </div>

      <!-- Background color picker (shown only when JPEG + any image has alpha) -->
      <div v-if="showColorPicker" class="min-w-[120px] space-y-1.5">
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

      <!-- Convert button (ml-auto pushes to right when space allows) -->
      <UButton
        color="primary"
        size="md"
        class="ml-auto"
        :disabled="images.length === 0 || isProcessing"
        :loading="isProcessing"
        @click="convertAll"
      >
        {{ $t('controls.convert') }}
      </UButton>

      <!-- Download All button (LAYT-04: visible only when at least one image is done) -->
      <UButton
        v-if="hasDoneImages"
        icon="i-heroicons-archive-box-arrow-down"
        :disabled="!hasDoneImages || isGenerating"
        :loading="isGenerating"
        @click="handleDownload"
      >
        {{ isGenerating ? $t('batch.generating') : $t('batch.download_all') }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
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
</script>

<template>
  <div class="rounded-xl border border-neutral-200 bg-white p-4 space-y-5">
    <!-- Format selector -->
    <div class="space-y-1.5">
      <label class="text-sm font-medium text-neutral-700">{{ $t('controls.format') }}</label>
      <USelect
        :items="formatItems"
        :model-value="options.format"
        @update:model-value="setFormat"
      />
    </div>

    <!-- Quality slider -->
    <div class="space-y-1.5">
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
    <div class="space-y-1.5">
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
    <div v-if="options.resizeMode === 'proportional'" class="space-y-1.5">
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
    <div v-if="options.resizeMode === 'exact'" class="space-y-2">
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.width') }}</label>
        <UInputNumber
          :model-value="localWidth"
          :min="1"
          :max="16384"
          :step="1"
          @update:model-value="onWidthChange"
        />
      </div>
      <div class="space-y-1.5">
        <label class="text-sm font-medium text-neutral-700">{{ $t('controls.height') }}</label>
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
    <div v-if="showColorPicker" class="space-y-1.5">
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

    <!-- Convert button -->
    <UButton
      color="primary"
      size="md"
      block
      :disabled="images.length === 0 || isProcessing"
      :loading="isProcessing"
      @click="convertAll"
    >
      {{ $t('controls.convert') }}
    </UButton>
  </div>
</template>

<script setup lang="ts">
import type { ImageItem } from '~/types'
import { formatBytes } from '~/utils/formatBytes'

const props = defineProps<{ item: ImageItem }>()
const { removeImage } = useImageStore()
const { options } = useConvertOptions()

const statusColor = computed(() => ({
  idle: 'neutral',
  processing: 'warning',
  done: 'success',
  error: 'error',
} as const)[props.item.status])

const savings = computed(() => {
  if (props.item.status !== 'done' || !props.item.convertedSize) return null
  const pct = (props.item.originalSize - props.item.convertedSize) / props.item.originalSize * 100
  return { pct: Math.abs(pct).toFixed(1), grew: pct < 0 }
})

function downloadImage() {
  if (!props.item.convertedBlob) return
  const extMap: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  const ext = extMap[options.value.format] || 'webp'
  const baseName = props.item.name.replace(/\.[^.]+$/, '')
  const url = URL.createObjectURL(props.item.convertedBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${baseName}.${ext}`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg border border-neutral-200 bg-white px-3 py-2">
    <!-- Thumbnail -->
    <img
      v-if="item.previewUrl"
      :src="item.previewUrl"
      :alt="item.name"
      class="size-12 rounded object-cover shrink-0"
    />
    <div v-else class="size-12 rounded bg-neutral-100 shrink-0 flex items-center justify-center">
      <UIcon name="i-heroicons-photo" class="text-neutral-400 size-6" />
    </div>

    <!-- Filename -->
    <p class="flex-1 truncate text-sm font-medium text-neutral-800 min-w-0">{{ item.name }}</p>

    <!-- Original size -->
    <span class="text-xs text-neutral-500 shrink-0">{{ formatBytes(item.originalSize) }}</span>

    <!-- Converted size + savings (only when done) -->
    <template v-if="item.status === 'done' && item.convertedSize !== null">
      <span class="text-xs text-neutral-700 shrink-0">{{ formatBytes(item.convertedSize) }}</span>
      <span
        v-if="savings"
        :class="['text-xs font-medium shrink-0', savings.grew ? 'text-red-500' : 'text-green-600']"
      >
        {{ savings.grew ? '+' : '-' }}{{ savings.pct }}% {{ savings.grew ? $t('card.increase') : $t('card.savings') }}
      </span>
    </template>

    <!-- Error message -->
    <span v-if="item.status === 'error' && item.error" class="text-xs text-red-500 shrink-0 max-w-32 truncate" :title="item.error">
      {{ item.error }}
    </span>

    <!-- Status badge -->
    <UBadge :color="statusColor" :label="$t(`status.${item.status}`)" size="sm" class="shrink-0" />

    <!-- Download button -->
    <UButton
      icon="i-heroicons-arrow-down-tray"
      size="xs"
      variant="ghost"
      :disabled="item.status !== 'done'"
      :title="$t('card.download')"
      class="shrink-0"
      @click="downloadImage"
    />

    <!-- Remove button -->
    <UButton
      icon="i-heroicons-x-mark"
      size="xs"
      variant="ghost"
      color="error"
      :disabled="item.status === 'processing'"
      :title="$t('card.remove')"
      class="shrink-0"
      @click="removeImage(item.id)"
    />
  </div>
</template>

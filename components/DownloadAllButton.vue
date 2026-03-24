<script setup lang="ts">
import { downloadAll } from '~/utils/downloadAll'

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

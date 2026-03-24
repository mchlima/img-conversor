<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-4 px-6 border-b border-neutral-200">
      <div class="max-w-6xl mx-auto">
        <AppLogo class="h-8 text-neutral-800 dark:text-neutral-100" style="aspect-ratio: 984/349;" />
      </div>
    </header>

    <!-- Main content area -->
    <main class="flex-1 px-6 py-6">
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- ControlPanel: horizontal bar, visible only when images exist (LAYT-02/D-04) -->
        <ControlPanel v-if="images.length > 0" class="!mb-10" />

        <DropZone />

        <!-- Action buttons: between dropzone and list, always visible -->
        <div class="flex flex-wrap items-center gap-2 !mt-10">
          <UButton
            color="primary"
            variant="outline"
            size="md"
            :disabled="images.length === 0 || isProcessing"
            :loading="isProcessing"
            @click="convertAll"
          >
            {{ $t('controls.convert') }}
          </UButton>

          <UButton
            color="primary"
            variant="outline"
            icon="i-heroicons-archive-box-arrow-down"
            size="md"
            :disabled="!hasDoneImages || isGenerating"
            :loading="isGenerating"
            @click="handleDownload"
          >
            {{ isGenerating ? $t('batch.generating') : $t('batch.download_all') }}
          </UButton>

          <UButton
            color="error"
            variant="outline"
            icon="i-heroicons-trash"
            size="md"
            :disabled="images.length === 0"
            @click="clearImages"
          >
            {{ $t('controls.clear') }}
          </UButton>
        </div>

        <!-- Image list (D-05: vertical list, one per line) -->
        <div v-if="images.length > 0" class="space-y-2">
          <ImageCard
            v-for="item in images"
            :key="item.id"
            :item="item"
          />
        </div>

        <!-- Onboarding steps: always visible below image list (ONBD-01) -->
        <OnboardingSteps class="!mt-10" />
      </div>
    </main>

    <!-- Footer with trust signal (D-11: second location) -->
    <footer class="py-4 px-6 border-t border-neutral-200 text-center">
      <p class="text-sm text-neutral-400">{{ $t('footer.privacy') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { downloadAll } from '~/utils/downloadAll'

const { images, convertAll, isProcessing, clearImages } = useImageStore()
const { options } = useConvertOptions()

const hasDoneImages = computed(() => images.value.some(i => i.status === 'done'))
const isGenerating = ref(false)

async function handleDownload() {
  if (!hasDoneImages.value || isGenerating.value) return
  isGenerating.value = true
  try {
    await downloadAll(images.value, options.value.format)
  } finally {
    isGenerating.value = false
  }
}
</script>

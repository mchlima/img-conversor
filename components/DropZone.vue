<script setup lang="ts">
const { images, addImages } = useImageStore()
const isDragOver = ref(false)
const fileInput = useTemplateRef<HTMLInputElement>('fileInput')
const hasImages = computed(() => images.value.length > 0)

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (files.length) addImages(files)
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) addImages(files)
  input.value = '' // reset so same file can be re-selected
}

function openPicker() {
  fileInput.value?.click()
}
</script>

<template>
  <div
    :class="[
      'border-2 border-dashed rounded-xl text-center transition-colors cursor-pointer select-none',
      isDragOver ? 'border-primary bg-primary/5' : 'border-neutral-300 hover:border-neutral-400',
      hasImages ? 'px-6 py-3 flex items-center justify-center gap-2' : 'px-8 py-12',
    ]"
    @dragover.prevent="isDragOver = true"
    @dragleave="isDragOver = false"
    @drop.prevent="onDrop"
    @click="openPicker"
  >
    <!-- Expanded state (no images loaded yet) -->
    <template v-if="!hasImages">
      <UIcon name="i-heroicons-arrow-up-tray" class="mx-auto mb-3 text-neutral-400 size-10" />
      <p class="text-base font-medium text-neutral-700">{{ $t('dropzone.title') }}</p>
      <p class="text-sm text-neutral-500 mt-1">{{ $t('dropzone.subtitle') }}</p>
      <p class="text-xs text-neutral-400 mt-3">{{ $t('dropzone.privacy') }}</p>
    </template>

    <!-- Compact state (images loaded) -->
    <template v-else>
      <UIcon name="i-heroicons-arrow-up-tray" class="text-neutral-400 size-4 shrink-0" />
      <p class="text-sm text-neutral-600">{{ $t('dropzone.add_more') }}</p>
    </template>

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

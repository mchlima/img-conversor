<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-4 px-6 border-b border-neutral-200">
      <h1 class="text-xl font-semibold">{{ $t('app.name') }}</h1>
      <p class="text-sm text-neutral-500">{{ $t('app.tagline') }}</p>
    </header>

    <!-- Main content area -->
    <main class="flex-1 px-6 py-6">
      <div class="max-w-6xl mx-auto lg:grid lg:grid-cols-[320px_1fr] lg:gap-6">
        <!-- Sidebar: ControlPanel (on desktop, shows on left) -->
        <aside class="mb-6 lg:mb-0">
          <ControlPanel />
        </aside>

        <!-- Content: DropZone + Image List -->
        <div class="space-y-4">
          <DropZone />

          <!-- Download All button: above list per D-02 -->
          <div v-if="images.length > 0" class="flex justify-end">
            <DownloadAllButton />
          </div>

          <!-- Image list (D-05: vertical list, one per line) -->
          <div v-if="images.length > 0" class="space-y-2">
            <ImageCard
              v-for="item in images"
              :key="item.id"
              :item="item"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Footer with trust signal (D-11: second location) -->
    <footer class="py-4 px-6 border-t border-neutral-200 text-center">
      <p class="text-sm text-neutral-400">{{ $t('footer.privacy') }}</p>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { images } = useImageStore()
</script>

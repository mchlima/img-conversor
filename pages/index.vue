<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header -->
    <header class="py-4 px-6 border-b border-neutral-200">
      <h1 class="text-xl font-semibold">{{ $t('app.name') }}</h1>
      <p class="text-sm text-neutral-500">{{ $t('app.tagline') }}</p>
    </header>

    <!-- Main content area -->
    <main class="flex-1 px-6 py-6">
      <div class="max-w-6xl mx-auto space-y-4">
        <!-- ControlPanel: horizontal bar, visible only when images exist (LAYT-02/D-04) -->
        <ControlPanel v-if="images.length > 0" />

        <DropZone />

        <!-- Image list (D-05: vertical list, one per line) -->
        <div v-if="images.length > 0" class="space-y-2">
          <ImageCard
            v-for="item in images"
            :key="item.id"
            :item="item"
          />
        </div>

        <!-- Onboarding steps: always visible below image list (ONBD-01) -->
        <OnboardingSteps />
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

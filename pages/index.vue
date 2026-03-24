<template>
  <div class="min-h-screen">
    <header class="py-4 px-6">
      <h1 class="text-xl font-semibold">{{ $t('app.name') }}</h1>
    </header>
    <main class="px-6">
      <ClientOnly>
        <p>{{ $t('app.tagline') }}</p>
      </ClientOnly>
    </main>
  </div>
</template>

<script setup lang="ts">
onMounted(async () => {
  try {
    const webp = await import('@jsquash/webp')
    console.info('[WASM] @jsquash/webp loaded successfully', Object.keys(webp))
  } catch (err) {
    console.error('[WASM] Failed to load @jsquash/webp:', err)
  }
})
</script>

<template>
  <div>
    <h2 class="text-lg font-semibold text-neutral-700 mb-4">{{ $t('onboarding.title') }}</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div
        v-for="step in steps"
        :key="step"
        class="border border-neutral-200 rounded-lg p-4"
      >
        <span class="text-2xl font-bold text-primary">{{ $t(`onboarding.${step}.number`) }}</span>
        <h3 class="text-base font-semibold mt-2">{{ $t(`onboarding.${step}.title`) }}</h3>
        <p class="text-sm text-neutral-500 mt-1">{{ $t(`onboarding.${step}.description`) }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const steps = ['step1', 'step2', 'step3', 'step4']
</script>

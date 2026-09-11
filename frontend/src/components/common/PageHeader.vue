<script setup lang="ts">
defineProps<{
  title: string
  description: string
}>()
</script>

<template>
  <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
    <div>
      <p class="text-sm font-bold uppercase tracking-[0.18em] text-secondary">Blockflix Rental</p>
      <h1 class="mt-2 text-3xl font-black text-white md:text-4xl">{{ title }}</h1>
      <p class="mt-2 max-w-2xl text-sm text-slate-400">{{ description }}</p>
    </div>
    <div class="flex flex-wrap gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

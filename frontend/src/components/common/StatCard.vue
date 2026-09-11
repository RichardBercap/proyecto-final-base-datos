<script setup lang="ts">
import Card from '@/components/ui/card/Card.vue'

defineProps<{
  label: string
  value: string | number
  hint?: string
}>()
</script>

<template>
  <Card class="p-5 transition duration-200 hover:-translate-y-1 hover:border-secondary/40">
    <p class="text-sm font-semibold text-slate-400">{{ label }}</p>
    <p class="mt-3 text-3xl font-black text-white">{{ value }}</p>
    <p v-if="hint" class="mt-2 text-xs text-secondary">{{ hint }}</p>
  </Card>
</template>

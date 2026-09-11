<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  class?: string
}>()
</script>

<template>
  <section :class="cn('rounded-xl border border-white/10 bg-slate-900/80 shadow-xl shadow-black/20', $props.class)">
    <slot />
  </section>
</template>

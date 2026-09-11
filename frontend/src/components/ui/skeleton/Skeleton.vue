<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  class?: string
}>()
</script>

<template>
  <div :class="cn('animate-pulse rounded-xl bg-white/10', $props.class)" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'success' | 'warning' | 'danger'
  }>(),
  {
    variant: 'default'
  }
)

const classes = computed(() =>
  cn('inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold', {
    'bg-blue-500/15 text-blue-200': props.variant === 'default',
    'bg-emerald-500/15 text-emerald-200': props.variant === 'success',
    'bg-yellow-400/15 text-yellow-200': props.variant === 'warning',
    'bg-red-500/15 text-red-200': props.variant === 'danger'
  })
)
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>

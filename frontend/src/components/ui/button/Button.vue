<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
    size?: 'sm' | 'md' | 'lg' | 'icon'
    type?: 'button' | 'submit' | 'reset'
    disabled?: boolean
    class?: string
  }>(),
  {
    variant: 'primary',
    size: 'md',
    type: 'button',
    disabled: false,
    class: ''
  }
)

const classes = computed(() =>
  cn(
    'focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-55',
    {
      'bg-primary text-white shadow-blockbuster hover:-translate-y-0.5 hover:bg-blue-700':
        props.variant === 'primary',
      'bg-secondary text-slate-950 shadow-lg shadow-yellow-500/10 hover:-translate-y-0.5 hover:bg-yellow-300':
        props.variant === 'secondary',
      'bg-transparent text-slate-200 hover:bg-white/10': props.variant === 'ghost',
      'bg-red-600 text-white hover:bg-red-500': props.variant === 'danger',
      'h-9 px-3 text-sm': props.size === 'sm',
      'h-11 px-4 text-sm': props.size === 'md',
      'h-12 px-5 text-base': props.size === 'lg',
      'h-10 w-10 p-0': props.size === 'icon'
    },
    props.class
  )
)
</script>

<template>
  <button :type="type" :disabled="disabled" :class="classes">
    <slot />
  </button>
</template>

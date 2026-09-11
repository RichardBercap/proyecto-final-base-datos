<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  modelValue?: string | number
  placeholder?: string
  type?: string
  class?: string
}>()

defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <input
    :value="modelValue"
    :type="type || 'text'"
    :placeholder="placeholder"
    :class="
      cn(
        'focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm text-slate-100 placeholder:text-slate-500',
        $props.class
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

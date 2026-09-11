<script setup lang="ts">
import { cn } from '@/utils/cn'

defineProps<{
  modelValue?: string
  placeholder?: string
  class?: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :class="
      cn(
        'focus-ring min-h-28 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500',
        $props.class
      )
    "
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>

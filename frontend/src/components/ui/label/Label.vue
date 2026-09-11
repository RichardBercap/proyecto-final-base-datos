<script setup lang="ts">
defineProps<{
  htmlFor?: string
}>()
</script>

<template>
  <label :for="htmlFor" class="text-sm font-medium text-slate-200">
    <slot />
  </label>
</template>

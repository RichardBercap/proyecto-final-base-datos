<script setup lang="ts">
defineProps<{
  message: string | null
}>()
</script>

<template>
  <div v-if="message" class="rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
    {{ message }}
  </div>
</template>

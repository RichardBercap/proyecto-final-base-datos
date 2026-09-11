<script setup lang="ts">
import { FilmIcon } from '@heroicons/vue/24/outline'
import Button from '@/components/ui/button/Button.vue'

defineProps<{
  title: string
  description: string
  actionLabel?: string
}>()

defineEmits<{
  action: []
}>()
</script>

<template>
  <div class="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-slate-900/50 p-8 text-center">
    <FilmIcon class="mb-4 h-12 w-12 text-secondary" />
    <h3 class="text-lg font-semibold text-white">{{ title }}</h3>
    <p class="mt-2 max-w-md text-sm text-slate-400">{{ description }}</p>
    <Button v-if="actionLabel" class="mt-5" variant="secondary" @click="$emit('action')">
      {{ actionLabel }}
    </Button>
  </div>
</template>

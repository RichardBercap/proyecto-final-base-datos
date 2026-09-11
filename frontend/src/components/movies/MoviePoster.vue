<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  title: string
  genre?: string
  posterUrl?: string
}>()

const imageFailed = ref(false)
const showPosterImage = computed(() => Boolean(props.posterUrl) && !imageFailed.value)

watch(
  () => props.posterUrl,
  () => {
    imageFailed.value = false
  }
)
</script>

<template>
  <div class="aspect-[2/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary via-slate-900 to-slate-950 shadow-xl shadow-black/30">
    <img
      v-if="showPosterImage"
      :src="posterUrl"
      :alt="title"
      class="h-full w-full object-cover transition duration-300 hover:scale-105"
      loading="lazy"
      @error="imageFailed = true"
    />
    <div v-else class="flex h-full flex-col justify-between p-4">
      <div class="h-2 w-16 rounded-full bg-secondary" />
      <div>
        <p class="line-clamp-4 text-2xl font-black leading-tight text-white">{{ title }}</p>
        <p class="mt-3 inline-flex rounded-full bg-secondary px-3 py-1 text-xs font-bold text-slate-950">
          {{ genre || 'Video Club' }}
        </p>
      </div>
    </div>
  </div>
</template>

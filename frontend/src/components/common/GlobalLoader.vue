<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { FilmIcon } from '@heroicons/vue/24/solid'
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()
const { isGlobalLoading } = storeToRefs(uiStore)
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isGlobalLoading"
      class="fixed inset-0 z-[80] grid place-items-center bg-slate-950/80 backdrop-blur-md"
      role="status"
      aria-live="polite"
      aria-label="Cargando solicitud"
    >
      <div class="flex flex-col items-center rounded-xl border border-secondary/30 bg-slate-900/95 px-8 py-7 shadow-blockbuster">
        <div class="relative grid h-16 w-16 place-items-center rounded-xl bg-primary">
          <FilmIcon class="h-9 w-9 text-secondary" />
          <div class="absolute inset-0 animate-ping rounded-xl border border-secondary/60" />
        </div>
        <p class="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-secondary">Procesando</p>
        <p class="mt-1 text-sm text-slate-300">Conectando con el backend</p>
      </div>
    </div>
  </Transition>
</template>

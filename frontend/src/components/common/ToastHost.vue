<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { XMarkIcon } from '@heroicons/vue/24/outline'
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()
const { toasts } = storeToRefs(uiStore)
</script>

<template>
  <div class="fixed right-4 top-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
    <div
      v-for="toast in toasts"
      :key="toast.id"
      class="rounded-xl border border-white/10 bg-slate-900 p-4 shadow-2xl shadow-black/30"
      role="status"
    >
      <div class="flex items-start justify-between gap-3">
        <div>
          <p class="font-semibold text-white">{{ toast.title }}</p>
          <p v-if="toast.description" class="mt-1 text-sm text-slate-400">{{ toast.description }}</p>
        </div>
        <button class="focus-ring rounded-lg p-1 text-slate-400 hover:bg-white/10 hover:text-white" @click="uiStore.dismissToast(toast.id)">
          <XMarkIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</template>

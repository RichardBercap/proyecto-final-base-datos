<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'

const query = ref('')
const router = useRouter()

const submit = () => {
  if (!query.value.trim()) return
  void router.push({ path: '/movies', query: { q: query.value.trim() } })
}
</script>

<template>
  <form class="relative hidden w-full max-w-md lg:block" role="search" @submit.prevent="submit">
    <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
    <input
      v-model="query"
      class="focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950/75 pl-10 pr-3 text-sm text-white placeholder:text-slate-500"
      placeholder="Buscar películas, actores u Oscars"
    />
  </form>
</template>

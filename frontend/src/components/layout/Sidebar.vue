<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router'
import {
  Cog6ToothIcon,
  FilmIcon,
  HomeIcon,
  PlayCircleIcon,
  TicketIcon,
  UserGroupIcon
} from '@heroicons/vue/24/outline'
import { cn } from '@/utils/cn'

const route = useRoute()

const items = [
  { label: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { label: 'Movies', to: '/movies', icon: FilmIcon },
  { label: 'Clients', to: '/clients', icon: UserGroupIcon },
  { label: 'Loans', to: '/loans', icon: TicketIcon },
  { label: 'Settings', to: '/settings', icon: Cog6ToothIcon },
  { label: 'Catálogo cliente', to: '/catalog', icon: PlayCircleIcon }
]
</script>

<template>
  <aside class="flex h-full w-72 flex-col border-r border-white/10 bg-slate-950/95 px-4 py-5">
    <RouterLink to="/dashboard" class="mb-8 flex items-center gap-3 px-2">
      <div class="grid h-11 w-11 place-items-center rounded-xl bg-secondary font-black text-slate-950">
        BF
      </div>
      <div>
        <p class="text-lg font-black tracking-wide text-white">Blockflix</p>
        <p class="text-xs font-semibold uppercase text-secondary">Video Rental</p>
      </div>
    </RouterLink>

    <nav class="space-y-2">
      <RouterLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        :class="
          cn(
            'focus-ring flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 transition hover:bg-white/10 hover:text-white',
            route.path.startsWith(item.to) && 'bg-primary text-white shadow-blockbuster'
          )
        "
      >
        <component :is="item.icon" class="h-5 w-5" />
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="mt-auto rounded-xl border border-secondary/30 bg-secondary/10 p-4">
      <p class="text-sm font-semibold text-secondary">Rental Store Mode</p>
      <p class="mt-1 text-xs text-slate-300">API conectado a Elasticsearch local.</p>
    </div>
  </aside>
</template>

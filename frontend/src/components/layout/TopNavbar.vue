<script setup lang="ts">
import { Bars3Icon, BellIcon, MoonIcon, UserCircleIcon } from '@heroicons/vue/24/outline'
import Breadcrumb from '@/components/layout/Breadcrumb.vue'
import GlobalSearch from '@/components/layout/GlobalSearch.vue'
import Button from '@/components/ui/button/Button.vue'
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
    <div class="flex h-16 items-center gap-3 px-4 sm:px-6">
      <Button class="lg:hidden" variant="ghost" size="icon" aria-label="Abrir menú" @click="uiStore.toggleSidebar">
        <Bars3Icon class="h-5 w-5" />
      </Button>
      <div class="min-w-0 flex-1">
        <Breadcrumb />
      </div>
      <GlobalSearch />
      <Button variant="ghost" size="icon" aria-label="Notificaciones">
        <BellIcon class="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Modo oscuro">
        <MoonIcon class="h-5 w-5" />
      </Button>
      <Button variant="ghost" size="icon" aria-label="Usuario">
        <UserCircleIcon class="h-6 w-6" />
      </Button>
    </div>
  </header>
</template>

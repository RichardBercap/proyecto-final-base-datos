<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Sidebar from '@/components/layout/Sidebar.vue'
import TopNavbar from '@/components/layout/TopNavbar.vue'
import Footer from '@/components/layout/Footer.vue'
import ToastHost from '@/components/common/ToastHost.vue'
import { useUiStore } from '@/stores/ui.store'

const uiStore = useUiStore()
const { sidebarOpen } = storeToRefs(uiStore)
</script>

<template>
  <div class="movie-gradient min-h-screen">
    <div class="fixed inset-y-0 left-0 z-40 hidden lg:block">
      <Sidebar />
    </div>

    <div v-if="sidebarOpen" class="fixed inset-0 z-50 lg:hidden">
      <button class="absolute inset-0 bg-black/60" aria-label="Cerrar menú" @click="uiStore.toggleSidebar" />
      <div class="relative h-full">
        <Sidebar />
      </div>
    </div>

    <div class="min-h-screen lg:pl-72">
      <TopNavbar />
      <main class="min-h-[calc(100vh-8rem)] px-4 py-6 sm:px-6">
        <RouterView />
      </main>
      <Footer />
    </div>

    <ToastHost />
  </div>
</template>

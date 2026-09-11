<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'

const route = useRoute()

const crumbs = computed(() =>
  route.path
    .split('/')
    .filter(Boolean)
    .map((segment, index, segments) => ({
      label: segment.replace(/-/g, ' '),
      to: `/${segments.slice(0, index + 1).join('/')}`
    }))
)
</script>

<template>
  <nav class="hidden text-sm text-slate-400 md:flex" aria-label="Breadcrumb">
    <RouterLink to="/dashboard" class="hover:text-secondary">Inicio</RouterLink>
    <template v-for="crumb in crumbs" :key="crumb.to">
      <span class="mx-2">/</span>
      <RouterLink :to="crumb.to" class="capitalize hover:text-secondary">{{ crumb.label }}</RouterLink>
    </template>
  </nav>
</template>

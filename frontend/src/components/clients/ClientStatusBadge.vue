<script setup lang="ts">
import Badge from '@/components/ui/badge/Badge.vue'
import type { ClientStatus } from '@/types/client'

defineProps<{
  status: ClientStatus
}>()
</script>

<template>
  <Badge :variant="status === 'activo' ? 'success' : status === 'bloqueado' ? 'danger' : 'warning'">
    {{ status }}
  </Badge>
</template>

<script setup lang="ts">
import Badge from '@/components/ui/badge/Badge.vue'
import type { LoanStatus } from '@/types/loan'

defineProps<{
  status: LoanStatus
}>()
</script>

<template>
  <Badge :variant="status === 'activo' ? 'warning' : 'success'">
    {{ status }}
  </Badge>
</template>

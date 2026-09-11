<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import EmptyState from '@/components/common/EmptyState.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import LoanStatusBadge from '@/components/loans/LoanStatusBadge.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import { useLoansStore } from '@/stores/loans.store'
import { formatCurrency, formatDate } from '@/utils/format'
import { paginate, totalPages } from '@/utils/pagination'

const router = useRouter()
const loansStore = useLoansStore()
const query = ref('')
const page = ref(1)
const pageSize = 10

const filteredLoans = computed(() => {
  const search = query.value.toLowerCase()
  return loansStore.loans.filter((loan) =>
    [loan.prestamo_id, loan.cliente.nombre_completo, loan.estado].join(' ').toLowerCase().includes(search)
  )
})

const visibleLoans = computed(() => paginate(filteredLoans.value, page.value, pageSize))
const pages = computed(() => totalPages(filteredLoans.value.length, pageSize))

onMounted(loansStore.fetchLoans)
</script>

<template>
  <PageHeader title="Loans" description="Préstamos, facturas, devoluciones y seguimiento de copias.">
    <template #actions>
      <RouterLink to="/loans/new">
        <Button variant="secondary"><PlusIcon class="h-5 w-5" />Nuevo préstamo</Button>
      </RouterLink>
    </template>
  </PageHeader>

  <Card class="mb-5 p-4">
    <Input v-model="query" placeholder="Buscar préstamo por cliente, ID o estado" />
  </Card>

  <Card v-if="visibleLoans.length" class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-white/5 text-slate-400">
          <tr>
            <th class="px-4 py-3">Préstamo</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="loan in visibleLoans"
            :key="loan.prestamo_id"
            class="cursor-pointer border-t border-white/10 transition hover:bg-white/5"
            @click="router.push(`/loans/${loan.prestamo_id}`)"
          >
            <td class="px-4 py-4 font-semibold text-white">{{ loan.prestamo_id }}</td>
            <td>{{ loan.cliente.nombre_completo }}</td>
            <td class="text-slate-400">{{ formatDate(loan.fecha_prestamo) }}</td>
            <td class="font-semibold text-secondary">{{ formatCurrency(loan.total_bs) }}</td>
            <td><LoanStatusBadge :status="loan.estado" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
  <EmptyState
    v-else
    title="Sin préstamos"
    description="Todavía no hay préstamos registrados."
    action-label="Crear préstamo"
    @action="router.push('/loans/new')"
  />

  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-slate-400">Página {{ page }} de {{ pages }}</p>
    <div class="flex gap-2">
      <Button variant="ghost" :disabled="page === 1" @click="page--">Anterior</Button>
      <Button variant="ghost" :disabled="page === pages" @click="page++">Siguiente</Button>
    </div>
  </div>
</template>

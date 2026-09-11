<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import PageHeader from '@/components/common/PageHeader.vue'
import StatCard from '@/components/common/StatCard.vue'
import Card from '@/components/ui/card/Card.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useClientsStore } from '@/stores/clients.store'
import { useLoansStore } from '@/stores/loans.store'
import { useMoviesStore } from '@/stores/movies.store'
import { formatCurrency, formatDate } from '@/utils/format'

const moviesStore = useMoviesStore()
const clientsStore = useClientsStore()
const loansStore = useLoansStore()

const { movies, availableCopies, loanedCopies, loading: moviesLoading } = storeToRefs(moviesStore)
const { clients, blockedClients, loading: clientsLoading } = storeToRefs(clientsStore)
const { activeLoans, latestLoans, loading: loansLoading } = storeToRefs(loansStore)

onMounted(async () => {
  await Promise.all([
    moviesStore.fetchMovies(),
    moviesStore.fetchCopies(),
    clientsStore.fetchClients(),
    loansStore.fetchLoans()
  ])
})
</script>

<template>
  <PageHeader
    title="Dashboard"
    description="Vista ejecutiva del inventario, préstamos activos y actividad reciente del videoclub."
  />

  <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
    <StatCard label="Películas" :value="movies.length" hint="Catálogo total" />
    <StatCard label="Disponibles" :value="availableCopies.length" hint="Copias listas" />
    <StatCard label="Prestadas" :value="loanedCopies.length" hint="Copias en alquiler" />
    <StatCard label="Clientes" :value="clients.length" hint="Registrados" />
    <StatCard label="Préstamos activos" :value="activeLoans.length" hint="Por devolver" />
    <StatCard label="Bloqueados" :value="blockedClients.length" hint="Clientes restringidos" />
  </div>

  <div class="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
    <Card class="p-5">
      <div class="mb-5 flex items-center justify-between">
        <h2 class="text-xl font-bold text-white">Últimos préstamos</h2>
        <span class="rounded-full bg-secondary px-3 py-1 text-xs font-bold text-slate-950">Live</span>
      </div>
      <div v-if="loansLoading" class="space-y-3">
        <Skeleton v-for="item in 4" :key="item" class="h-16" />
      </div>
      <div v-else class="space-y-3">
        <RouterLink
          v-for="loan in latestLoans"
          :key="loan.prestamo_id"
          :to="`/loans/${loan.prestamo_id}`"
          class="flex items-center justify-between rounded-xl bg-white/5 p-4 transition hover:bg-white/10"
        >
          <div>
            <p class="font-semibold text-white">{{ loan.cliente.nombre_completo }}</p>
            <p class="text-sm text-slate-400">{{ formatDate(loan.fecha_prestamo) }} · {{ loan.cantidad_peliculas }} películas</p>
          </div>
          <p class="font-black text-secondary">{{ formatCurrency(loan.total_bs) }}</p>
        </RouterLink>
      </div>
    </Card>

    <Card class="p-5">
      <h2 class="text-xl font-bold text-white">Actividad y gráficos</h2>
      <div class="mt-5 space-y-4">
        <div class="h-32 rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-400">
          Placeholder: préstamos por semana
        </div>
        <div class="h-32 rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-sm text-slate-400">
          Placeholder: disponibilidad por género
        </div>
      </div>
    </Card>
  </div>

  <div v-if="moviesLoading || clientsLoading" class="sr-only">Cargando métricas</div>
</template>

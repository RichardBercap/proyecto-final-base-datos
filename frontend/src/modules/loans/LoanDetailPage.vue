<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import LoanStatusBadge from '@/components/loans/LoanStatusBadge.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import { useLoansStore } from '@/stores/loans.store'
import { useUiStore } from '@/stores/ui.store'
import { formatCurrency, formatDate } from '@/utils/format'

const route = useRoute()
const loansStore = useLoansStore()
const uiStore = useUiStore()

onMounted(() => loansStore.fetchLoan(String(route.params.id)))

const returnLoan = async () => {
  if (!loansStore.selectedLoan) return
  await loansStore.returnLoan(loansStore.selectedLoan.prestamo_id)
  uiStore.notify({ title: 'Préstamo devuelto', variant: 'success' })
}
</script>

<template>
  <PageHeader title="Detalle de préstamo" description="Resumen, factura y películas incluidas.">
    <template #actions>
      <Button v-if="loansStore.selectedLoan?.estado === 'activo'" variant="secondary" @click="returnLoan">
        Devolver préstamo
      </Button>
    </template>
  </PageHeader>

  <div v-if="loansStore.selectedLoan" class="grid gap-6 xl:grid-cols-[1fr_0.75fr]">
    <Card class="p-5">
      <div class="flex items-start justify-between gap-4">
        <div>
          <h2 class="text-3xl font-black text-white">{{ loansStore.selectedLoan.prestamo_id }}</h2>
          <p class="mt-2 text-slate-400">{{ loansStore.selectedLoan.cliente.nombre_completo }}</p>
        </div>
        <LoanStatusBadge :status="loansStore.selectedLoan.estado" />
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-3">
        <div class="rounded-xl bg-white/5 p-4">
          <p class="text-sm text-slate-400">Préstamo</p>
          <p class="font-semibold text-white">{{ formatDate(loansStore.selectedLoan.fecha_prestamo) }}</p>
        </div>
        <div class="rounded-xl bg-white/5 p-4">
          <p class="text-sm text-slate-400">Devolución prevista</p>
          <p class="font-semibold text-white">{{ formatDate(loansStore.selectedLoan.fecha_devolucion_prevista) }}</p>
        </div>
        <div class="rounded-xl bg-white/5 p-4">
          <p class="text-sm text-slate-400">Total</p>
          <p class="text-xl font-black text-secondary">{{ formatCurrency(loansStore.selectedLoan.total_bs) }}</p>
        </div>
      </div>

      <div class="mt-6 overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead class="text-slate-400">
            <tr>
              <th class="py-3">Película</th>
              <th>Copia</th>
              <th>Tarifa</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in loansStore.selectedLoan.items" :key="item.copia_id" class="border-t border-white/10">
              <td class="py-3 font-semibold text-white">{{ item.titulo }}</td>
              <td>{{ item.codigo_interno }}</td>
              <td>{{ formatCurrency(item.tarifa_bs) }}</td>
              <td>{{ item.estado }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>

    <Card class="p-5">
      <h3 class="text-xl font-bold text-white">Factura</h3>
      <div class="mt-5 space-y-3 text-sm">
        <p><span class="text-slate-400">Número:</span> {{ loansStore.selectedLoan.factura.numero }}</p>
        <p><span class="text-slate-400">NIT/CI:</span> {{ loansStore.selectedLoan.factura.nit_ci }}</p>
        <p><span class="text-slate-400">Razón social:</span> {{ loansStore.selectedLoan.factura.razon_social }}</p>
        <p><span class="text-slate-400">Subtotal:</span> {{ formatCurrency(loansStore.selectedLoan.subtotal_bs) }}</p>
        <p><span class="text-slate-400">Descuento:</span> {{ loansStore.selectedLoan.descuento_porcentaje }}%</p>
        <p class="text-lg font-black text-secondary">Total {{ formatCurrency(loansStore.selectedLoan.total_bs) }}</p>
      </div>
    </Card>
  </div>
</template>

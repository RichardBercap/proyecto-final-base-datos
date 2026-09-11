<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { PlusIcon } from '@heroicons/vue/24/outline'
import ClientStatusBadge from '@/components/clients/ClientStatusBadge.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import { useClientsStore } from '@/stores/clients.store'
import { formatDate } from '@/utils/format'
import { paginate, totalPages } from '@/utils/pagination'

const router = useRouter()
const clientsStore = useClientsStore()
const query = ref('')
const page = ref(1)
const pageSize = 10

const filteredClients = computed(() => {
  const search = query.value.toLowerCase()
  return clientsStore.clients.filter((client) =>
    [client.nombre_completo, client.correo_electronico, client.telefono_celular, client.estado]
      .join(' ')
      .toLowerCase()
      .includes(search)
  )
})

const visibleClients = computed(() => paginate(filteredClients.value, page.value, pageSize))
const pages = computed(() => totalPages(filteredClients.value.length, pageSize))

onMounted(clientsStore.fetchClients)
</script>

<template>
  <PageHeader title="Clients" description="Administración de clientes, estados, datos de contacto e historial.">
    <template #actions>
      <RouterLink to="/clients/new">
        <Button variant="secondary"><PlusIcon class="h-5 w-5" />Nuevo cliente</Button>
      </RouterLink>
    </template>
  </PageHeader>

  <Card class="mb-5 p-4">
    <Input v-model="query" placeholder="Buscar cliente por nombre, correo, teléfono o estado" />
  </Card>
  <ErrorAlert :message="clientsStore.error" />

  <Card v-if="visibleClients.length" class="overflow-hidden">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="bg-white/5 text-slate-400">
          <tr>
            <th class="px-4 py-3">Cliente</th>
            <th>Contacto</th>
            <th>Zona</th>
            <th>Registro</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="client in visibleClients"
            :key="client.cliente_id"
            class="cursor-pointer border-t border-white/10 transition hover:bg-white/5"
            @click="router.push(`/clients/${client.cliente_id}`)"
          >
            <td class="px-4 py-4 font-semibold text-white">{{ client.nombre_completo }}</td>
            <td class="text-slate-300">{{ client.correo_electronico }}</td>
            <td class="text-slate-300">{{ client.direccion.zona }}</td>
            <td class="text-slate-400">{{ formatDate(client.fecha_registro) }}</td>
            <td><ClientStatusBadge :status="client.estado" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </Card>
  <EmptyState
    v-else
    title="Sin clientes"
    description="No hay clientes registrados o no coinciden con la búsqueda."
    action-label="Crear cliente"
    @action="router.push('/clients/new')"
  />

  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-slate-400">Página {{ page }} de {{ pages }}</p>
    <div class="flex gap-2">
      <Button variant="ghost" :disabled="page === 1" @click="page--">Anterior</Button>
      <Button variant="ghost" :disabled="page === pages" @click="page++">Siguiente</Button>
    </div>
  </div>
</template>

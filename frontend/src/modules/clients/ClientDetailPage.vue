<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ClientStatusBadge from '@/components/clients/ClientStatusBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Label from '@/components/ui/label/Label.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { useClientsStore } from '@/stores/clients.store'
import { useUiStore } from '@/stores/ui.store'
import { formatDate } from '@/utils/format'

const route = useRoute()
const clientsStore = useClientsStore()
const uiStore = useUiStore()
const blockDialogOpen = ref(false)
const blockForm = reactive({
  razon: 'mora',
  detalle: ''
})

onMounted(() => clientsStore.fetchClient(String(route.params.id)))

const block = async () => {
  if (!clientsStore.selectedClient) return
  await clientsStore.blockClient(
    clientsStore.selectedClient.cliente_id,
    blockForm.razon,
    blockForm.detalle || 'Cliente bloqueado desde la interfaz administrativa'
  )
  blockDialogOpen.value = false
  uiStore.notify({ title: 'Cliente bloqueado', variant: 'info' })
}

const unblock = async () => {
  try {
    await clientsStore.unblockClientPlaceholder()
  } catch (error) {
    uiStore.notify({
      title: 'Acción pendiente',
      description: error instanceof Error ? error.message : 'Endpoint no disponible',
      variant: 'error'
    })
  }
}
</script>

<template>
  <PageHeader title="Detalle de cliente" description="Perfil, estado e historial del cliente.">
    <template #actions>
      <RouterLink v-if="clientsStore.selectedClient" :to="`/clients/${clientsStore.selectedClient.cliente_id}/edit`">
        <Button variant="ghost">Editar</Button>
      </RouterLink>
      <Button v-if="clientsStore.selectedClient?.estado !== 'bloqueado'" variant="danger" @click="blockDialogOpen = true">Bloquear</Button>
      <Button v-else variant="secondary" @click="unblock">Desbloquear</Button>
    </template>
  </PageHeader>

  <div v-if="clientsStore.selectedClient" class="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
    <Card class="p-5">
      <div class="flex items-start justify-between">
        <div>
          <h2 class="text-3xl font-black text-white">{{ clientsStore.selectedClient.nombre_completo }}</h2>
          <p class="mt-2 text-slate-400">{{ clientsStore.selectedClient.correo_electronico }}</p>
        </div>
        <ClientStatusBadge :status="clientsStore.selectedClient.estado" />
      </div>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <p><span class="text-slate-400">Celular:</span> {{ clientsStore.selectedClient.telefono_celular }}</p>
        <p><span class="text-slate-400">Nacimiento:</span> {{ formatDate(clientsStore.selectedClient.fecha_nacimiento) }}</p>
        <p><span class="text-slate-400">Ciudad:</span> {{ clientsStore.selectedClient.direccion.ciudad }}</p>
        <p><span class="text-slate-400">Zona:</span> {{ clientsStore.selectedClient.direccion.zona }}</p>
      </div>
      <p class="mt-5 text-slate-300">{{ clientsStore.selectedClient.direccion.texto }}</p>
    </Card>

    <Card class="p-5">
      <h3 class="text-xl font-bold text-white">Historial</h3>
      <div class="mt-4 space-y-3">
        <div v-if="clientsStore.selectedClient.bloqueo_actual" class="rounded-xl bg-red-500/10 p-4 text-sm text-red-100">
          {{ clientsStore.selectedClient.bloqueo_actual.detalle }}
        </div>
        <div
          v-for="blockItem in clientsStore.selectedClient.historial_bloqueos"
          :key="`${blockItem.fecha_bloqueo}-${blockItem.razon}`"
          class="rounded-xl bg-white/5 p-4 text-sm text-slate-300"
        >
          {{ blockItem.razon }} · {{ blockItem.detalle }}
        </div>
        <p v-if="clientsStore.selectedClient.historial_bloqueos.length === 0" class="text-sm text-slate-400">
          Sin eventos históricos registrados.
        </p>
      </div>
    </Card>
  </div>

  <div v-if="blockDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
    <Card class="w-full max-w-lg p-5">
      <h3 class="text-xl font-bold text-white">Bloquear cliente</h3>
      <p class="mt-2 text-sm text-slate-400">{{ clientsStore.selectedClient?.nombre_completo }}</p>
      <div class="mt-5 space-y-4">
        <div>
          <Label>Razón</Label>
          <select v-model="blockForm.razon" class="focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
            <option value="mora">Mora</option>
            <option value="no_devolucion">No devolución</option>
            <option value="danio_material">Daño de material</option>
            <option value="bloqueo_manual">Otra razón</option>
          </select>
        </div>
        <div>
          <Label>Detalle</Label>
          <Textarea v-model="blockForm.detalle" placeholder="Describe por qué se bloquea al cliente" />
        </div>
      </div>
      <div class="mt-5 flex justify-end gap-3">
        <Button variant="ghost" @click="blockDialogOpen = false">Cancelar</Button>
        <Button variant="danger" @click="block">Confirmar bloqueo</Button>
      </div>
    </Card>
  </div>
</template>

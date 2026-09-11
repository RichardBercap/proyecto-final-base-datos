<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { useClientsStore } from '@/stores/clients.store'
import { useUiStore } from '@/stores/ui.store'
import type { ClientPayload } from '@/types/client'

const route = useRoute()
const router = useRouter()
const clientsStore = useClientsStore()
const uiStore = useUiStore()
const clientId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(clientId.value))

const form = reactive<ClientPayload>({
  cliente_id: '',
  nombre_completo: '',
  telefono_celular: '',
  correo_electronico: '',
  fecha_nacimiento: '',
  estado: 'activo',
  direccion: {
    texto: '',
    ciudad: 'La Paz',
    zona: '',
    ubicacion: {
      lat: -16.5,
      lon: -68.15
    }
  }
})

onMounted(async () => {
  if (!isEdit.value) return
  await clientsStore.fetchClient(clientId.value)
  if (clientsStore.selectedClient) Object.assign(form, clientsStore.selectedClient)
})

const submit = async () => {
  await clientsStore.saveClient(
    {
      nombre_completo: form.nombre_completo,
      telefono_celular: form.telefono_celular,
      correo_electronico: form.correo_electronico,
      fecha_nacimiento: form.fecha_nacimiento,
      estado: form.estado,
      direccion: {
        texto: form.direccion.texto,
        ciudad: form.direccion.ciudad,
        zona: form.direccion.zona,
        ubicacion: {
          lat: Number(form.direccion.ubicacion.lat),
          lon: Number(form.direccion.ubicacion.lon)
        }
      }
    },
    isEdit.value ? clientId.value : undefined
  )
  uiStore.notify({ title: 'Cliente guardado', variant: 'success' })
  await router.push('/clients')
}
</script>

<template>
  <PageHeader :title="isEdit ? 'Editar cliente' : 'Nuevo cliente'" description="Datos personales, ubicación y estado operativo del cliente." />

  <form class="grid gap-5 xl:grid-cols-[1fr_0.8fr]" @submit.prevent="submit">
    <Card class="grid gap-4 p-5 md:grid-cols-2">
      <div>
        <Label>Nombre completo</Label>
        <Input v-model="form.nombre_completo" required />
      </div>
      <div>
        <Label>Celular</Label>
        <Input v-model="form.telefono_celular" required />
      </div>
      <div>
        <Label>Correo</Label>
        <Input v-model="form.correo_electronico" type="email" required />
      </div>
      <div>
        <Label>Fecha nacimiento</Label>
        <Input v-model="form.fecha_nacimiento" type="date" required />
      </div>
      <div>
        <Label>Estado</Label>
        <select v-model="form.estado" class="focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
          <option value="activo">activo</option>
          <option value="bloqueado">bloqueado</option>
          <option value="inactivo">inactivo</option>
        </select>
      </div>
    </Card>

    <Card class="space-y-4 p-5">
      <div>
        <Label>Dirección</Label>
        <Textarea v-model="form.direccion.texto" />
      </div>
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Ciudad</Label>
          <Input v-model="form.direccion.ciudad" />
        </div>
        <div>
          <Label>Zona</Label>
          <Input v-model="form.direccion.zona" />
        </div>
        <div>
          <Label>Latitud</Label>
          <Input v-model="form.direccion.ubicacion.lat" type="number" />
        </div>
        <div>
          <Label>Longitud</Label>
          <Input v-model="form.direccion.ubicacion.lon" type="number" />
        </div>
      </div>
      <div class="flex justify-end gap-3">
        <Button variant="ghost" @click="router.back()">Cancelar</Button>
        <Button variant="secondary" type="submit">Guardar</Button>
      </div>
    </Card>
  </form>
</template>

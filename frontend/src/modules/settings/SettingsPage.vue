<script setup lang="ts">
import { computed, onMounted, reactive, watchEffect } from 'vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useSettingsStore } from '@/stores/settings.store'
import { useUiStore } from '@/stores/ui.store'
import type { SettingsPayload } from '@/types/settings'
import { formatDate } from '@/utils/format'

const settingsStore = useSettingsStore()
const uiStore = useUiStore()

const form = reactive<SettingsPayload>({
  configuracion_id: 'CFG-001',
  version: 1,
  activa: true,
  vigente_desde: new Date().toISOString(),
  moneda: 'BOB',
  maximo_dias_prestamo: 5,
  generos: [
    'Accion',
    'Aventura',
    'Animacion',
    'Ciencia ficcion',
    'Comedia',
    'Crimen',
    'Documental',
    'Drama',
    'Fantasia',
    'Terror',
    'Romance',
    'Suspenso'
  ],
  tarifas: [
    { dias: 1, costo_bs: 2 },
    { dias: 2, costo_bs: 3 },
    { dias: 3, costo_bs: 4 },
    { dias: 4, costo_bs: 5 },
    { dias: 5, costo_bs: 6 }
  ],
  descuentos: [
    { cantidad_minima: 1, cantidad_maxima: 2, porcentaje: 0 },
    { cantidad_minima: 3, cantidad_maxima: 5, porcentaje: 5 },
    { cantidad_minima: 6, porcentaje: 10 }
  ]
})

onMounted(settingsStore.fetchActiveSettings)

const genresText = computed({
  get: () => form.generos.join(', '),
  set: (value: string) => {
    form.generos = value.split(',').map((item) => item.trim()).filter(Boolean)
  }
})

watchEffect(() => {
  if (settingsStore.activeSettings) {
    Object.assign(form, {
      ...settingsStore.activeSettings,
      version: settingsStore.activeSettings.version + 1
    })
  }
})

const submit = async () => {
  await settingsStore.saveSettings({
    activa: form.activa,
    vigente_desde: form.vigente_desde,
    moneda: form.moneda,
    version: Number(form.version),
    maximo_dias_prestamo: Number(form.maximo_dias_prestamo),
    generos: form.generos,
    tarifas: form.tarifas.map((rate) => ({
      dias: Number(rate.dias),
      costo_bs: Number(rate.costo_bs)
    })),
    descuentos: form.descuentos.map((rule) => ({
      cantidad_minima: Number(rule.cantidad_minima),
      cantidad_maxima:
        rule.cantidad_maxima === undefined || Number.isNaN(Number(rule.cantidad_maxima))
          ? undefined
          : Number(rule.cantidad_maxima),
      porcentaje: Number(rule.porcentaje)
    }))
  })
  uiStore.notify({ title: 'Configuración guardada', variant: 'success' })
}
</script>

<template>
  <PageHeader title="Settings" description="Precios, descuentos, duración máxima y configuración activa del negocio." />

  <div class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
    <Card class="p-5">
      <h2 class="text-xl font-bold text-white">Configuración activa</h2>
      <div v-if="settingsStore.activeSettings" class="mt-5 space-y-3 text-sm">
        <p><span class="text-slate-400">ID:</span> {{ settingsStore.activeSettings.configuracion_id }}</p>
        <p><span class="text-slate-400">Versión:</span> {{ settingsStore.activeSettings.version }}</p>
        <p><span class="text-slate-400">Moneda:</span> {{ settingsStore.activeSettings.moneda }}</p>
        <p><span class="text-slate-400">Vigente desde:</span> {{ formatDate(settingsStore.activeSettings.vigente_desde) }}</p>
      </div>
    </Card>

    <Card class="space-y-5 p-5">
      <div class="grid gap-4 md:grid-cols-2">
        <div>
          <Label>Nueva versión</Label>
          <Input v-model="form.version" type="number" />
        </div>
        <div>
          <Label>Máximo días</Label>
          <Input v-model="form.maximo_dias_prestamo" type="number" />
        </div>
      </div>

      <div>
        <Label>Géneros</Label>
        <Input v-model="genresText" placeholder="Drama, Comedia, Suspenso" />
      </div>

      <div>
        <h3 class="mb-3 text-lg font-bold text-white">Tarifas</h3>
        <div class="grid gap-3 md:grid-cols-2">
          <div v-for="rate in form.tarifas" :key="rate.dias" class="grid grid-cols-2 gap-3 rounded-xl bg-white/5 p-3">
            <Input v-model="rate.dias" type="number" />
            <Input v-model="rate.costo_bs" type="number" />
          </div>
        </div>
      </div>

      <div>
        <h3 class="mb-3 text-lg font-bold text-white">Descuentos</h3>
        <div class="grid gap-3">
          <div v-for="rule in form.descuentos" :key="rule.cantidad_minima" class="grid gap-3 rounded-xl bg-white/5 p-3 md:grid-cols-3">
            <Input v-model="rule.cantidad_minima" type="number" />
            <Input v-model="rule.cantidad_maxima" type="number" placeholder="Máximo opcional" />
            <Input v-model="rule.porcentaje" type="number" />
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <Button variant="secondary" @click="submit">Guardar nueva versión</Button>
      </div>
    </Card>
  </div>
</template>

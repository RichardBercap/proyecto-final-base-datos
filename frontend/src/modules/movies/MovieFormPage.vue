<script setup lang="ts">
import { computed, onMounted, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { useMoviesStore } from '@/stores/movies.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useUiStore } from '@/stores/ui.store'
import type { MoviePayload } from '@/types/movie'

const route = useRoute()
const router = useRouter()
const moviesStore = useMoviesStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()
const movieId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(movieId.value))
const defaultGenres = [
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
]

const schema = toTypedSchema(
  z.object({
    titulo: z.string().min(2),
    genero: z.string().min(2),
    anio_publicacion: z.number().int().min(1888),
    duracion_minutos: z.number().int().min(1),
    costo_unitario_bs: z.number().min(0),
    unidades_adquiridas: z.number().int().min(0)
  })
)

useForm({ validationSchema: schema })

const form = reactive<MoviePayload>({
  pelicula_id: '',
  poster_url: '',
  titulo: '',
  titulos_alternativos: [],
  duracion_minutos: 120,
  genero: '',
  anio_publicacion: new Date().getFullYear(),
  oscars: {
    nominaciones: [],
    ganados: [],
    cantidad_nominaciones: 0,
    cantidad_ganados: 0
  },
  actores_principales: [],
  costo_unitario_bs: 0,
  unidades_adquiridas: 1
})

const alternatives = computed({
  get: () => form.titulos_alternativos.join(', '),
  set: (value: string) => {
    form.titulos_alternativos = value.split(',').map((item) => item.trim()).filter(Boolean)
  }
})

const actors = computed({
  get: () => form.actores_principales.join(', '),
  set: (value: string) => {
    form.actores_principales = value.split(',').map((item) => item.trim()).filter(Boolean)
  }
})

const nominations = computed({
  get: () => form.oscars.nominaciones.join(', '),
  set: (value: string) => {
    form.oscars.nominaciones = value.split(',').map((item) => item.trim()).filter(Boolean)
    form.oscars.cantidad_nominaciones = form.oscars.nominaciones.length
  }
})

const wins = computed({
  get: () => form.oscars.ganados.join(', '),
  set: (value: string) => {
    form.oscars.ganados = value.split(',').map((item) => item.trim()).filter(Boolean)
    form.oscars.cantidad_ganados = form.oscars.ganados.length
  }
})

const configuredGenres = computed(() => {
  const genres = settingsStore.activeSettings?.generos?.length ? settingsStore.activeSettings.generos : defaultGenres
  const currentGenre = form.genero.trim()
  return currentGenre && !genres.includes(currentGenre) ? [currentGenre, ...genres] : genres
})

onMounted(async () => {
  await settingsStore.fetchActiveSettings()
  if (!isEdit.value) return
  await moviesStore.fetchMovie(movieId.value)
  if (moviesStore.selectedMovie) Object.assign(form, moviesStore.selectedMovie)
})

const submit = async () => {
  const id = isEdit.value ? movieId.value : undefined
  const posterUrl = form.poster_url?.trim()
  await moviesStore.saveMovie(
    {
      titulo: form.titulo,
      ...(posterUrl ? { poster_url: posterUrl } : {}),
      titulos_alternativos: form.titulos_alternativos,
      genero: form.genero,
      anio_publicacion: Number(form.anio_publicacion),
      duracion_minutos: Number(form.duracion_minutos),
      oscars: form.oscars,
      actores_principales: form.actores_principales,
      costo_unitario_bs: Number(form.costo_unitario_bs),
      unidades_adquiridas: Number(form.unidades_adquiridas)
    },
    id
  )
  uiStore.notify({ title: 'Película guardada', variant: 'success' })
  await router.push('/movies')
}
</script>

<template>
  <PageHeader
    :title="isEdit ? 'Editar película' : 'Nueva película'"
    description="Registra la ficha de catálogo que usa Elasticsearch para búsqueda e inventario."
  />

  <ErrorAlert :message="moviesStore.error" />

  <form class="mt-5 grid gap-5 xl:grid-cols-[1fr_0.7fr]" @submit.prevent="submit">
    <Card class="grid gap-4 p-5 md:grid-cols-2">
      <div class="md:col-span-2">
        <Label>Título</Label>
        <Input v-model="form.titulo" required />
      </div>
      <div class="md:col-span-2">
        <Label>URL de portada</Label>
        <Input v-model="form.poster_url" type="url" placeholder="https://..." />
      </div>
      <div>
        <Label>Género</Label>
        <select v-model="form.genero" required class="focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950/80 px-3 text-sm text-slate-100">
          <option disabled value="">Seleccionar género</option>
          <option v-for="item in configuredGenres" :key="item" :value="item">{{ item }}</option>
        </select>
      </div>
      <div>
        <Label>Año</Label>
        <Input v-model="form.anio_publicacion" type="number" required />
      </div>
      <div>
        <Label>Duración minutos</Label>
        <Input v-model="form.duracion_minutos" type="number" required />
      </div>
      <div>
        <Label>Costo unitario Bs</Label>
        <Input v-model="form.costo_unitario_bs" type="number" required />
      </div>
      <div>
        <Label>Unidades adquiridas</Label>
        <Input v-model="form.unidades_adquiridas" type="number" required />
      </div>
      <div class="md:col-span-2">
        <Label>Actores principales</Label>
        <Textarea v-model="actors" placeholder="Separados por coma" />
      </div>
    </Card>

    <Card class="space-y-4 p-5">
      <div>
        <Label>Títulos alternativos</Label>
        <Textarea v-model="alternatives" placeholder="Separados por coma" />
      </div>
      <div>
        <Label>Nominaciones Oscar</Label>
        <Textarea v-model="nominations" placeholder="Separadas por coma" />
      </div>
      <div>
        <Label>Oscars ganados</Label>
        <Textarea v-model="wins" placeholder="Separados por coma" />
      </div>
      <div class="flex justify-end gap-3">
        <Button variant="ghost" @click="router.back()">Cancelar</Button>
        <Button variant="secondary" type="submit" :disabled="moviesStore.loading">Guardar</Button>
      </div>
    </Card>
  </form>
</template>

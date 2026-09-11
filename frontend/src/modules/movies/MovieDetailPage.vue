<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import MoviePoster from '@/components/movies/MoviePoster.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'
import { useMoviesStore } from '@/stores/movies.store'
import { useUiStore } from '@/stores/ui.store'
import { formatCurrency, formatDate } from '@/utils/format'

const route = useRoute()
const moviesStore = useMoviesStore()
const uiStore = useUiStore()
const movieId = computed(() => String(route.params.id))

const copyForm = reactive({
  copia_id: '',
  codigo_interno: '',
  fecha_adquisicion: new Date().toISOString().slice(0, 10),
  costo_adquisicion_bs: 0,
  estado: 'disponible' as const
})

const retireDialogOpen = ref(false)
const copyToRetire = ref('')
const retireForm = reactive({
  razon: 'no_devuelto',
  detalle: ''
})

onMounted(async () => {
  await Promise.all([moviesStore.fetchMovie(movieId.value), moviesStore.fetchCopies()])
})

const movieCopies = computed(() =>
  moviesStore.copies.filter((copy) => copy.pelicula_id === moviesStore.selectedMovie?.pelicula_id)
)

const addCopy = async () => {
  const movie = moviesStore.selectedMovie
  if (!movie) return

  await moviesStore.createCopy({
    codigo_interno: copyForm.codigo_interno,
    pelicula_id: movie.pelicula_id,
    pelicula: {
      titulo: movie.titulo,
      genero: movie.genero
    },
    fecha_adquisicion: copyForm.fecha_adquisicion,
    costo_adquisicion_bs: Number(copyForm.costo_adquisicion_bs),
    estado: copyForm.estado
  })
  uiStore.notify({ title: 'Copia registrada', variant: 'success' })
}

const openRetireDialog = (id: string) => {
  copyToRetire.value = id
  retireForm.razon = 'no_devuelto'
  retireForm.detalle = ''
  retireDialogOpen.value = true
}

const retire = async () => {
  if (!copyToRetire.value) return

  await moviesStore.retireCopy(
    copyToRetire.value,
    retireForm.razon,
    retireForm.detalle || 'Baja registrada desde la interfaz administrativa'
  )
  retireDialogOpen.value = false
  uiStore.notify({ title: 'Copia dada de baja', variant: 'info' })
}
</script>

<template>
  <PageHeader title="Detalle de película" description="Ficha completa, estado de inventario y gestión de copias.">
    <template #actions>
      <RouterLink v-if="moviesStore.selectedMovie" :to="`/movies/${moviesStore.selectedMovie.pelicula_id}/edit`">
        <Button variant="secondary">Editar</Button>
      </RouterLink>
    </template>
  </PageHeader>

  <ErrorAlert :message="moviesStore.error" />

  <div v-if="moviesStore.selectedMovie" class="mt-5 grid gap-6 xl:grid-cols-[22rem_1fr]">
    <MoviePoster
      :title="moviesStore.selectedMovie.titulo"
      :genre="moviesStore.selectedMovie.genero"
      :poster-url="moviesStore.selectedMovie.poster_url"
    />

    <div class="space-y-6">
      <Card class="p-5">
        <div class="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 class="text-3xl font-black text-white">{{ moviesStore.selectedMovie.titulo }}</h2>
            <p class="mt-2 text-slate-400">
              {{ moviesStore.selectedMovie.anio_publicacion }} · {{ moviesStore.selectedMovie.duracion_minutos }} minutos
            </p>
          </div>
          <Badge>{{ moviesStore.selectedMovie.genero }}</Badge>
        </div>
        <div class="mt-5 grid gap-4 sm:grid-cols-3">
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-400">Costo</p>
            <p class="text-xl font-bold text-secondary">{{ formatCurrency(moviesStore.selectedMovie.costo_unitario_bs) }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-400">Oscars</p>
            <p class="text-xl font-bold text-white">{{ moviesStore.selectedMovie.oscars.cantidad_ganados }}</p>
          </div>
          <div class="rounded-xl bg-white/5 p-4">
            <p class="text-sm text-slate-400">Actualizada</p>
            <p class="text-sm font-semibold text-white">{{ formatDate(moviesStore.selectedMovie.fecha_actualizacion) }}</p>
          </div>
        </div>
        <p class="mt-5 text-sm text-slate-300">{{ moviesStore.selectedMovie.actores_principales.join(', ') }}</p>
      </Card>

      <Card class="p-5">
        <h3 class="text-xl font-bold text-white">Inventario</h3>
        <div class="mt-4 overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="text-slate-400">
              <tr>
                <th class="py-3">Código</th>
                <th>Estado</th>
                <th>Adquisición</th>
                <th class="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="copy in movieCopies" :key="copy.copia_id" class="border-t border-white/10">
                <td class="py-3 font-semibold text-white">{{ copy.codigo_interno }}</td>
                <td>{{ copy.estado }}</td>
                <td>{{ formatDate(copy.fecha_adquisicion) }}</td>
                <td class="text-right">
                  <Button v-if="copy.estado !== 'baja'" variant="danger" size="sm" @click="openRetireDialog(copy.copia_id)">Baja</Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card class="grid gap-4 p-5 md:grid-cols-2">
        <h3 class="md:col-span-2 text-xl font-bold text-white">Registrar nueva copia</h3>
        <div>
          <Label>Código interno</Label>
          <Input v-model="copyForm.codigo_interno" required />
        </div>
        <div>
          <Label>Fecha adquisición</Label>
          <Input v-model="copyForm.fecha_adquisicion" type="date" />
        </div>
        <div>
          <Label>Costo Bs</Label>
          <Input v-model="copyForm.costo_adquisicion_bs" type="number" />
        </div>
        <div class="md:col-span-2 flex justify-end">
          <Button variant="secondary" @click="addCopy">Registrar copia</Button>
        </div>
      </Card>
    </div>
  </div>

  <div v-if="retireDialogOpen" class="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4">
    <Card class="w-full max-w-lg p-5">
      <h3 class="text-xl font-bold text-white">Registrar baja de copia</h3>
      <p class="mt-2 text-sm text-slate-400">Copia: {{ copyToRetire }}</p>
      <div class="mt-5 space-y-4">
        <div>
          <Label>Razón</Label>
          <select v-model="retireForm.razon" class="focus-ring h-11 w-full rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
            <option value="no_devuelto">No devuelto</option>
            <option value="robo">Robo</option>
            <option value="danio">Daño</option>
            <option value="perdida">Pérdida</option>
            <option value="baja_manual">Otra razón</option>
          </select>
        </div>
        <div>
          <Label>Detalle</Label>
          <Textarea v-model="retireForm.detalle" placeholder="Describe el motivo de la baja" />
        </div>
      </div>
      <div class="mt-5 flex justify-end gap-3">
        <Button variant="ghost" @click="retireDialogOpen = false">Cancelar</Button>
        <Button variant="danger" @click="retire">Confirmar baja</Button>
      </div>
    </Card>
  </div>
</template>

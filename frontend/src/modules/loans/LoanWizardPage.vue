<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import ClientStatusBadge from '@/components/clients/ClientStatusBadge.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Label from '@/components/ui/label/Label.vue'
import { useClientsStore } from '@/stores/clients.store'
import { useLoansStore } from '@/stores/loans.store'
import { useMoviesStore } from '@/stores/movies.store'
import { useSettingsStore } from '@/stores/settings.store'
import { useUiStore } from '@/stores/ui.store'
import type { Client } from '@/types/client'
import type { Copy } from '@/types/copy'
import { formatCurrency, formatDate } from '@/utils/format'

const router = useRouter()
const clientsStore = useClientsStore()
const moviesStore = useMoviesStore()
const loansStore = useLoansStore()
const settingsStore = useSettingsStore()
const uiStore = useUiStore()

const step = ref(1)
const clientQuery = ref('')
const movieQuery = ref('')
const selectedClient = ref<Client | null>(null)
const selectedCopies = ref<Copy[]>([])

const form = reactive({
  duracion_dias: 3,
  nit_ci: '',
  razon_social: ''
})

const filteredClients = computed(() => {
  const query = clientQuery.value.toLowerCase()
  return clientsStore.clients.filter((client) =>
    [client.nombre_completo, client.cliente_id, client.telefono_celular].join(' ').toLowerCase().includes(query)
  )
})

const filteredMovies = computed(() => {
  const query = movieQuery.value.toLowerCase()
  return moviesStore.movies.filter((movie) =>
    [movie.titulo, movie.genero, movie.actores_principales.join(' ')].join(' ').toLowerCase().includes(query)
  )
})

const availableCopies = computed(() => moviesStore.copies.filter((copy) => copy.estado === 'disponible'))

const selectedMovieCopies = (movieId: string) =>
  availableCopies.value.filter((copy) => copy.pelicula_id === movieId)

const tariff = computed(() => {
  const settings = settingsStore.activeSettings
  if (!settings) return 0
  return settings.tarifas.find((rate) => Number(rate.dias) === Number(form.duracion_dias))?.costo_bs || 0
})

const discountPercentage = computed(() => {
  const settings = settingsStore.activeSettings
  if (!settings) return 0
  const count = selectedCopies.value.length
  const discount = settings.descuentos.find((rule) => {
    const max = rule.cantidad_maxima ?? Number.POSITIVE_INFINITY
    return count >= rule.cantidad_minima && count <= max
  })
  return discount?.porcentaje || 0
})

const subtotal = computed(() => tariff.value * selectedCopies.value.length)
const discountAmount = computed(() => subtotal.value * (discountPercentage.value / 100))
const total = computed(() => subtotal.value - discountAmount.value)
const expectedReturnDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + Number(form.duracion_dias || 0))
  return date.toISOString()
})
const canSubmit = computed(
  () =>
    Boolean(selectedClient.value) &&
    selectedClient.value?.estado === 'activo' &&
    selectedCopies.value.length > 0 &&
    tariff.value > 0
)

onMounted(async () => {
  await Promise.all([
    clientsStore.fetchClients(),
    moviesStore.fetchMovies(),
    moviesStore.fetchCopies(),
    settingsStore.fetchActiveSettings()
  ])
})

watch(movieQuery, async (value) => {
  const query = value.trim()
  if (query.length === 0 || query.length >= 2) {
    await moviesStore.searchMovies(query)
  }
})

const toggleCopy = (copy: Copy) => {
  const exists = selectedCopies.value.some((item) => item.copia_id === copy.copia_id)
  selectedCopies.value = exists
    ? selectedCopies.value.filter((item) => item.copia_id !== copy.copia_id)
    : [...selectedCopies.value, copy]
}

const submit = async () => {
  if (!selectedClient.value || selectedCopies.value.length === 0) return

  const loan = await loansStore.createLoan({
    cliente_id: selectedClient.value.cliente_id,
    copia_ids: selectedCopies.value.map((copy) => copy.copia_id),
    duracion_dias: Number(form.duracion_dias),
    nit_ci: form.nit_ci,
    razon_social: form.razon_social
  })

  uiStore.notify({ title: 'Préstamo creado', description: loan.prestamo_id, variant: 'success' })
  await router.push(`/loans/${loan.prestamo_id}`)
}
</script>

<template>
  <PageHeader title="Nuevo préstamo" description="Wizard de alquiler con cliente, copias, duración, precio y factura." />

  <div class="mb-5 grid gap-2 sm:grid-cols-5">
    <button
      v-for="item in 5"
      :key="item"
      class="focus-ring rounded-xl px-3 py-2 text-sm font-bold transition"
      :class="item === step ? 'bg-secondary text-slate-950' : 'bg-white/5 text-slate-300'"
      @click="step = item"
    >
      Paso {{ item }}
    </button>
  </div>

  <Card class="p-5">
    <section v-if="step === 1" class="space-y-4">
      <h2 class="text-xl font-bold text-white">Buscar cliente</h2>
      <Input v-model="clientQuery" placeholder="Nombre, teléfono o ID" />
      <div class="grid gap-3 md:grid-cols-2">
        <button
          v-for="client in filteredClients"
          :key="client.cliente_id"
          class="focus-ring rounded-xl border border-white/10 p-4 text-left transition hover:border-secondary/50"
          :class="selectedClient?.cliente_id === client.cliente_id && 'border-secondary bg-secondary/10'"
          @click="selectedClient = client"
        >
          <div class="flex items-center justify-between gap-3">
            <p class="font-semibold text-white">{{ client.nombre_completo }}</p>
            <ClientStatusBadge :status="client.estado" />
          </div>
          <p class="mt-1 text-sm text-slate-400">{{ client.telefono_celular }}</p>
        </button>
      </div>
    </section>

    <section v-if="step === 2" class="space-y-4">
      <h2 class="text-xl font-bold text-white">Buscar películas</h2>
      <Input v-model="movieQuery" placeholder="Título, género o actor" />
      <div class="grid gap-3 md:grid-cols-2">
        <button
          v-for="movie in filteredMovies"
          :key="movie.pelicula_id"
          class="focus-ring rounded-xl border border-white/10 p-4 text-left transition hover:border-secondary/50"
          @click="movieQuery = movie.titulo"
        >
          <p class="font-semibold text-white">{{ movie.titulo }}</p>
          <p class="mt-1 text-sm text-slate-400">{{ movie.genero }} · {{ selectedMovieCopies(movie.pelicula_id).length }} disponibles</p>
        </button>
      </div>
    </section>

    <section v-if="step === 3" class="space-y-4">
      <h2 class="text-xl font-bold text-white">Seleccionar copias</h2>
      <div class="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <button
          v-for="copy in availableCopies"
          :key="copy.copia_id"
          class="focus-ring rounded-xl border border-white/10 p-4 text-left transition hover:border-secondary/50"
          :class="selectedCopies.some((item) => item.copia_id === copy.copia_id) && 'border-secondary bg-secondary/10'"
          @click="toggleCopy(copy)"
        >
          <p class="font-semibold text-white">{{ copy.pelicula.titulo }}</p>
          <p class="mt-1 text-sm text-slate-400">{{ copy.codigo_interno }} · {{ copy.copia_id }}</p>
        </button>
      </div>
    </section>

    <section v-if="step === 4" class="grid gap-4 md:grid-cols-3">
      <div>
        <Label>Duración días</Label>
        <Input v-model="form.duracion_dias" type="number" />
      </div>
      <div class="rounded-xl bg-white/5 p-4">
        <p class="text-sm font-semibold text-slate-400">Fecha de devolución prevista</p>
        <p class="mt-2 font-bold text-secondary">{{ formatDate(expectedReturnDate) }}</p>
      </div>
      <div>
        <Label>NIT/CI</Label>
        <Input v-model="form.nit_ci" />
      </div>
      <div>
        <Label>Razón social</Label>
        <Input v-model="form.razon_social" />
      </div>
    </section>

    <section v-if="step === 5" class="grid gap-6 xl:grid-cols-[1fr_0.8fr]">
      <div>
        <h2 class="text-xl font-bold text-white">Resumen</h2>
        <div class="mt-4 space-y-3">
          <p class="text-slate-300">Cliente: {{ selectedClient?.nombre_completo || 'Sin seleccionar' }}</p>
          <p class="text-slate-300">Copias: {{ selectedCopies.length }}</p>
          <p class="text-slate-300">Duración: {{ form.duracion_dias }} días</p>
          <p class="text-slate-300">Devolución prevista: {{ formatDate(expectedReturnDate) }}</p>
        </div>
      </div>
      <div class="rounded-xl bg-white/5 p-5">
        <p class="flex justify-between"><span>Tarifa</span><strong>{{ formatCurrency(tariff) }}</strong></p>
        <p class="mt-2 flex justify-between"><span>Subtotal</span><strong>{{ formatCurrency(subtotal) }}</strong></p>
        <p class="mt-2 flex justify-between"><span>Descuento</span><strong>{{ discountPercentage }}%</strong></p>
        <p class="mt-4 flex justify-between text-xl text-secondary"><span>Total</span><strong>{{ formatCurrency(total) }}</strong></p>
        <Button class="mt-6 w-full" variant="secondary" :disabled="!canSubmit" @click="submit">
          Confirmar préstamo
        </Button>
      </div>
    </section>

    <div class="mt-6 flex justify-between">
      <Button variant="ghost" :disabled="step === 1" @click="step--">Anterior</Button>
      <Button v-if="step < 5" variant="secondary" @click="step++">Siguiente</Button>
    </div>
  </Card>
</template>

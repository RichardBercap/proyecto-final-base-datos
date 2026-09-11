<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { FunnelIcon, PlusIcon } from '@heroicons/vue/24/outline'
import EmptyState from '@/components/common/EmptyState.vue'
import ErrorAlert from '@/components/common/ErrorAlert.vue'
import PageHeader from '@/components/common/PageHeader.vue'
import MovieCard from '@/components/movies/MovieCard.vue'
import Button from '@/components/ui/button/Button.vue'
import Card from '@/components/ui/card/Card.vue'
import Input from '@/components/ui/input/Input.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useDebouncedSearch } from '@/composables/useDebouncedSearch'
import { useMoviesStore } from '@/stores/movies.store'
import { paginate, totalPages } from '@/utils/pagination'

const route = useRoute()
const router = useRouter()
const moviesStore = useMoviesStore()
const { movies, genres, loading, error } = storeToRefs(moviesStore)

const genre = ref('')
const onlyOscar = ref(false)
const actor = ref('')
const page = ref(1)
const pageSize = 8
const sort = ref('titulo')
const { search } = useDebouncedSearch(async (value) => {
  page.value = 1
  await moviesStore.searchMovies(value)
})

const filteredMovies = computed(() => {
  const actorQuery = actor.value.trim().toLowerCase()
  const result = movies.value.filter((movie) => {
    const genreMatch = !genre.value || movie.genero === genre.value
    const oscarMatch = !onlyOscar.value || movie.oscars.cantidad_ganados > 0
    const actorMatch =
      !actorQuery ||
      movie.actores_principales.some((name) => name.toLowerCase().includes(actorQuery))
    return genreMatch && oscarMatch && actorMatch
  })

  return [...result].sort((first, second) => {
    if (sort.value === 'anio') return second.anio_publicacion - first.anio_publicacion
    if (sort.value === 'copias') return second.unidades_adquiridas - first.unidades_adquiridas
    return first.titulo.localeCompare(second.titulo)
  })
})

const visibleMovies = computed(() => paginate(filteredMovies.value, page.value, pageSize))
const pages = computed(() => totalPages(filteredMovies.value.length, pageSize))

onMounted(async () => {
  search.value = String(route.query.q || '')
  await moviesStore.searchMovies(search.value)
})

watch(page, (value) => {
  if (value > pages.value) page.value = pages.value
})
</script>

<template>
  <PageHeader title="Movies" description="Catálogo de películas con búsqueda de servidor, filtros locales e inventario.">
    <template #actions>
      <RouterLink to="/movies/new">
        <Button variant="secondary"><PlusIcon class="h-5 w-5" />Nueva película</Button>
      </RouterLink>
    </template>
  </PageHeader>

  <Card class="mb-6 p-4">
    <div class="grid gap-3 md:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
      <Input v-model="search" placeholder="Buscar en servidor por título, género, actor u Oscar" />
      <select v-model="genre" class="focus-ring h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
        <option value="">Todos los géneros</option>
        <option v-for="item in genres" :key="item" :value="item">{{ item }}</option>
      </select>
      <Input v-model="actor" placeholder="Filtrar actor" />
      <select v-model="sort" class="focus-ring h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
        <option value="titulo">Ordenar por título</option>
        <option value="anio">Más recientes</option>
        <option value="copias">Más copias</option>
      </select>
      <Button :variant="onlyOscar ? 'secondary' : 'ghost'" @click="onlyOscar = !onlyOscar">
        <FunnelIcon class="h-5 w-5" />Oscars
      </Button>
    </div>
  </Card>

  <ErrorAlert :message="error" />

  <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    <Skeleton v-for="item in 8" :key="item" class="h-96" />
  </div>
  <EmptyState
    v-else-if="visibleMovies.length === 0"
    title="Sin películas"
    description="No hay resultados para los filtros actuales."
    action-label="Crear película"
    @action="router.push('/movies/new')"
  />
  <div v-else class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
    <MovieCard v-for="movie in visibleMovies" :key="movie.pelicula_id" :movie="movie" />
  </div>

  <div class="mt-6 flex items-center justify-between">
    <p class="text-sm text-slate-400">Página {{ page }} de {{ pages }} · {{ filteredMovies.length }} resultados</p>
    <div class="flex gap-2">
      <Button variant="ghost" :disabled="page === 1" @click="page--">Anterior</Button>
      <Button variant="ghost" :disabled="page === pages" @click="page++">Siguiente</Button>
    </div>
  </div>
</template>

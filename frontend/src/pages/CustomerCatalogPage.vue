<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { MagnifyingGlassIcon } from '@heroicons/vue/24/outline'
import EmptyState from '@/components/common/EmptyState.vue'
import MoviePoster from '@/components/movies/MoviePoster.vue'
import Badge from '@/components/ui/badge/Badge.vue'
import Button from '@/components/ui/button/Button.vue'
import Input from '@/components/ui/input/Input.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useMoviesStore } from '@/stores/movies.store'

const moviesStore = useMoviesStore()
const query = ref('')
const selectedGenre = ref('')

const genres = computed(() => moviesStore.genres)

const filteredMovies = computed(() => {
  const search = query.value.toLowerCase()

  return moviesStore.movies.filter((movie) => {
    const matchesGenre = !selectedGenre.value || movie.genero === selectedGenre.value
    const matchesSearch = [movie.titulo, movie.genero, movie.actores_principales.join(' ')]
      .join(' ')
      .toLowerCase()
      .includes(search)

    return matchesGenre && matchesSearch
  })
})

const featuredMovie = computed(() => filteredMovies.value[0] || moviesStore.movies[0])

onMounted(moviesStore.fetchMovies)
</script>

<template>
  <main class="movie-gradient min-h-screen text-white">
    <header class="sticky top-0 z-30 border-b border-white/10 bg-slate-950/75 px-4 py-4 backdrop-blur-xl sm:px-8">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <RouterLink to="/catalog" class="flex items-center gap-3">
          <div class="grid h-11 w-11 place-items-center rounded-xl bg-secondary font-black text-slate-950">
            BF
          </div>
          <div>
            <p class="text-lg font-black">Blockflix</p>
            <p class="text-xs font-bold uppercase tracking-[0.16em] text-secondary">Catálogo</p>
          </div>
        </RouterLink>
        <RouterLink to="/dashboard">
          <Button variant="ghost">Administración</Button>
        </RouterLink>
      </div>
    </header>

    <section class="mx-auto max-w-7xl px-4 pb-8 pt-8 sm:px-8 lg:pt-12">
      <div v-if="featuredMovie" class="grid min-h-[28rem] items-end gap-8 lg:grid-cols-[1fr_18rem]">
        <div class="max-w-3xl">
          <p class="text-sm font-black uppercase tracking-[0.24em] text-secondary">Disponible en videoclub</p>
          <h1 class="mt-4 text-5xl font-black leading-tight md:text-7xl">{{ featuredMovie.titulo }}</h1>
          <p class="mt-4 max-w-xl text-base text-slate-300 md:text-lg">
            {{ featuredMovie.genero }} · {{ featuredMovie.anio_publicacion }} ·
            {{ featuredMovie.duracion_minutos }} minutos
          </p>
          <p class="mt-3 text-sm text-slate-400">{{ featuredMovie.actores_principales.join(', ') }}</p>
          <div class="mt-6 flex flex-wrap gap-3">
            <Badge variant="warning">{{ featuredMovie.oscars.cantidad_ganados }} Oscars</Badge>
            <Badge>{{ featuredMovie.unidades_adquiridas }} copias</Badge>
          </div>
        </div>
        <MoviePoster
          :title="featuredMovie.titulo"
          :genre="featuredMovie.genero"
          :poster-url="featuredMovie.poster_url"
          class="hidden lg:block"
        />
      </div>

      <div class="mt-8 grid gap-3 md:grid-cols-[1fr_auto]">
        <div class="relative">
          <MagnifyingGlassIcon class="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
          <Input v-model="query" class="pl-10" placeholder="Buscar película, género o actor" />
        </div>
        <select v-model="selectedGenre" class="focus-ring h-11 rounded-xl border border-white/10 bg-slate-950 px-3 text-sm">
          <option value="">Todos los géneros</option>
          <option v-for="genre in genres" :key="genre" :value="genre">{{ genre }}</option>
        </select>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-12 sm:px-8">
      <h2 class="mb-5 text-2xl font-black">Todas las películas</h2>
      <div v-if="moviesStore.loading" class="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Skeleton v-for="item in 10" :key="item" class="h-80" />
      </div>
      <EmptyState
        v-else-if="filteredMovies.length === 0"
        title="Sin resultados"
        description="No encontramos películas con esos filtros."
      />
      <div v-else class="grid gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <RouterLink
          v-for="movie in filteredMovies"
          :key="movie.pelicula_id"
          :to="`/movies/${movie.pelicula_id}`"
          class="group"
        >
          <MoviePoster :title="movie.titulo" :genre="movie.genero" :poster-url="movie.poster_url" />
          <div class="mt-3">
            <p class="line-clamp-1 font-bold">{{ movie.titulo }}</p>
            <p class="text-sm text-slate-400">{{ movie.genero }} · {{ movie.anio_publicacion }}</p>
          </div>
        </RouterLink>
      </div>
    </section>
  </main>
</template>

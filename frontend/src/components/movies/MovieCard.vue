<script setup lang="ts">
import { RouterLink } from 'vue-router'
import Badge from '@/components/ui/badge/Badge.vue'
import Card from '@/components/ui/card/Card.vue'
import MoviePoster from '@/components/movies/MoviePoster.vue'
import type { Movie } from '@/types/movie'
import { formatCurrency } from '@/utils/format'

defineProps<{
  movie: Movie
}>()
</script>

<template>
  <RouterLink :to="`/movies/${movie.pelicula_id}`">
    <Card class="group h-full overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-secondary/50 hover:shadow-blockbuster">
      <MoviePoster :title="movie.titulo" :genre="movie.genero" :poster-url="movie.poster_url" />
      <div class="p-4">
        <div class="flex items-start justify-between gap-3">
          <div>
            <h3 class="line-clamp-1 font-bold text-white">{{ movie.titulo }}</h3>
            <p class="text-sm text-slate-400">{{ movie.anio_publicacion }} · {{ movie.duracion_minutos }} min</p>
          </div>
          <Badge>{{ movie.genero }}</Badge>
        </div>
        <p class="mt-3 line-clamp-1 text-sm text-slate-400">
          {{ movie.actores_principales.join(', ') }}
        </p>
        <p class="mt-3 text-sm font-semibold text-secondary">
          {{ formatCurrency(movie.costo_unitario_bs) }} · {{ movie.unidades_adquiridas }} copias
        </p>
      </div>
    </Card>
  </RouterLink>
</template>

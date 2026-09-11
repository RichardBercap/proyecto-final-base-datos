import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { moviesService } from '@/services/movies.service'
import type { Copy, CopyPayload } from '@/types/copy'
import type { Movie, MoviePayload } from '@/types/movie'

export const useMoviesStore = defineStore('movies', () => {
  const movies = ref<Movie[]>([])
  const copies = ref<Copy[]>([])
  const selectedMovie = ref<Movie | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const genres = computed(() => [...new Set(movies.value.map((movie) => movie.genero).filter(Boolean))].sort())
  const availableCopies = computed(() => copies.value.filter((copy) => copy.estado === 'disponible'))
  const loanedCopies = computed(() => copies.value.filter((copy) => copy.estado === 'prestada'))

  const run = async <T>(action: () => Promise<T>) => {
    loading.value = true
    error.value = null
    try {
      return await action()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error inesperado'
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchMovies = () =>
    run(async () => {
      movies.value = await moviesService.list()
    })

  const searchMovies = (query: string) =>
    run(async () => {
      movies.value = query.trim() ? await moviesService.search(query) : await moviesService.list()
    })

  const fetchMovie = (id: string) =>
    run(async () => {
      selectedMovie.value = await moviesService.get(id)
    })

  const saveMovie = (payload: MoviePayload, id?: string) =>
    run(async () => {
      const movie = id ? await moviesService.update(id, payload) : await moviesService.create(payload)
      await fetchMovies()
      selectedMovie.value = movie
      return movie
    })

  const fetchCopies = () =>
    run(async () => {
      copies.value = await moviesService.listCopies()
    })

  const fetchAvailableCopies = (movieId?: string) =>
    run(async () => {
      copies.value = await moviesService.listAvailableCopies(movieId)
    })

  const createCopy = (payload: CopyPayload) =>
    run(async () => {
      const copy = await moviesService.createCopy(payload)
      await fetchCopies()
      return copy
    })

  const retireCopy = (id: string, reason: string, detail: string) =>
    run(async () => {
      await moviesService.retireCopy(id, reason, detail)
      await fetchCopies()
    })

  return {
    movies,
    copies,
    selectedMovie,
    loading,
    error,
    genres,
    availableCopies,
    loanedCopies,
    fetchMovies,
    searchMovies,
    fetchMovie,
    saveMovie,
    fetchCopies,
    fetchAvailableCopies,
    createCopy,
    retireCopy
  }
})

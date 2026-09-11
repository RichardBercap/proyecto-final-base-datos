import { http } from '@/api/http'
import type { Copy, CopyPayload } from '@/types/copy'
import type { Movie, MoviePayload } from '@/types/movie'

export const moviesService = {
  async list() {
    const { data } = await http.get<Movie[]>('/peliculas')
    return data
  },
  async search(query: string) {
    const { data } = await http.get<Movie[]>('/peliculas/buscar', { params: { q: query } })
    return data
  },
  async get(id: string) {
    const { data } = await http.get<Movie>(`/peliculas/${id}`)
    return data
  },
  async create(payload: MoviePayload) {
    const { data } = await http.post<Movie>('/peliculas', payload)
    return data
  },
  async update(id: string, payload: Partial<MoviePayload>) {
    const { data } = await http.put<Movie>(`/peliculas/${id}`, payload)
    return data
  },
  async listCopies() {
    const { data } = await http.get<Copy[]>('/copias')
    return data
  },
  async listAvailableCopies(movieId?: string) {
    const { data } = await http.get<Copy[]>('/copias/disponibles', {
      params: movieId ? { pelicula_id: movieId } : undefined
    })
    return data
  },
  async createCopy(payload: CopyPayload) {
    const { data } = await http.post<Copy>('/copias', payload)
    return data
  },
  async retireCopy(id: string, reason: string, detail: string) {
    const { data } = await http.patch<{ message: string; copia_id: string }>(`/copias/${id}/baja`, {
      razon: reason,
      detalle: detail
    })
    return data
  }
}

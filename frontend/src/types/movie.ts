export interface OscarInfo {
  nominaciones: string[]
  ganados: string[]
  cantidad_nominaciones: number
  cantidad_ganados: number
}

export interface Movie {
  id?: string
  pelicula_id: string
  poster_url?: string
  titulo: string
  titulos_alternativos: string[]
  duracion_minutos: number
  genero: string
  anio_publicacion: number
  oscars: OscarInfo
  actores_principales: string[]
  costo_unitario_bs: number
  unidades_adquiridas: number
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export type MoviePayload = Omit<Movie, 'id' | 'pelicula_id' | 'fecha_creacion' | 'fecha_actualizacion'> & {
  pelicula_id?: string
}

export type Genre = string

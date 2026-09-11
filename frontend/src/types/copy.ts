export type CopyStatus = 'disponible' | 'prestada' | 'baja'

export interface MovieSnapshot {
  titulo: string
  genero: string
}

export interface Copy {
  id?: string
  copia_id: string
  codigo_interno: string
  pelicula_id: string
  pelicula: MovieSnapshot
  fecha_adquisicion: string
  costo_adquisicion_bs: number
  estado: CopyStatus
  prestamo_actual_id?: string
  baja?: {
    fecha: string
    razon: string
    detalle: string
  }
  fecha_actualizacion?: string
}

export type CopyPayload = Omit<Copy, 'id' | 'copia_id' | 'baja' | 'fecha_actualizacion' | 'prestamo_actual_id'> & {
  copia_id?: string
}

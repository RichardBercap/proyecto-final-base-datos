export type ClientStatus = 'activo' | 'bloqueado' | 'inactivo'

export interface ClientAddress {
  texto: string
  ciudad: string
  zona: string
  ubicacion: {
    lat: number
    lon: number
  }
}

export interface ClientBlock {
  fecha?: string
  fecha_bloqueo?: string
  fecha_desbloqueo?: string
  razon: string
  detalle: string
}

export interface Client {
  id?: string
  cliente_id: string
  nombre_completo: string
  telefono_celular: string
  correo_electronico: string
  fecha_nacimiento: string
  direccion: ClientAddress
  fecha_registro?: string
  estado: ClientStatus
  bloqueo_actual?: ClientBlock
  historial_bloqueos: ClientBlock[]
  fecha_actualizacion?: string
}

export type ClientPayload = Omit<
  Client,
  | 'id'
  | 'cliente_id'
  | 'fecha_registro'
  | 'bloqueo_actual'
  | 'historial_bloqueos'
  | 'fecha_actualizacion'
> & {
  cliente_id?: string
  historial_bloqueos?: ClientBlock[]
}

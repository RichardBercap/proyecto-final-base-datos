export type LoanStatus = 'activo' | 'devuelto'

export interface LoanItem {
  copia_id: string
  codigo_interno: string
  pelicula_id: string
  titulo: string
  genero: string
  tarifa_bs: number
  fecha_devolucion_real?: string
  estado: 'prestada' | 'devuelta'
}

export interface Invoice {
  numero: string
  fecha_emision: string
  nit_ci: string
  razon_social: string
  importe_total_bs: number
}

export interface Loan {
  id?: string
  prestamo_id: string
  cliente_id: string
  cliente: {
    nombre_completo: string
    telefono_celular: string
    correo_electronico: string
  }
  fecha_prestamo: string
  fecha_devolucion_prevista: string
  fecha_devolucion_real?: string
  duracion_dias: number
  estado: LoanStatus
  configuracion_id: string
  configuracion_version: number
  items: LoanItem[]
  cantidad_peliculas: number
  subtotal_bs: number
  descuento_porcentaje: number
  descuento_bs: number
  total_bs: number
  factura: Invoice
  fecha_creacion?: string
  fecha_actualizacion?: string
}

export interface LoanPayload {
  prestamo_id?: string
  cliente_id: string
  copia_ids: string[]
  duracion_dias: number
  nit_ci?: string
  razon_social?: string
  factura?: Partial<Invoice>
}

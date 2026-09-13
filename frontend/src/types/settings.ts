export interface RateRule {
  dias: number
  costo_bs: number
}

export interface DiscountRule {
  cantidad_minima: number
  cantidad_maxima?: number
  porcentaje: number
}

export interface Settings {
  id?: string
  configuracion_id: string
  version: number
  activa: boolean
  vigente_desde: string
  vigente_hasta?: string
  moneda: string
  maximo_dias_prestamo: number
  generos: string[]
  tarifas: RateRule[]
  descuentos: DiscountRule[]
  fecha_creacion?: string
}

export type SettingsPayload = Omit<Settings, 'id' | 'configuracion_id' | 'fecha_creacion' | 'vigente_hasta'> & {
  configuracion_id?: string
}

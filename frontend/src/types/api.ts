export interface ApiErrorPayload {
  error?: {
    message?: string
    details?: Record<string, unknown>
  }
}

export interface ApiListMeta {
  total: number
  page: number
  pageSize: number
}

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export type SortDirection = 'asc' | 'desc'

export interface SortState {
  field: string
  direction: SortDirection
}

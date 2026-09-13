import { http } from '@/api/http'
import type { Client, ClientPayload } from '@/types/client'

export const clientsService = {
  async list() {
    const { data } = await http.get<Client[]>('/clientes')
    return data
  },
  async get(id: string) {
    const { data } = await http.get<Client>(`/clientes/${id}`)
    return data
  },
  async create(payload: ClientPayload) {
    const { data } = await http.post<Client>('/clientes', payload)
    return data
  },
  async update(id: string, payload: Partial<ClientPayload>) {
    const { data } = await http.put<Client>(`/clientes/${id}`, payload)
    return data
  },
  async block(id: string, reason: string, detail: string) {
    const { data } = await http.patch<Client>(`/clientes/${id}/bloquear`, {
      razon: reason,
      detalle: detail
    })
    return data
  },
  async unblock(id: string) {
    const { data } = await http.patch<Client>(`/clientes/${id}/desbloquear`)
    return data
  }
}

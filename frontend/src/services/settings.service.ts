import { http } from '@/api/http'
import type { Settings, SettingsPayload } from '@/types/settings'

export const settingsService = {
  async getActive() {
    const { data } = await http.get<Settings>('/configuraciones/activa')
    return data
  },
  async create(payload: SettingsPayload) {
    const { data } = await http.post<Settings>('/configuraciones', payload)
    return data
  }
}

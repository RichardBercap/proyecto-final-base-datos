import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsService } from '@/services/settings.service'
import type { Settings, SettingsPayload } from '@/types/settings'

export const useSettingsStore = defineStore('settings', () => {
  const activeSettings = ref<Settings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  const fetchActiveSettings = () =>
    run(async () => {
      activeSettings.value = await settingsService.getActive()
    })

  const saveSettings = (payload: SettingsPayload) =>
    run(async () => {
      activeSettings.value = await settingsService.create(payload)
      return activeSettings.value
    })

  return {
    activeSettings,
    loading,
    error,
    fetchActiveSettings,
    saveSettings
  }
})

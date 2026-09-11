import { ref } from 'vue'

export const useAsyncState = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)

  const execute = async <T>(callback: () => Promise<T>) => {
    loading.value = true
    error.value = null

    try {
      return await callback()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Error inesperado'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    execute
  }
}

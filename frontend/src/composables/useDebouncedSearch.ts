import { ref, watch, type Ref } from 'vue'
import { useDebounceFn } from '@vueuse/core'

export const useDebouncedSearch = (callback: (value: string) => void | Promise<void>, delay = 350) => {
  const search = ref('')
  const debouncedCallback = useDebounceFn(callback, delay)

  watch(search as Ref<string>, (value) => {
    void debouncedCallback(value)
  })

  return {
    search
  }
}

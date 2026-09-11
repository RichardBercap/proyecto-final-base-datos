import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type ToastVariant = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  title: string
  description?: string
  variant: ToastVariant
}

export const useUiStore = defineStore('ui', () => {
  const sidebarOpen = ref(false)
  const darkMode = ref(true)
  const toasts = ref<ToastMessage[]>([])
  const pendingRequests = ref(0)

  const themeClass = computed(() => (darkMode.value ? 'dark' : ''))
  const isGlobalLoading = computed(() => pendingRequests.value > 0)

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
  }

  const notify = (message: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID()
    toasts.value.push({ id, ...message })
    window.setTimeout(() => dismissToast(id), 4200)
  }

  const dismissToast = (id: string) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  const startRequest = () => {
    pendingRequests.value += 1
  }

  const finishRequest = () => {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  return {
    sidebarOpen,
    darkMode,
    toasts,
    pendingRequests,
    themeClass,
    isGlobalLoading,
    toggleSidebar,
    notify,
    dismissToast,
    startRequest,
    finishRequest
  }
})

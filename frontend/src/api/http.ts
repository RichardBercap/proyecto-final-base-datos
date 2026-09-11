import axios, { AxiosError } from 'axios'
import { env } from '@/config/env'
import { useUiStore } from '@/stores/ui.store'
import type { ApiErrorPayload } from '@/types/api'

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
})

http.interceptors.request.use(
  (config) => {
    const uiStore = useUiStore()
    uiStore.startRequest()

    const token = localStorage.getItem('auth_token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error: AxiosError<ApiErrorPayload>) => {
    const uiStore = useUiStore()
    uiStore.finishRequest()
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => {
    const uiStore = useUiStore()
    uiStore.finishRequest()
    return response
  },
  (error: AxiosError<ApiErrorPayload>) => {
    const uiStore = useUiStore()
    uiStore.finishRequest()

    const message =
      error.response?.data?.error?.message ||
      error.message ||
      'No se pudo completar la solicitud'

    return Promise.reject(new Error(message))
  }
)

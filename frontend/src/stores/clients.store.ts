import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { clientsService } from '@/services/clients.service'
import type { Client, ClientPayload } from '@/types/client'

export const useClientsStore = defineStore('clients', () => {
  const clients = ref<Client[]>([])
  const selectedClient = ref<Client | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const blockedClients = computed(() => clients.value.filter((client) => client.estado === 'bloqueado'))
  const activeClients = computed(() => clients.value.filter((client) => client.estado === 'activo'))

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

  const fetchClients = () =>
    run(async () => {
      clients.value = await clientsService.list()
    })

  const fetchClient = (id: string) =>
    run(async () => {
      selectedClient.value = await clientsService.get(id)
    })

  const saveClient = (payload: ClientPayload, id?: string) =>
    run(async () => {
      const client = id ? await clientsService.update(id, payload) : await clientsService.create(payload)
      await fetchClients()
      selectedClient.value = client
      return client
    })

  const blockClient = (id: string, reason: string, detail: string) =>
    run(async () => {
      const client = await clientsService.block(id, reason, detail)
      await fetchClients()
      selectedClient.value = client
      return client
    })

  const unblockClient = (id: string) =>
    run(async () => {
      const client = await clientsService.unblock(id)
      await fetchClients()
      selectedClient.value = client
      return client
    })

  return {
    clients,
    selectedClient,
    loading,
    error,
    blockedClients,
    activeClients,
    fetchClients,
    fetchClient,
    saveClient,
    blockClient,
    unblockClient
  }
})

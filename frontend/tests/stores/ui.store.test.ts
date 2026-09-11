import { setActivePinia, createPinia } from 'pinia'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useUiStore } from '@/stores/ui.store'

describe('ui store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('toggles sidebar', () => {
    const store = useUiStore()
    store.toggleSidebar()
    expect(store.sidebarOpen).toBe(true)
  })

  it('adds and dismisses toasts', () => {
    const store = useUiStore()
    store.notify({ title: 'Listo', variant: 'success' })
    expect(store.toasts).toHaveLength(1)
    vi.runAllTimers()
    expect(store.toasts).toHaveLength(0)
  })
})

import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { loansService } from '@/services/loans.service'
import type { Loan, LoanPayload } from '@/types/loan'

export const useLoansStore = defineStore('loans', () => {
  const loans = ref<Loan[]>([])
  const selectedLoan = ref<Loan | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeLoans = computed(() => loans.value.filter((loan) => loan.estado === 'activo'))
  const latestLoans = computed(() => loans.value.slice(0, 5))

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

  const fetchLoans = () =>
    run(async () => {
      loans.value = await loansService.list()
    })

  const fetchLoan = (id: string) =>
    run(async () => {
      selectedLoan.value = await loansService.get(id)
    })

  const createLoan = (payload: LoanPayload) =>
    run(async () => {
      const loan = await loansService.create(payload)
      await fetchLoans()
      selectedLoan.value = loan
      return loan
    })

  const returnLoan = (id: string) =>
    run(async () => {
      const loan = await loansService.returnLoan(id)
      await fetchLoans()
      selectedLoan.value = loan
      return loan
    })

  return {
    loans,
    selectedLoan,
    loading,
    error,
    activeLoans,
    latestLoans,
    fetchLoans,
    fetchLoan,
    createLoan,
    returnLoan
  }
})

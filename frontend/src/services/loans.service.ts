import { http } from '@/api/http'
import type { Loan, LoanPayload } from '@/types/loan'

export const loansService = {
  async list() {
    const { data } = await http.get<Loan[]>('/prestamos')
    return data
  },
  async get(id: string) {
    const { data } = await http.get<Loan>(`/prestamos/${id}`)
    return data
  },
  async create(payload: LoanPayload) {
    const { data } = await http.post<Loan>('/prestamos', payload)
    return data
  },
  async returnLoan(id: string) {
    const { data } = await http.patch<Loan>(`/prestamos/${id}/devolver`)
    return data
  }
}

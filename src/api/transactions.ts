import { request } from '@/api/http'
import type { Transaction } from '@/types'

export type TransactionPayload = {
  type: string
  amount: number
  title: string
  note: string
  image?: string
  date: string
}

export const transactionsApi = {
  list(month?: string) {
    const q = month ? `?month=${encodeURIComponent(month)}` : ''
    return request<Transaction[]>(`/transactions${q}`)
  },

  get(id: string) {
    return request<Transaction>(`/transactions/${id}`)
  },

  create(body: TransactionPayload) {
    return request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(body),
    })
  },

  update(id: string, body: TransactionPayload) {
    return request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(body),
    })
  },

  delete(id: string) {
    return request<{ ok: boolean }>(`/transactions/${id}`, { method: 'DELETE' })
  },
}

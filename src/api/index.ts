export { ApiError, getToken, setToken } from '@/api/http'
export type { AuthResponse } from '@/api/auth'
export type { TransactionPayload } from '@/api/transactions'
export type { NotePayload } from '@/api/notes'

import { authApi } from '@/api/auth'
import { healthApi } from '@/api/health'
import { notesApi } from '@/api/notes'
import { titlesApi } from '@/api/titles'
import { transactionsApi } from '@/api/transactions'

export const api = {
  auth: authApi,
  health: healthApi,
  transactions: transactionsApi,
  titles: titlesApi,
  notes: notesApi,
}

export { ApiError, getToken, setToken } from '@/api/http'
export type { AuthResponse } from '@/api/auth'
export type { TransactionPayload } from '@/api/transactions'

import { authApi } from '@/api/auth'
import { titlesApi } from '@/api/titles'
import { transactionsApi } from '@/api/transactions'

export const api = {
  auth: authApi,
  transactions: transactionsApi,
  titles: titlesApi,
}

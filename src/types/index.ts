export type TransactionType = 'income' | 'expense'

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface Transaction {
  id: string
  userId: string
  type: TransactionType
  amount: number
  title: string
  note: string
  image?: string
  date: string
  createdAt: string
  updatedAt: string
}

export interface MonthSummary {
  income: number
  expense: number
  balance: number
  count: number
}

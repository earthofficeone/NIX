export type TransactionType = 'income' | 'expense'

export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface RecordTitle {
  id: string
  userId: string
  type: TransactionType
  name: string
  createdAt: string
  updatedAt: string
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

export type NoteBlockType =
  | 'paragraph'
  | 'heading'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'heading4'
  | 'bullet'
  | 'numbered'
  | 'code'
  | 'quote'
  | 'image'
  | 'file'

export interface NoteBlock {
  id: string
  type: NoteBlockType
  content: string
  fileName?: string
  fileMime?: string
  fileSize?: number
}

export interface Note {
  id: string
  userId: string
  title: string
  blocks: NoteBlock[]
  createdAt: string
  updatedAt: string
}

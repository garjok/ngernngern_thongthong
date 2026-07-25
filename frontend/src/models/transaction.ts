export type TransactionType = 'INCOME' | 'EXPENSE'

export interface Transaction {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
  createdAt: string
}

export interface CreateTransactionBody {
  type: TransactionType
  category: string
  amount: number
  description?: string
  date: string
}

export interface UpdateTransactionBody {
  type?: TransactionType
  category?: string
  amount?: number
  description?: string
  date?: string
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}

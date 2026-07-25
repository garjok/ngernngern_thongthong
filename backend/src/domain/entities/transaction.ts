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

export interface CreateTransactionInput {
  type: TransactionType
  category: string
  amount: number
  description: string
  date: string
}

export interface UpdateTransactionInput {
  type?: TransactionType
  category?: string
  amount?: number
  description?: string
  date?: string
}

import { defineStore } from 'pinia'
import { transactionApi } from '@/apis/transaction-api'
import type { CreateTransactionBody, Transaction, UpdateTransactionBody } from '@/models'

export const useTransactionStore = defineStore('TransactionStore', () => {
  const transactions = ref<Transaction[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTransactions() {
    isLoading.value = true
    error.value = null
    try {
      const res = await transactionApi.list()
      transactions.value = res.data
    }
    catch (e: any) {
      error.value = e.message
    }
    finally {
      isLoading.value = false
    }
  }

  async function createTransaction(body: CreateTransactionBody) {
    const res = await transactionApi.create(body)
    transactions.value.unshift(res.data)
    return res.data
  }

  async function updateTransaction(id: string, body: UpdateTransactionBody) {
    const res = await transactionApi.update(id, body)
    const idx = transactions.value.findIndex(t => t.id === id)
    if (idx !== -1) transactions.value[idx] = res.data
    return res.data
  }

  async function deleteTransaction(id: string) {
    await transactionApi.remove(id)
    transactions.value = transactions.value.filter(t => t.id !== id)
  }

  // Computed helpers
  const totalIncome = computed(() =>
    transactions.value
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const totalExpense = computed(() =>
    transactions.value
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)
  )

  const balance = computed(() => totalIncome.value - totalExpense.value)

  const transactionsByMonth = computed(() => {
    const groups: Record<string, { income: number; expense: number; transactions: Transaction[] }> = {}
    for (const t of transactions.value) {
      const month = t.date.substring(0, 7) // YYYY-MM
      if (!groups[month]) groups[month] = { income: 0, expense: 0, transactions: [] }
      if (t.type === 'INCOME') groups[month].income += t.amount
      else groups[month].expense += t.amount
      groups[month].transactions.push(t)
    }
    return groups
  })

  return {
    transactions, isLoading, error,
    fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
    totalIncome, totalExpense, balance, transactionsByMonth,
  }
})

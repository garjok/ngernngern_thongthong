import type { CreateTransactionInput, Transaction, UpdateTransactionInput } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

const VALID_TYPES = ['INCOME', 'EXPENSE'] as const
const MIN_AMOUNT = 0

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validateType(input.type)
    this.validateAmount(input.amount)
    if (!input.category?.trim()) throw new ValidationError('category is required')
    if (!input.date) throw new ValidationError('date is required')

    return this.transactionRepository.create({
      type: input.type,
      category: input.category.trim(),
      amount: input.amount,
      description: input.description?.trim() ?? '',
      date: input.date,
    })
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.type !== undefined) this.validateType(input.type)
    if (input.amount !== undefined) this.validateAmount(input.amount)

    const existing = await this.transactionRepository.findById(id)
    if (!existing) throw new NotFoundError('Transaction')

    const updated = await this.transactionRepository.update(id, {
      type: input.type ?? existing.type,
      category: input.category ?? existing.category,
      amount: input.amount ?? existing.amount,
      description: input.description ?? existing.description,
      date: input.date ?? existing.date,
    })
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  private validateType(type: string): void {
    if (!VALID_TYPES.includes(type as any)) {
      throw new ValidationError('type must be either INCOME or EXPENSE')
    }
  }

  private validateAmount(amount: number): void {
    if (typeof amount !== 'number' || amount <= MIN_AMOUNT) {
      throw new ValidationError('amount must be a positive number')
    }
  }
}

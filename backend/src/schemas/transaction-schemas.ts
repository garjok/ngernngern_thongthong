import z from 'zod'

export const transactionTypeSchema = z.enum(['INCOME', 'EXPENSE'])

export const transactionSchema = z.object({
  id: z.string().uuid(),
  type: transactionTypeSchema,
  category: z.string(),
  amount: z.number().positive(),
  description: z.string(),
  date: z.string(),
  createdAt: z.string(),
})

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: z.string().min(1),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().min(1),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})

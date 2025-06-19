import { z } from 'zod'

// Common schemas
export const TransactionTypeSchema = z.enum(['INCOME', 'EXPENSE'])
export const CategoryTypeSchema = z.enum(['INCOME', 'EXPENSE'])
export const BudgetPeriodSchema = z.enum(['MONTHLY', 'WEEKLY', 'YEARLY'])
export const SavingsGoalStatusSchema = z.enum(['ACTIVE', 'ACHIEVED', 'DISCARDED'])

// Transaction validation schemas
export const CreateTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: TransactionTypeSchema,
  description: z.string().max(255, 'Description too long').optional(),
  date: z.string().datetime().or(z.date()),
  categoryId: z.string().cuid('Invalid category ID'),
  savingsGoalId: z.string().cuid('Invalid savings goal ID').optional(),
  receiptUrl: z.string().url('Invalid receipt URL').nullish().or(z.literal('')).transform(val => val === '' ? null : val),
})

export const UpdateTransactionSchema = CreateTransactionSchema.partial()

export const TransactionFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  type: TransactionTypeSchema.optional(),
  categoryId: z.string().cuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minAmount: z.number().positive().optional(),
  maxAmount: z.number().positive().optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['date', 'amount', 'description']).default('date'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Category validation schemas
export const CreateCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  icon: z.string().optional(),
  color: z.string().optional(),
  type: CategoryTypeSchema,
})

export const UpdateCategorySchema = CreateCategorySchema.partial().extend({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long').optional(),
})

// Budget validation schemas
export const BudgetItemSchema = z.object({
  categoryId: z.string().cuid('Invalid category ID'),
  amount: z.number().positive('Amount must be positive'),
  type: TransactionTypeSchema,
})

export const CreateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Budget name too long'),
  period: BudgetPeriodSchema,
  startDate: z.string().datetime().or(z.date()),
  endDate: z.string().datetime().or(z.date()),
  budgetItems: z.array(BudgetItemSchema).min(1, 'At least one budget item is required'),
}).refine((data) => {
  const start = new Date(data.startDate)
  const end = new Date(data.endDate)
  return end > start
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export const UpdateBudgetSchema = z.object({
  name: z.string().min(1, 'Budget name is required').max(100, 'Budget name too long').optional(),
  period: BudgetPeriodSchema.optional(),
  startDate: z.string().datetime().or(z.date()).optional(),
  endDate: z.string().datetime().or(z.date()).optional(),
  isActive: z.boolean().optional(),
  budgetItems: z.array(BudgetItemSchema).optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    return end > start
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['endDate'],
})

export const BudgetFiltersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  period: BudgetPeriodSchema.optional(),
  isActive: z.boolean().optional(),
  search: z.string().max(255).optional(),
  sortBy: z.enum(['name', 'startDate', 'createdAt']).default('startDate'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Savings Goal validation schemas
export const CreateSavingsGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  targetAmount: z.number().positive('Target amount must be positive'),
  deadline: z.string().datetime().or(z.date()).optional(),
}).refine((data) => {
  if (data.deadline) {
    const deadline = new Date(data.deadline)
    const now = new Date()
    return deadline > now
  }
  return true
}, {
  message: 'Deadline must be in the future',
  path: ['deadline'],
})

export const UpdateSavingsGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  targetAmount: z.number().positive('Target amount must be positive').optional(),
  deadline: z.string().datetime().or(z.date()).optional(),
}).refine((data) => {
  if (data.deadline) {
    const deadline = new Date(data.deadline)
    const now = new Date()
    return deadline > now
  }
  return true
}, {
  message: 'Deadline must be in the future',
  path: ['deadline'],
})

export const UpdateSavingsGoalStatusSchema = z.object({
  status: SavingsGoalStatusSchema,
})

// Response schemas
export const TransactionResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  type: TransactionTypeSchema,
  description: z.string(),
  date: z.date(),
  categoryId: z.string(),
  userId: z.string(),
  savingsGoalId: z.string().nullable(),
  receiptUrl: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
    type: CategoryTypeSchema,
  }),
})

export const CategoryResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  type: CategoryTypeSchema,
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  _count: z.object({
    transactions: z.number(),
  }).optional(),
})

export const BudgetResponseSchema = z.object({
  id: z.string(),
  amount: z.number(),
  period: BudgetPeriodSchema,
  categoryId: z.string(),
  userId: z.string(),
  startDate: z.date(),
  endDate: z.date(),
  createdAt: z.date(),
  updatedAt: z.date(),
  category: z.object({
    id: z.string(),
    name: z.string(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
  }),
  spent: z.number().optional(), // Calculated field
  remaining: z.number().optional(), // Calculated field
  percentage: z.number().optional(), // Calculated field
})

export const SavingsGoalResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  targetAmount: z.number(),
  deadline: z.date().nullable(),
  status: SavingsGoalStatusSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
  currentAmount: z.number().optional(), // Calculated from transactions
  progress: z.number().optional(), // Calculated percentage
  isDeadlineMissed: z.boolean().optional(), // Calculated field
})

// Pagination schema
export const PaginationSchema = z.object({
  page: z.number().int().positive(),
  limit: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
  totalCount: z.number().int().nonnegative(),
  hasNext: z.boolean(),
  hasPrev: z.boolean(),
})

export const PaginatedTransactionsSchema = z.object({
  data: z.array(TransactionResponseSchema),
  pagination: PaginationSchema,
})

// Statistics schemas
export const TransactionStatsSchema = z.object({
  totalIncome: z.number(),
  totalExpenses: z.number(),
  netIncome: z.number(),
  transactionCount: z.number(),
  averageTransaction: z.number(),
  categoryBreakdown: z.array(z.object({
    categoryId: z.string(),
    categoryName: z.string(),
    amount: z.number(),
    count: z.number(),
    percentage: z.number(),
  })),
})

// API Error schema
export const APIErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.any().optional(),
})

// Type exports
export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>
export type TransactionFilters = z.infer<typeof TransactionFiltersSchema>
export type CreateCategoryInput = z.infer<typeof CreateCategorySchema>
export type UpdateCategoryInput = z.infer<typeof UpdateCategorySchema>
export type CreateBudgetInput = z.infer<typeof CreateBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof UpdateBudgetSchema>
export type CreateSavingsGoalInput = z.infer<typeof CreateSavingsGoalSchema>
export type UpdateSavingsGoalInput = z.infer<typeof UpdateSavingsGoalSchema>
export type UpdateSavingsGoalStatusInput = z.infer<typeof UpdateSavingsGoalStatusSchema>
export type TransactionResponse = z.infer<typeof TransactionResponseSchema>
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>
export type BudgetResponse = z.infer<typeof BudgetResponseSchema>
export type SavingsGoalResponse = z.infer<typeof SavingsGoalResponseSchema>
export type PaginatedTransactions = z.infer<typeof PaginatedTransactionsSchema>
export type TransactionStats = z.infer<typeof TransactionStatsSchema>
export type Pagination = z.infer<typeof PaginationSchema>
export type APIError = z.infer<typeof APIErrorSchema>
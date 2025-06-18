// Database model types
export interface User {
  id: string
  name?: string | null
  email: string
  emailVerified?: Date | null
  image?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  icon?: string | null
  color?: string | null
  type: 'INCOME' | 'EXPENSE'
  userId: string
  createdAt: Date
  updatedAt: Date
}

export interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: Date
  categoryId: string
  userId: string
  receiptUrl?: string | null
  createdAt: Date
  updatedAt: Date
  category?: Category
}

export interface Budget {
  id: string
  amount: number
  period: 'MONTHLY' | 'WEEKLY' | 'DAILY'
  categoryId: string
  userId: string
  startDate: Date
  endDate: Date
  createdAt: Date
  updatedAt: Date
  category?: Category
}

// DTO types for API requests
export interface CreateTransactionDto {
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: string
  categoryId: string
}

export interface UpdateTransactionDto {
  amount?: number
  type?: 'INCOME' | 'EXPENSE'
  description?: string
  date?: string
  categoryId?: string
}

export interface CreateCategoryDto {
  name: string
  icon?: string
  color?: string
  type: 'INCOME' | 'EXPENSE'
}

export interface UpdateCategoryDto {
  name?: string
  icon?: string
  color?: string
}

export interface CreateBudgetDto {
  amount: number
  period: 'MONTHLY' | 'WEEKLY' | 'DAILY'
  categoryId: string
  startDate: string
  endDate: string
}

export interface UpdateBudgetDto {
  amount?: number
  period?: 'MONTHLY' | 'WEEKLY' | 'DAILY'
  startDate?: string
  endDate?: string
}

// Utility types
export interface BudgetProgress {
  budget: Budget
  spent: number
  remaining: number
  percentage: number
  status: 'under' | 'near' | 'over' // under 80%, 80-99%, over 100%
}

export interface DashboardSummary {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  savingsGoalProgress?: number
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Default categories for new users
export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Taschengeld', icon: '💰', color: 'yellow', type: 'INCOME' as const },
  { name: 'Geschenke', icon: '🎁', color: 'pink', type: 'INCOME' as const },
  { name: 'Nebenjob', icon: '💼', color: 'blue', type: 'INCOME' as const },
]

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Drinks', icon: '🍔', color: 'orange', type: 'EXPENSE' as const },
  { name: 'Clothes', icon: '👕', color: 'purple', type: 'EXPENSE' as const },
  { name: 'Sports', icon: '⚽', color: 'green', type: 'EXPENSE' as const },
  { name: 'Games', icon: '🎮', color: 'red', type: 'EXPENSE' as const },
  { name: 'Other', icon: '📌', color: 'gray', type: 'EXPENSE' as const },
]
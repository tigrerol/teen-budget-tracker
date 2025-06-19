'use client'

import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { BudgetProgress, Transaction } from '@/types'

interface BudgetOverviewData {
  budgetId: string
  budgetName: string
  categoryName: string
  categoryIcon: string
  categoryColor: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentage: number
  status: 'under' | 'near' | 'over'
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  startDate: string
  endDate: string
}

export function useBudgetOverview() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['budget-overview'],
    queryFn: async (): Promise<BudgetOverviewData[]> => {
      const response = await fetch('/api/budgets?isActive=true&limit=10')
      if (!response.ok) {
        throw new Error('Failed to fetch budget overview')
      }
      
      const result = await response.json()
      const budgets = result.data || []
      
      // Get current month transactions for budget comparison
      const now = new Date()
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      
      const transactionsResponse = await fetch(
        `/api/transactions?startDate=${currentMonthStart.toISOString()}&endDate=${currentMonthEnd.toISOString()}&limit=1000`
      )
      
      const transactionResult = transactionsResponse.ok 
        ? await transactionsResponse.json() 
        : { data: [] }
      
      const transactions: Transaction[] = transactionResult.data || []

      // Process each budget to calculate spending vs budget
      const budgetOverview: BudgetOverviewData[] = []
      
      for (const budget of budgets) {
        if (!budget.budgetItems || budget.budgetItems.length === 0) continue
        
        // Process each budget item (category) in the budget
        for (const budgetItem of budget.budgetItems) {
          if (budgetItem.type !== 'EXPENSE') continue // Only show expense categories in overview
          
          // Calculate actual spending for this category in the budget period
          const relevantTransactions = transactions.filter(transaction => 
            transaction.categoryId === budgetItem.categoryId &&
            transaction.type === 'EXPENSE' &&
            new Date(transaction.date) >= new Date(budget.startDate) &&
            new Date(transaction.date) <= new Date(budget.endDate)
          )
          
          const spentAmount = relevantTransactions.reduce((sum, t) => sum + t.amount, 0)
          const budgetAmount = budgetItem.amount
          const remainingAmount = budgetAmount - spentAmount
          const percentage = budgetAmount > 0 ? (spentAmount / budgetAmount) * 100 : 0
          
          let status: 'under' | 'near' | 'over' = 'under'
          if (percentage >= 100) status = 'over'
          else if (percentage >= 80) status = 'near'
          
          budgetOverview.push({
            budgetId: budget.id,
            budgetName: budget.name,
            categoryName: budgetItem.category?.name || 'Unknown Category',
            categoryIcon: budgetItem.category?.icon || '📦',
            categoryColor: budgetItem.category?.color || 'bg-gray-100 text-gray-800',
            budgetAmount,
            spentAmount,
            remainingAmount,
            percentage: Math.min(percentage, 100), // Cap at 100% for display
            status,
            period: budget.period,
            startDate: budget.startDate.toString(),
            endDate: budget.endDate.toString()
          })
        }
      }
      
      // Sort by percentage (highest first) and limit to top 5 for dashboard
      return budgetOverview
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5)
    },
    enabled: !!session,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  })
}
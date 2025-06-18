'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatCurrency } from '@/lib/currency'
import { 
  Plus,
  PiggyBank,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

export default function BudgetPage() {
  // Mock budget data - will be replaced with real data
  const budgets = [
    {
      id: 1,
      category: 'Food & Drinks',
      allocated: 60,
      spent: 45,
      emoji: '🍔',
      color: 'bg-orange-500'
    },
    {
      id: 2,
      category: 'Clothes',
      allocated: 80,
      spent: 89,
      emoji: '👕',
      color: 'bg-purple-500'
    },
    {
      id: 3,
      category: 'Entertainment',
      allocated: 40,
      spent: 12,
      emoji: '🎮',
      color: 'bg-blue-500'
    },
    {
      id: 4,
      category: 'Transportation',
      allocated: 30,
      spent: 15,
      emoji: '🚌',
      color: 'bg-green-500'
    }
  ]

  const totalAllocated = budgets.reduce((sum, budget) => sum + budget.allocated, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Budget Management 💰
          </h1>
          <p className="text-muted-foreground">
            Track your spending limits and stay on budget
          </p>
        </div>
        <Button className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalAllocated)}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              {((totalSpent / totalAllocated) * 100).toFixed(1)}% of budget
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalAllocated - totalSpent)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Budget Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {budgets.map((budget) => {
              const percentage = (budget.spent / budget.allocated) * 100
              const isOverBudget = percentage > 100
              
              return (
                <div key={budget.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        {budget.emoji}
                      </div>
                      <div>
                        <p className="font-medium">{budget.category}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(budget.spent)} of {formatCurrency(budget.allocated)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isOverBudget && (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(percentage, 100)} 
                    className="h-2"
                  />
                  {isOverBudget && (
                    <p className="text-sm text-red-600 font-medium">
                      Over budget by {formatCurrency(budget.spent - budget.allocated)}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
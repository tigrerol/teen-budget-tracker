'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { useTransactionStats } from '@/hooks/use-transaction-stats'
import { useRecentTransactions } from '@/hooks/use-recent-transactions'
import { useSavingsGoal } from '@/hooks/use-savings-goal'
import { useBudgetOverview } from '@/hooks/use-budget-overview'
import { SavingsGoalForm } from '@/components/savings/savings-goal-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { VersionInfo } from '@/components/ui/version-info'
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Plus,
  Loader2,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const { data: stats, isLoading: statsLoading, error: statsError } = useTransactionStats()
  const { data: recentTransactions = [], isLoading: transactionsLoading } = useRecentTransactions(3)
  const { data: savingsGoal, isLoading: savingsLoading } = useSavingsGoal()
  const { data: budgetOverview = [], isLoading: budgetLoading, error: budgetError } = useBudgetOverview()

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] })
      queryClient.invalidateQueries({ queryKey: ['budget-overview'] })
    },
  })

  // Handle delete
  const handleDelete = async (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(transactionId)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name || 'Demo User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s your financial overview for this month
          </p>
        </div>
        <TransactionForm
          trigger={
            <Button className="md:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Add Transaction
            </Button>
          }
        />
      </div>

      {/* Summary Cards */}
      {statsError && (
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load dashboard data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-primary">
                  {formatCurrency(stats?.totalBalance || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.balanceChangePercent !== undefined && stats.balanceChangePercent !== 0 ? (
                    <>
                      {stats.balanceChangePercent > 0 ? '+' : ''}
                      {stats.balanceChangePercent.toFixed(1)}% from last month
                    </>
                  ) : (
                    'All-time balance'
                  )}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(stats?.monthlyIncome || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  This month's income
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(stats?.monthlyExpenses || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.monthlyIncome && stats.monthlyIncome > 0 
                    ? `${Math.round((stats.monthlyExpenses / stats.monthlyIncome) * 100)}% of income spent`
                    : 'This month\'s expenses'
                  }
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {savingsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : savingsGoal ? (
              <>
                <div className="text-2xl font-bold text-emerald-600">
                  {formatCurrency(savingsGoal.currentAmount || 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsGoal.progress?.toFixed(1)}% of {formatCurrency(savingsGoal.targetAmount)} goal
                </p>
                <div className="mt-2">
                  <div className="w-full bg-emerald-100 rounded-full h-2">
                    <div 
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(savingsGoal.progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-medium text-emerald-700">{savingsGoal.title}</span>
                  <SavingsGoalForm
                    savingsGoalId={savingsGoal.id}
                    trigger={
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Edit
                      </button>
                    }
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-2">
                <div className="text-lg font-medium text-muted-foreground mb-2">No active goal</div>
                <SavingsGoalForm
                  trigger={
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="mr-2 h-3 w-3" />
                      Create Goal
                    </Button>
                  }
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading transactions...</span>
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No transactions yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add your first transaction to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                        transaction.category.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {transaction.category.icon || '📦'}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description || 'No description'}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category.name} • {format(new Date(transaction.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(transaction.id)}
                        disabled={deleteMutation.isPending}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-red-600"
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            {budgetError && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>
                  Failed to load budget overview. Please try refreshing the page.
                </AlertDescription>
              </Alert>
            )}
            
            {budgetLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2 text-sm text-muted-foreground">Loading budgets...</span>
              </div>
            ) : budgetOverview.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground mb-2">No active budgets</p>
                <p className="text-xs text-muted-foreground mb-4">Create a budget to track your spending</p>
                <Button size="sm" asChild>
                  <a href="/budget">
                    <Plus className="mr-2 h-3 w-3" />
                    Create Budget
                  </a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {budgetOverview.map((item, index) => {
                  const getProgressColor = () => {
                    if (item.status === 'over') return 'bg-red-600'
                    if (item.status === 'near') return 'bg-yellow-600'
                    return 'bg-green-600'
                  }
                  
                  const getStatusColor = () => {
                    if (item.status === 'over') return 'text-red-600'
                    if (item.status === 'near') return 'text-yellow-600'
                    return 'text-green-600'
                  }

                  return (
                    <div key={`${item.budgetId}-${item.categoryName}-${index}`} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${item.categoryColor}`}>
                            {item.categoryIcon}
                          </span>
                          <span className="font-medium">{item.categoryName}</span>
                        </div>
                        <span className={`font-medium ${getStatusColor()}`}>
                          {formatCurrency(item.spentAmount)} / {formatCurrency(item.budgetAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                          style={{ width: `${Math.min(item.percentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{item.percentage.toFixed(1)}% used</span>
                        <span>
                          {item.remainingAmount >= 0 
                            ? `${formatCurrency(item.remainingAmount)} left` 
                            : `${formatCurrency(Math.abs(item.remainingAmount))} over`
                          }
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Version Info Footer */}
      <div className="mt-8 pt-4 border-t border-border/50">
        <VersionInfo compact className="justify-center" />
      </div>
    </div>
  )
}
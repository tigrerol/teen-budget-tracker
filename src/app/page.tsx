'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { TransactionForm } from '@/components/transactions/transaction-form'
import { useTransactionStats } from '@/hooks/use-transaction-stats'
import { useRecentTransactions } from '@/hooks/use-recent-transactions'
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Plus,
  Loader2
} from 'lucide-react'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { data: session } = useSession()
  const { data: stats, isLoading: statsLoading, error: statsError } = useTransactionStats()
  const { data: recentTransactions = [], isLoading: transactionsLoading } = useRecentTransactions(3)

  // Mock savings goal data (to be replaced when budgets are implemented)
  const mockSavingsData = {
    savingsGoal: 500.00,
    currentSavings: stats?.totalBalance || 0,
  }

  const savingsProgress = (mockSavingsData.currentSavings / mockSavingsData.savingsGoal) * 100

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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {formatCurrency(mockSavingsData.currentSavings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {savingsProgress.toFixed(1)}% of {formatCurrency(mockSavingsData.savingsGoal)} goal
                </p>
              </>
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
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category.name} • {format(new Date(transaction.date), 'MMM dd')}
                        </p>
                      </div>
                    </div>
                    <span className={`font-medium ${
                      transaction.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </span>
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
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Food & Drinks</span>
                  <span>€45 / €60</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Clothes</span>
                  <span>€89 / €80</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Entertainment</span>
                  <span>€12 / €40</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '30%' }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
'use client'

import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/currency'
import { 
  PiggyBank, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Plus
} from 'lucide-react'

export default function DashboardPage() {
  const { data: session } = useSession()

  // Mock data for now - will be replaced with real data
  const mockData = {
    totalBalance: 245.50,
    monthlyIncome: 150.00,
    monthlyExpenses: 89.50,
    savingsGoal: 500.00,
    currentSavings: 156.00,
  }

  const savingsProgress = (mockData.currentSavings / mockData.savingsGoal) * 100

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {session?.user?.name || 'Demo User'}! 👋
          </h1>
          <p className="text-muted-foreground">
            Here's your financial overview for this month
          </p>
        </div>
        <Button className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {formatCurrency(mockData.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(mockData.monthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Allowance + part-time work
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(mockData.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              60% of income spent
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Goal</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(mockData.currentSavings)}
            </div>
            <p className="text-xs text-muted-foreground">
              {savingsProgress.toFixed(1)}% of {formatCurrency(mockData.savingsGoal)} goal
            </p>
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
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                    🍔
                  </div>
                  <div>
                    <p className="font-medium">Lunch with friends</p>
                    <p className="text-sm text-muted-foreground">Food & Drinks</p>
                  </div>
                </div>
                <span className="font-medium text-red-600">-{formatCurrency(15.50)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    💰
                  </div>
                  <div>
                    <p className="font-medium">Weekly allowance</p>
                    <p className="text-sm text-muted-foreground">Taschengeld</p>
                  </div>
                </div>
                <span className="font-medium text-green-600">+{formatCurrency(25.00)}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    👕
                  </div>
                  <div>
                    <p className="font-medium">New t-shirt</p>
                    <p className="text-sm text-muted-foreground">Clothes</p>
                  </div>
                </div>
                <span className="font-medium text-red-600">-{formatCurrency(29.99)}</span>
              </div>
            </div>
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
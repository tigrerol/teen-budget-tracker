'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { 
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target
} from 'lucide-react'

export default function AnalyticsPage() {
  // Mock analytics data - will be replaced with real data
  const monthlyData = [
    { month: 'Jan', income: 150, expenses: 120 },
    { month: 'Feb', income: 175, expenses: 140 },
    { month: 'Mar', income: 200, expenses: 160 },
    { month: 'Apr', income: 150, expenses: 89 }
  ]

  const expenseBreakdown = [
    { category: 'Food & Drinks', amount: 156.50, percentage: 35, color: 'bg-orange-500' },
    { category: 'Clothes', amount: 89.99, percentage: 20, color: 'bg-purple-500' },
    { category: 'Entertainment', amount: 67.50, percentage: 15, color: 'bg-blue-500' },
    { category: 'Transportation', amount: 45.80, percentage: 10, color: 'bg-green-500' },
    { category: 'Other', amount: 89.21, percentage: 20, color: 'bg-gray-500' }
  ]

  const savingsRate = 28.5
  const avgMonthlyIncome = 168.75
  const avgMonthlyExpenses = 127.25

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Analytics 📊
          </h1>
          <p className="text-muted-foreground">
            Insights into your spending patterns and financial health
          </p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Savings Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {savingsRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              Above recommended 20%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgMonthlyIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(avgMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Savings</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(avgMonthlyIncome - avgMonthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Monthly Trends</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyData.map((month, index) => {
              const netIncome = month.income - month.expenses
              const isPositive = netIncome > 0
              
              return (
                <div key={month.month} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{month.month} 2024</span>
                    <div className="flex items-center space-x-4">
                      <Badge variant="outline" className="text-green-600">
                        Income: {formatCurrency(month.income)}
                      </Badge>
                      <Badge variant="outline" className="text-red-600">
                        Expenses: {formatCurrency(month.expenses)}
                      </Badge>
                      <Badge className={isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        Net: {formatCurrency(netIncome)}
                      </Badge>
                    </div>
                  </div>
                  
                  {/* Simple bar visualization */}
                  <div className="flex space-x-1 h-8">
                    <div 
                      className="bg-green-500 rounded"
                      style={{ width: `${(month.income / 200) * 100}%` }}
                      title={`Income: ${formatCurrency(month.income)}`}
                    />
                    <div 
                      className="bg-red-500 rounded"
                      style={{ width: `${(month.expenses / 200) * 100}%` }}
                      title={`Expenses: ${formatCurrency(month.expenses)}`}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PieChart className="h-5 w-5" />
            <span>Expense Breakdown</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expenseBreakdown.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{item.category}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {item.percentage}%
                    </span>
                    <span className="font-medium">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${item.color} h-2 rounded-full transition-all duration-300`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Financial Health Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">85/100</div>
              <Badge className="bg-green-100 text-green-800">Excellent</Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span>Savings Rate (28.5%)</span>
                <Badge className="bg-green-100 text-green-800">Great</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Budget Adherence</span>
                <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Spending Consistency</span>
                <Badge className="bg-green-100 text-green-800">Excellent</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span>Goal Progress</span>
                <Badge className="bg-blue-100 text-blue-800">On Track</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
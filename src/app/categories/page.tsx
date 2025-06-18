'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { 
  Plus,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown
} from 'lucide-react'

export default function CategoriesPage() {
  // Mock categories data - will be replaced with real data
  const categories = [
    {
      id: 1,
      name: 'Food & Drinks',
      emoji: '🍔',
      color: 'bg-orange-100 text-orange-800',
      type: 'expense',
      transactionCount: 12,
      totalAmount: 156.50,
      lastUsed: '2 hours ago'
    },
    {
      id: 2,
      name: 'Allowance',
      emoji: '💰',
      color: 'bg-green-100 text-green-800',
      type: 'income',
      transactionCount: 4,
      totalAmount: 200.00,
      lastUsed: '1 week ago'
    },
    {
      id: 3,
      name: 'Clothes',
      emoji: '👕',
      color: 'bg-purple-100 text-purple-800',
      type: 'expense',
      transactionCount: 8,
      totalAmount: 189.99,
      lastUsed: '3 days ago'
    },
    {
      id: 4,
      name: 'Entertainment',
      emoji: '🎮',
      color: 'bg-blue-100 text-blue-800',
      type: 'expense',
      transactionCount: 6,
      totalAmount: 89.50,
      lastUsed: '5 days ago'
    },
    {
      id: 5,
      name: 'Part-time Job',
      emoji: '💼',
      color: 'bg-green-100 text-green-800',
      type: 'income',
      transactionCount: 8,
      totalAmount: 320.00,
      lastUsed: '1 day ago'
    },
    {
      id: 6,
      name: 'Transportation',
      emoji: '🚌',
      color: 'bg-yellow-100 text-yellow-800',
      type: 'expense',
      transactionCount: 15,
      totalAmount: 67.80,
      lastUsed: '1 day ago'
    }
  ]

  const incomeCategories = categories.filter(cat => cat.type === 'income')
  const expenseCategories = categories.filter(cat => cat.type === 'expense')

  const totalIncome = incomeCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)
  const totalExpenses = expenseCategories.reduce((sum, cat) => sum + cat.totalAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Categories 🏷️
          </h1>
          <p className="text-muted-foreground">
            Organize your income and expenses
          </p>
        </div>
        <Button className="md:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {incomeCategories.length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(totalExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {expenseCategories.length} categories
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Income Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Income Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {incomeCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {category.emoji}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge className={category.color}>Income</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.transactionCount} transactions • Last used {category.lastUsed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-green-600">
                      +{formatCurrency(category.totalAmount)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span>Expense Categories</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {expenseCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-xl">
                    {category.emoji}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{category.name}</h3>
                      <Badge className={category.color}>Expense</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {category.transactionCount} transactions • Last used {category.lastUsed}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(category.totalAmount)}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
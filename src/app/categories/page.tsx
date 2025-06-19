'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CategoryForm } from '@/components/categories/category-form'
import { Category } from '@/types'
import { 
  Plus,
  Edit,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'

export default function CategoriesPage() {
  const { data: session } = useSession()
  
  const { data: categories = [], isLoading, error, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    enabled: !!session,
  })

  const incomeCategories = categories.filter((cat: Category) => cat.type === 'INCOME')
  const expenseCategories = categories.filter((cat: Category) => cat.type === 'EXPENSE')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading categories...</span>
      </div>
    )
  }

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
        <CategoryForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          }
          onSuccess={() => refetch()}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load categories'}
          </AlertDescription>
        </Alert>
      )}

      {/* Income Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Income Categories ({incomeCategories.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {incomeCategories.map((category: Category & { _count?: { transactions: number } }) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    category.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.icon || '💰'}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category._count?.transactions || 0} transactions
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <CategoryForm
                    categoryId={category.id}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                    onSuccess={() => refetch()}
                  />
                </div>
              </div>
            ))}
            {incomeCategories.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No income categories yet</p>
                <p className="text-sm">Create your first income category to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Expense Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <span>Expense Categories ({expenseCategories.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {expenseCategories.map((category: Category & { _count?: { transactions: number } }) => (
              <div
                key={category.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    category.color || 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.icon || '💸'}
                  </div>
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category._count?.transactions || 0} transactions
                    </p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <CategoryForm
                    categoryId={category.id}
                    trigger={
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    }
                    onSuccess={() => refetch()}
                  />
                </div>
              </div>
            ))}
            {expenseCategories.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                <p>No expense categories yet</p>
                <p className="text-sm">Create your first expense category to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
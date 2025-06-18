'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/currency'
import { 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Loader2,
  Euro 
} from 'lucide-react'
import { format } from 'date-fns'

interface BudgetItem {
  categoryId: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  notes?: string
}

interface BudgetFormData {
  name: string
  period: 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  startDate: string
  endDate: string
  budgetItems: BudgetItem[]
}

interface BudgetFormProps {
  budgetId?: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function BudgetForm({ budgetId, trigger, onSuccess }: BudgetFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<BudgetFormData>({
    name: '',
    period: 'MONTHLY',
    startDate: '',
    endDate: '',
    budgetItems: [],
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    enabled: !!session,
  })

  // Fetch existing budget for editing
  const { data: existingBudget } = useQuery({
    queryKey: ['budget', budgetId],
    queryFn: async () => {
      const response = await fetch(`/api/budgets/${budgetId}`)
      if (!response.ok) throw new Error('Failed to fetch budget')
      return response.json()
    },
    enabled: !!budgetId && !!session,
  })

  // Set form data when editing
  useEffect(() => {
    if (existingBudget) {
      setFormData({
        name: existingBudget.name,
        period: existingBudget.period,
        startDate: existingBudget.startDate.split('T')[0],
        endDate: existingBudget.endDate.split('T')[0],
        budgetItems: existingBudget.budgetItems.map((item: any) => ({
          categoryId: item.categoryId,
          amount: item.amount,
          type: item.type,
          notes: item.notes || '',
        })),
      })
    }
  }, [existingBudget])

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: BudgetFormData) => {
      const url = budgetId ? `/api/budgets/${budgetId}` : '/api/budgets'
      const method = budgetId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          startDate: new Date(data.startDate).toISOString(),
          endDate: new Date(data.endDate).toISOString(),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save budget')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
      if (budgetId) {
        queryClient.invalidateQueries({ queryKey: ['budget', budgetId] })
      }
      setOpen(false)
      setError(null)
      onSuccess?.()
      
      // Reset form if creating new budget
      if (!budgetId) {
        setFormData({
          name: '',
          period: 'MONTHLY',
          startDate: '',
          endDate: '',
          budgetItems: [],
        })
      }
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!formData.name.trim()) {
      setError('Budget name is required')
      return
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Start and end dates are required')
      return
    }

    if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      setError('End date must be after start date')
      return
    }

    if (formData.budgetItems.length === 0) {
      setError('At least one budget item is required')
      return
    }

    mutation.mutate(formData)
  }

  const addBudgetItem = (type: 'INCOME' | 'EXPENSE') => {
    const availableCategories = categories.filter((cat: any) => 
      cat.type === type && 
      !formData.budgetItems.some(item => item.categoryId === cat.id)
    )

    if (availableCategories.length === 0) {
      setError(`No more ${type.toLowerCase()} categories available`)
      return
    }

    setFormData(prev => ({
      ...prev,
      budgetItems: [
        ...prev.budgetItems,
        {
          categoryId: availableCategories[0].id,
          amount: 0,
          type,
          notes: '',
        },
      ],
    }))
  }

  const removeBudgetItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.filter((_, i) => i !== index),
    }))
  }

  const updateBudgetItem = (index: number, updates: Partial<BudgetItem>) => {
    setFormData(prev => ({
      ...prev,
      budgetItems: prev.budgetItems.map((item, i) => 
        i === index ? { ...item, ...updates } : item
      ),
    }))
  }

  const incomeItems = formData.budgetItems.filter(item => item.type === 'INCOME')
  const expenseItems = formData.budgetItems.filter(item => item.type === 'EXPENSE')
  const totalIncome = incomeItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalExpenses = expenseItems.reduce((sum, item) => sum + (item.amount || 0), 0)
  const netIncome = totalIncome - totalExpenses

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {budgetId ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Budget Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., January 2024 Budget"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select value={formData.period} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, period: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WEEKLY">Weekly</SelectItem>
                  <SelectItem value="MONTHLY">Monthly</SelectItem>
                  <SelectItem value="YEARLY">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                required
              />
            </div>
          </div>

          {/* Budget Summary */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Total Income</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(totalIncome)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium">Total Expenses</span>
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(totalExpenses)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Net Income</span>
                </div>
                <div className={`text-2xl font-bold ${
                  netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {formatCurrency(netIncome)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Income Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Income ({incomeItems.length})</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBudgetItem('INCOME')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {incomeItems.map((item, index) => {
                const actualIndex = formData.budgetItems.findIndex(
                  (budgetItem, i) => budgetItem === item
                )
                const category = categories.find((cat: any) => cat.id === item.categoryId)
                
                return (
                  <div key={actualIndex} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      category?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {category?.icon || '💰'}
                    </div>
                    
                    <div className="flex-1 grid gap-4 md:grid-cols-4">
                      <Select
                        value={item.categoryId}
                        onValueChange={(value) => updateBudgetItem(actualIndex, { categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat: any) => cat.type === 'INCOME')
                            .filter((cat: any) => 
                              cat.id === item.categoryId || 
                              !formData.budgetItems.some(bi => bi.categoryId === cat.id)
                            )
                            .map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center">
                                  {category.icon && <span className="mr-2">{category.icon}</span>}
                                  {category.name}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount || ''}
                        onChange={(e) => updateBudgetItem(actualIndex, { 
                          amount: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="Amount"
                      />

                      <Input
                        value={item.notes || ''}
                        onChange={(e) => updateBudgetItem(actualIndex, { notes: e.target.value })}
                        placeholder="Notes (optional)"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBudgetItem(actualIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}

              {incomeItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No income categories added yet</p>
                  <p className="text-sm">Click "Add Income" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span>Expenses ({expenseItems.length})</span>
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addBudgetItem('EXPENSE')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {expenseItems.map((item, index) => {
                const actualIndex = formData.budgetItems.findIndex(
                  (budgetItem, i) => budgetItem === item
                )
                const category = categories.find((cat: any) => cat.id === item.categoryId)
                
                return (
                  <div key={actualIndex} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      category?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {category?.icon || '💸'}
                    </div>
                    
                    <div className="flex-1 grid gap-4 md:grid-cols-4">
                      <Select
                        value={item.categoryId}
                        onValueChange={(value) => updateBudgetItem(actualIndex, { categoryId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            .filter((cat: any) => cat.type === 'EXPENSE')
                            .filter((cat: any) => 
                              cat.id === item.categoryId || 
                              !formData.budgetItems.some(bi => bi.categoryId === cat.id)
                            )
                            .map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                <span className="flex items-center">
                                  {category.icon && <span className="mr-2">{category.icon}</span>}
                                  {category.name}
                                </span>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>

                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.amount || ''}
                        onChange={(e) => updateBudgetItem(actualIndex, { 
                          amount: parseFloat(e.target.value) || 0 
                        })}
                        placeholder="Amount"
                      />

                      <Input
                        value={item.notes || ''}
                        onChange={(e) => updateBudgetItem(actualIndex, { notes: e.target.value })}
                        placeholder="Notes (optional)"
                      />
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBudgetItem(actualIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              })}

              {expenseItems.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingDown className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No expense categories added yet</p>
                  <p className="text-sm">Click "Add Expense" to get started</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {budgetId ? 'Update Budget' : 'Create Budget'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
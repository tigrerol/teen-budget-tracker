'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { Plus, Loader2 } from 'lucide-react'
import { z } from 'zod'

interface TransactionFormProps {
  trigger?: React.ReactNode
  transactionId?: string // For editing existing transaction
  onSuccess?: () => void
}

interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
  type: 'INCOME' | 'EXPENSE'
}

interface TransactionFormData {
  amount: string
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: string
  categoryId: string
  receiptUrl?: string
}

export function TransactionForm({ trigger, transactionId, onSuccess }: TransactionFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<TransactionFormData>({
    amount: '',
    type: 'EXPENSE',
    description: '',
    date: new Date().toISOString().split('T')[0], // Today's date
    categoryId: '',
    receiptUrl: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch categories
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Please sign in to continue')
        }
        throw new Error('Failed to fetch categories')
      }
      return response.json() as Promise<Category[]>
    },
    enabled: !!session,
    retry: false, // Don't retry on auth errors
  })

  // Fetch existing transaction for editing
  const { data: existingTransaction, isLoading: transactionLoading } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: async () => {
      const response = await fetch(`/api/transactions/${transactionId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transaction')
      }
      return response.json()
    },
    enabled: !!transactionId && !!session,
  })

  // Set form data when editing existing transaction
  useEffect(() => {
    if (existingTransaction) {
      setFormData({
        amount: existingTransaction.amount.toString(),
        type: existingTransaction.type,
        description: existingTransaction.description,
        date: new Date(existingTransaction.date).toISOString().split('T')[0],
        categoryId: existingTransaction.categoryId,
        receiptUrl: existingTransaction.receiptUrl || '',
      })
    }
  }, [existingTransaction])

  // Create transaction mutation
  const createMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create transaction')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      setOpen(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error: Error) => {
      console.error('Create transaction error:', error)
    },
  })

  // Update transaction mutation
  const updateMutation = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: parseFloat(data.amount),
          date: new Date(data.date).toISOString(),
        }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update transaction')
      }
      
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction', transactionId] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
      setOpen(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      console.error('Update transaction error:', error)
    },
  })

  const resetForm = () => {
    setFormData({
      amount: '',
      type: 'EXPENSE',
      description: '',
      date: new Date().toISOString().split('T')[0],
      categoryId: '',
      receiptUrl: '',
    })
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required'
    }

    if (!formData.date) {
      newErrors.date = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const selectedCategory = categories.find(c => c.id === formData.categoryId)
    if (selectedCategory && selectedCategory.type !== formData.type) {
      setErrors({ categoryId: 'Selected category type does not match transaction type' })
      return
    }

    if (transactionId) {
      updateMutation.mutate(formData)
    } else {
      createMutation.mutate(formData)
    }
  }

  const filteredCategories = categories.filter(category => category.type === formData.type)

  const isLoading = createMutation.isPending || updateMutation.isPending
  const mutation = transactionId ? updateMutation : createMutation

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {transactionId ? 'Edit Transaction' : 'Add New Transaction'}
          </DialogTitle>
        </DialogHeader>
        
        {(categoriesLoading || transactionLoading) ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading...</span>
          </div>
        ) : categoriesError ? (
          <div className="py-8">
            <Alert variant="destructive">
              <AlertDescription>
                {categoriesError.message || 'Failed to load categories. Please try again.'}
              </AlertDescription>
            </Alert>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Transaction Type */}
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'INCOME' | 'EXPENSE') => {
                  setFormData(prev => ({ ...prev, type: value, categoryId: '' }))
                  setErrors(prev => ({ ...prev, categoryId: '' }))
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">💰 Income</SelectItem>
                  <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (€)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, amount: e.target.value }))
                  setErrors(prev => ({ ...prev, amount: '' }))
                }}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount}</p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => {
                  setFormData(prev => ({ ...prev, categoryId: value }))
                  setErrors(prev => ({ ...prev, categoryId: '' }))
                }}
              >
                <SelectTrigger className={errors.categoryId ? 'border-red-500' : ''}>
                  <SelectValue placeholder={
                    filteredCategories.length === 0 
                      ? `No ${formData.type.toLowerCase()} categories available`
                      : "Select a category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.length === 0 ? (
                    <SelectItem value="no-categories" disabled>
                      No {formData.type.toLowerCase()} categories found
                    </SelectItem>
                  ) : (
                    filteredCategories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        <span className="flex items-center">
                          {category.icon && <span className="mr-2">{category.icon}</span>}
                          {category.name}
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-sm text-red-500">{errors.categoryId}</p>
              )}
              {/* Debug info - remove in production */}
              <p className="text-xs text-muted-foreground">
                Debug: {categories.length} total categories, {filteredCategories.length} {formData.type.toLowerCase()} categories
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What was this transaction for?"
                value={formData.description}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, description: e.target.value }))
                  setErrors(prev => ({ ...prev, description: '' }))
                }}
                className={errors.description ? 'border-red-500' : ''}
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, date: e.target.value }))
                  setErrors(prev => ({ ...prev, date: '' }))
                }}
                className={errors.date ? 'border-red-500' : ''}
              />
              {errors.date && (
                <p className="text-sm text-red-500">{errors.date}</p>
              )}
            </div>

            {/* Receipt URL (Optional) */}
            <div className="space-y-2">
              <Label htmlFor="receiptUrl">Receipt URL (Optional)</Label>
              <Input
                id="receiptUrl"
                type="url"
                placeholder="https://..."
                value={formData.receiptUrl}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, receiptUrl: e.target.value }))
                }}
              />
            </div>

            {/* Error Alert */}
            {mutation.isError && (
              <Alert variant="destructive">
                <AlertDescription>
                  {mutation.error?.message || 'An error occurred'}
                </AlertDescription>
              </Alert>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {transactionId ? 'Update' : 'Create'} Transaction
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
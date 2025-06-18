'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Loader2,
  Plus,
  Edit,
  Trash2
} from 'lucide-react'

interface CategoryFormData {
  name: string
  icon: string
  color: string
  type: 'INCOME' | 'EXPENSE'
}

interface CategoryFormProps {
  categoryId?: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

const PRESET_ICONS = [
  '💰', '💼', '🎁', '🚀', '📈', '💳', // Income
  '🍔', '👕', '🎮', '🚌', '📚', '🧴', '📱', '🎯', '📦', '🏠', '⚡', '🏥', '🎬', '✈️' // Expense
]

const PRESET_COLORS = [
  'bg-green-100 text-green-800',
  'bg-blue-100 text-blue-800', 
  'bg-purple-100 text-purple-800',
  'bg-orange-100 text-orange-800',
  'bg-yellow-100 text-yellow-800',
  'bg-pink-100 text-pink-800',
  'bg-indigo-100 text-indigo-800',
  'bg-emerald-100 text-emerald-800',
  'bg-slate-100 text-slate-800',
  'bg-red-100 text-red-800',
]

export function CategoryForm({ categoryId, trigger, onSuccess }: CategoryFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    icon: '📦',
    color: 'bg-gray-100 text-gray-800',
    type: 'EXPENSE',
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch existing category for editing
  const { data: existingCategory } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`)
      if (!response.ok) throw new Error('Failed to fetch category')
      return response.json()
    },
    enabled: !!categoryId && !!session,
  })

  // Set form data when editing
  useEffect(() => {
    if (existingCategory) {
      setFormData({
        name: existingCategory.name,
        icon: existingCategory.icon || '📦',
        color: existingCategory.color || 'bg-gray-100 text-gray-800',
        type: existingCategory.type,
      })
    }
  }, [existingCategory])

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const url = categoryId ? `/api/categories/${categoryId}` : '/api/categories'
      const method = categoryId ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save category')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      if (categoryId) {
        queryClient.invalidateQueries({ queryKey: ['category', categoryId] })
      }
      setOpen(false)
      setError(null)
      onSuccess?.()
      
      // Reset form if creating new category
      if (!categoryId) {
        setFormData({
          name: '',
          icon: '📦',
          color: 'bg-gray-100 text-gray-800',
          type: 'EXPENSE',
        })
      }
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete category')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      setOpen(false)
      onSuccess?.()
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
      setError('Category name is required')
      return
    }

    mutation.mutate(formData)
  }

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${formData.name}"? This action cannot be undone.`)) {
      deleteMutation.mutate()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {categoryId ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Category Preview */}
          <div className="flex items-center justify-center p-6 border rounded-lg bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${formData.color}`}>
                {formData.icon}
              </div>
              <div>
                <div className="font-semibold">{formData.name || 'Category Name'}</div>
                <Badge variant={formData.type === 'INCOME' ? 'default' : 'secondary'}>
                  {formData.type}
                </Badge>
              </div>
            </div>
          </div>

          {/* Basic Info */}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Food & Drinks"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: any) => 
                setFormData(prev => ({ ...prev, type: value }))
              }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">💰 Income</SelectItem>
                  <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label>Icon</Label>
            <div className="grid grid-cols-8 gap-2">
              {PRESET_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, icon }))}
                  className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-xl hover:bg-gray-50 transition-colors ${
                    formData.icon === icon ? 'border-primary bg-primary/10' : 'border-gray-200'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="custom-icon" className="text-sm">Custom:</Label>
              <Input
                id="custom-icon"
                value={formData.icon}
                onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                className="w-20 text-center"
                placeholder="🎯"
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Color</Label>
            <div className="grid grid-cols-5 gap-2">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color }))}
                  className={`h-12 rounded-lg border-2 flex items-center justify-center text-sm font-medium transition-colors ${color} ${
                    formData.color === color ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200'
                  }`}
                >
                  Sample
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-between">
            {categoryId && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
            
            <div className="flex space-x-2 ml-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={mutation.isPending || deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending || deleteMutation.isPending}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {categoryId ? 'Update Category' : 'Create Category'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
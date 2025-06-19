'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatCurrency } from '@/lib/currency'
import { 
  Loader2,
  Target,
  Calendar,
  Trophy,
  X
} from 'lucide-react'

interface SavingsGoalFormData {
  title: string
  description: string
  targetAmount: number
  deadline: string
}

interface SavingsGoalFormProps {
  savingsGoalId?: string
  trigger: React.ReactNode
  onSuccess?: () => void
}

export function SavingsGoalForm({ savingsGoalId, trigger, onSuccess }: SavingsGoalFormProps) {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<SavingsGoalFormData>({
    title: '',
    description: '',
    targetAmount: 0,
    deadline: '',
  })
  const [error, setError] = useState<string | null>(null)

  // Fetch existing savings goal for editing
  const { data: existingSavingsGoal } = useQuery({
    queryKey: ['savings-goal', savingsGoalId],
    queryFn: async () => {
      const response = await fetch(`/api/savings-goal/${savingsGoalId}`)
      if (!response.ok) throw new Error('Failed to fetch savings goal')
      return response.json()
    },
    enabled: !!savingsGoalId && !!session,
  })

  // Set form data when editing
  useEffect(() => {
    if (existingSavingsGoal) {
      setFormData({
        title: existingSavingsGoal.title,
        description: existingSavingsGoal.description || '',
        targetAmount: existingSavingsGoal.targetAmount,
        deadline: existingSavingsGoal.deadline ? existingSavingsGoal.deadline.split('T')[0] : '',
      })
    }
  }, [existingSavingsGoal])

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: async (data: SavingsGoalFormData) => {
      const url = savingsGoalId ? `/api/savings-goal/${savingsGoalId}` : '/api/savings-goal'
      const method = savingsGoalId ? 'PUT' : 'POST'
      
      const payload = {
        ...data,
        targetAmount: Number(data.targetAmount),
        deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save savings goal')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goal'] })
      if (savingsGoalId) {
        queryClient.invalidateQueries({ queryKey: ['savings-goal', savingsGoalId] })
      }
      setOpen(false)
      setError(null)
      onSuccess?.()
      
      // Reset form if creating new goal
      if (!savingsGoalId) {
        setFormData({
          title: '',
          description: '',
          targetAmount: 0,
          deadline: '',
        })
      }
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  // Status update mutations
  const achieveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/savings-goal/${savingsGoalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACHIEVED' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to mark goal as achieved')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goal'] })
      setOpen(false)
      onSuccess?.()
    },
    onError: (error: Error) => {
      setError(error.message)
    },
  })

  const discardMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/savings-goal/${savingsGoalId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DISCARDED' }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to discard goal')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savings-goal'] })
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
    if (!formData.title.trim()) {
      setError('Title is required')
      return
    }

    if (formData.targetAmount <= 0) {
      setError('Target amount must be positive')
      return
    }

    if (formData.deadline && new Date(formData.deadline) <= new Date()) {
      setError('Deadline must be in the future')
      return
    }

    mutation.mutate(formData)
  }

  const handleAchieve = () => {
    if (confirm('Mark this savings goal as achieved? This cannot be undone.')) {
      achieveMutation.mutate()
    }
  }

  const handleDiscard = () => {
    if (confirm('Discard this savings goal? This cannot be undone and you will be able to create a new goal.')) {
      discardMutation.mutate()
    }
  }

  const isEditing = !!savingsGoalId
  const isLoading = mutation.isPending || achieveMutation.isPending || discardMutation.isPending

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>{isEditing ? 'Edit Savings Goal' : 'Create Savings Goal'}</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Goal Preview */}
          {formData.title && (
            <div className="p-4 border rounded-lg bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-xl">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-emerald-900">{formData.title}</h3>
                  <p className="text-sm text-emerald-700">
                    Target: {formatCurrency(formData.targetAmount || 0)}
                  </p>
                  {formData.deadline && (
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      Due {new Date(formData.deadline).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Goal Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., New Laptop, Vacation Fund"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <Input
                id="targetAmount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  targetAmount: parseFloat(e.target.value) || 0 
                }))}
                placeholder="500.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Why is this goal important to you?"
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2">
            <div className="flex space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </Button>
            </div>

            {/* Status Change Buttons for Editing */}
            {isEditing && existingSavingsGoal?.status === 'ACTIVE' && (
              <div className="flex space-x-2 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAchieve}
                  disabled={isLoading}
                  className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                >
                  {achieveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Trophy className="mr-2 h-4 w-4" />
                  Mark Achieved
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDiscard}
                  disabled={isLoading}
                  className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                >
                  {discardMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <X className="mr-2 h-4 w-4" />
                  Discard
                </Button>
              </div>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
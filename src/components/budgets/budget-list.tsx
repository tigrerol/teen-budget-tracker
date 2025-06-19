'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BudgetForm } from './budget-form'
import { formatCurrency } from '@/lib/currency'
import { BudgetWithTotals, BudgetItem } from '@/types'
import { 
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Calendar,
  PiggyBank,
  Plus,
  Eye,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { format } from 'date-fns'

// Using BudgetWithTotals from @/types

interface PaginatedBudgets {
  data: BudgetWithTotals[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface BudgetFilters {
  search: string
  period: 'all' | 'MONTHLY' | 'WEEKLY' | 'YEARLY'
  isActive: 'all' | 'true' | 'false'
  sortBy: 'name' | 'startDate' | 'createdAt'
  sortOrder: 'asc' | 'desc'
  page: number
}

export function BudgetList() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState<BudgetFilters>({
    search: '',
    period: 'all',
    isActive: 'all',
    sortBy: 'startDate',
    sortOrder: 'desc',
    page: 1,
  })

  const [expandedBudget, setExpandedBudget] = useState<string | null>(null)

  // Build query parameters
  const buildQueryParams = (filterParams: BudgetFilters) => {
    const params = new URLSearchParams()
    
    params.set('page', filterParams.page.toString())
    params.set('limit', '10')
    params.set('sortBy', filterParams.sortBy)
    params.set('sortOrder', filterParams.sortOrder)
    
    if (filterParams.search) params.set('search', filterParams.search)
    if (filterParams.period !== 'all') params.set('period', filterParams.period)
    if (filterParams.isActive !== 'all') params.set('isActive', filterParams.isActive)
    
    return params.toString()
  }

  // Fetch budgets
  const { 
    data: budgetsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['budgets', filters],
    queryFn: async () => {
      const queryParams = buildQueryParams(filters)
      const response = await fetch(`/api/budgets?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch budgets')
      }
      return response.json() as Promise<PaginatedBudgets>
    },
    enabled: !!session,
  })

  // Delete budget mutation
  const deleteMutation = useMutation({
    mutationFn: async (budgetId: string) => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete budget')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  // Toggle active status mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ budgetId, isActive }: { budgetId: string; isActive: boolean }) => {
      const response = await fetch(`/api/budgets/${budgetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update budget')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] })
    },
  })

  // Update filters
  const updateFilter = (key: keyof BudgetFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : typeof value === 'string' ? parseInt(value) : value, // Reset to page 1 when filtering
    }))
  }

  // Handle delete
  const handleDelete = async (budgetId: string, budgetName: string) => {
    if (confirm(`Are you sure you want to delete "${budgetName}"? This action cannot be undone.`)) {
      deleteMutation.mutate(budgetId)
    }
  }

  // Handle toggle active
  const handleToggleActive = (budgetId: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({ budgetId, isActive: !currentStatus })
  }

  const budgets = budgetsData?.data || []
  const pagination = budgetsData?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Budgets</h2>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.totalCount} total budgets` : 'Manage your budgets'}
          </p>
        </div>
        <BudgetForm
          trigger={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Budget
            </Button>
          }
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search budget names..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Period Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Period</label>
              <Select value={filters.period} onValueChange={(value) => updateFilter('period', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="WEEKLY">📅 Weekly</SelectItem>
                  <SelectItem value="MONTHLY">📊 Monthly</SelectItem>
                  <SelectItem value="YEARLY">📈 Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.isActive} onValueChange={(value) => updateFilter('isActive', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Budgets</SelectItem>
                  <SelectItem value="true">✅ Active</SelectItem>
                  <SelectItem value="false">⏸️ Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort</label>
              <Select 
                value={`${filters.sortBy}-${filters.sortOrder}`} 
                onValueChange={(value) => {
                  const [sortBy, sortOrder] = value.split('-')
                  updateFilter('sortBy', sortBy)
                  updateFilter('sortOrder', sortOrder)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="startDate-desc">Start Date (Newest First)</SelectItem>
                  <SelectItem value="startDate-asc">Start Date (Oldest First)</SelectItem>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="createdAt-desc">Created (Newest First)</SelectItem>
                  <SelectItem value="createdAt-asc">Created (Oldest First)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load budgets'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading budgets...</span>
        </div>
      ) : budgets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <PiggyBank className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No budgets found</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.period !== 'all' || filters.isActive !== 'all'
                    ? 'Try adjusting your filters or create a new budget.'
                    : 'Get started by creating your first budget.'}
                </p>
              </div>
              <BudgetForm
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Budget
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Budget Cards */}
          {budgets.map((budget: BudgetWithTotals) => (
            <Card key={budget.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Budget Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div>
                        <h3 className="font-semibold text-lg">{budget.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {format(new Date(budget.startDate), 'MMM dd')} - {format(new Date(budget.endDate), 'MMM dd, yyyy')}
                          </span>
                          <Badge variant="outline">
                            {budget.period.toLowerCase()}
                          </Badge>
                          <Badge variant={budget.isActive ? "default" : "secondary"}>
                            {budget.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedBudget(
                          expandedBudget === budget.id ? null : budget.id
                        )}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(budget.id, budget.isActive)}
                        disabled={toggleActiveMutation.isPending}
                      >
                        {budget.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>

                      <BudgetForm
                        budgetId={budget.id}
                        trigger={
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        }
                        onSuccess={() => refetch()}
                      />

                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDelete(budget.id, budget.name)}
                        disabled={deleteMutation.isPending}
                      >
                        {deleteMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Budget Summary */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Income</div>
                        <div className="font-semibold text-green-600">
                          {formatCurrency(budget.totals.totalIncome)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {budget.totals.incomeItemCount} items
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <TrendingDown className="h-5 w-5 text-red-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Expenses</div>
                        <div className="font-semibold text-red-600">
                          {formatCurrency(budget.totals.totalExpenses)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {budget.totals.expenseItemCount} items
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <PiggyBank className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">Net Income</div>
                        <div className={`font-semibold ${
                          budget.totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(budget.totals.netIncome)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {budget.totals.netIncome >= 0 ? 'Surplus' : 'Deficit'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedBudget === budget.id && (
                    <div className="border-t pt-4 space-y-4">
                      {/* Income Items */}
                      {budget.budgetItems?.filter((item: any) => item.type === 'INCOME').length && budget.budgetItems.filter((item: any) => item.type === 'INCOME').length > 0 && (
                        <div>
                          <h4 className="font-medium text-green-600 mb-2 flex items-center">
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Income Categories
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {budget.budgetItems
                              ?.filter((item: any) => item.type === 'INCOME')
                              .map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                      item.category?.color || 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {item.category?.icon || '💰'}
                                    </div>
                                    <span className="text-sm font-medium">{item.category?.name}</span>
                                  </div>
                                  <span className="font-semibold text-green-600">
                                    {formatCurrency(item.amount)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* Expense Items */}
                      {budget.budgetItems?.filter((item: any) => item.type === 'EXPENSE').length && budget.budgetItems.filter((item: any) => item.type === 'EXPENSE').length > 0 && (
                        <div>
                          <h4 className="font-medium text-red-600 mb-2 flex items-center">
                            <TrendingDown className="h-4 w-4 mr-2" />
                            Expense Categories
                          </h4>
                          <div className="grid gap-2 md:grid-cols-2">
                            {budget.budgetItems
                              ?.filter((item: any) => item.type === 'EXPENSE')
                              .map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                                      item.category?.color || 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {item.category?.icon || '💸'}
                                    </div>
                                    <span className="text-sm font-medium">{item.category?.name}</span>
                                  </div>
                                  <span className="font-semibold text-red-600">
                                    {formatCurrency(item.amount)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of{' '}
                {pagination.totalCount} budgets
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter('page', pagination.page - 1)}
                  disabled={!pagination.hasPrev}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <div className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => updateFilter('page', pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
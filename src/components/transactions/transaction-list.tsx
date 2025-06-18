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
import { TransactionForm } from './transaction-form'
import { formatCurrency } from '@/lib/currency'
import { 
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowUpDown,
  TrendingUp,
  TrendingDown
} from 'lucide-react'
import { format } from 'date-fns'

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string
  date: string
  categoryId: string
  userId: string
  receiptUrl: string | null
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
    type: 'INCOME' | 'EXPENSE'
  }
}

interface PaginatedTransactions {
  data: Transaction[]
  pagination: {
    page: number
    limit: number
    totalPages: number
    totalCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

interface TransactionFilters {
  search: string
  type: 'ALL' | 'INCOME' | 'EXPENSE'
  categoryId: string
  sortBy: 'date' | 'amount' | 'description'
  sortOrder: 'asc' | 'desc'
  page: number
}

export function TransactionList() {
  const { data: session } = useSession()
  const queryClient = useQueryClient()
  
  const [filters, setFilters] = useState<TransactionFilters>({
    search: '',
    type: 'ALL',
    categoryId: 'all',
    sortBy: 'date',
    sortOrder: 'desc',
    page: 1,
  })

  const [editingTransaction, setEditingTransaction] = useState<string | null>(null)

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await fetch('/api/categories')
      if (!response.ok) throw new Error('Failed to fetch categories')
      return response.json()
    },
    enabled: !!session,
  })

  // Build query parameters
  const buildQueryParams = (filterParams: TransactionFilters) => {
    const params = new URLSearchParams()
    
    params.set('page', filterParams.page.toString())
    params.set('limit', '10')
    params.set('sortBy', filterParams.sortBy)
    params.set('sortOrder', filterParams.sortOrder)
    
    if (filterParams.search) params.set('search', filterParams.search)
    if (filterParams.type !== 'ALL') params.set('type', filterParams.type)
    if (filterParams.categoryId && filterParams.categoryId !== 'all') params.set('categoryId', filterParams.categoryId)
    
    return params.toString()
  }

  // Fetch transactions
  const { 
    data: transactionsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const queryParams = buildQueryParams(filters)
      const response = await fetch(`/api/transactions?${queryParams}`)
      if (!response.ok) {
        throw new Error('Failed to fetch transactions')
      }
      return response.json() as Promise<PaginatedTransactions>
    },
    enabled: !!session,
  })

  // Delete transaction mutation
  const deleteMutation = useMutation({
    mutationFn: async (transactionId: string) => {
      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete transaction')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['transaction-stats'] })
    },
  })

  // Update filters
  const updateFilter = (key: keyof TransactionFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key !== 'page' ? 1 : value, // Reset to page 1 when filtering
    }))
  }

  // Handle delete
  const handleDelete = async (transactionId: string) => {
    if (confirm('Are you sure you want to delete this transaction?')) {
      deleteMutation.mutate(transactionId)
    }
  }

  const transactions = transactionsData?.data || []
  const pagination = transactionsData?.pagination

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Transactions</h2>
          <p className="text-muted-foreground">
            {pagination ? `${pagination.totalCount} total transactions` : 'Manage your transactions'}
          </p>
        </div>
        <TransactionForm
          trigger={
            <Button>
              <TrendingUp className="mr-2 h-4 w-4" />
              Add Transaction
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
                  placeholder="Search descriptions..."
                  value={filters.search}
                  onChange={(e) => updateFilter('search', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={filters.type} onValueChange={(value) => updateFilter('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="INCOME">💰 Income</SelectItem>
                  <SelectItem value="EXPENSE">💸 Expense</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filters.categoryId} onValueChange={(value) => updateFilter('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category: any) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center">
                        {category.icon && <span className="mr-2">{category.icon}</span>}
                        {category.name}
                      </span>
                    </SelectItem>
                  ))}
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
                  <SelectItem value="date-desc">Date (Newest First)</SelectItem>
                  <SelectItem value="date-asc">Date (Oldest First)</SelectItem>
                  <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                  <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                  <SelectItem value="description-asc">Description (A-Z)</SelectItem>
                  <SelectItem value="description-desc">Description (Z-A)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || 'Failed to load transactions'}
          </AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading transactions...</span>
        </div>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="space-y-4">
              <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No transactions found</h3>
                <p className="text-muted-foreground">
                  {filters.search || filters.type !== 'ALL' || filters.categoryId
                    ? 'Try adjusting your filters or add a new transaction.'
                    : 'Get started by adding your first transaction.'}
                </p>
              </div>
              <TransactionForm
                trigger={
                  <Button>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Add Your First Transaction
                  </Button>
                }
              />
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Transactions */}
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="transition-shadow hover:shadow-md">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {/* Category Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                      transaction.category?.color || 'bg-gray-100 text-gray-800'
                    }`}>
                      {transaction.category?.icon || '📦'}
                    </div>
                    
                    {/* Transaction Details */}
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold">{transaction.description}</h3>
                        <Badge variant={transaction.type === 'INCOME' ? 'default' : 'secondary'}>
                          {transaction.type === 'INCOME' ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {transaction.type}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{transaction.category.name}</span>
                        <span>•</span>
                        <span>{format(new Date(transaction.date), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Amount and Actions */}
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'INCOME' 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {transaction.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(transaction.amount)}
                      </div>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex space-x-1">
                      <TransactionForm
                        transactionId={transaction.id}
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
                        onClick={() => handleDelete(transaction.id)}
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
                {pagination.totalCount} transactions
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
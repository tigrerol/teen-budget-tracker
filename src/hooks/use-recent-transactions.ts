import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface Transaction {
  id: string
  amount: number
  type: 'INCOME' | 'EXPENSE'
  description: string | null
  date: string
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
}

export function useRecentTransactions(limit = 5) {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['recent-transactions', limit],
    queryFn: async (): Promise<Transaction[]> => {
      const response = await fetch(`/api/transactions?limit=${limit}&sortBy=date&sortOrder=desc`)
      if (!response.ok) {
        throw new Error('Failed to fetch recent transactions')
      }
      const data = await response.json()
      return data.data || []
    },
    enabled: !!session,
  })
}
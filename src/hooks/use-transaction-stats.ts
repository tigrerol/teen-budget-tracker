import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

interface TransactionStats {
  totalBalance: number
  monthlyIncome: number
  monthlyExpenses: number
  currentMonthBalance: number
  previousMonthBalance: number
  balanceChange: number
  balanceChangePercent: number
}

export function useTransactionStats() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['transaction-stats'],
    queryFn: async (): Promise<TransactionStats> => {
      const response = await fetch('/api/transactions/stats')
      if (!response.ok) {
        throw new Error('Failed to fetch transaction stats')
      }
      return response.json()
    },
    enabled: !!session,
  })
}
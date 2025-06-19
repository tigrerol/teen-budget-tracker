import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'

export function useSavingsGoal() {
  const { data: session } = useSession()

  return useQuery({
    queryKey: ['savings-goal'],
    queryFn: async () => {
      const response = await fetch('/api/savings-goal')
      if (!response.ok) {
        throw new Error('Failed to fetch savings goal')
      }
      const data = await response.json()
      return data // Could be null if no active goal
    },
    enabled: !!session,
  })
}
'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { UserProfileCard } from '@/components/auth/user-profile-card'
import { PinPad } from '@/components/auth/pin-pad'
import { Button } from '@/components/ui/button'
import { PiggyBank } from 'lucide-react'

interface User {
  id: string
  name: string
  avatar: string
  color: string
}

const USERS: User[] = [
  {
    id: 'viola',
    name: 'Viola',
    avatar: '/avatars/viola-avatar.svg',
    color: '#C084FC'
  },
  {
    id: 'dominic',
    name: 'Dominic',
    avatar: '/avatars/dominic-avatar.svg',
    color: '#3B82F6'
  }
]

export default function SignInPage() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [userIds, setUserIds] = useState<Record<string, string>>({})
  const router = useRouter()

  // Fetch actual user IDs on mount
  useEffect(() => {
    fetchUserIds()
  }, [])

  const fetchUserIds = async () => {
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        const ids: Record<string, string> = {}
        data.users.forEach((user: any) => {
          if (user.name === 'Viola') ids.viola = user.id
          if (user.name === 'Dominic') ids.dominic = user.id
        })
        setUserIds(ids)
      }
    } catch (error) {
      console.error('Failed to fetch user IDs:', error)
    }
  }

  const handlePinSubmit = async (pin: string) => {
    if (!selectedUser || !userIds[selectedUser.id]) return

    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('pin', {
        userId: userIds[selectedUser.id],
        pin,
        redirect: false,
      })

      if (result?.error) {
        setError('Incorrect PIN. Please try again.')
        // Don't reset the PIN input, just show error
      } else {
        router.push('/')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDemoSignIn = async () => {
    setIsLoading(true)
    setError('')

    try {
      const result = await signIn('demo', {
        redirect: false,
      })

      if (result?.error) {
        setError('Failed to sign in. Please try again.')
      } else {
        router.push('/')
      }
    } catch {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <PiggyBank className="h-12 w-12 text-primary mr-3" />
          <h1 className="text-4xl font-bold text-primary">Teen Budget Tracker</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Learn financial literacy through smart budgeting
        </p>
      </div>

      {!selectedUser ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {USERS.map((user) => (
              <UserProfileCard
                key={user.id}
                name={user.name}
                avatar={user.avatar}
                color={user.color}
                onClick={() => setSelectedUser(user)}
              />
            ))}
          </div>
          
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="mt-4"
            >
              Try Demo Account
            </Button>
          </div>
        </div>
      ) : (
        <PinPad
          userName={selectedUser.name}
          userAvatar={selectedUser.avatar}
          onSubmit={handlePinSubmit}
          onBack={() => {
            setSelectedUser(null)
            setError('')
          }}
          isLoading={isLoading}
          error={error}
        />
      )}
    </div>
  )
}
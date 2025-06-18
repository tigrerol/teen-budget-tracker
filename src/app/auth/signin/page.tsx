'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

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
    } catch (err) {
      setError('An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-primary">
            Teen Budget Tracker
          </CardTitle>
          <CardDescription>
            Learn financial literacy through smart budgeting
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Button 
            onClick={handleDemoSignIn}
            disabled={isLoading}
            className="w-full"
            size="lg"
          >
            {isLoading ? 'Signing in...' : 'Try Demo Account'}
          </Button>
          
          <div className="text-center text-sm text-muted-foreground">
            <p>🔒 No registration required</p>
            <p>Start tracking your budget instantly!</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
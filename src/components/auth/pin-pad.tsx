'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Delete, Circle } from 'lucide-react'

interface PinPadProps {
  userName: string
  userAvatar: string
  onSubmit: (pin: string) => void
  onBack: () => void
  isLoading?: boolean
  error?: string
}

export function PinPad({ userName, userAvatar, onSubmit, onBack, isLoading, error }: PinPadProps) {
  const [pin, setPin] = useState('')
  const maxPinLength = 4

  useEffect(() => {
    if (pin.length === maxPinLength) {
      onSubmit(pin)
    }
  }, [pin, onSubmit])

  const handleNumberClick = (num: string) => {
    if (pin.length < maxPinLength) {
      setPin(pin + num)
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
  }

  const handleClear = () => {
    setPin('')
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="mb-4">
          <img 
            src={userAvatar} 
            alt={userName} 
            className="w-20 h-20 mx-auto rounded-full mb-2"
          />
          <CardTitle className="text-xl">Welcome back, {userName}!</CardTitle>
        </div>
        <p className="text-muted-foreground">Enter your 4-digit PIN</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* PIN Display */}
        <div className="flex justify-center space-x-3">
          {[...Array(maxPinLength)].map((_: undefined, i: number) => (
            <div
              key={i}
              className="w-12 h-12 border-2 rounded-lg flex items-center justify-center"
            >
              {i < pin.length ? (
                <Circle className="w-3 h-3 fill-current" />
              ) : null}
            </div>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-center text-sm text-destructive">{error}</p>
        )}

        {/* Number Pad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num: number) => (
            <Button
              key={num}
              variant="outline"
              size="lg"
              className="h-16 text-xl font-semibold"
              onClick={() => handleNumberClick(num.toString())}
              disabled={isLoading}
            >
              {num}
            </Button>
          ))}
          <Button
            variant="outline"
            size="lg"
            className="h-16"
            onClick={handleClear}
            disabled={isLoading}
          >
            Clear
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16 text-xl font-semibold"
            onClick={() => handleNumberClick('0')}
            disabled={isLoading}
          >
            0
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-16"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Delete className="h-5 w-5" />
          </Button>
        </div>

        {/* Back Button */}
        <Button
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isLoading}
        >
          Choose Different User
        </Button>
      </CardContent>
    </Card>
  )
}
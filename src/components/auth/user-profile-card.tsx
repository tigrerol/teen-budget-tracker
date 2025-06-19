'use client'

import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

interface UserProfileCardProps {
  name: string
  avatar: string
  color: string
  onClick: () => void
}

export function UserProfileCard({ name, avatar, color, onClick }: UserProfileCardProps) {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 hover:shadow-xl border-2`}
      style={{ borderColor: color }}
      onClick={onClick}
    >
      <CardContent className="p-8 text-center">
        <div className="mb-4 relative w-32 h-32 mx-auto">
          <Image
            src={avatar}
            alt={`${name}'s avatar`}
            width={128}
            height={128}
            className="rounded-full"
          />
        </div>
        <h3 className="text-2xl font-bold" style={{ color }}>{name}</h3>
        <p className="text-muted-foreground mt-2">Tap to sign in</p>
      </CardContent>
    </Card>
  )
}
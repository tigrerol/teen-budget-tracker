import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Fetch only Viola and Dominic users
    const users = await prisma.user.findMany({
      where: {
        name: {
          in: ['Viola', 'Dominic']
        }
      },
      select: {
        id: true,
        name: true,
        avatar: true
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}
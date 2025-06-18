import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST() {
  const DEMO_EMAIL = 'demo@teen-budget.app'
  
  try {
    // Check if demo user exists, create if not
    let user = await prisma.user.findUnique({
      where: { email: DEMO_EMAIL }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: DEMO_EMAIL,
          name: 'Demo User',
          image: null,
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      }
    })
  } catch (error) {
    console.error('Demo user creation error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create demo user' },
      { status: 500 }
    )
  }
}
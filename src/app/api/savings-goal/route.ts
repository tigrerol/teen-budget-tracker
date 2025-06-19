import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateSavingsGoalSchema } from '@/lib/validations'
import { Transaction } from '@/types'
import { z } from 'zod'

// GET /api/savings-goal - Get user's active savings goal
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const savingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        transactions: {
          where: {
            type: 'INCOME' // Only count income transactions as savings
          },
          select: {
            amount: true
          }
        }
      }
    })

    if (!savingsGoal) {
      return NextResponse.json(null)
    }

    // Calculate current amount from linked transactions
    const currentAmount = savingsGoal.transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0)
    const progress = (currentAmount / savingsGoal.targetAmount) * 100
    const isDeadlineMissed = savingsGoal.deadline ? new Date() > savingsGoal.deadline : false

    const response = {
      ...savingsGoal,
      transactions: undefined, // Remove transactions from response
      currentAmount,
      progress: Math.min(progress, 100), // Cap at 100%
      isDeadlineMissed
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/savings-goal error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/savings-goal - Create new savings goal
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateSavingsGoalSchema.parse(body)
    
    // Check if user already has an active savings goal
    const existingGoal = await prisma.savingsGoal.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    })
    
    if (existingGoal) {
      return NextResponse.json(
        { 
          error: 'Active savings goal already exists',
          details: 'You can only have one active savings goal at a time. Complete or discard your current goal before creating a new one.'
        },
        { status: 409 }
      )
    }

    // Create the savings goal
    const savingsGoal = await prisma.savingsGoal.create({
      data: {
        ...validatedData,
        userId: session.user.id,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : null
      }
    })

    // Return with initial calculated fields
    const response = {
      ...savingsGoal,
      currentAmount: 0,
      progress: 0,
      isDeadlineMissed: false
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('POST /api/savings-goal error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateSavingsGoalStatusSchema } from '@/lib/validations'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// PATCH /api/savings-goal/[id]/status - Update savings goal status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateSavingsGoalStatusSchema.parse(body)
    
    // Check if savings goal exists and belongs to user
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      },
      include: {
        transactions: {
          where: {
            type: 'INCOME'
          },
          select: {
            amount: true
          }
        }
      }
    })
    
    if (!existingSavingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      )
    }

    // Validate status transition
    if (existingSavingsGoal.status === validatedData.status) {
      return NextResponse.json(
        { error: `Savings goal is already ${validatedData.status.toLowerCase()}` },
        { status: 400 }
      )
    }

    // Don't allow changing status from achieved/discarded back to active
    if (existingSavingsGoal.status !== 'ACTIVE' && validatedData.status === 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot reactivate a completed or discarded savings goal' },
        { status: 400 }
      )
    }

    // Update the status
    const updatedSavingsGoal = await prisma.savingsGoal.update({
      where: { id: id },
      data: {
        status: validatedData.status
      },
      include: {
        transactions: {
          where: {
            type: 'INCOME'
          },
          select: {
            amount: true
          }
        }
      }
    })

    // Calculate current amount and progress
    const currentAmount = updatedSavingsGoal.transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0)
    const progress = (currentAmount / updatedSavingsGoal.targetAmount) * 100
    const isDeadlineMissed = updatedSavingsGoal.deadline ? new Date() > updatedSavingsGoal.deadline : false

    const response = {
      ...updatedSavingsGoal,
      transactions: undefined,
      currentAmount,
      progress: Math.min(progress, 100),
      isDeadlineMissed
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('PATCH /api/savings-goal/[id]/status error:', error)
    
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
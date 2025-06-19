import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateSavingsGoalSchema } from '@/lib/validations'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/savings-goal/[id] - Get specific savings goal
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const savingsGoal = await prisma.savingsGoal.findFirst({
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

    if (!savingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      )
    }

    // Calculate current amount from linked transactions
    const currentAmount = savingsGoal.transactions.reduce((sum: number, transaction: any) => sum + transaction.amount, 0)
    const progress = (currentAmount / savingsGoal.targetAmount) * 100
    const isDeadlineMissed = savingsGoal.deadline ? new Date() > savingsGoal.deadline : false

    const response = {
      ...savingsGoal,
      transactions: undefined,
      currentAmount,
      progress: Math.min(progress, 100),
      isDeadlineMissed
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('GET /api/savings-goal/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/savings-goal/[id] - Update savings goal
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateSavingsGoalSchema.parse(body)
    
    // Check if savings goal exists and belongs to user
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })
    
    if (!existingSavingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      )
    }

    // Don't allow updates to non-active goals
    if (existingSavingsGoal.status !== 'ACTIVE') {
      return NextResponse.json(
        { error: 'Cannot update completed or discarded savings goal' },
        { status: 400 }
      )
    }

    // Update the savings goal
    const updatedSavingsGoal = await prisma.savingsGoal.update({
      where: { id: id },
      data: {
        ...validatedData,
        deadline: validatedData.deadline ? new Date(validatedData.deadline) : undefined
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
    console.error('PUT /api/savings-goal/[id] error:', error)
    
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

// DELETE /api/savings-goal/[id] - Delete savings goal
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if savings goal exists and belongs to user
    const existingSavingsGoal = await prisma.savingsGoal.findFirst({
      where: {
        id: id,
        userId: session.user.id
      }
    })
    
    if (!existingSavingsGoal) {
      return NextResponse.json(
        { error: 'Savings goal not found' },
        { status: 404 }
      )
    }

    // Before deleting, unlink any transactions
    await prisma.transaction.updateMany({
      where: {
        savingsGoalId: id
      },
      data: {
        savingsGoalId: null
      }
    })

    // Delete the savings goal
    await prisma.savingsGoal.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/savings-goal/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
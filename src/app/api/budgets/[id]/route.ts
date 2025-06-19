import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateBudgetSchema } from '@/lib/validations'
import { BudgetItem } from '@/types'
import { z } from 'zod'

// GET /api/budgets/[id] - Get a specific budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { id } = await params

    const budget = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        budgetItems: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true,
                type: true,
              },
            },
          },
          orderBy: [
            { type: 'asc' }, // EXPENSE first, then INCOME
            { category: { name: 'asc' } },
          ],
        },
      },
    })

    if (!budget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    // Calculate budget totals
    const incomeItems = budget.budgetItems.filter((item: any) => item.type === 'INCOME')
    const expenseItems = budget.budgetItems.filter((item: any) => item.type === 'EXPENSE')
    
    const totalIncome = incomeItems.reduce((sum: number, item: any) => sum + item.amount, 0)
    const totalExpenses = expenseItems.reduce((sum: number, item: any) => sum + item.amount, 0)
    const netIncome = totalIncome - totalExpenses

    const budgetWithTotals = {
      ...budget,
      totals: {
        totalIncome,
        totalExpenses,
        netIncome,
        incomeItemCount: incomeItems.length,
        expenseItemCount: expenseItems.length,
      },
    }

    return NextResponse.json(budgetWithTotals)
  } catch (error) {
    console.error('GET /api/budgets/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/budgets/[id] - Update a budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = UpdateBudgetSchema.parse(body)

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    // If budget items are being updated, validate categories
    if (validatedData.budgetItems) {
      const categoryIds = validatedData.budgetItems.map((item: any) => item.categoryId)
      const categories = await prisma.category.findMany({
        where: {
          id: { in: categoryIds },
          userId: user.id,
        },
      })

      if (categories.length !== categoryIds.length) {
        return NextResponse.json(
          { error: 'One or more categories not found or do not belong to user' },
          { status: 400 }
        )
      }
    }

    // Update budget in a transaction
    const updatedBudget = await prisma.$transaction(async (tx: any) => {
      // Update budget basic info
      const budgetUpdateData: any = {}
      if (validatedData.name !== undefined) budgetUpdateData.name = validatedData.name
      if (validatedData.period !== undefined) budgetUpdateData.period = validatedData.period
      if (validatedData.startDate !== undefined) budgetUpdateData.startDate = new Date(validatedData.startDate)
      if (validatedData.endDate !== undefined) budgetUpdateData.endDate = new Date(validatedData.endDate)
      if (validatedData.isActive !== undefined) budgetUpdateData.isActive = validatedData.isActive

      const budget = await tx.budget.update({
        where: { id },
        data: budgetUpdateData,
      })

      // If budget items are being updated, replace them
      if (validatedData.budgetItems) {
        // Delete existing budget items
        await tx.budgetItem.deleteMany({
          where: { budgetId: id },
        })

        // Create new budget items
        await tx.budgetItem.createMany({
          data: validatedData.budgetItems.map((item: any) => ({
            budgetId: id,
            categoryId: item.categoryId,
            amount: item.amount,
            type: item.type,
          })),
        })
      }

      return budget
    })

    // Fetch the complete updated budget with relations
    const completeUpdatedBudget = await prisma.budget.findUnique({
      where: { id },
      include: {
        budgetItems: {
          include: {
            category: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true,
                type: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(completeUpdatedBudget)
  } catch (error) {
    console.error('PUT /api/budgets/[id] error:', error)
    
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

// DELETE /api/budgets/[id] - Delete a budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const { id } = await params

    // Check if budget exists and belongs to user
    const existingBudget = await prisma.budget.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!existingBudget) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      )
    }

    // Delete budget (budget items will be deleted automatically due to cascade)
    await prisma.budget.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Budget deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('DELETE /api/budgets/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
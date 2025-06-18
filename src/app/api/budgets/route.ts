import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateBudgetSchema, BudgetFiltersSchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/budgets - Get user's budgets with pagination and filtering
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams)
    
    // Process query parameters
    const processedParams = {
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : 1,
      limit: queryParams.limit ? parseInt(queryParams.limit) : 20,
      isActive: queryParams.isActive ? queryParams.isActive === 'true' : undefined,
    }

    const filters = BudgetFiltersSchema.parse(processedParams)

    // Build where clause
    const where: any = {
      userId: user.id,
    }

    if (filters.period) where.period = filters.period
    if (filters.isActive !== undefined) where.isActive = filters.isActive
    if (filters.search) {
      where.name = {
        contains: filters.search,
        mode: 'insensitive',
      }
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit
    const take = filters.limit

    // Get total count for pagination
    const totalCount = await prisma.budget.count({ where })
    const totalPages = Math.ceil(totalCount / filters.limit)

    // Get budgets with budget items and categories
    const budgets = await prisma.budget.findMany({
      where,
      skip,
      take,
      orderBy: {
        [filters.sortBy]: filters.sortOrder,
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
        },
      },
    })

    // Calculate budget totals
    const budgetsWithTotals = budgets.map(budget => {
      const incomeItems = budget.budgetItems.filter(item => item.type === 'INCOME')
      const expenseItems = budget.budgetItems.filter(item => item.type === 'EXPENSE')
      
      const totalIncome = incomeItems.reduce((sum, item) => sum + item.amount, 0)
      const totalExpenses = expenseItems.reduce((sum, item) => sum + item.amount, 0)
      const netIncome = totalIncome - totalExpenses

      return {
        ...budget,
        totals: {
          totalIncome,
          totalExpenses,
          netIncome,
          incomeItemCount: incomeItems.length,
          expenseItemCount: expenseItems.length,
        },
      }
    })

    const paginatedResponse = {
      data: budgetsWithTotals,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalPages,
        totalCount,
        hasNext: filters.page < totalPages,
        hasPrev: filters.page > 1,
      }
    }

    return NextResponse.json(paginatedResponse)
  } catch (error) {
    console.error('GET /api/budgets error:', error)
    
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

// POST /api/budgets - Create a new budget
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const validatedData = CreateBudgetSchema.parse(body)

    // Check if categories belong to the user
    const categoryIds = validatedData.budgetItems.map(item => item.categoryId)
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

    // Create budget with budget items in a transaction
    const budget = await prisma.budget.create({
      data: {
        name: validatedData.name,
        period: validatedData.period,
        startDate: new Date(validatedData.startDate),
        endDate: new Date(validatedData.endDate),
        userId: user.id,
        budgetItems: {
          create: validatedData.budgetItems.map(item => ({
            categoryId: item.categoryId,
            amount: item.amount,
            type: item.type,
            notes: item.notes || null,
          })),
        },
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
        },
      },
    })

    return NextResponse.json(budget, { status: 201 })
  } catch (error) {
    console.error('POST /api/budgets error:', error)
    
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
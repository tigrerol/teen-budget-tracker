import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { 
  CreateTransactionSchema, 
  TransactionFiltersSchema,
  PaginatedTransactionsSchema 
} from '@/lib/validations'
import { z } from 'zod'

// GET /api/transactions - List transactions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryParams = Object.fromEntries(searchParams)
    
    // Convert string params to appropriate types
    const processedParams = {
      ...queryParams,
      page: queryParams.page ? parseInt(queryParams.page) : undefined,
      limit: queryParams.limit ? parseInt(queryParams.limit) : undefined,
      minAmount: queryParams.minAmount ? parseFloat(queryParams.minAmount) : undefined,
      maxAmount: queryParams.maxAmount ? parseFloat(queryParams.maxAmount) : undefined,
    }

    // Validate query parameters
    const filters = TransactionFiltersSchema.parse(processedParams)
    
    // Build where clause
    const whereClause: any = {
      userId: session.user.id,
    }
    
    if (filters.type) {
      whereClause.type = filters.type
    }
    
    if (filters.categoryId) {
      whereClause.categoryId = filters.categoryId
    }
    
    if (filters.startDate || filters.endDate) {
      whereClause.date = {}
      if (filters.startDate) {
        whereClause.date.gte = new Date(filters.startDate)
      }
      if (filters.endDate) {
        whereClause.date.lte = new Date(filters.endDate)
      }
    }
    
    if (filters.minAmount || filters.maxAmount) {
      whereClause.amount = {}
      if (filters.minAmount) {
        whereClause.amount.gte = filters.minAmount
      }
      if (filters.maxAmount) {
        whereClause.amount.lte = filters.maxAmount
      }
    }
    
    if (filters.search) {
      whereClause.description = {
        contains: filters.search,
        mode: 'insensitive'
      }
    }

    // Calculate pagination
    const skip = (filters.page - 1) * filters.limit
    
    // Get total count for pagination
    const totalCount = await prisma.transaction.count({
      where: whereClause
    })
    
    const totalPages = Math.ceil(totalCount / filters.limit)
    
    // Get transactions
    const transactions = await prisma.transaction.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          }
        }
      },
      orderBy: {
        [filters.sortBy]: filters.sortOrder
      },
      skip,
      take: filters.limit,
    })

    const paginatedResponse = {
      data: transactions,
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
    console.error('GET /api/transactions error:', error)
    
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

// POST /api/transactions - Create new transaction
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateTransactionSchema.parse(body)
    
    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: session.user.id,
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found or does not belong to user' },
        { status: 404 }
      )
    }
    
    // Verify transaction type matches category type
    if (validatedData.type !== category.type) {
      return NextResponse.json(
        { error: 'Transaction type must match category type' },
        { status: 400 }
      )
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        date: new Date(validatedData.date),
        userId: session.user.id,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            icon: true,
            color: true,
            type: true,
          }
        }
      }
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    console.error('POST /api/transactions error:', error)
    
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
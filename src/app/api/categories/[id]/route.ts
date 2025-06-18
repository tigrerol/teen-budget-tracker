import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateCategorySchema } from '@/lib/validations'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/categories/[id] - Get single category with usage stats
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const category = await prisma.category.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            budgetItems: true,
          }
        }
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Get additional usage statistics
    const transactionStats = await prisma.transaction.aggregate({
      where: {
        categoryId: id,
        userId: session.user.id,
      },
      _sum: {
        amount: true,
      },
      _avg: {
        amount: true,
      }
    })

    // Get recent transactions for this category
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        categoryId: id,
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc'
      },
      take: 5,
      select: {
        id: true,
        amount: true,
        description: true,
        date: true,
      }
    })

    const categoryWithStats = {
      ...category,
      usage: {
        totalAmount: transactionStats._sum.amount || 0,
        averageAmount: transactionStats._avg.amount || 0,
        recentTransactions,
      }
    }

    return NextResponse.json(categoryWithStats)
  } catch (error) {
    console.error('GET /api/categories/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/categories/[id] - Update category
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateCategorySchema.parse(body)
    
    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }
    
    // If name is being updated, check for duplicates
    if (validatedData.name && validatedData.name !== existingCategory.name) {
      const duplicateCategory = await prisma.category.findFirst({
        where: {
          userId: session.user.id,
          name: validatedData.name,
          id: { not: id }, // Exclude current category
        }
      })
      
      if (duplicateCategory) {
        return NextResponse.json(
          { error: 'Category with this name already exists' },
          { status: 409 }
        )
      }
    }
    
    // If type is being changed, check if any transactions exist
    if (validatedData.type && validatedData.type !== existingCategory.type) {
      const transactionCount = await prisma.transaction.count({
        where: {
          categoryId: id,
          userId: session.user.id,
        }
      })
      
      if (transactionCount > 0) {
        return NextResponse.json(
          { 
            error: 'Cannot change category type when transactions exist',
            details: `This category has ${transactionCount} existing transactions. Create a new category instead.`
          },
          { status: 400 }
        )
      }
    }

    // Update category
    const category = await prisma.category.update({
      where: { id: id },
      data: validatedData,
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('PUT /api/categories/[id] error:', error)
    
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

// DELETE /api/categories/[id] - Delete category
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if category exists and belongs to user
    const existingCategory = await prisma.category.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })
    
    if (!existingCategory) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Check if category has transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        categoryId: id,
        userId: session.user.id,
      }
    })
    
    if (transactionCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with existing transactions',
          details: `Found ${transactionCount} transactions using this category`
        },
        { status: 400 }
      )
    }
    
    // Check if category has budget items
    const budgetItemCount = await prisma.budgetItem.count({
      where: {
        categoryId: id,
      }
    })
    
    if (budgetItemCount > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete category with existing budget items',
          details: `Found ${budgetItemCount} budget items using this category`
        },
        { status: 400 }
      )
    }

    // Delete category
    await prisma.category.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/categories/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
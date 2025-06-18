import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { UpdateTransactionSchema } from '@/lib/validations'
import { z } from 'zod'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

// GET /api/transactions/[id] - Get single transaction
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
      where: {
        id: id,
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

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('GET /api/transactions/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/transactions/[id] - Update transaction
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    
    // Validate request body
    const validatedData = UpdateTransactionSchema.parse(body)
    
    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })
    
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }
    
    // If categoryId is being updated, verify it belongs to user
    if (validatedData.categoryId) {
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
      
      // Verify transaction type matches category type if type is provided
      const transactionType = validatedData.type || existingTransaction.type
      if (transactionType !== category.type) {
        return NextResponse.json(
          { error: 'Transaction type must match category type' },
          { status: 400 }
        )
      }
    }
    
    // If type is being updated without categoryId, verify it matches existing category
    if (validatedData.type && !validatedData.categoryId) {
      const category = await prisma.category.findFirst({
        where: {
          id: existingTransaction.categoryId,
        }
      })
      
      if (category && validatedData.type !== category.type) {
        return NextResponse.json(
          { error: 'Transaction type must match category type' },
          { status: 400 }
        )
      }
    }

    // Prepare update data
    const updateData: any = {}
    if (validatedData.amount !== undefined) updateData.amount = validatedData.amount
    if (validatedData.type !== undefined) updateData.type = validatedData.type
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.date !== undefined) updateData.date = new Date(validatedData.date)
    if (validatedData.categoryId !== undefined) updateData.categoryId = validatedData.categoryId
    if (validatedData.receiptUrl !== undefined) updateData.receiptUrl = validatedData.receiptUrl

    // Update transaction
    const transaction = await prisma.transaction.update({
      where: { id: id },
      data: updateData,
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

    return NextResponse.json(transaction)
  } catch (error) {
    console.error('PUT /api/transactions/[id] error:', error)
    
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

// DELETE /api/transactions/[id] - Delete transaction
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if transaction exists and belongs to user
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id: id,
        userId: session.user.id,
      }
    })
    
    if (!existingTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Delete transaction
    await prisma.transaction.delete({
      where: { id: id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('DELETE /api/transactions/[id] error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
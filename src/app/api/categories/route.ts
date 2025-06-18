import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { CreateCategorySchema } from '@/lib/validations'
import { z } from 'zod'

// GET /api/categories - List all user categories
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // Filter by type (INCOME/EXPENSE)
    const includeCount = searchParams.get('includeCount') === 'true'

    const whereClause: any = {
      userId: session.user.id,
    }

    if (type && (type === 'INCOME' || type === 'EXPENSE')) {
      whereClause.type = type
    }

    const categories = await prisma.category.findMany({
      where: whereClause,
      include: includeCount ? {
        _count: {
          select: {
            transactions: true,
          }
        }
      } : undefined,
      orderBy: [
        { type: 'asc' }, // Income first, then expenses
        { name: 'asc' }  // Then alphabetical
      ]
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('GET /api/categories error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/categories - Create new category
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate request body
    const validatedData = CreateCategorySchema.parse(body)
    
    // Check if category name already exists for this user
    const existingCategory = await prisma.category.findFirst({
      where: {
        userId: session.user.id,
        name: validatedData.name,
      }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Category with this name already exists' },
        { status: 409 }
      )
    }

    // Create category
    const category = await prisma.category.create({
      data: {
        ...validatedData,
        userId: session.user.id,
      }
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('POST /api/categories error:', error)
    
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
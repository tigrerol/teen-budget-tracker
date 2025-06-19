import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Transaction } from '@/types'

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

    // Get current month date range
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
    
    // Get previous month date range
    const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)

    // Get all transactions for the user
    const allTransactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
      },
      select: {
        amount: true,
        type: true,
        date: true,
      },
    })

    // Calculate total balance (all time)
    const totalBalance = allTransactions.reduce((sum: number, transaction: any) => {
      return transaction.type === 'INCOME' 
        ? sum + transaction.amount 
        : sum - transaction.amount
    }, 0)

    // Filter transactions for current month
    const currentMonthTransactions = allTransactions.filter((t: any) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= currentMonthStart && transactionDate <= currentMonthEnd
    })

    // Filter transactions for previous month
    const previousMonthTransactions = allTransactions.filter((t: any) => {
      const transactionDate = new Date(t.date)
      return transactionDate >= previousMonthStart && transactionDate <= previousMonthEnd
    })

    // Calculate current month stats
    const monthlyIncome = currentMonthTransactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const monthlyExpenses = currentMonthTransactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const currentMonthBalance = monthlyIncome - monthlyExpenses

    // Calculate previous month balance
    const previousMonthIncome = previousMonthTransactions
      .filter((t: any) => t.type === 'INCOME')
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const previousMonthExpenses = previousMonthTransactions
      .filter((t: any) => t.type === 'EXPENSE')
      .reduce((sum: number, t: any) => sum + t.amount, 0)

    const previousMonthBalance = previousMonthIncome - previousMonthExpenses

    // Calculate balance change
    const balanceChange = currentMonthBalance - previousMonthBalance
    const balanceChangePercent = previousMonthBalance !== 0 
      ? (balanceChange / Math.abs(previousMonthBalance)) * 100 
      : 0

    const stats = {
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      currentMonthBalance,
      previousMonthBalance,
      balanceChange,
      balanceChangePercent,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching transaction stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
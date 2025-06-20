import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  // Income Categories
  { name: 'Allowance', icon: '💰', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Part-time Job', icon: '💼', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Gifts', icon: '🎁', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Side Hustle', icon: '🚀', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  
  // Expense Categories
  { name: 'Food & Drinks', icon: '🍔', color: 'bg-orange-100 text-orange-800', type: 'EXPENSE' },
  { name: 'Clothes', icon: '👕', color: 'bg-purple-100 text-purple-800', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎮', color: 'bg-blue-100 text-blue-800', type: 'EXPENSE' },
  { name: 'Transportation', icon: '🚌', color: 'bg-yellow-100 text-yellow-800', type: 'EXPENSE' },
  { name: 'School Supplies', icon: '📚', color: 'bg-indigo-100 text-indigo-800', type: 'EXPENSE' },
  { name: 'Personal Care', icon: '🧴', color: 'bg-pink-100 text-pink-800', type: 'EXPENSE' },
  { name: 'Technology', icon: '📱', color: 'bg-gray-100 text-gray-800', type: 'EXPENSE' },
  { name: 'Savings Goal', icon: '🎯', color: 'bg-emerald-100 text-emerald-800', type: 'EXPENSE' },
  { name: 'Other', icon: '📦', color: 'bg-slate-100 text-slate-800', type: 'EXPENSE' },
]

async function createDefaultCategories(userId: string) {
  console.log('Creating default categories for user:', userId)
  
  for (const category of DEFAULT_CATEGORIES) {
    try {
      await prisma.category.upsert({
        where: {
          userId_name: {
            userId,
            name: category.name
          }
        },
        update: {
          icon: category.icon,
          color: category.color,
          type: category.type,
        },
        create: {
          name: category.name,
          icon: category.icon,
          color: category.color,
          type: category.type,
          userId,
        }
      })
    } catch (error) {
      console.error(`Failed to create category ${category.name}:`, error)
    }
  }
}

async function createSampleBudgets(userId: string) {
  console.log('Creating sample budgets for user:', userId)
  
  // Get some categories for budget creation
  const expenseCategories = await prisma.category.findMany({
    where: { userId, type: 'EXPENSE' }
  })
  
  const incomeCategories = await prisma.category.findMany({
    where: { userId, type: 'INCOME' }
  })
  
  if (expenseCategories.length === 0 || incomeCategories.length === 0) {
    console.log('No categories found, skipping budget creation')
    return
  }
  
  // Create a monthly budget for current month
  const now = new Date()
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1)
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  try {
    const budget = await prisma.budget.create({
      data: {
        name: 'Monthly Budget',
        period: 'MONTHLY',
        startDate,
        endDate,
        isActive: true,
        userId,
        budgetItems: {
          create: [
            {
              categoryId: expenseCategories.find((c: any) => c.name === 'Food & Drinks')?.id || expenseCategories[0].id,
              amount: 100.00,
              type: 'EXPENSE'
            },
            {
              categoryId: expenseCategories.find((c: any) => c.name === 'Clothes')?.id || expenseCategories[1]?.id || expenseCategories[0].id,
              amount: 80.00,
              type: 'EXPENSE'
            },
            {
              categoryId: expenseCategories.find((c: any) => c.name === 'Entertainment')?.id || expenseCategories[2]?.id || expenseCategories[0].id,
              amount: 50.00,
              type: 'EXPENSE'
            },
            {
              categoryId: incomeCategories.find((c: any) => c.name === 'Allowance')?.id || incomeCategories[0].id,
              amount: 200.00,
              type: 'INCOME'
            }
          ]
        }
      }
    })
    
    console.log('Created sample budget:', budget.name)
  } catch (error) {
    console.error('Failed to create sample budget:', error)
  }
}

async function createSampleData(userId: string) {
  console.log('Creating sample transactions for user:', userId)
  
  // Get some categories for sample transactions
  const incomeCategories = await prisma.category.findMany({
    where: { userId, type: 'INCOME' }
  })
  
  const expenseCategories = await prisma.category.findMany({
    where: { userId, type: 'EXPENSE' }
  })
  
  if (incomeCategories.length === 0 || expenseCategories.length === 0) {
    console.log('No categories found, skipping sample data creation')
    return
  }
  
  // Create sample transactions for current month to align with budget
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  
  const sampleTransactions = [
    {
      amount: 25.00,
      type: 'INCOME',
      description: 'Weekly allowance',
      date: new Date(currentMonthStart.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days into current month
      categoryId: incomeCategories.find((c: any) => c.name === 'Allowance')?.id || incomeCategories[0].id,
    },
    {
      amount: 15.50,
      type: 'EXPENSE',
      description: 'Lunch with friends',
      date: new Date(currentMonthStart.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days into current month
      categoryId: expenseCategories.find((c: any) => c.name === 'Food & Drinks')?.id || expenseCategories[0].id,
    },
    {
      amount: 50.00,
      type: 'INCOME',
      description: 'Part-time work payment',
      date: new Date(currentMonthStart.getTime() + 10 * 24 * 60 * 60 * 1000), // 10 days into current month
      categoryId: incomeCategories.find((c: any) => c.name === 'Part-time Job')?.id || incomeCategories[0].id,
    },
    {
      amount: 29.99,
      type: 'EXPENSE',
      description: 'New t-shirt',
      date: new Date(currentMonthStart.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days into current month
      categoryId: expenseCategories.find((c: any) => c.name === 'Clothes')?.id || expenseCategories[0].id,
    },
    {
      amount: 12.00,
      type: 'EXPENSE',
      description: 'Movie ticket',
      date: new Date(currentMonthStart.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days into current month
      categoryId: expenseCategories.find((c: any) => c.name === 'Entertainment')?.id || expenseCategories[0].id,
    },
  ]
  
  for (const transaction of sampleTransactions) {
    try {
      await prisma.transaction.create({
        data: {
          ...transaction,
          userId,
        }
      })
    } catch (error) {
      console.error('Failed to create sample transaction:', error)
    }
  }
}

async function main() {
  console.log('🌱 Seeding database...')
  
  // Find or create demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@teen-budget.app' },
    update: {},
    create: {
      email: 'demo@teen-budget.app',
      name: 'Demo User',
    }
  })
  
  console.log('Demo user:', demoUser.email)
  
  // Create Viola user with PIN 1234
  const violaPin = await bcrypt.hash('1234', 12)
  const viola = await prisma.user.upsert({
    where: { email: 'viola@teen-budget.app' },
    update: {
      pin: violaPin,
      avatar: '/avatars/viola-avatar.svg'
    },
    create: {
      email: 'viola@teen-budget.app',
      name: 'Viola',
      pin: violaPin,
      avatar: '/avatars/viola-avatar.svg'
    }
  })
  
  console.log('Viola user created:', viola.email)
  
  // Create Dominic user with PIN 5678
  const dominicPin = await bcrypt.hash('5678', 12)
  const dominic = await prisma.user.upsert({
    where: { email: 'dominic@teen-budget.app' },
    update: {
      pin: dominicPin,
      avatar: '/avatars/dominic-avatar.svg'
    },
    create: {
      email: 'dominic@teen-budget.app',
      name: 'Dominic',
      pin: dominicPin,
      avatar: '/avatars/dominic-avatar.svg'
    }
  })
  
  console.log('Dominic user created:', dominic.email)
  
  // Create default categories for all users
  await createDefaultCategories(demoUser.id)
  await createDefaultCategories(viola.id)
  await createDefaultCategories(dominic.id)
  
  // Create sample budgets for all users
  await createSampleBudgets(demoUser.id)
  await createSampleBudgets(viola.id)
  await createSampleBudgets(dominic.id)
  
  // Create sample data for all users
  await createSampleData(demoUser.id)
  await createSampleData(viola.id)
  await createSampleData(dominic.id)
  
  console.log('✅ Database seeded successfully!')
  console.log('🔐 Login credentials:')
  console.log('  - Viola: PIN 1234')
  console.log('  - Dominic: PIN 5678')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
import { PrismaClient } from '@prisma/client'

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
  
  // Sample transactions for the last 30 days
  const sampleTransactions = [
    {
      amount: 25.00,
      type: 'INCOME',
      description: 'Weekly allowance',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
      categoryId: incomeCategories.find(c => c.name === 'Allowance')?.id || incomeCategories[0].id,
    },
    {
      amount: 15.50,
      type: 'EXPENSE',
      description: 'Lunch with friends',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      categoryId: expenseCategories.find(c => c.name === 'Food & Drinks')?.id || expenseCategories[0].id,
    },
    {
      amount: 50.00,
      type: 'INCOME',
      description: 'Part-time work payment',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      categoryId: incomeCategories.find(c => c.name === 'Part-time Job')?.id || incomeCategories[0].id,
    },
    {
      amount: 29.99,
      type: 'EXPENSE',
      description: 'New t-shirt',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      categoryId: expenseCategories.find(c => c.name === 'Clothes')?.id || expenseCategories[0].id,
    },
    {
      amount: 12.00,
      type: 'EXPENSE',
      description: 'Movie ticket',
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 2 weeks ago
      categoryId: expenseCategories.find(c => c.name === 'Entertainment')?.id || expenseCategories[0].id,
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
  
  // Create default categories
  await createDefaultCategories(demoUser.id)
  
  // Create sample data
  await createSampleData(demoUser.id)
  
  console.log('✅ Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
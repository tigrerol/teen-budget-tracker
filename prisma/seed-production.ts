import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEFAULT_CATEGORIES = [
  { name: 'Allowance', icon: '💰', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Part-time Job', icon: '💼', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Gifts', icon: '🎁', color: 'bg-green-100 text-green-800', type: 'INCOME' },
  { name: 'Savings', icon: '🎯', color: 'bg-emerald-100 text-emerald-800', type: 'INCOME' },
  { name: 'Food & Drinks', icon: '🍔', color: 'bg-orange-100 text-orange-800', type: 'EXPENSE' },
  { name: 'Clothes', icon: '👕', color: 'bg-purple-100 text-purple-800', type: 'EXPENSE' },
  { name: 'Entertainment', icon: '🎮', color: 'bg-blue-100 text-blue-800', type: 'EXPENSE' },
  { name: 'Transportation', icon: '🚌', color: 'bg-yellow-100 text-yellow-800', type: 'EXPENSE' },
  { name: 'School Supplies', icon: '📚', color: 'bg-indigo-100 text-indigo-800', type: 'EXPENSE' },
  { name: 'Other', icon: '📦', color: 'bg-slate-100 text-slate-800', type: 'EXPENSE' },
]

const USERS = [
  {
    name: 'Viola',
    email: 'viola@teen-budget.app',
    pin: '1234', // Default PIN - should be changed on first login
    avatar: '/avatars/viola-avatar.svg'
  },
  {
    name: 'Dominic',
    email: 'dominic@teen-budget.app',
    pin: '5678', // Default PIN - should be changed on first login
    avatar: '/avatars/dominic-avatar.svg'
  }
]

async function main() {
  console.log('🌱 Seeding production data...')

  // Clean existing data (except demo user)
  await prisma.transaction.deleteMany({
    where: {
      user: {
        email: {
          not: 'demo@teen-budget.app'
        }
      }
    }
  })
  
  await prisma.budgetItem.deleteMany({
    where: {
      budget: {
        user: {
          email: {
            not: 'demo@teen-budget.app'
          }
        }
      }
    }
  })
  
  await prisma.budget.deleteMany({
    where: {
      user: {
        email: {
          not: 'demo@teen-budget.app'
        }
      }
    }
  })
  
  await prisma.savingsGoal.deleteMany({
    where: {
      user: {
        email: {
          not: 'demo@teen-budget.app'
        }
      }
    }
  })
  
  await prisma.category.deleteMany({
    where: {
      user: {
        email: {
          not: 'demo@teen-budget.app'
        }
      }
    }
  })

  // Remove existing Viola and Dominic users
  await prisma.user.deleteMany({
    where: {
      email: {
        in: ['viola@teen-budget.app', 'dominic@teen-budget.app']
      }
    }
  })

  // Create Viola and Dominic with hashed PINs
  for (const userData of USERS) {
    console.log(`Creating user: ${userData.name}`)
    
    const hashedPin = await bcrypt.hash(userData.pin, 10)
    
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        pin: hashedPin,
        avatar: userData.avatar,
      }
    })

    // Create default categories for each user
    console.log(`Creating categories for ${userData.name}`)
    for (const category of DEFAULT_CATEGORIES) {
      await prisma.category.create({
        data: {
          ...category,
          userId: user.id,
        }
      })
    }

    console.log(`✅ ${userData.name} setup complete`)
  }

  console.log('🎉 Production seeding completed!')
  console.log('')
  console.log('📌 Default PINs:')
  console.log('   Viola: 1234')
  console.log('   Dominic: 5678')
  console.log('')
  console.log('⚠️  Remember to change these PINs in production!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
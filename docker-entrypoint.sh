#!/bin/sh
set -e

# Check if database exists
DB_EXISTS=false
if [ -f /app/data/teen-budget.db ]; then
    DB_EXISTS=true
    echo "Database exists, updating schema..."
else
    echo "Initializing new database..."
fi

# Always run database push to ensure schema is up to date
cd /app
export DATABASE_URL="file:/app/data/teen-budget.db"
npx prisma db push --skip-generate

# Seed database only if it's new
if [ "$DB_EXISTS" = false ]; then
    
    echo "Seeding database with default data..."
    # Create seed data directly using node
    node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    const DEFAULT_CATEGORIES = [
      { name: 'Allowance', icon: '💰', color: 'bg-green-100 text-green-800', type: 'INCOME' },
      { name: 'Part-time Job', icon: '💼', color: 'bg-green-100 text-green-800', type: 'INCOME' },
      { name: 'Gifts', icon: '🎁', color: 'bg-green-100 text-green-800', type: 'INCOME' },
      { name: 'Food & Drinks', icon: '🍔', color: 'bg-orange-100 text-orange-800', type: 'EXPENSE' },
      { name: 'Clothes', icon: '👕', color: 'bg-purple-100 text-purple-800', type: 'EXPENSE' },
      { name: 'Entertainment', icon: '🎮', color: 'bg-blue-100 text-blue-800', type: 'EXPENSE' },
      { name: 'Transportation', icon: '🚌', color: 'bg-yellow-100 text-yellow-800', type: 'EXPENSE' },
      { name: 'School Supplies', icon: '📚', color: 'bg-indigo-100 text-indigo-800', type: 'EXPENSE' },
      { name: 'Other', icon: '📦', color: 'bg-slate-100 text-slate-800', type: 'EXPENSE' },
    ];

    async function main() {
      const demoUser = await prisma.user.upsert({
        where: { email: 'demo@teen-budget.app' },
        update: {},
        create: {
          email: 'demo@teen-budget.app',
          name: 'Demo User',
        }
      });

      for (const category of DEFAULT_CATEGORIES) {
        await prisma.category.upsert({
          where: {
            userId_name: {
              userId: demoUser.id,
              name: category.name
            }
          },
          update: category,
          create: {
            ...category,
            userId: demoUser.id,
          }
        });
      }

      // Create sample transactions
      const categories = await prisma.category.findMany({ where: { userId: demoUser.id } });
      const incomeCategory = categories.find(c => c.type === 'INCOME');
      const expenseCategory = categories.find(c => c.type === 'EXPENSE');

      if (incomeCategory && expenseCategory) {
        await prisma.transaction.create({
          data: {
            amount: 25.00,
            type: 'INCOME',
            description: 'Weekly allowance',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            categoryId: incomeCategory.id,
            userId: demoUser.id,
          }
        });

        await prisma.transaction.create({
          data: {
            amount: 15.50,
            type: 'EXPENSE',
            description: 'Lunch with friends',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            categoryId: expenseCategory.id,
            userId: demoUser.id,
          }
        });
      }

      console.log('Seeding completed successfully!');
    }

    main().catch(console.error).finally(() => prisma.\$disconnect());
    "
    
    echo "Database initialized and seeded successfully!"
else
    echo "Schema updated successfully!"
fi

# Start the Next.js application
echo "Starting Teen Budget Tracker..."
exec node server.js
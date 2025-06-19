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
    echo "Initializing production data..."
    node -e "
    const { execSync } = require('child_process');
    try {
      execSync('npx tsx prisma/seed-production.ts', { stdio: 'inherit' });
    } catch (error) {
      console.error('Production seeding failed:', error);
      process.exit(1);
    }
    "
    echo "Database initialized with production data!"
else
    echo "Schema updated successfully!"
fi

# Start the Next.js application
echo "Starting Teen Budget Tracker..."
exec node server.js
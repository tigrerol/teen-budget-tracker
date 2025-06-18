#!/bin/sh
set -e

# Initialize database if it doesn't exist or is empty
if [ ! -s /app/data/teen-budget.db ]; then
    echo "Initializing database..."
    cd /app
    export DATABASE_URL="file:/app/data/teen-budget.db"
    npx prisma db push --skip-generate
    echo "Database initialized successfully!"
else
    echo "Database already exists, skipping initialization..."
fi

# Start the Next.js application
echo "Starting Teen Budget Tracker..."
exec node server.js
#!/bin/bash

# Teen Budget Tracker - Standalone Docker Run Script

set -e

# Default configuration
CONTAINER_NAME="teen-budget-tracker"
PORT="3001"
VOLUME_NAME="teen_budget_data"

echo "🚀 Starting Teen Budget Tracker..."

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Stop and remove existing container if it exists
if docker ps -a --format 'table {{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "🛑 Stopping existing container..."
    docker stop ${CONTAINER_NAME} >/dev/null 2>&1 || true
    docker rm ${CONTAINER_NAME} >/dev/null 2>&1 || true
fi

# Create volume if it doesn't exist
docker volume create ${VOLUME_NAME} >/dev/null 2>&1 || true

# Run the container
echo "🐳 Starting Docker container..."
docker run -d \
    --name ${CONTAINER_NAME} \
    --restart unless-stopped \
    -p ${PORT}:3001 \
    -v ${VOLUME_NAME}:/app/data \
    -e NODE_ENV=production \
    -e DATABASE_URL=file:/app/data/teen-budget.db \
    -e NEXTAUTH_URL=http://localhost:${PORT} \
    -e NEXTAUTH_SECRET=your-super-secret-key-change-in-production \
    teen-budget-tracker:latest

echo "✅ Teen Budget Tracker started successfully!"
echo ""
echo "🌐 Application URL: http://localhost:${PORT}"
echo "📱 Demo login: Click 'Try Demo Account' to get started"
echo ""
echo "📊 Container status: docker logs ${CONTAINER_NAME}"
echo "🛑 To stop: docker stop ${CONTAINER_NAME}"
echo "🗑️  To remove: docker rm ${CONTAINER_NAME}"
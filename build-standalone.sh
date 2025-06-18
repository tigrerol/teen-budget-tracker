#!/bin/bash

# Teen Budget Tracker - Standalone Docker Build Script

set -e

echo "🏗️  Building Teen Budget Tracker Docker image..."

# Check if docker is available
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    exit 1
fi

# Build the Docker image
docker build -t teen-budget-tracker:latest .

echo "✅ Docker image built successfully!"
echo ""
echo "📦 Image: teen-budget-tracker:latest"
echo "🚀 To run: ./run-standalone.sh"
echo "📝 To run with docker-compose: docker-compose up -d"
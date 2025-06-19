#!/bin/bash

# Teen Budget Tracker - Build and Push to DockerHub
# Usage: ./build-and-push.sh [version]

set -e

# Configuration
DOCKERHUB_USERNAME="tigreroll"
IMAGE_NAME="teen-budget-tracker"
VERSION=${1:-"latest"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Teen Budget Tracker - Docker Build & Push${NC}"
echo "================================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running. Please start Docker and try again.${NC}"
    exit 1
fi

# Check if logged into DockerHub
if ! docker info | grep -q "Username.*${DOCKERHUB_USERNAME}"; then
    echo -e "${YELLOW}⚠️  Not logged into DockerHub as ${DOCKERHUB_USERNAME}${NC}"
    echo "Please log in first:"
    echo "docker login"
    exit 1
fi

# Confirm current directory
echo -e "${BLUE}📁 Current directory: $(pwd)${NC}"
if [[ ! -f "Dockerfile" ]]; then
    echo -e "${RED}❌ Dockerfile not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Build the image
echo -e "${BLUE}🔨 Building Docker image...${NC}"
echo "Image: ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"

docker build \
    --tag "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}" \
    --tag "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest" \
    --platform linux/amd64 \
    .

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Build completed successfully!${NC}"
else
    echo -e "${RED}❌ Build failed!${NC}"
    exit 1
fi

# Show image size
echo -e "${BLUE}📊 Image information:${NC}"
docker images "${DOCKERHUB_USERNAME}/${IMAGE_NAME}" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}"

# Confirm push
echo ""
echo -e "${YELLOW}🤔 Ready to push to DockerHub?${NC}"
echo "This will push:"
echo "  - ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
echo "  - ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⏹️  Push cancelled.${NC}"
    exit 0
fi

# Push to DockerHub
echo -e "${BLUE}📤 Pushing to DockerHub...${NC}"

# Push versioned tag
echo "Pushing ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}..."
docker push "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"

# Push latest tag
echo "Pushing ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest..."
docker push "${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"

if [[ $? -eq 0 ]]; then
    echo -e "${GREEN}✅ Successfully pushed to DockerHub!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Deployment information:${NC}"
    echo "DockerHub Image: ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:${VERSION}"
    echo "Pull command: docker pull ${DOCKERHUB_USERNAME}/${IMAGE_NAME}:latest"
    echo ""
    echo -e "${BLUE}📋 Next steps for Synology deployment:${NC}"
    echo "1. Copy docker-compose-synology.yml to your Synology NAS"
    echo "2. Edit the environment variables (NEXTAUTH_URL and NEXTAUTH_SECRET)"
    echo "3. Run: docker-compose -f docker-compose-synology.yml up -d"
    echo "4. Access at: http://YOUR_NAS_IP:3001"
    echo ""
    echo -e "${YELLOW}⚠️  Don't forget to change the default PINs after deployment!${NC}"
    echo "   - Viola: 1234"
    echo "   - Dominic: 5678"
else
    echo -e "${RED}❌ Push failed!${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🏁 All done! Your image is ready for deployment.${NC}"
#!/bin/bash

echo "🚀 Setting up GitHub Code Analysis Microservices..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if command succeeded
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ $1${NC}"
    else
        echo -e "${RED}✗ $1 failed${NC}"
        exit 1
    fi
}

# Install dependencies for lint-error
echo -e "${BLUE}📦 Installing lint-error dependencies...${NC}"
cd packages/lint-error
npm install
check_status "lint-error dependencies installed"
cd ../..

# Install dependencies for type-error
echo -e "${BLUE}📦 Installing type-error dependencies...${NC}"
cd packages/type-error
npm install
check_status "type-error dependencies installed"
cd ../..

# Install dependencies for security
echo -e "${BLUE}📦 Installing security dependencies...${NC}"
cd packages/security
npm install
check_status "security dependencies installed"
cd ../..

# Build all packages
echo ""
echo -e "${BLUE}🔨 Building all packages...${NC}"

cd packages/lint-error
npm run build
check_status "lint-error built"
cd ../..

cd packages/type-error
npm run build
check_status "type-error built"
cd ../..

cd packages/security
npm run build
check_status "security built"
cd ../..

# Link packages locally
echo ""
echo -e "${BLUE}🔗 Linking packages locally...${NC}"

cd packages/lint-error
npm link
check_status "lint-error linked"
cd ../..

cd packages/type-error
npm link
check_status "type-error linked"
cd ../..

cd packages/security
npm link
check_status "security linked"
cd ../..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "You can now use the following commands:"
echo "  lint-error analyze --owner <owner> --repo <repo> --token <token>"
echo "  type-error analyze --owner <owner> --repo <repo> --token <token>"
echo "  security-analyzer analyze --owner <owner> --repo <repo> --token <token>"
echo ""
echo "Set your GitHub token:"
echo "  export GITHUB_TOKEN=your_token_here"
echo ""
echo "See MICROSERVICES_GUIDE.md for more information."

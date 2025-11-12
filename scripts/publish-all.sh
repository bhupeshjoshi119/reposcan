#!/bin/bash

echo "📦 Publishing all microservices to npm..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if logged in to npm
echo -e "${BLUE}Checking npm authentication...${NC}"
npm whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Not logged in to npm${NC}"
    echo "Please run: npm login"
    exit 1
fi

echo -e "${GREEN}✓ Logged in as $(npm whoami)${NC}"
echo ""

# Confirm publication
echo -e "${YELLOW}⚠️  This will publish the following packages:${NC}"
echo "  - @github-analyzer/lint-error"
echo "  - @github-analyzer/type-error"
echo "  - @github-analyzer/security"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# Build all packages first
echo -e "${BLUE}🔨 Building all packages...${NC}"

cd packages/lint-error
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build lint-error${NC}"
    exit 1
fi
cd ../..

cd packages/type-error
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build type-error${NC}"
    exit 1
fi
cd ../..

cd packages/security
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Failed to build security${NC}"
    exit 1
fi
cd ../..

echo -e "${GREEN}✓ All packages built successfully${NC}"
echo ""

# Publish lint-error
echo -e "${BLUE}📤 Publishing @github-analyzer/lint-error...${NC}"
cd packages/lint-error
npm publish --access public
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ @github-analyzer/lint-error published${NC}"
else
    echo -e "${RED}✗ Failed to publish @github-analyzer/lint-error${NC}"
fi
cd ../..
echo ""

# Publish type-error
echo -e "${BLUE}📤 Publishing @github-analyzer/type-error...${NC}"
cd packages/type-error
npm publish --access public
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ @github-analyzer/type-error published${NC}"
else
    echo -e "${RED}✗ Failed to publish @github-analyzer/type-error${NC}"
fi
cd ../..
echo ""

# Publish security
echo -e "${BLUE}📤 Publishing @github-analyzer/security...${NC}"
cd packages/security
npm publish --access public
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ @github-analyzer/security published${NC}"
else
    echo -e "${RED}✗ Failed to publish @github-analyzer/security${NC}"
fi
cd ../..
echo ""

echo -e "${GREEN}✅ Publication complete!${NC}"
echo ""
echo "Users can now install with:"
echo "  npm install -g @github-analyzer/lint-error"
echo "  npm install -g @github-analyzer/type-error"
echo "  npm install -g @github-analyzer/security"

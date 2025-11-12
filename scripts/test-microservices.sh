#!/bin/bash

echo "🧪 Testing GitHub Code Analysis Microservices..."
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for GitHub token
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${RED}✗ GITHUB_TOKEN environment variable not set${NC}"
    echo "Please set it: export GITHUB_TOKEN=your_token_here"
    exit 1
fi

echo -e "${GREEN}✓ GitHub token found${NC}"
echo ""

# Test repository (using a small public repo)
TEST_OWNER="facebook"
TEST_REPO="react"
TEST_BRANCH="main"

echo -e "${BLUE}Testing with repository: ${TEST_OWNER}/${TEST_REPO}${NC}"
echo ""

# Test lint-error
echo -e "${BLUE}🔍 Testing lint-error...${NC}"
lint-error analyze --owner $TEST_OWNER --repo $TEST_REPO --branch $TEST_BRANCH --token $GITHUB_TOKEN > /tmp/lint-test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ lint-error working${NC}"
    echo "Sample output:"
    head -n 10 /tmp/lint-test.log
else
    echo -e "${RED}✗ lint-error failed${NC}"
    cat /tmp/lint-test.log
fi
echo ""

# Test type-error
echo -e "${BLUE}🔍 Testing type-error...${NC}"
type-error analyze --owner $TEST_OWNER --repo $TEST_REPO --branch $TEST_BRANCH --token $GITHUB_TOKEN > /tmp/type-test.log 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ type-error working${NC}"
    echo "Sample output:"
    head -n 10 /tmp/type-test.log
else
    echo -e "${RED}✗ type-error failed${NC}"
    cat /tmp/type-test.log
fi
echo ""

# Test security
echo -e "${BLUE}🔍 Testing security-analyzer...${NC}"
security-analyzer analyze --owner $TEST_OWNER --repo $TEST_REPO --branch $TEST_BRANCH --token $GITHUB_TOKEN > /tmp/security-test.log 2>&1
SECURITY_EXIT=$?
if [ $SECURITY_EXIT -eq 0 ] || [ $SECURITY_EXIT -eq 1 ]; then
    echo -e "${GREEN}✓ security-analyzer working${NC}"
    echo "Sample output:"
    head -n 15 /tmp/security-test.log
else
    echo -e "${RED}✗ security-analyzer failed${NC}"
    cat /tmp/security-test.log
fi
echo ""

echo -e "${GREEN}✅ Testing complete!${NC}"
echo ""
echo "Full logs saved to:"
echo "  /tmp/lint-test.log"
echo "  /tmp/type-test.log"
echo "  /tmp/security-test.log"

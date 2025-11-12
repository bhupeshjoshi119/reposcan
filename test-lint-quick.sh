#!/bin/bash

echo "🧪 Quick Lint Error Test"
echo ""

# Check if .env exists
if [ -f .env ]; then
    echo "✓ Found .env file"
    source .env
else
    echo "⚠️  No .env file found"
fi

# Check token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    echo ""
    echo "Please either:"
    echo "  1. Create .env file with: GITHUB_TOKEN=your_token"
    echo "  2. Or run: export GITHUB_TOKEN=your_token"
    exit 1
fi

echo "✓ GitHub token found"
echo ""

# Test with a small repo (limit to 10 files for speed)
echo "Testing with bhupeshjoshi119/open-repo-lens (limited to 10 files)..."
echo ""

lint-error analyze \
  --owner bhupeshjoshi119 \
  --repo open-repo-lens \
  --max-files 10

echo ""
echo "Exit code: $?"

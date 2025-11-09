#!/bin/bash

# 🚀 Quick Setup Script - Make Your Sunday Awesome!

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║              🚀 GitHub Issue Analyzer - Quick Setup                         ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed!"
echo ""

# Setup tokens
echo "🔑 Token Setup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "You need two tokens:"
echo "1. GitHub Personal Access Token (Required)"
echo "2. Stack Exchange API Key (Optional)"
echo ""

read -p "Do you want to set up tokens now? (y/n): " setup_tokens

if [ "$setup_tokens" = "y" ] || [ "$setup_tokens" = "Y" ]; then
    echo ""
    echo "📝 GitHub Token Setup"
    echo "   Get your token at: https://github.com/settings/tokens"
    echo "   Select scopes: repo, public_repo"
    echo ""
    read -p "Enter your GitHub token (ghp_...): " github_token
    
    echo ""
    read -p "Do you have a Stack Exchange key? (y/n): " has_se_key
    
    if [ "$has_se_key" = "y" ] || [ "$has_se_key" = "Y" ]; then
        echo "   Get your key at: https://stackapps.com/apps/oauth/register"
        read -p "Enter your Stack Exchange key: " se_key
    fi
    
    # Create .env file
    echo "GITHUB_TOKEN=$github_token" > .env
    if [ ! -z "$se_key" ]; then
        echo "STACK_EXCHANGE_KEY=$se_key" >> .env
    fi
    
    # Add to .gitignore
    if ! grep -q ".env" .gitignore 2>/dev/null; then
        echo ".env" >> .gitignore
    fi
    
    echo ""
    echo "✅ Tokens saved to .env file"
    echo "   (This file is in .gitignore for security)"
else
    echo ""
    echo "⚠️  You can set up tokens later by:"
    echo "   1. Creating a .env file"
    echo "   2. Using the UI (npm run dev)"
    echo "   3. Setting environment variables"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                          ✅ Setup Complete!                                 ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 What's Next?"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 CLI Usage:"
echo "   npm run analyze-issue <github-issue-url>"
echo "   npm run batch-analyze <owner> <repo>"
echo ""
echo "🎨 UI Usage:"
echo "   npm run dev"
echo "   Then open: http://localhost:3000"
echo ""
echo "📚 Documentation:"
echo "   • SETUP_GUIDE.md - Token setup guide"
echo "   • UI_SETUP_GUIDE.md - Complete UI setup"
echo "   • BATCH_ANALYSIS_GUIDE.md - Batch analysis guide"
echo ""
echo "🎉 Examples:"
echo "   npm run analyze-issue https://github.com/facebook/react/issues/1"
echo "   npm run batch-analyze flutter flutter --max=10"
echo ""
echo "💡 Tips:"
echo "   • Start with small repos (--max=10) for testing"
echo "   • Use UI for easy token management"
echo "   • Check guides for detailed instructions"
echo ""
echo "🚀 Have an awesome Sunday! Let's analyze some issues!"
echo ""

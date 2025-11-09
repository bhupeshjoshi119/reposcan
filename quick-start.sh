#!/bin/bash

# 🚀 Quick Start Script - No Blocking!

clear

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║              🚀 GitHub Issue Analyzer - Quick Start                         ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js: $(node --version)"
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install --silent
    echo "✅ Dependencies installed!"
    echo ""
fi

# Check for .env file
if [ -f ".env" ]; then
    echo "✅ Found .env file with tokens"
    echo ""
else
    echo "⚠️  No .env file found"
    echo ""
    echo "📝 You can set up tokens in 3 ways:"
    echo ""
    echo "1. Run the tool now - it will prompt you for tokens"
    echo "2. Create .env file manually:"
    echo "   echo 'GITHUB_TOKEN=your_token' > .env"
    echo "3. Use the UI (npm run dev) for easy setup"
    echo ""
fi

echo "╔══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                              ║"
echo "║                          ✅ Ready to Go!                                    ║"
echo "║                                                                              ║"
echo "╚══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "🎯 Quick Commands:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Analyze Single Issue:"
echo "   npm run analyze-issue https://github.com/facebook/react/issues/1"
echo ""
echo "📊 Analyze ALL Issues:"
echo "   npm run batch-analyze flutter flutter"
echo ""
echo "🎨 Start UI (Easy Mode):"
echo "   npm run dev"
echo "   Then open: http://localhost:3000"
echo ""
echo "💡 The tool will prompt you for tokens if needed!"
echo ""
echo "📚 Documentation:"
echo "   • SUNDAY_AWESOME_GUIDE.md - Complete guide"
echo "   • SETUP_GUIDE.md - Token setup"
echo "   • UI_SETUP_GUIDE.md - UI setup"
echo ""
echo "🚀 Try it now:"
echo "   npm run analyze-issue https://github.com/facebook/react/issues/1"
echo ""

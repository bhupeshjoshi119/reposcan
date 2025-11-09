# ⚡ Quick Start - Get Awesome in 2 Minutes!

## 🚀 Super Fast Setup

```bash
# 1. Run quick start
chmod +x quick-start.sh && ./quick-start.sh

# 2. Try it now!
npm run analyze-issue https://github.com/facebook/react/issues/1

# 3. Enter your GitHub token when prompted
# 4. Done! 🎉
```

## 🔑 Get GitHub Token (30 seconds)

1. Visit: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select: `repo` and `public_repo`
4. Copy token (starts with `ghp_`)

## 💡 3 Ways to Use

### 1. Interactive (Easiest!)
```bash
# Just run - it will ask for token
npm run analyze-issue <github-issue-url>

# Example
npm run analyze-issue https://github.com/flutter/flutter/issues/12345
```

### 2. .env File (Best!)
```bash
# Create .env file
echo "GITHUB_TOKEN=ghp_your_token" > .env

# Run anytime
npm run analyze-issue <url>
npm run batch-analyze owner repo
```

### 3. UI (Beautiful!)
```bash
# Start UI
npm run dev

# Open: http://localhost:3000
# Enter tokens in UI
# Click and analyze!
```

## 📊 What You Can Do

### Single Issue (30 seconds)
```bash
npm run analyze-issue https://github.com/facebook/react/issues/1
```
**Result:** 5-10 page PDF with solutions

### Batch Analysis (10 minutes)
```bash
npm run batch-analyze facebook react --max=100
```
**Result:** 2 MB PDF with 100 issues

### ALL Issues (45 minutes)
```bash
npm run batch-analyze flutter flutter
```
**Result:** 45 MB PDF with 12,000 issues!

## 🎯 Quick Commands

```bash
# Single issue
npm run analyze-issue <github-issue-url>

# Batch with options
npm run batch-analyze <owner> <repo>
npm run batch-analyze <owner> <repo> --max=500
npm run batch-analyze <owner> <repo> --state=open

# UI
npm run dev
```

## 📚 Need Help?

- **TOKEN_GUIDE.md** - Token setup (3 ways)
- **SUNDAY_AWESOME_GUIDE.md** - Complete guide
- **UI_SETUP_GUIDE.md** - UI setup

## ✅ That's It!

You're ready to analyze issues and get Stack Overflow solutions!

**Start now:**
```bash
npm run analyze-issue https://github.com/facebook/react/issues/1
```

🎉 **Have an awesome Sunday!**

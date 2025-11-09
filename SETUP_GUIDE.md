# 🚀 Complete Setup Guide - Make Your Sunday Awesome!

## 📋 Step-by-Step Setup

### Step 1: Get Your GitHub Token (2 minutes)

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: Click your profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Give it a name: "Issue Analyzer"
   - Select scopes:
     - ✅ `repo` (Full control of private repositories)
     - ✅ `public_repo` (Access public repositories)
   - Click "Generate token"

3. **Copy Your Token**
   - ⚠️ **IMPORTANT**: Copy it now! You won't see it again
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Get Your Stack Exchange API Key (2 minutes) - OPTIONAL

1. **Register Your Application**
   - Visit: https://stackapps.com/apps/oauth/register
   - Fill in:
     - Application Name: "Issue Analyzer"
     - Description: "Analyzes GitHub issues with Stack Overflow solutions"
     - OAuth Domain: `localhost`
     - Application Website: `http://localhost:3000`

2. **Get Your Key**
   - After registration, you'll see your key
   - It looks like: `xxxxxxxxxxxxxxxxxx`
   - **Note**: This is optional but increases rate limit from 300 to 10,000 requests/day

### Step 3: Secure Storage Options

#### Option A: Environment Variables (Recommended for CLI)

**On macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export GITHUB_TOKEN="ghp_your_token_here"
export STACK_EXCHANGE_KEY="your_key_here"

# Reload shell
source ~/.bashrc  # or source ~/.zshrc
```

**On Windows:**
```cmd
# PowerShell
$env:GITHUB_TOKEN="ghp_your_token_here"
$env:STACK_EXCHANGE_KEY="your_key_here"

# Or set permanently
setx GITHUB_TOKEN "ghp_your_token_here"
setx STACK_EXCHANGE_KEY "your_key_here"
```

#### Option B: .env File (Recommended for Development)

1. **Create .env file in project root:**
```bash
# .env
GITHUB_TOKEN=ghp_your_token_here
STACK_EXCHANGE_KEY=your_key_here
```

2. **Add to .gitignore:**
```bash
echo ".env" >> .gitignore
```

3. **Install dotenv:**
```bash
npm install dotenv
```

#### Option C: UI Settings (Recommended for Users)

We'll create a beautiful UI where users can:
- Enter tokens securely
- Store them encrypted
- Manage them easily
- No command line needed!

### Step 4: Verify Setup

```bash
# Check if tokens are set
echo $GITHUB_TOKEN
echo $STACK_EXCHANGE_KEY

# Test the CLI
npm run analyze-issue https://github.com/facebook/react/issues/1

# If it works, you're all set! 🎉
```

## 🎨 UI Version (Coming Next!)

I'm creating a beautiful web UI where you can:
- ✅ Enter tokens in a secure form
- ✅ Store them encrypted locally
- ✅ Analyze issues with one click
- ✅ View results in real-time
- ✅ Download PDFs directly
- ✅ No command line needed!

Stay tuned! 🚀

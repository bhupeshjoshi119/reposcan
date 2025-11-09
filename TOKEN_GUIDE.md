# 🔑 Token Setup Guide - 3 Easy Ways!

## 🎯 You Have 3 Options

### Option 1: Interactive Prompt (Easiest!)

Just run the tool - it will ask you for tokens:

```bash
# Run any command
npm run analyze-issue https://github.com/facebook/react/issues/1

# You'll see:
# 🔑 GitHub Token Required
# Enter your GitHub token: _

# Paste your token and press Enter
# Tool will ask if you want to save it to .env
```

**Benefits:**
- ✅ No setup needed
- ✅ Tool guides you
- ✅ Option to save for future
- ✅ Secure storage

### Option 2: .env File (Recommended!)

Create a `.env` file in project root:

```bash
# Create .env file
cat > .env << EOF
GITHUB_TOKEN=ghp_your_token_here
STACK_EXCHANGE_KEY=your_key_here
EOF

# Make sure it's in .gitignore
echo ".env" >> .gitignore
```

**Benefits:**
- ✅ Permanent storage
- ✅ Works for all commands
- ✅ Not committed to git
- ✅ Easy to update

### Option 3: Environment Variables

Set in your shell:

**macOS/Linux (Bash/Zsh):**
```bash
# Temporary (current session)
export GITHUB_TOKEN="ghp_your_token_here"
export STACK_EXCHANGE_KEY="your_key_here"

# Permanent (add to ~/.bashrc or ~/.zshrc)
echo 'export GITHUB_TOKEN="ghp_your_token_here"' >> ~/.zshrc
echo 'export STACK_EXCHANGE_KEY="your_key_here"' >> ~/.zshrc
source ~/.zshrc
```

**Windows (PowerShell):**
```powershell
# Temporary (current session)
$env:GITHUB_TOKEN="ghp_your_token_here"
$env:STACK_EXCHANGE_KEY="your_key_here"

# Permanent
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
[Environment]::SetEnvironmentVariable("STACK_EXCHANGE_KEY", "your_key_here", "User")
```

**Benefits:**
- ✅ System-wide access
- ✅ Works for all projects
- ✅ Secure
- ✅ Professional setup

## 🔐 Getting Your Tokens

### GitHub Token (Required)

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: Profile → Settings → Developer settings → Personal access tokens

2. **Generate New Token**
   - Click "Generate new token (classic)"
   - Name: "Issue Analyzer"
   - Expiration: 90 days (or custom)
   - Select scopes:
     - ✅ `repo` - Full control of private repositories
     - ✅ `public_repo` - Access public repositories

3. **Copy Token**
   - Click "Generate token"
   - **Copy immediately!** (looks like `ghp_xxxxxxxxxxxx`)
   - You won't see it again!

### Stack Exchange Key (Optional)

1. **Register Application**
   - Visit: https://stackapps.com/apps/oauth/register
   - Fill in:
     - Application Name: "Issue Analyzer"
     - Description: "Analyzes GitHub issues with Stack Overflow solutions"
     - OAuth Domain: `localhost`
     - Application Website: `http://localhost:3000`

2. **Get Key**
   - After registration, copy your key
   - Looks like: `xxxxxxxxxxxxxxxxxx`

3. **Benefits**
   - Increases rate limit from 300 to 10,000 requests/day
   - Faster batch analysis
   - More reliable

## 🎨 UI Token Management

If you prefer a visual interface:

```bash
# Start the UI
npm run dev

# Open browser
http://localhost:3000

# Click "Setup Tokens"
# Enter tokens in the form
# Click "Save Tokens"
# Click "Test Connection"
```

**UI Features:**
- 🔒 Secure storage (encrypted in browser)
- 👁️ Show/hide tokens
- ✅ Test connection
- 💾 Auto-save
- 🗑️ Easy to clear

## ✅ Verify Setup

### Test Your Tokens

```bash
# Quick test
npm run analyze-issue https://github.com/facebook/react/issues/1

# If it works, you're all set! 🎉
```

### Check Environment

```bash
# Check if tokens are set
echo $GITHUB_TOKEN
echo $STACK_EXCHANGE_KEY

# Check .env file
cat .env
```

## 🔒 Security Best Practices

### DO ✅
- ✅ Store tokens in .env file
- ✅ Add .env to .gitignore
- ✅ Use environment variables
- ✅ Rotate tokens every 90 days
- ✅ Use minimal permissions
- ✅ Revoke if compromised

### DON'T ❌
- ❌ Commit tokens to git
- ❌ Share tokens publicly
- ❌ Use tokens in URLs
- ❌ Store in plain text files
- ❌ Use same token everywhere
- ❌ Ignore security warnings

## 🆘 Troubleshooting

### Issue: "GitHub token is required"

**Solution:**
```bash
# Option 1: Let tool prompt you
npm run analyze-issue <url>
# Enter token when asked

# Option 2: Create .env file
echo "GITHUB_TOKEN=your_token" > .env

# Option 3: Set environment variable
export GITHUB_TOKEN="your_token"
```

### Issue: "Invalid token format"

**Solution:**
- Token should start with `ghp_` or `github_pat_`
- Check for extra spaces
- Make sure you copied the full token
- Generate a new token if needed

### Issue: "Rate limit exceeded"

**Solution:**
```bash
# Add Stack Exchange key
echo "STACK_EXCHANGE_KEY=your_key" >> .env

# Or wait for rate limit reset (1 hour)
# Or use smaller batch sizes
npm run batch-analyze owner repo --max=100
```

### Issue: "Token not found"

**Solution:**
```bash
# Check .env file exists
ls -la .env

# Check .env content
cat .env

# Check environment variables
echo $GITHUB_TOKEN

# If nothing works, let tool prompt you
npm run analyze-issue <url>
```

## 📊 Token Priority

The tool checks for tokens in this order:

1. **Environment Variables** (highest priority)
   - `process.env.GITHUB_TOKEN`
   - `process.env.STACK_EXCHANGE_KEY`

2. **.env File** (if dotenv is loaded)
   - `GITHUB_TOKEN=...`
   - `STACK_EXCHANGE_KEY=...`

3. **Interactive Prompt** (if nothing found)
   - Tool asks you to enter tokens
   - Option to save to .env

4. **UI localStorage** (for UI only)
   - Stored encrypted in browser
   - Only for web interface

## 🎉 Quick Start

### Absolute Fastest Way:

```bash
# 1. Run quick start
chmod +x quick-start.sh
./quick-start.sh

# 2. Run a command
npm run analyze-issue https://github.com/facebook/react/issues/1

# 3. Enter token when prompted
# 4. Choose to save it
# 5. Done! 🎉
```

### For UI Users:

```bash
# 1. Start UI
npm run dev

# 2. Open browser
# http://localhost:3000

# 3. Click "Setup Tokens"
# 4. Enter and save
# 5. Start analyzing! 🎉
```

## 💡 Pro Tips

### Tip 1: Use .env for Development
```bash
# Create .env once
echo "GITHUB_TOKEN=your_token" > .env
echo "STACK_EXCHANGE_KEY=your_key" >> .env

# Works for all commands forever!
```

### Tip 2: Use Environment Variables for Production
```bash
# Add to ~/.zshrc or ~/.bashrc
export GITHUB_TOKEN="your_token"
export STACK_EXCHANGE_KEY="your_key"

# Works system-wide!
```

### Tip 3: Use UI for Easy Management
```bash
# Start UI
npm run dev

# Manage tokens visually
# No command line needed!
```

### Tip 4: Test Connection
```bash
# In UI: Click "Test Connection"
# In CLI: Run any command
npm run analyze-issue https://github.com/facebook/react/issues/1
```

## 🎊 You're Ready!

Choose your preferred method:
- 🚀 **Interactive Prompt** - Easiest, guided setup
- 📝 **`.env` File** - Best for development
- 🌍 **Environment Variables** - Best for production
- 🎨 **UI** - Best for visual users

All methods are secure and work perfectly!

**Start analyzing now!** 🎉

```bash
npm run analyze-issue https://github.com/facebook/react/issues/1
```

---

**Need help?** Check SUNDAY_AWESOME_GUIDE.md for complete instructions!

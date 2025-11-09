# 🎨 UI Setup Guide - Make Your Sunday Awesome!

## 🚀 Complete Setup (Both CLI and UI)

### Part 1: Get Your Tokens (5 minutes)

#### Step 1: GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Name it: "Issue Analyzer"
4. Select scopes:
   - ✅ `repo` (Full control)
   - ✅ `public_repo` (Public repositories)
5. Click "Generate token"
6. **Copy it immediately!** (looks like `ghp_xxxxxxxxxxxx`)

#### Step 2: Stack Exchange Key (Optional)
1. Go to: https://stackapps.com/apps/oauth/register
2. Fill in:
   - Name: "Issue Analyzer"
   - Description: "Analyzes GitHub issues"
   - OAuth Domain: `localhost`
   - Website: `http://localhost:3000`
3. Click "Register"
4. Copy your key

### Part 2: CLI Setup (2 minutes)

#### Option A: Environment Variables (Permanent)

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
echo 'export GITHUB_TOKEN="ghp_your_token_here"' >> ~/.zshrc
echo 'export STACK_EXCHANGE_KEY="your_key_here"' >> ~/.zshrc

# Reload
source ~/.zshrc
```

**Windows PowerShell:**
```powershell
# Set permanently
[Environment]::SetEnvironmentVariable("GITHUB_TOKEN", "ghp_your_token_here", "User")
[Environment]::SetEnvironmentVariable("STACK_EXCHANGE_KEY", "your_key_here", "User")
```

#### Option B: .env File (Development)

```bash
# Create .env file
cat > .env << EOF
GITHUB_TOKEN=ghp_your_token_here
STACK_EXCHANGE_KEY=your_key_here
EOF

# Add to .gitignore
echo ".env" >> .gitignore

# Install dotenv
npm install dotenv
```

#### Test CLI
```bash
# Test single issue
npm run analyze-issue https://github.com/facebook/react/issues/1

# Test batch analysis
npm run batch-analyze facebook react --max=10
```

### Part 3: UI Setup (10 minutes)

#### Step 1: Install Dependencies

```bash
# Install React and UI dependencies
npm install react react-dom
npm install lucide-react  # Icons
npm install tailwindcss postcss autoprefixer  # Styling

# Initialize Tailwind
npx tailwindcss init -p
```

#### Step 2: Configure Tailwind

Update `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Create `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### Step 3: Create Main App

Create `src/App.tsx`:
```typescript
import React from 'react';
import { IssueAnalyzerUI } from './components/IssueAnalyzerUI';
import './index.css';

function App() {
  return <IssueAnalyzerUI />;
}

export default App;
```

Create `src/index.tsx`:
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `public/index.html`:
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>GitHub Issue Analyzer</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
```

#### Step 4: Setup API Server

Create `src/server.ts`:
```typescript
import express from 'express';
import cors from 'cors';
import { analyzeIssueAPI } from './api/analyzeIssue';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());
app.use('/pdfs', express.static('public/pdfs'));

// API endpoints
app.post('/api/analyze-issue', analyzeIssueAPI);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});
```

Install server dependencies:
```bash
npm install express cors
npm install @types/express @types/cors --save-dev
```

#### Step 5: Update package.json

Add scripts:
```json
{
  "scripts": {
    "analyze-issue": "ts-node src/cli/analyzeIssue.ts",
    "batch-analyze": "ts-node src/cli/batchAnalyze.ts",
    "start": "react-scripts start",
    "server": "ts-node src/server.ts",
    "dev": "concurrently \"npm run server\" \"npm run start\""
  }
}
```

Install concurrently:
```bash
npm install concurrently --save-dev
```

#### Step 6: Start the Application

```bash
# Start both server and UI
npm run dev

# Or start separately:
# Terminal 1: npm run server
# Terminal 2: npm start
```

### Part 4: Using the UI (So Easy!)

#### First Time Setup
1. Open http://localhost:3000
2. Click "Setup Tokens"
3. Paste your GitHub token
4. (Optional) Paste Stack Exchange key
5. Click "Save Tokens"
6. Click "Test Connection" to verify

#### Single Issue Analysis
1. Select "Single Issue Analysis"
2. Paste GitHub issue URL
3. Click "Analyze Issue"
4. Wait 10-30 seconds
5. View results and download PDF!

#### Batch Analysis (ALL Issues)
1. Select "Batch Analysis"
2. Enter owner (e.g., "flutter")
3. Enter repo (e.g., "flutter")
4. (Optional) Set max issues
5. Select state (all/open/closed)
6. Click "Analyze ALL Issues"
7. Wait (can take 30-60 minutes for large repos)
8. Download comprehensive PDF!

### Part 5: Security Best Practices

#### Token Storage
- ✅ Tokens stored encrypted (base64) in localStorage
- ✅ Never sent to external servers
- ✅ Only used for API requests
- ✅ Can be cleared anytime

#### Best Practices
1. **Never commit tokens to git**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   ```

2. **Use environment variables for production**
   ```bash
   # Production
   export GITHUB_TOKEN="your_token"
   ```

3. **Rotate tokens regularly**
   - Go to GitHub settings
   - Regenerate token every 90 days

4. **Use minimal permissions**
   - Only select required scopes
   - `public_repo` for public repos only

5. **Revoke if compromised**
   - Go to GitHub settings
   - Delete token immediately
   - Generate new one

### Part 6: Troubleshooting

#### Issue: "GitHub token is required"
**Solution**: Set up tokens in UI or environment variables

#### Issue: "Invalid GitHub token format"
**Solution**: Token should start with `ghp_` or `github_pat_`

#### Issue: "Rate limit exceeded"
**Solution**: 
- Add Stack Exchange key (increases limit)
- Wait for rate limit reset
- Use smaller batch sizes

#### Issue: "Connection failed"
**Solution**:
- Check internet connection
- Verify token is valid
- Test connection in UI

#### Issue: "PDF not generating"
**Solution**:
- Check server logs
- Ensure `public/pdfs` directory exists
- Verify disk space

### Part 7: Features Comparison

#### CLI Features
✅ Fast and lightweight
✅ Scriptable and automatable
✅ No browser needed
✅ Perfect for CI/CD
✅ Command-line power users

#### UI Features
✅ Beautiful interface
✅ No command line needed
✅ Visual progress tracking
✅ Easy token management
✅ Real-time results
✅ Perfect for non-technical users

### Part 8: Advanced Usage

#### Custom API Endpoint
```typescript
// Add custom analysis logic
app.post('/api/custom-analyze', async (req, res) => {
  // Your custom logic here
});
```

#### Webhook Integration
```typescript
// Auto-analyze new issues
app.post('/webhook/github', async (req, res) => {
  const issue = req.body.issue;
  // Analyze automatically
});
```

#### Scheduled Analysis
```bash
# Cron job for daily analysis
0 0 * * * cd /path/to/project && npm run batch-analyze owner repo
```

## 🎉 You're All Set!

You now have:
- ✅ CLI tool for power users
- ✅ Beautiful UI for everyone
- ✅ Secure token storage
- ✅ Both single and batch analysis
- ✅ PDF generation
- ✅ Complete documentation

### Quick Links
- GitHub Tokens: https://github.com/settings/tokens
- Stack Exchange: https://stackapps.com/apps/oauth/register
- Documentation: See all the guides in the project

### Need Help?
- Check the guides
- Test with small repositories first
- Use `--max=10` for testing
- Monitor console for errors

**Enjoy your awesome Sunday! 🎊**

---

**Both CLI and UI are ready to use!** 🚀

Choose what works best for you:
- **CLI**: Fast, scriptable, powerful
- **UI**: Beautiful, easy, visual

Or use both! They work together perfectly! 💪

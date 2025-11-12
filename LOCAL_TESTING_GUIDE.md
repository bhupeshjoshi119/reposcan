# 🧪 Local Testing Guide

Complete guide to test microservices locally before publishing to npm.

---

## 📋 Prerequisites

1. **GitHub Token** - Required for all tests
   ```bash
   # Get token from: https://github.com/settings/tokens
   # Required scope: repo
   export GITHUB_TOKEN=your_github_token_here
   ```

2. **Node.js & npm** - Ensure you have them installed
   ```bash
   node --version  # Should be v16 or higher
   npm --version   # Should be v8 or higher
   ```

---

## 🚀 Step-by-Step Testing

### Step 1: Install Dependencies

```bash
# Install dependencies for all packages
cd packages/lint-error
npm install
cd ../..

cd packages/type-error
npm install
cd ../..

cd packages/security
npm install
cd ../..
```

### Step 2: Build All Packages

```bash
# Build lint-error
cd packages/lint-error
npm run build
cd ../..

# Build type-error
cd packages/type-error
npm run build
cd ../..

# Build security
cd packages/security
npm run build
cd ../..
```

**Expected Output:**
- `dist/` folder created in each package
- `dist/index.js` and `dist/cli.js` files present
- No TypeScript errors

### Step 3: Link Packages Locally

```bash
# Link lint-error
cd packages/lint-error
npm link
cd ../..

# Link type-error
cd packages/type-error
npm link
cd ../..

# Link security
cd packages/security
npm link
cd ../..
```

**Expected Output:**
- Packages linked globally
- CLI commands available: `lint-error`, `type-error`, `security-analyzer`

### Step 4: Verify CLI Commands

```bash
# Check if commands are available
which lint-error
which type-error
which security-analyzer

# Check versions (should not error)
lint-error --help
type-error --help
security-analyzer --help
```

### Step 5: Test Each Package

#### Test 1: Lint Error Analyzer

```bash
# Test with a small public repo
lint-error analyze \
  --owner facebook \
  --repo react \
  --branch main \
  --token $GITHUB_TOKEN

# Expected: Should display lint analysis results
# - Total Errors
# - Total Warnings
# - Top Issues
# - Summary by File
```

#### Test 2: Type Error Analyzer

```bash
# Test with TypeScript repo
type-error analyze \
  --owner microsoft \
  --repo vscode \
  --branch main \
  --token $GITHUB_TOKEN

# Expected: Should display type analysis results
# - Language detected
# - Total Errors
# - Total Warnings
# - Top Type Errors
```

#### Test 3: Security Analyzer

```bash
# Test security analysis
security-analyzer analyze \
  --owner facebook \
  --repo react \
  --branch main \
  --token $GITHUB_TOKEN

# Expected: Should display security results
# - Security Score
# - Critical/High/Medium/Low issues
# - Vulnerability details
```

---

## 🔍 Detailed Testing

### Test Programmatic API

Create a test file to verify the programmatic API:

```bash
cat > test-api.mjs << 'EOF'
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';

const token = process.env.GITHUB_TOKEN;

if (!token) {
  console.error('GITHUB_TOKEN not set');
  process.exit(1);
}

console.log('Testing Lint Error Analyzer...');
const lintAnalyzer = new LintErrorAnalyzer(token);
const lintResults = await lintAnalyzer.analyzeRepository('facebook', 'react', 'main');
console.log('✓ Lint Errors:', lintResults.totalErrors);
console.log('✓ Lint Warnings:', lintResults.totalWarnings);

console.log('\nTesting Type Error Analyzer...');
const typeAnalyzer = new TypeErrorAnalyzer(token, true);
const typeResults = await typeAnalyzer.analyzeRepository('microsoft', 'vscode', 'main');
console.log('✓ Type Errors:', typeResults.totalErrors);
console.log('✓ Language:', typeResults.languageInfo.language);

console.log('\nTesting Security Analyzer...');
const securityAnalyzer = new SecurityAnalyzer(token);
const securityResults = await securityAnalyzer.analyzeRepository('facebook', 'react', 'main');
console.log('✓ Security Score:', securityResults.securityScore);
console.log('✓ Critical Issues:', securityResults.criticalIssues);

console.log('\n✅ All tests passed!');
EOF

# Run the test
node test-api.mjs
```

---

## ✅ Validation Checklist

Before publishing, verify:

### Build Validation
- [ ] All packages build without errors
- [ ] `dist/` folders contain compiled JavaScript
- [ ] Type definitions (`.d.ts`) are generated
- [ ] No TypeScript compilation errors

### CLI Validation
- [ ] Commands are globally available after `npm link`
- [ ] `--help` flag works for all commands
- [ ] Commands accept required arguments
- [ ] Error messages are clear and helpful

### Functionality Validation
- [ ] Lint analyzer detects issues correctly
- [ ] Type analyzer connects to GitHub MCP
- [ ] Security analyzer calculates security score
- [ ] All analyzers handle errors gracefully

### API Validation
- [ ] Packages can be imported in Node.js
- [ ] Classes can be instantiated
- [ ] Methods return expected results
- [ ] TypeScript types are available

### Documentation Validation
- [ ] README files are complete
- [ ] Usage examples work
- [ ] API documentation is accurate

---

## 🐛 Common Issues & Solutions

### Issue 1: "Command not found"

**Problem:** CLI commands not available after `npm link`

**Solution:**
```bash
# Unlink and relink
npm unlink -g @github-analyzer/lint-error
cd packages/lint-error
npm link

# Check npm global bin path
npm config get prefix
# Add to PATH if needed: export PATH="$(npm config get prefix)/bin:$PATH"
```

### Issue 2: "Cannot find module"

**Problem:** Import errors when testing programmatic API

**Solution:**
```bash
# Rebuild the package
cd packages/[package-name]
rm -rf dist node_modules
npm install
npm run build
npm link
```

### Issue 3: "GitHub token is required"

**Problem:** Token not being passed correctly

**Solution:**
```bash
# Verify token is set
echo $GITHUB_TOKEN

# If empty, set it
export GITHUB_TOKEN=your_token_here

# Or pass directly
lint-error analyze --owner test --repo test --token your_token_here
```

### Issue 4: Build errors

**Problem:** TypeScript compilation fails

**Solution:**
```bash
cd packages/[package-name]

# Check TypeScript version
npm list typescript

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Try building again
npm run build
```

### Issue 5: "Rate limit exceeded"

**Problem:** GitHub API rate limit hit during testing

**Solution:**
```bash
# Check rate limit status
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/rate_limit

# Wait for reset or use different token
# Authenticated: 5,000 requests/hour
```

---

## 📊 Test Results Interpretation

### Successful Test Output

**Lint Error Analyzer:**
```
=== Lint Analysis Results ===
Total Errors: 45
Total Warnings: 120
Total Info: 30
✓ PASS
```

**Type Error Analyzer:**
```
=== Type Analysis Results ===
Language: typescript
Total Errors: 23
Total Warnings: 67
✓ PASS
```

**Security Analyzer:**
```
=== Security Analysis Results ===
Security Score: 72/100
Total Issues: 15
✓ PASS (or exit code 1 if critical issues found)
```

### Failed Test Output

**Indicators of failure:**
- Error messages in output
- Non-zero exit codes (except security with critical issues)
- Stack traces
- "undefined" or "null" in results
- Network errors

---

## 🎯 Quick Test Script

Use this script for rapid testing:

```bash
#!/bin/bash

echo "🧪 Quick Test Script"
echo ""

# Check token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "❌ GITHUB_TOKEN not set"
    exit 1
fi
echo "✓ GitHub token found"

# Test lint-error
echo ""
echo "Testing lint-error..."
lint-error analyze --owner facebook --repo react --token $GITHUB_TOKEN > /tmp/lint-test.log 2>&1
if [ $? -eq 0 ]; then
    echo "✓ lint-error works"
else
    echo "❌ lint-error failed"
    cat /tmp/lint-test.log
fi

# Test type-error
echo ""
echo "Testing type-error..."
type-error analyze --owner microsoft --repo vscode --token $GITHUB_TOKEN > /tmp/type-test.log 2>&1
if [ $? -eq 0 ]; then
    echo "✓ type-error works"
else
    echo "❌ type-error failed"
    cat /tmp/type-test.log
fi

# Test security
echo ""
echo "Testing security-analyzer..."
security-analyzer analyze --owner facebook --repo react --token $GITHUB_TOKEN > /tmp/security-test.log 2>&1
SECURITY_EXIT=$?
if [ $SECURITY_EXIT -eq 0 ] || [ $SECURITY_EXIT -eq 1 ]; then
    echo "✓ security-analyzer works"
else
    echo "❌ security-analyzer failed"
    cat /tmp/security-test.log
fi

echo ""
echo "✅ All tests complete!"
```

Save as `quick-test.sh` and run:
```bash
chmod +x quick-test.sh
./quick-test.sh
```

---

## 📦 Pre-Publishing Checklist

Before running `npm publish`:

### Code Quality
- [ ] All tests pass
- [ ] No console.log statements in production code
- [ ] Error handling is robust
- [ ] Code is well-commented

### Package Configuration
- [ ] `package.json` has correct name, version, description
- [ ] `main` and `types` fields point to correct files
- [ ] `bin` field is configured for CLI
- [ ] `files` field includes only necessary files
- [ ] Dependencies are correct (not devDependencies)

### Documentation
- [ ] README is complete and accurate
- [ ] Usage examples work
- [ ] API documentation is up to date
- [ ] CHANGELOG is updated (if applicable)

### Version Management
- [ ] Version number is correct
- [ ] No uncommitted changes
- [ ] Git tags are in sync (if using)

### npm Account
- [ ] Logged in: `npm whoami`
- [ ] Have publish permissions
- [ ] Package name is available (for first publish)

---

## 🚀 Publishing Workflow

Once all tests pass:

```bash
# 1. Final build
cd packages/lint-error && npm run build && cd ../..
cd packages/type-error && npm run build && cd ../..
cd packages/security && npm run build && cd ../..

# 2. Login to npm
npm login

# 3. Publish (dry run first)
cd packages/lint-error
npm publish --dry-run
# If looks good:
npm publish --access public

cd ../type-error
npm publish --dry-run
npm publish --access public

cd ../security
npm publish --dry-run
npm publish --access public
```

Or use the automated script:
```bash
bash scripts/publish-all.sh
```

---

## ✨ Post-Publishing Verification

After publishing:

```bash
# 1. Unlink local packages
npm unlink -g @github-analyzer/lint-error
npm unlink -g @github-analyzer/type-error
npm unlink -g @github-analyzer/security

# 2. Install from npm
npm install -g @github-analyzer/lint-error
npm install -g @github-analyzer/type-error
npm install -g @github-analyzer/security

# 3. Test installed packages
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react

# 4. Verify on npm
npm view @github-analyzer/lint-error
npm view @github-analyzer/type-error
npm view @github-analyzer/security
```

---

## 📝 Summary

**Testing Steps:**
1. Install dependencies
2. Build packages
3. Link locally
4. Test CLI commands
5. Test programmatic API
6. Verify all functionality
7. Check documentation
8. Publish (dry run first)
9. Verify published packages

**Key Commands:**
```bash
# Setup
bash scripts/setup-microservices.sh

# Test
export GITHUB_TOKEN=your_token
bash scripts/test-microservices.sh

# Publish
npm login
bash scripts/publish-all.sh
```

---

**Ready to test? Start with Step 1!**

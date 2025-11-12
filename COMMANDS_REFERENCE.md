# 🚀 Quick Commands Reference

Essential commands for GitHub Code Analysis Microservices.

---

## 🔧 Setup & Installation

### First Time Setup
```bash
# Clone and setup
git clone <repository>
cd open-repo-lens-backup
bash scripts/setup-microservices.sh
```

### Manual Setup
```bash
# Install dependencies for each package
cd packages/lint-error && npm install && cd ../..
cd packages/type-error && npm install && cd ../..
cd packages/security && npm install && cd ../..

# Build all packages
cd packages/lint-error && npm run build && cd ../..
cd packages/type-error && npm run build && cd ../..
cd packages/security && npm run build && cd ../..

# Link for local testing
cd packages/lint-error && npm link && cd ../..
cd packages/type-error && npm link && cd ../..
cd packages/security && npm link && cd ../..
```

---

## 🔐 GitHub Token

```bash
# Set token (required for all commands)
export GITHUB_TOKEN=your_github_token_here

# Or pass directly
--token YOUR_TOKEN
```

---

## 🧪 Testing

### Test All Packages
```bash
bash scripts/test-microservices.sh
```

### Test Individual Packages
```bash
# Lint error analyzer
lint-error analyze --owner facebook --repo react

# Type error analyzer
type-error analyze --owner microsoft --repo vscode

# Security analyzer
security-analyzer analyze --owner facebook --repo react
```

---

## 📦 CLI Commands

### Lint Error Analyzer

```bash
# Basic usage
lint-error analyze --owner <owner> --repo <repo>

# With branch
lint-error analyze --owner facebook --repo react --branch main

# With token
lint-error analyze --owner facebook --repo react --token YOUR_TOKEN

# Full example
lint-error analyze \
  --owner facebook \
  --repo react \
  --branch main \
  --token $GITHUB_TOKEN
```

### Type Error Analyzer

```bash
# Basic usage
type-error analyze --owner <owner> --repo <repo>

# With branch
type-error analyze --owner microsoft --repo vscode --branch main

# Disable MCP
type-error analyze --owner microsoft --repo vscode --no-mcp

# With token
type-error analyze --owner microsoft --repo vscode --token YOUR_TOKEN

# Full example
type-error analyze \
  --owner microsoft \
  --repo vscode \
  --branch main \
  --token $GITHUB_TOKEN
```

### Security Analyzer

```bash
# Basic usage
security-analyzer analyze --owner <owner> --repo <repo>

# With branch
security-analyzer analyze --owner facebook --repo react --branch main

# JSON output
security-analyzer analyze --owner facebook --repo react --json

# With token
security-analyzer analyze --owner facebook --repo react --token YOUR_TOKEN

# Full example
security-analyzer analyze \
  --owner facebook \
  --repo react \
  --branch main \
  --token $GITHUB_TOKEN
```

---

## 💻 Programmatic API

### Import Packages

```typescript
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';
```

### Lint Error Analyzer

```typescript
const token = process.env.GITHUB_TOKEN;
const analyzer = new LintErrorAnalyzer(token);

const result = await analyzer.analyzeRepository('facebook', 'react', 'main');

console.log(result.totalErrors);
console.log(result.totalWarnings);
console.log(result.errors);
```

### Type Error Analyzer

```typescript
const token = process.env.GITHUB_TOKEN;
const analyzer = new TypeErrorAnalyzer(token, true); // true = enable MCP

const result = await analyzer.analyzeRepository('microsoft', 'vscode', 'main');

console.log(result.totalErrors);
console.log(result.languageInfo);
console.log(result.errors);
```

### Security Analyzer

```typescript
const token = process.env.GITHUB_TOKEN;
const analyzer = new SecurityAnalyzer(token);

const result = await analyzer.analyzeRepository('facebook', 'react', 'main');

console.log(result.securityScore);
console.log(result.criticalIssues);
console.log(result.issues);
console.log(result.dependencies);
```

### Analyze All

```typescript
const token = process.env.GITHUB_TOKEN;

const [lint, types, security] = await Promise.all([
  new LintErrorAnalyzer(token).analyzeRepository('facebook', 'react'),
  new TypeErrorAnalyzer(token, true).analyzeRepository('facebook', 'react'),
  new SecurityAnalyzer(token).analyzeRepository('facebook', 'react'),
]);

console.log('Lint:', lint.totalErrors);
console.log('Types:', types.totalErrors);
console.log('Security:', security.securityScore);
```

---

## 🔨 Development

### Build Commands

```bash
# Build all packages
cd packages/lint-error && npm run build && cd ../..
cd packages/type-error && npm run build && cd ../..
cd packages/security && npm run build && cd ../..

# Build single package
cd packages/[package-name]
npm run build

# Watch mode (auto-rebuild)
cd packages/[package-name]
npm run dev
```

### Link for Local Testing

```bash
# Link all packages
cd packages/lint-error && npm link && cd ../..
cd packages/type-error && npm link && cd ../..
cd packages/security && npm link && cd ../..

# Link single package
cd packages/[package-name]
npm link

# Unlink
npm unlink -g @github-analyzer/[package-name]
```

---

## 📤 Publishing

### Publish All Packages

```bash
# Login to npm (first time)
npm login

# Publish all
bash scripts/publish-all.sh
```

### Publish Individual Package

```bash
cd packages/[package-name]

# Update version
npm version patch  # 1.0.0 -> 1.0.1
npm version minor  # 1.0.0 -> 1.1.0
npm version major  # 1.0.0 -> 2.0.0

# Build
npm run build

# Publish
npm publish --access public
```

### Verify Publication

```bash
# Check on npm
npm view @github-analyzer/lint-error
npm view @github-analyzer/type-error
npm view @github-analyzer/security

# Install globally
npm install -g @github-analyzer/lint-error
npm install -g @github-analyzer/type-error
npm install -g @github-analyzer/security

# Test
lint-error --version
type-error --version
security-analyzer --version
```

---

## 🔄 Update & Maintenance

### Update Dependencies

```bash
cd packages/[package-name]
npm update
npm audit fix
```

### Clean Build

```bash
cd packages/[package-name]
rm -rf node_modules dist
npm install
npm run build
```

### Reinstall Everything

```bash
# Remove all node_modules and dist
find packages -name "node_modules" -type d -exec rm -rf {} +
find packages -name "dist" -type d -exec rm -rf {} +

# Reinstall and rebuild
bash scripts/setup-microservices.sh
```

---

## 🧹 Cleanup

### Unlink Packages

```bash
npm unlink -g @github-analyzer/lint-error
npm unlink -g @github-analyzer/type-error
npm unlink -g @github-analyzer/security
```

### Remove Build Artifacts

```bash
find packages -name "dist" -type d -exec rm -rf {} +
find packages -name "*.tsbuildinfo" -type f -delete
```

### Remove Dependencies

```bash
find packages -name "node_modules" -type d -exec rm -rf {} +
```

---

## 📊 Useful Commands

### Check Package Info

```bash
cd packages/[package-name]
npm list
npm outdated
npm audit
```

### View Logs

```bash
# After running test script
cat /tmp/lint-test.log
cat /tmp/type-test.log
cat /tmp/security-test.log
```

### Count Lines of Code

```bash
wc -l packages/*/src/*.ts
```

### List All Files

```bash
find packages -type f -name "*.ts" -o -name "*.json" -o -name "*.md"
```

---

## 🎯 Common Workflows

### Workflow 1: First Time Setup

```bash
# 1. Clone repository
git clone <repository>
cd open-repo-lens-backup

# 2. Run setup
bash scripts/setup-microservices.sh

# 3. Set token
export GITHUB_TOKEN=your_token

# 4. Test
bash scripts/test-microservices.sh
```

### Workflow 2: Make Changes

```bash
# 1. Edit code
vim packages/lint-error/src/index.ts

# 2. Rebuild
cd packages/lint-error
npm run build

# 3. Test
lint-error analyze --owner facebook --repo react

# 4. Commit
git add .
git commit -m "Add new feature"
```

### Workflow 3: Publish Update

```bash
# 1. Update version
cd packages/lint-error
npm version patch

# 2. Build
npm run build

# 3. Test
npm link
lint-error analyze --owner test --repo test

# 4. Publish
npm publish --access public
```

### Workflow 4: Use in Project

```bash
# 1. Install
npm install @github-analyzer/lint-error @github-analyzer/type-error @github-analyzer/security

# 2. Create script
cat > analyze.js << 'EOF'
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
const analyzer = new LintErrorAnalyzer(process.env.GITHUB_TOKEN);
const result = await analyzer.analyzeRepository('facebook', 'react');
console.log(result);
EOF

# 3. Run
node analyze.js
```

---

## 🆘 Troubleshooting Commands

### Fix Permission Issues

```bash
chmod +x scripts/*.sh
```

### Fix npm Link Issues

```bash
npm unlink -g @github-analyzer/lint-error
cd packages/lint-error
npm link
```

### Fix Build Issues

```bash
cd packages/[package-name]
rm -rf node_modules dist package-lock.json
npm install
npm run build
```

### Check npm Login

```bash
npm whoami
npm login
```

---

## 📚 Documentation Commands

### View Documentation

```bash
# Main index
cat MICROSERVICES_INDEX.md

# Quick start
cat MICROSERVICES_QUICK_START.md

# Complete guide
cat MICROSERVICES_GUIDE.md

# Package docs
cat packages/lint-error/README.md
cat packages/type-error/README.md
cat packages/security/README.md
```

---

## 🎉 Quick Reference Card

```bash
# Setup
bash scripts/setup-microservices.sh

# Test
export GITHUB_TOKEN=token
bash scripts/test-microservices.sh

# Use
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react

# Publish
npm login
bash scripts/publish-all.sh
```

---

**For more details, see MICROSERVICES_INDEX.md**

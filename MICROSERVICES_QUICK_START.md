# Microservices Quick Start

## 🎯 What We Built

Three independent npm packages for GitHub code analysis:

1. **@github-analyzer/lint-error** - Lint error detection
2. **@github-analyzer/type-error** - Type error detection with GitHub MCP
3. **@github-analyzer/security** - Security vulnerability analysis

---

## ⚡ Quick Commands

### Setup (First Time)

```bash
# Run the setup script
bash scripts/setup-microservices.sh

# Or manually:
cd packages/lint-error && npm install && npm run build && npm link && cd ../..
cd packages/type-error && npm install && npm run build && npm link && cd ../..
cd packages/security && npm install && npm run build && npm link && cd ../..
```

### Test Locally

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Test all microservices
bash scripts/test-microservices.sh

# Or test individually:
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react
```

### Publish to NPM

```bash
# Login to npm (first time only)
npm login

# Publish all packages
bash scripts/publish-all.sh

# Or publish individually:
cd packages/lint-error && npm publish --access public && cd ../..
cd packages/type-error && npm publish --access public && cd ../..
cd packages/security && npm publish --access public && cd ../..
```

---

## 📦 Package Details

### Lint Error Analyzer
```bash
# Install globally
npm install -g @github-analyzer/lint-error

# Use
lint-error analyze --owner facebook --repo react --token YOUR_TOKEN

# Features
- Detects console.log, debugger, var usage
- Finds trailing whitespace
- Multi-language support
- Detailed error reports
```

### Type Error Analyzer
```bash
# Install globally
npm install -g @github-analyzer/type-error

# Use
type-error analyze --owner microsoft --repo vscode --token YOUR_TOKEN

# Features
- GitHub MCP integration
- TypeScript/JavaScript/Python/Java/Go support
- Detects implicit any, type mismatches
- Auto-detects language configuration
```

### Security Analyzer
```bash
# Install globally
npm install -g @github-analyzer/security

# Use
security-analyzer analyze --owner facebook --repo react --token YOUR_TOKEN

# Features
- SQL injection detection
- XSS vulnerability scanning
- Command injection detection
- Hardcoded credentials finder
- Dependency vulnerability checking
- Security score (0-100)
```

---

## 🔧 Development Workflow

### Making Changes

```bash
# 1. Edit code in packages/[package-name]/src/
# 2. Rebuild
cd packages/[package-name]
npm run build

# 3. Test locally
npm link
[package-cli] analyze --owner test --repo test

# 4. Publish new version
npm version patch  # or minor, major
npm publish --access public
```

### Adding New Features

Each package has:
- `src/index.ts` - Main analyzer class (programmatic API)
- `src/cli.ts` - CLI interface
- `package.json` - Package configuration
- `README.md` - Documentation

---

## 🚀 Integration Examples

### GitHub Actions

```yaml
- name: Run Code Analysis
  run: |
    npm install -g @github-analyzer/lint-error @github-analyzer/type-error @github-analyzer/security
    lint-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
    type-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
    security-analyzer analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Node.js Script

```javascript
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';

const token = process.env.GITHUB_TOKEN;

const lintResults = await new LintErrorAnalyzer(token).analyzeRepository('facebook', 'react');
const typeResults = await new TypeErrorAnalyzer(token).analyzeRepository('microsoft', 'vscode');
const securityResults = await new SecurityAnalyzer(token).analyzeRepository('facebook', 'react');

console.log('Lint Errors:', lintResults.totalErrors);
console.log('Type Errors:', typeResults.totalErrors);
console.log('Security Score:', securityResults.securityScore);
```

---

## 📊 Output Examples

### Lint Analysis
```
Total Errors: 45
Total Warnings: 120

[ERROR] src/index.ts:42:5
  Unexpected debugger statement (no-debugger)
```

### Type Analysis
```
Language: typescript
Total Errors: 23

[ERROR] src/types.ts:15:8
  Parameter implicitly has an any type (TS7006)
```

### Security Analysis
```
Security Score: 72/100
Critical: 2
High: 5

[CRITICAL] src/auth.ts:45
  Hardcoded Credentials (CWE-798)
```

---

## 🎓 Next Steps

1. **Test locally** - Run `bash scripts/test-microservices.sh`
2. **Customize** - Add your own detection rules
3. **Publish** - Share on npm with `bash scripts/publish-all.sh`
4. **Integrate** - Add to your CI/CD pipeline
5. **Extend** - Build more analyzers following the same pattern

---

## 📚 Full Documentation

See `MICROSERVICES_GUIDE.md` for complete documentation.

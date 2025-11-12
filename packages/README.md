# GitHub Code Analysis Microservices

Three independent npm packages for comprehensive GitHub repository analysis.

## 📦 Packages

| Package | Description | CLI Command | Version |
|---------|-------------|-------------|---------|
| [@github-analyzer/lint-error](./lint-error) | Lint error detection | `lint-error` | 1.0.0 |
| [@github-analyzer/type-error](./type-error) | Type error detection with MCP | `type-error` | 1.0.0 |
| [@github-analyzer/security](./security) | Security vulnerability analysis | `security-analyzer` | 1.0.0 |

---

## ⚡ Quick Start

### Install All Packages

```bash
npm install -g @github-analyzer/lint-error @github-analyzer/type-error @github-analyzer/security
```

### Use

```bash
# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Analyze a repository
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react
```

---

## 🔧 Development

### Setup

```bash
# From project root
bash scripts/setup-microservices.sh

# Or manually for each package:
cd lint-error && npm install && npm run build && npm link && cd ..
cd type-error && npm install && npm run build && npm link && cd ..
cd security && npm install && npm run build && npm link && cd ..
```

### Build

```bash
# Build all
cd lint-error && npm run build && cd ..
cd type-error && npm run build && cd ..
cd security && npm run build && cd ..

# Or build individually
cd [package-name]
npm run build
```

### Test

```bash
# From project root
bash scripts/test-microservices.sh

# Or test individually
[cli-command] analyze --owner test --repo test --token $GITHUB_TOKEN
```

---

## 📤 Publishing

### Prerequisites

```bash
# Login to npm (first time only)
npm login
```

### Publish All

```bash
# From project root
bash scripts/publish-all.sh
```

### Publish Individually

```bash
cd [package-name]
npm version patch  # or minor, major
npm run build
npm publish --access public
```

---

## 📚 Documentation

- [Complete Guide](../MICROSERVICES_GUIDE.md)
- [Quick Start](../MICROSERVICES_QUICK_START.md)
- [Implementation Summary](../MICROSERVICES_IMPLEMENTATION_SUMMARY.md)
- [Project Structure](../MICROSERVICES_STRUCTURE.md)

### Individual Package Docs

- [Lint Error README](./lint-error/README.md)
- [Type Error README](./type-error/README.md)
- [Security README](./security/README.md)

---

## 🎯 Features Comparison

| Feature | Lint Error | Type Error | Security |
|---------|-----------|-----------|----------|
| Multi-language | ✅ | ✅ | ✅ |
| GitHub MCP | ❌ | ✅ | ❌ |
| CLI Interface | ✅ | ✅ | ✅ |
| Programmatic API | ✅ | ✅ | ✅ |
| Error Categorization | ✅ | ✅ | ✅ |
| CWE/CVE Mapping | ❌ | ❌ | ✅ |
| Security Score | ❌ | ❌ | ✅ |
| Dependency Scanning | ❌ | ❌ | ✅ |

---

## 🔐 GitHub Token

All packages require a GitHub personal access token:

1. Create token: https://github.com/settings/tokens
2. Required scope: `repo`
3. Set environment variable: `export GITHUB_TOKEN=your_token`

---

## 🤝 Integration

### GitHub Actions

```yaml
- name: Code Analysis
  run: |
    npm install -g @github-analyzer/lint-error @github-analyzer/type-error @github-analyzer/security
    lint-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
    type-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
    security-analyzer analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }}
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### Node.js

```typescript
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';

const token = process.env.GITHUB_TOKEN;

const results = await Promise.all([
  new LintErrorAnalyzer(token).analyzeRepository('facebook', 'react'),
  new TypeErrorAnalyzer(token).analyzeRepository('microsoft', 'vscode'),
  new SecurityAnalyzer(token).analyzeRepository('facebook', 'react'),
]);
```

---

## 📄 License

MIT

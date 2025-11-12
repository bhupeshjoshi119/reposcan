# GitHub Code Analysis Microservices

Three independent, npm-publishable microservices for comprehensive code analysis.

## 📦 Packages

### 1. @github-analyzer/lint-error
Detects lint errors and code quality issues in GitHub repositories.

**Features:**
- Multi-language support (JS, TS, Python, Java, Go)
- Detects common lint issues (console.log, debugger, var usage, trailing spaces)
- Finds lint configuration files
- Detailed error reports with file/line/column info

**Installation:**
```bash
npm install -g @github-analyzer/lint-error
```

**Usage:**
```bash
lint-error analyze --owner facebook --repo react --token YOUR_TOKEN
```

---

### 2. @github-analyzer/type-error
Detects type errors using GitHub MCP (Model Context Protocol).

**Features:**
- GitHub MCP integration for advanced type checking
- Supports TypeScript, JavaScript, Python, Java, Go
- Analyzes GitHub Check Runs
- Auto-detects language and configuration
- Categorizes errors (implicit-any, type-annotation, non-null-assertion)

**Installation:**
```bash
npm install -g @github-analyzer/type-error
```

**Usage:**
```bash
type-error analyze --owner microsoft --repo vscode --token YOUR_TOKEN
```

---

### 3. @github-analyzer/security
Comprehensive security vulnerability analysis.

**Features:**
- Code security scanning (SQL injection, XSS, command injection)
- Hardcoded credentials detection
- Dependency vulnerability checking
- Secret file detection
- Security score calculation (0-100)
- CWE/CVE mapping

**Installation:**
```bash
npm install -g @github-analyzer/security
```

**Usage:**
```bash
security-analyzer analyze --owner facebook --repo react --token YOUR_TOKEN
```

---

## 🚀 Quick Start

### Setup All Packages

```bash
# Install dependencies for all packages
cd packages/lint-error && npm install && cd ../..
cd packages/type-error && npm install && cd ../..
cd packages/security && npm install && cd ../..
```

### Build All Packages

```bash
# Build all packages
cd packages/lint-error && npm run build && cd ../..
cd packages/type-error && npm run build && cd ../..
cd packages/security && npm run build && cd ../..
```

### Test Locally

```bash
# Link packages locally
cd packages/lint-error && npm link && cd ../..
cd packages/type-error && npm link && cd ../..
cd packages/security && npm link && cd ../..

# Now you can use them globally
lint-error analyze --owner facebook --repo react --token YOUR_TOKEN
type-error analyze --owner microsoft --repo vscode --token YOUR_TOKEN
security-analyzer analyze --owner facebook --repo react --token YOUR_TOKEN
```

---

## 📝 Publishing to NPM

### Prerequisites
1. Create an npm account at https://www.npmjs.com
2. Login to npm: `npm login`
3. Update package names in each `package.json` if needed

### Publish Each Package

```bash
# Publish lint-error
cd packages/lint-error
npm publish --access public
cd ../..

# Publish type-error
cd packages/type-error
npm publish --access public
cd ../..

# Publish security
cd packages/security
npm publish --access public
cd ../..
```

---

## 🔧 Development

### Project Structure

```
packages/
├── lint-error/
│   ├── src/
│   │   ├── index.ts      # Main analyzer class
│   │   └── cli.ts        # CLI interface
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
├── type-error/
│   ├── src/
│   │   ├── index.ts      # Type analyzer with MCP
│   │   └── cli.ts        # CLI interface
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── security/
    ├── src/
    │   ├── index.ts      # Security analyzer
    │   └── cli.ts        # CLI interface
    ├── package.json
    ├── tsconfig.json
    └── README.md
```

### Adding New Features

Each package is independent. To add features:

1. Edit the `src/index.ts` file in the respective package
2. Update the CLI in `src/cli.ts` if needed
3. Rebuild: `npm run build`
4. Test locally: `npm link`
5. Publish: `npm publish`

---

## 🔐 GitHub Token

All tools require a GitHub personal access token:

1. Go to https://github.com/settings/tokens
2. Generate a new token with `repo` scope
3. Use it via:
   - Environment variable: `export GITHUB_TOKEN=your_token`
   - CLI flag: `--token your_token`

---

## 📊 Output Formats

### Lint Error Output
```
Total Errors: 45
Total Warnings: 120
Total Info: 30

=== Top Issues ===
[ERROR] src/index.ts:42:5
  Unexpected debugger statement (no-debugger)
  debugger;
```

### Type Error Output
```
Language: typescript
Total Errors: 23
Total Warnings: 67

=== Top Type Errors ===
[ERROR] src/types.ts:15:8
  Parameter implicitly has an any type (TS7006)
  Category: implicit-any
```

### Security Output
```
Security Score: 72/100
Total Issues: 15
  Critical: 2
  High: 5
  Medium: 6
  Low: 2

=== CRITICAL ISSUES ===
[CRITICAL] src/auth.ts:45
  Hardcoded Credentials
  CWE: CWE-798
  Recommendation: Use environment variables
```

---

## 🤝 Integration Examples

### Use in CI/CD

```yaml
# .github/workflows/code-analysis.yml
name: Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Install analyzers
        run: |
          npm install -g @github-analyzer/lint-error
          npm install -g @github-analyzer/type-error
          npm install -g @github-analyzer/security
      
      - name: Run lint analysis
        run: lint-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }} --token ${{ secrets.GITHUB_TOKEN }}
      
      - name: Run type analysis
        run: type-error analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }} --token ${{ secrets.GITHUB_TOKEN }}
      
      - name: Run security analysis
        run: security-analyzer analyze --owner ${{ github.repository_owner }} --repo ${{ github.event.repository.name }} --token ${{ secrets.GITHUB_TOKEN }}
```

### Use Programmatically

```typescript
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';

const token = process.env.GITHUB_TOKEN;

// Analyze lint errors
const lintAnalyzer = new LintErrorAnalyzer(token);
const lintResults = await lintAnalyzer.analyzeRepository('facebook', 'react');

// Analyze type errors
const typeAnalyzer = new TypeErrorAnalyzer(token, true);
const typeResults = await typeAnalyzer.analyzeRepository('microsoft', 'vscode');

// Analyze security
const securityAnalyzer = new SecurityAnalyzer(token);
const securityResults = await securityAnalyzer.analyzeRepository('facebook', 'react');

// Combine results
const report = {
  lint: lintResults,
  types: typeResults,
  security: securityResults,
  overallScore: calculateScore(lintResults, typeResults, securityResults)
};
```

---

## 📄 License

MIT

---

## 🐛 Troubleshooting

### "GitHub token is required"
Set your token: `export GITHUB_TOKEN=your_token_here`

### "Rate limit exceeded"
GitHub API has rate limits. Wait or use a token with higher limits.

### "Permission denied"
Ensure your token has `repo` scope for private repositories.

### Build errors
Run `npm install` in each package directory before building.

---

## 🎯 Roadmap

- [ ] Add more language support
- [ ] Integrate with more vulnerability databases
- [ ] Add custom rule configuration
- [ ] Support for monorepos
- [ ] Web dashboard for results
- [ ] Slack/Discord notifications
- [ ] Auto-fix suggestions
- [ ] Historical trend analysis

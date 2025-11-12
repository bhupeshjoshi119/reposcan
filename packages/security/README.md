# @github-analyzer/security

Security vulnerability analysis microservice for GitHub repositories.

## Installation

```bash
npm install -g @github-analyzer/security
```

## Usage

### CLI

```bash
# Analyze a repository
security-analyzer analyze --owner facebook --repo react --branch main --token YOUR_GITHUB_TOKEN

# Output as JSON
security-analyzer analyze --owner facebook --repo react --json

# Or use environment variable
export GITHUB_TOKEN=your_token_here
security-analyzer analyze --owner facebook --repo react
```

### Programmatic API

```typescript
import { SecurityAnalyzer } from '@github-analyzer/security';

const analyzer = new SecurityAnalyzer('YOUR_GITHUB_TOKEN');

const result = await analyzer.analyzeRepository('facebook', 'react', 'main');

console.log(`Security Score: ${result.securityScore}/100`);
console.log(`Critical Issues: ${result.criticalIssues}`);
console.log(result.issues);
```

## Features

- **Code Security Analysis**: Detects common vulnerabilities
  - SQL Injection (CWE-89)
  - Cross-Site Scripting (CWE-79)
  - Command Injection (CWE-78)
  - Hardcoded Credentials (CWE-798)
  - Weak Random Number Generation (CWE-338)
  - Code Injection via eval() (CWE-95)
  - Insecure Transport (CWE-319)
  - Exposed Secrets (CWE-540)

- **Dependency Vulnerability Scanning**: Checks for known vulnerabilities in dependencies
- **Security Score**: Calculates overall security score (0-100)
- **Detailed Reports**: Provides file, line, and remediation information
- **Multiple Languages**: Supports JavaScript, TypeScript, Python, Java, Go, PHP, Ruby

## Security Categories

- `sql-injection`: SQL injection vulnerabilities
- `xss`: Cross-site scripting vulnerabilities
- `command-injection`: Command injection vulnerabilities
- `hardcoded-credentials`: Hardcoded passwords and API keys
- `weak-random`: Weak random number generation
- `code-injection`: Code injection via eval()
- `insecure-transport`: Insecure HTTP connections
- `exposed-secrets`: Exposed secret files

## API

### `SecurityAnalyzer`

#### Constructor

```typescript
new SecurityAnalyzer(githubToken: string)
```

#### Methods

##### `analyzeRepository(owner, repo, branch?)`

Analyzes a GitHub repository for security vulnerabilities.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `branch` (string, optional): Branch name (default: 'main')

**Returns:** `Promise<SecurityAnalysisResult>`

## Exit Codes

- `0`: Success (no critical issues)
- `1`: Critical security issues found

## License

MIT

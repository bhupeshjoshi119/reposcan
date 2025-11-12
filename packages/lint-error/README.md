# @github-analyzer/lint-error

Lint error detection microservice for GitHub repositories.

## Installation

```bash
npm install -g @github-analyzer/lint-error
```

## Usage

### CLI

```bash
# Analyze a repository
lint-error analyze --owner facebook --repo react --branch main --token YOUR_GITHUB_TOKEN

# Or use environment variable
export GITHUB_TOKEN=your_token_here
lint-error analyze --owner facebook --repo react
```

### Programmatic API

```typescript
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';

const analyzer = new LintErrorAnalyzer('YOUR_GITHUB_TOKEN');

const result = await analyzer.analyzeRepository('facebook', 'react', 'main');

console.log(`Total Errors: ${result.totalErrors}`);
console.log(`Total Warnings: ${result.totalWarnings}`);
console.log(result.errors);
```

## Features

- Detects common lint issues across multiple languages
- Analyzes entire repositories recursively
- Provides detailed error reports with file, line, and column information
- Summarizes issues by file and rule
- Supports JavaScript, TypeScript, Python, Java, Go, and more

## API

### `LintErrorAnalyzer`

#### Constructor

```typescript
new LintErrorAnalyzer(githubToken: string)
```

#### Methods

##### `analyzeRepository(owner, repo, branch?)`

Analyzes a GitHub repository for lint errors.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `branch` (string, optional): Branch name (default: 'main')

**Returns:** `Promise<LintAnalysisResult>`

## License

MIT

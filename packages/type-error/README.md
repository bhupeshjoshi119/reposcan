# @github-analyzer/type-error

Type error detection microservice for GitHub repositories using GitHub MCP (Model Context Protocol).

## Installation

```bash
npm install -g @github-analyzer/type-error
```

## Usage

### CLI

```bash
# Analyze a repository
type-error analyze --owner microsoft --repo vscode --branch main --token YOUR_GITHUB_TOKEN

# Disable MCP integration
type-error analyze --owner microsoft --repo vscode --no-mcp

# Or use environment variable
export GITHUB_TOKEN=your_token_here
type-error analyze --owner microsoft --repo vscode
```

### Programmatic API

```typescript
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';

const analyzer = new TypeErrorAnalyzer('YOUR_GITHUB_TOKEN', true);

const result = await analyzer.analyzeRepository('microsoft', 'vscode', 'main');

console.log(`Total Type Errors: ${result.totalErrors}`);
console.log(`Language: ${result.languageInfo.language}`);
console.log(result.errors);
```

## Features

- Detects type errors in TypeScript, JavaScript, Python, Java, and Go
- Integrates with GitHub MCP for advanced type checking
- Analyzes GitHub Check Runs for type errors
- Provides detailed error reports with file, line, and column information
- Categorizes errors by type (implicit-any, type-annotation, etc.)
- Auto-detects language and configuration files

## GitHub MCP Integration

This tool leverages GitHub's Model Context Protocol (MCP) to access advanced type checking information from GitHub's code analysis infrastructure. MCP provides:

- Real-time type checking results from GitHub Actions
- Integration with language servers
- Access to check run annotations
- Enhanced error detection

## API

### `TypeErrorAnalyzer`

#### Constructor

```typescript
new TypeErrorAnalyzer(githubToken: string, mcpEnabled?: boolean)
```

#### Methods

##### `analyzeRepository(owner, repo, branch?)`

Analyzes a GitHub repository for type errors.

**Parameters:**
- `owner` (string): Repository owner
- `repo` (string): Repository name
- `branch` (string, optional): Branch name (default: 'main')

**Returns:** `Promise<TypeAnalysisResult>`

## Supported Languages

- TypeScript (.ts, .tsx)
- JavaScript (.js, .jsx)
- Python (.py)
- Java (.java)
- Go (.go)

## License

MIT

# 🏗️ Microservices Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     GitHub Code Analysis Platform                        │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
        ┌──────────────────┐ ┌──────────────┐ ┌──────────────────┐
        │  Lint Error      │ │ Type Error   │ │    Security      │
        │   Analyzer       │ │  Analyzer    │ │    Analyzer      │
        │                  │ │              │ │                  │
        │  @github-        │ │ @github-     │ │  @github-        │
        │  analyzer/       │ │ analyzer/    │ │  analyzer/       │
        │  lint-error      │ │ type-error   │ │  security        │
        └──────────────────┘ └──────────────┘ └──────────────────┘
                │                   │                    │
                │                   │                    │
                └───────────────────┼────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │   GitHub REST API     │
                        │   GitHub MCP          │
                        └───────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  GitHub Repository    │
                        │  (Source Code)        │
                        └───────────────────────┘
```

---

## Package Architecture

### 1. Lint Error Analyzer

```
@github-analyzer/lint-error
│
├── CLI Interface (lint-error)
│   └── Commander.js
│       ├── analyze command
│       └── Options: --owner, --repo, --branch, --token
│
├── Programmatic API
│   └── LintErrorAnalyzer class
│       ├── analyzeRepository()
│       ├── analyzeFile()
│       ├── lintContent()
│       ├── findLintConfigs()
│       └── getSourceFiles()
│
└── Output
    └── LintAnalysisResult
        ├── totalErrors
        ├── totalWarnings
        ├── errors[]
        └── summary{}
```

### 2. Type Error Analyzer

```
@github-analyzer/type-error
│
├── CLI Interface (type-error)
│   └── Commander.js
│       ├── analyze command
│       └── Options: --owner, --repo, --branch, --token, --no-mcp
│
├── Programmatic API
│   └── TypeErrorAnalyzer class
│       ├── analyzeRepository()
│       ├── analyzeMCP() ← GitHub MCP Integration
│       ├── analyzeFile()
│       ├── checkTypes()
│       ├── detectLanguage()
│       └── getSourceFiles()
│
└── Output
    └── TypeAnalysisResult
        ├── totalErrors
        ├── totalWarnings
        ├── errors[]
        ├── languageInfo{}
        └── summary{}
```

### 3. Security Analyzer

```
@github-analyzer/security
│
├── CLI Interface (security-analyzer)
│   └── Commander.js
│       ├── analyze command
│       └── Options: --owner, --repo, --branch, --token, --json
│
├── Programmatic API
│   └── SecurityAnalyzer class
│       ├── analyzeRepository()
│       ├── getSecurityAdvisories()
│       ├── checkDependencies()
│       ├── analyzeFile()
│       ├── scanContent()
│       ├── scanForSecrets()
│       └── calculateSecurityScore()
│
└── Output
    └── SecurityAnalysisResult
        ├── totalIssues
        ├── criticalIssues
        ├── issues[]
        ├── dependencies[]
        ├── securityScore
        └── summary{}
```

---

## Data Flow

### CLI Usage Flow

```
User Command
    │
    ▼
┌─────────────────┐
│  CLI Parser     │ (Commander.js)
│  - Parse args   │
│  - Validate     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Analyzer Class │
│  - Initialize   │
│  - Set token    │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  GitHub API     │
│  - Fetch repo   │
│  - Get files    │
│  - Get content  │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Analysis       │
│  - Scan code    │
│  - Detect issues│
│  - Categorize   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Results        │
│  - Format       │
│  - Display      │
│  - Return       │
└─────────────────┘
```

### Programmatic API Flow

```
Node.js Application
    │
    ▼
┌─────────────────┐
│  Import Package │
│  new Analyzer() │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Call Method    │
│  .analyze()     │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  GitHub API     │
│  - Fetch data   │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Analysis       │
│  - Process      │
└─────────────────┘
    │
    ▼
┌─────────────────┐
│  Return Result  │
│  (JSON object)  │
└─────────────────┘
```

---

## Integration Patterns

### Pattern 1: Standalone CLI

```
Terminal
    │
    ▼
lint-error analyze --owner facebook --repo react
    │
    ▼
Display results in terminal
```

### Pattern 2: Node.js Application

```
Node.js App
    │
    ▼
import { LintErrorAnalyzer } from '@github-analyzer/lint-error'
    │
    ▼
const result = await analyzer.analyzeRepository(...)
    │
    ▼
Process results in application
```

### Pattern 3: CI/CD Pipeline

```
GitHub Actions
    │
    ▼
npm install -g @github-analyzer/lint-error
    │
    ▼
lint-error analyze --owner $OWNER --repo $REPO
    │
    ▼
Check exit code / Parse output
    │
    ▼
Pass/Fail build
```

### Pattern 4: Combined Analysis

```
Application
    │
    ├─► LintErrorAnalyzer
    │       │
    │       ▼
    │   Lint Results
    │
    ├─► TypeErrorAnalyzer
    │       │
    │       ▼
    │   Type Results
    │
    └─► SecurityAnalyzer
            │
            ▼
        Security Results
            │
            ▼
    Combine & Generate Report
```

---

## Technology Stack

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
├─────────────────────────────────────────────────────────┤
│  TypeScript (Source Code)                               │
│  Commander.js (CLI Framework)                           │
│  Chalk (Terminal Styling)                               │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    API Layer                             │
├─────────────────────────────────────────────────────────┤
│  @octokit/rest (GitHub API Client)                      │
│  GitHub REST API                                         │
│  GitHub MCP (Model Context Protocol)                    │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    Data Layer                            │
├─────────────────────────────────────────────────────────┤
│  GitHub Repositories                                     │
│  Source Code Files                                       │
│  Check Runs & Annotations                                │
└─────────────────────────────────────────────────────────┘
```

---

## Deployment Architecture

### Development

```
Local Machine
    │
    ├─► packages/lint-error/
    │       └─► npm link
    │
    ├─► packages/type-error/
    │       └─► npm link
    │
    └─► packages/security/
            └─► npm link
                │
                ▼
        Global CLI commands available
```

### Production (npm)

```
npm Registry
    │
    ├─► @github-analyzer/lint-error@1.0.0
    │
    ├─► @github-analyzer/type-error@1.0.0
    │
    └─► @github-analyzer/security@1.0.0
            │
            ▼
    npm install -g [package]
            │
            ▼
    Global CLI commands available
```

### CI/CD Integration

```
GitHub Actions Workflow
    │
    ▼
Install packages from npm
    │
    ▼
Run analysis commands
    │
    ▼
Parse results
    │
    ▼
Report status
```

---

## Security Model

```
┌─────────────────────────────────────────────────────────┐
│                  Authentication                          │
├─────────────────────────────────────────────────────────┤
│  GitHub Personal Access Token                            │
│  - Stored in environment variable                        │
│  - Passed to Octokit client                             │
│  - Required scope: repo                                  │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Authorization                           │
├─────────────────────────────────────────────────────────┤
│  GitHub API validates token                              │
│  - Checks repository access                              │
│  - Enforces rate limits                                  │
│  - Returns 401/403 on failure                           │
└─────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                  Data Access                             │
├─────────────────────────────────────────────────────────┤
│  Read-only access to repositories                        │
│  - Fetch file contents                                   │
│  - Read check runs                                       │
│  - No write operations                                   │
└─────────────────────────────────────────────────────────┘
```

---

## Scalability Considerations

### Horizontal Scaling

```
Multiple Instances
    │
    ├─► Instance 1: Analyze Repo A
    │
    ├─► Instance 2: Analyze Repo B
    │
    └─► Instance 3: Analyze Repo C
            │
            ▼
    Independent execution
    No shared state
```

### Rate Limiting

```
GitHub API Rate Limits
    │
    ├─► Unauthenticated: 60 requests/hour
    │
    └─► Authenticated: 5,000 requests/hour
            │
            ▼
    Implement retry logic
    Use conditional requests
    Cache results
```

---

## Error Handling

```
User Request
    │
    ▼
Try Analysis
    │
    ├─► Success
    │       └─► Return results
    │
    └─► Error
            │
            ├─► Network Error
            │       └─► Retry with backoff
            │
            ├─► Auth Error
            │       └─► Return 401 message
            │
            ├─► Rate Limit
            │       └─► Wait and retry
            │
            └─► Other Error
                    └─► Log and return error
```

---

## Future Architecture

```
Current: CLI + Programmatic API
    │
    ▼
Future Additions:
    │
    ├─► Web Dashboard
    │       └─► React frontend
    │
    ├─► REST API Server
    │       └─► Express backend
    │
    ├─► Database
    │       └─► Store historical results
    │
    ├─► Queue System
    │       └─► Background processing
    │
    └─► Notification System
            └─► Slack/Discord/Email
```

---

**For implementation details, see MICROSERVICES_IMPLEMENTATION_SUMMARY.md**

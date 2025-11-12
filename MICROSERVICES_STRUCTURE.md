# Microservices Project Structure

## 📁 Complete Directory Layout

```
open-repo-lens-backup/
│
├── packages/                           # Microservices root
│   │
│   ├── lint-error/                     # Lint Error Analyzer
│   │   ├── src/
│   │   │   ├── index.ts               # Main LintErrorAnalyzer class
│   │   │   └── cli.ts                 # CLI interface
│   │   ├── dist/                      # Compiled output (generated)
│   │   ├── node_modules/              # Dependencies (generated)
│   │   ├── package.json               # Package configuration
│   │   ├── tsconfig.json              # TypeScript config
│   │   └── README.md                  # Documentation
│   │
│   ├── type-error/                     # Type Error Analyzer
│   │   ├── src/
│   │   │   ├── index.ts               # TypeErrorAnalyzer with MCP
│   │   │   └── cli.ts                 # CLI interface
│   │   ├── dist/                      # Compiled output (generated)
│   │   ├── node_modules/              # Dependencies (generated)
│   │   ├── package.json               # Package configuration
│   │   ├── tsconfig.json              # TypeScript config
│   │   └── README.md                  # Documentation
│   │
│   ├── security/                       # Security Analyzer
│   │   ├── src/
│   │   │   ├── index.ts               # SecurityAnalyzer class
│   │   │   └── cli.ts                 # CLI interface
│   │   ├── dist/                      # Compiled output (generated)
│   │   ├── node_modules/              # Dependencies (generated)
│   │   ├── package.json               # Package configuration
│   │   ├── tsconfig.json              # TypeScript config
│   │   └── README.md                  # Documentation
│   │
│   └── .gitignore                      # Ignore node_modules, dist, etc.
│
├── scripts/                            # Automation scripts
│   ├── setup-microservices.sh         # Setup all packages
│   ├── publish-all.sh                 # Publish to npm
│   └── test-microservices.sh          # Test all packages
│
├── MICROSERVICES_GUIDE.md             # Complete documentation
├── MICROSERVICES_QUICK_START.md       # Quick reference
├── MICROSERVICES_IMPLEMENTATION_SUMMARY.md  # Implementation details
└── MICROSERVICES_STRUCTURE.md         # This file
```

---

## 📦 Package Details

### 1. @github-analyzer/lint-error

**Location:** `packages/lint-error/`

**Files:**
- `src/index.ts` (280 lines) - Main analyzer with LintErrorAnalyzer class
- `src/cli.ts` (70 lines) - Command-line interface
- `package.json` - npm package configuration
- `tsconfig.json` - TypeScript compiler settings
- `README.md` - Usage documentation

**Exports:**
```typescript
export class LintErrorAnalyzer
export interface LintError
export interface LintAnalysisResult
```

**CLI Command:** `lint-error`

---

### 2. @github-analyzer/type-error

**Location:** `packages/type-error/`

**Files:**
- `src/index.ts` (420 lines) - Type analyzer with GitHub MCP integration
- `src/cli.ts` (90 lines) - Command-line interface
- `package.json` - npm package configuration
- `tsconfig.json` - TypeScript compiler settings
- `README.md` - Usage documentation

**Exports:**
```typescript
export class TypeErrorAnalyzer
export interface TypeError
export interface TypeAnalysisResult
```

**CLI Command:** `type-error`

---

### 3. @github-analyzer/security

**Location:** `packages/security/`

**Files:**
- `src/index.ts` (520 lines) - Security analyzer with vulnerability detection
- `src/cli.ts` (110 lines) - Command-line interface
- `package.json` - npm package configuration
- `tsconfig.json` - TypeScript compiler settings
- `README.md` - Usage documentation

**Exports:**
```typescript
export class SecurityAnalyzer
export interface SecurityIssue
export interface DependencyVulnerability
export interface SecurityAnalysisResult
```

**CLI Command:** `security-analyzer`

---

## 🔧 Configuration Files

### package.json (Each Package)

```json
{
  "name": "@github-analyzer/[package-name]",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "bin": {
    "[cli-name]": "./dist/cli.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "@octokit/rest": "^22.0.1",
    "commander": "^12.0.0",
    "chalk": "^5.3.0"
  },
  "devDependencies": {
    "@types/node": "^22.16.5",
    "tsx": "^4.20.6",
    "typescript": "^5.8.3"
  }
}
```

### tsconfig.json (Each Package)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## 🚀 Build Process

### Development Build

```bash
cd packages/[package-name]
npm install          # Install dependencies
npm run dev          # Watch mode (auto-rebuild on changes)
```

### Production Build

```bash
cd packages/[package-name]
npm install          # Install dependencies
npm run build        # Compile TypeScript to JavaScript
```

**Output:**
- `dist/index.js` - Compiled main module
- `dist/index.d.ts` - TypeScript type definitions
- `dist/cli.js` - Compiled CLI executable
- `dist/*.map` - Source maps for debugging

---

## 📤 Publishing Workflow

### 1. Prepare Package

```bash
cd packages/[package-name]

# Update version
npm version patch  # 1.0.0 -> 1.0.1

# Build
npm run build

# Test locally
npm link
[cli-command] analyze --owner test --repo test
```

### 2. Publish to NPM

```bash
# Login (first time only)
npm login

# Publish
npm publish --access public
```

### 3. Verify Publication

```bash
# Install globally
npm install -g @github-analyzer/[package-name]

# Test
[cli-command] --version
```

---

## 🔗 Dependencies

### Runtime Dependencies (All Packages)

- **@octokit/rest** (^22.0.1) - GitHub API client
- **commander** (^12.0.0) - CLI framework
- **chalk** (^5.3.0) - Terminal styling

### Development Dependencies (All Packages)

- **@types/node** (^22.16.5) - Node.js type definitions
- **tsx** (^4.20.6) - TypeScript execution
- **typescript** (^5.8.3) - TypeScript compiler

---

## 🎯 Entry Points

### Programmatic API

```typescript
// Import from npm package
import { LintErrorAnalyzer } from '@github-analyzer/lint-error';
import { TypeErrorAnalyzer } from '@github-analyzer/type-error';
import { SecurityAnalyzer } from '@github-analyzer/security';

// Use the classes
const analyzer = new LintErrorAnalyzer(token);
const result = await analyzer.analyzeRepository(owner, repo);
```

### CLI

```bash
# Installed globally via npm
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react
```

---

## 📊 File Sizes (Approximate)

```
packages/lint-error/
  src/index.ts         ~8 KB   (280 lines)
  src/cli.ts           ~2 KB   (70 lines)
  dist/index.js        ~12 KB  (compiled)
  dist/cli.js          ~3 KB   (compiled)

packages/type-error/
  src/index.ts         ~14 KB  (420 lines)
  src/cli.ts           ~3 KB   (90 lines)
  dist/index.js        ~20 KB  (compiled)
  dist/cli.js          ~4 KB   (compiled)

packages/security/
  src/index.ts         ~18 KB  (520 lines)
  src/cli.ts           ~4 KB   (110 lines)
  dist/index.js        ~25 KB  (compiled)
  dist/cli.js          ~5 KB   (compiled)
```

---

## 🔄 Development Workflow

### 1. Clone & Setup

```bash
git clone <repository>
cd open-repo-lens-backup
bash scripts/setup-microservices.sh
```

### 2. Make Changes

```bash
# Edit source files
vim packages/lint-error/src/index.ts

# Rebuild
cd packages/lint-error
npm run build
```

### 3. Test Locally

```bash
# Link for local testing
npm link

# Test
lint-error analyze --owner test --repo test
```

### 4. Publish

```bash
# Update version
npm version patch

# Publish
npm publish --access public
```

---

## 🧪 Testing

### Manual Testing

```bash
# Set token
export GITHUB_TOKEN=your_token

# Test each package
lint-error analyze --owner facebook --repo react
type-error analyze --owner microsoft --repo vscode
security-analyzer analyze --owner facebook --repo react
```

### Automated Testing

```bash
# Run test script
bash scripts/test-microservices.sh
```

---

## 📚 Documentation Files

- **MICROSERVICES_GUIDE.md** - Complete guide with examples
- **MICROSERVICES_QUICK_START.md** - Quick reference commands
- **MICROSERVICES_IMPLEMENTATION_SUMMARY.md** - Implementation details
- **MICROSERVICES_STRUCTURE.md** - This file (project structure)
- **packages/*/README.md** - Individual package documentation

---

## 🎓 Key Concepts

### Monorepo Structure
- Multiple independent packages in one repository
- Shared scripts and documentation
- Independent versioning and publishing

### TypeScript Compilation
- Source in `src/` directory
- Compiled output in `dist/` directory
- Type definitions generated automatically

### CLI Binaries
- Defined in `package.json` `bin` field
- Executable after global install
- Uses commander for argument parsing

### npm Publishing
- Public scoped packages (@github-analyzer/*)
- Semantic versioning (major.minor.patch)
- Automated with prepublishOnly script

---

## ✨ Summary

Three independent microservices, each with:
- ✅ TypeScript source code
- ✅ CLI interface
- ✅ Programmatic API
- ✅ Complete documentation
- ✅ npm-ready configuration
- ✅ Build automation
- ✅ Testing scripts

Ready to publish and use!

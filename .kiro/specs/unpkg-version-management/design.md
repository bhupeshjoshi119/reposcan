# Design Document

## Overview

The unpkg version management system consists of two main components:
1. **Version Configuration Parser** - Reads and interprets ide_requirement.md for the agent
2. **CLI Backup Tool** - Manages backup, restore, and validation of version configurations

The system uses a simple markdown file format for configuration, making it human-readable and version-control friendly. The CLI tool provides safety mechanisms through backup/restore functionality and validation checks.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Project Root                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         ide_requirement.md                       │  │
│  │  (Library version configurations)                │  │
│  └──────────────────────────────────────────────────┘  │
│                      ▲                                  │
│                      │                                  │
│         ┌────────────┴────────────┐                    │
│         │                         │                    │
│    ┌────▼─────┐           ┌──────▼──────┐            │
│    │  Agent   │           │  CLI Tool   │            │
│    │  Parser  │           │  (Backup)   │            │
│    └──────────┘           └─────────────┘            │
│                                  │                     │
│                           ┌──────▼──────┐            │
│                           │  .backups/  │            │
│                           │  directory  │            │
│                           └─────────────┘            │
└─────────────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Configuration Creation**: Developer creates/edits ide_requirement.md
2. **Validation**: CLI tool validates configuration before use
3. **Backup**: CLI tool creates timestamped backups
4. **Agent Usage**: Agent reads and applies configurations
5. **Restore**: CLI tool restores from backup if needed

## Components and Interfaces

### 1. Configuration File Format (ide_requirement.md)

**Structure:**
```markdown
# Library Version Requirements

## Preact
- unpkg.com/preact@10.26.4/dist/preact.min.js
- unpkg.com/preact@latest/dist/preact.min.js

## React
- unpkg.com/react@18.3.1/umd/react.production.min.js
- unpkg.com/react@^18/umd/react.production.min.js

## Three.js
- unpkg.com/three@0.174.0/build/three.module.min.js
```

**Format Rules:**
- Markdown headers (##) denote library names
- Bullet points (-) contain unpkg URLs
- One URL per line
- Comments allowed using standard markdown

### 2. Version Config Parser

**Location:** `src/utils/versionConfigParser.ts`

**Interface:**
```typescript
interface UnpkgConfig {
  library: string;
  version: string;
  filePath: string;
  fullUrl: string;
}

interface ParsedConfig {
  libraries: Map<string, UnpkgConfig[]>;
  errors: ConfigError[];
}

interface ConfigError {
  line: number;
  message: string;
  url: string;
}

class VersionConfigParser {
  parseFile(filePath: string): ParsedConfig;
  validateUrl(url: string): boolean;
  extractVersionInfo(url: string): UnpkgConfig | null;
  getLibraryConfig(libraryName: string): UnpkgConfig[];
}
```

**Key Methods:**
- `parseFile()`: Reads ide_requirement.md and returns structured config
- `validateUrl()`: Validates unpkg URL format
- `extractVersionInfo()`: Parses URL into components
- `getLibraryConfig()`: Returns all versions for a specific library

### 3. CLI Backup Tool

**Location:** `src/cli/version-backup.ts`

**Interface:**
```typescript
interface BackupMetadata {
  timestamp: string;
  filename: string;
  size: number;
  hash: string;
}

class VersionBackupCLI {
  backup(): Promise<BackupMetadata>;
  restore(backupId: string): Promise<void>;
  list(): Promise<BackupMetadata[]>;
  validate(): Promise<ValidationResult>;
  clean(keepLast: number): Promise<void>;
}

interface ValidationResult {
  valid: boolean;
  errors: ConfigError[];
  warnings: string[];
}
```

**CLI Commands:**
```bash
# Backup current configuration
npm run version-backup backup

# List all backups
npm run version-backup list

# Restore from backup
npm run version-backup restore <timestamp>

# Validate current configuration
npm run version-backup validate

# Clean old backups (keep last 5)
npm run version-backup clean --keep 5
```

### 4. Agent Integration Service

**Location:** `src/services/versionManager.ts`

**Interface:**
```typescript
class VersionManager {
  loadConfig(): Promise<ParsedConfig>;
  getLibraryUrl(libraryName: string, preferredVersion?: string): string;
  resolveVersion(libraryName: string, versionSpec: string): UnpkgConfig | null;
  refreshConfig(): Promise<void>;
}
```

**Usage by Agent:**
```typescript
const versionManager = new VersionManager();
await versionManager.loadConfig();

// Get specific version
const reactUrl = versionManager.getLibraryUrl('react', '^18');

// Get default (first listed) version
const preactUrl = versionManager.getLibraryUrl('preact');
```

## Data Models

### UnpkgConfig Model
```typescript
interface UnpkgConfig {
  library: string;        // e.g., "react"
  version: string;        // e.g., "18.3.1", "^18", "latest"
  filePath: string;       // e.g., "/umd/react.production.min.js"
  fullUrl: string;        // Complete unpkg URL
  isScoped: boolean;      // true for @org/package
  versionType: 'exact' | 'range' | 'tag';
}
```

### BackupMetadata Model
```typescript
interface BackupMetadata {
  timestamp: string;      // ISO 8601 format
  filename: string;       // e.g., "ide_requirement_20250113_143022.md"
  size: number;          // File size in bytes
  hash: string;          // SHA-256 hash for integrity
  path: string;          // Full path to backup file
}
```

### ParsedConfig Model
```typescript
interface ParsedConfig {
  libraries: Map<string, UnpkgConfig[]>;  // Library name -> configs
  errors: ConfigError[];                   // Parsing errors
  metadata: {
    parseDate: Date;
    sourceFile: string;
    totalLibraries: number;
    totalUrls: number;
  };
}
```

## Error Handling

### Parser Error Handling
1. **Invalid URL Format**: Log warning, skip entry, continue parsing
2. **Missing File**: Return empty config with error
3. **Malformed Markdown**: Attempt best-effort parsing, report issues
4. **Duplicate Entries**: Use first occurrence, warn about duplicates

### CLI Error Handling
1. **Backup Failures**: Report error, don't delete existing backups
2. **Restore Failures**: Validate backup before overwriting current file
3. **Validation Errors**: Exit with code 1, display all errors
4. **Permission Issues**: Clear error message with suggested fix

### Agent Error Handling
1. **Config Not Found**: Use default CDN URLs, log warning
2. **Invalid Config**: Fall back to latest versions
3. **Network Issues**: Cache last known good config
4. **Version Resolution Failure**: Use latest stable version

## Testing Strategy

### Unit Tests

**Parser Tests** (`versionConfigParser.test.ts`):
- Parse valid ide_requirement.md files
- Handle invalid URL formats
- Extract version information correctly
- Validate semver ranges and tags
- Handle scoped packages (@org/package)

**CLI Tests** (`version-backup.test.ts`):
- Create backups with correct timestamps
- List backups in chronological order
- Restore backups without data loss
- Validate configurations accurately
- Clean old backups correctly

**Version Manager Tests** (`versionManager.test.ts`):
- Load and parse configurations
- Resolve version specifications
- Handle missing configurations
- Cache configurations appropriately

### Integration Tests

**End-to-End CLI Workflow**:
1. Create test ide_requirement.md
2. Run validation command
3. Create backup
4. Modify configuration
5. Restore from backup
6. Verify restoration accuracy

**Agent Integration**:
1. Agent loads configuration
2. Agent requests library URL
3. Verify correct version returned
4. Test fallback behavior

### Validation Tests

**URL Format Validation**:
- Valid exact versions
- Valid semver ranges
- Valid npm tags
- Invalid formats (should fail gracefully)
- Edge cases (special characters, long URLs)

## File Structure

```
project-root/
├── ide_requirement.md              # Main configuration file
├── .backups/                       # Backup directory (gitignored)
│   ├── ide_requirement_20250113_143022.md
│   ├── ide_requirement_20250113_120000.md
│   └── metadata.json               # Backup index
├── src/
│   ├── cli/
│   │   └── version-backup.ts       # CLI tool implementation
│   ├── services/
│   │   └── versionManager.ts       # Agent integration service
│   └── utils/
│       └── versionConfigParser.ts  # Parser implementation
└── package.json                    # Add CLI scripts
```

## Configuration Examples

### Basic Configuration
```markdown
# Library Version Requirements

## React
- unpkg.com/react@18.3.1/umd/react.production.min.js
```

### Multiple Versions
```markdown
# Library Version Requirements

## Preact
- unpkg.com/preact@10.26.4/dist/preact.min.js
- unpkg.com/preact@latest/dist/preact.min.js
```

### Semver Ranges
```markdown
# Library Version Requirements

## React
- unpkg.com/react@^18/umd/react.production.min.js
- unpkg.com/react@~18.3.0/umd/react.production.min.js
```

### With Comments
```markdown
# Library Version Requirements

## React
<!-- Production build for stable releases -->
- unpkg.com/react@18.3.1/umd/react.production.min.js

<!-- Latest for development -->
- unpkg.com/react@latest/umd/react.development.js
```

## Security Considerations

1. **File System Access**: CLI tool only accesses project directory and .backups/
2. **Backup Integrity**: SHA-256 hashes verify backup integrity
3. **Input Validation**: All URLs validated before use
4. **Path Traversal**: Prevent directory traversal in backup paths
5. **Backup Retention**: Automatic cleanup prevents disk space issues

## Performance Considerations

1. **Lazy Loading**: Parse config only when needed
2. **Caching**: Cache parsed config in memory
3. **Incremental Parsing**: Only re-parse on file changes
4. **Backup Compression**: Optional gzip for large configs
5. **Async Operations**: All file I/O is asynchronous

## Future Enhancements

1. **Version Pinning**: Lock specific versions across team
2. **Auto-Update**: CLI command to update to latest versions
3. **Diff Tool**: Compare configurations between backups
4. **Remote Backups**: Sync backups to cloud storage
5. **IDE Integration**: VS Code extension for visual editing

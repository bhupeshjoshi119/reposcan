# Requirements Document

## Introduction

This feature enables the agent to dynamically switch between different versions of JavaScript libraries using unpkg CDN URLs. The system will maintain a configuration file (ide_requirement.md) that specifies available libraries and their versions, allowing the agent to automatically select and use the appropriate version based on project requirements or user preferences. Additionally, a CLI tool will be provided for backing up and managing these version configurations.

## Glossary

- **unpkg**: A fast, global content delivery network for everything on npm, allowing direct access to any package via URL
- **Agent**: The AI-powered development assistant that will use this configuration to manage library versions
- **IDE Requirement File**: A markdown configuration file (ide_requirement.md) that stores library version specifications
- **Semver**: Semantic versioning specification for version numbering (e.g., 1.2.3, ^18, latest)
- **Version Switcher**: The system component responsible for parsing and applying version changes from the configuration file
- **CLI Tool**: Command-line interface tool for backing up and managing library version configurations
- **Backup**: A saved snapshot of the current ide_requirement.md configuration

## Requirements

### Requirement 1

**User Story:** As a developer, I want to specify library versions using unpkg CDN URLs in a configuration file, so that the agent can automatically use the correct library versions in my project.

#### Acceptance Criteria

1. THE Version Switcher SHALL parse unpkg CDN URLs from the ide_requirement.md file
2. THE Version Switcher SHALL support exact version specifications (e.g., preact@10.26.4)
3. THE Version Switcher SHALL support semver range specifications (e.g., react@^18)
4. THE Version Switcher SHALL support npm tag specifications (e.g., preact@latest)
5. THE Version Switcher SHALL extract library name, version, and file path from each unpkg URL

### Requirement 2

**User Story:** As a developer, I want the configuration file to support multiple popular JavaScript libraries, so that I can manage all my project dependencies in one place.

#### Acceptance Criteria

1. THE IDE Requirement File SHALL support Preact library configurations with valid unpkg URLs
2. THE IDE Requirement File SHALL support React library configurations with valid unpkg URLs
3. THE IDE Requirement File SHALL support Three.js library configurations with valid unpkg URLs
4. THE IDE Requirement File SHALL allow multiple versions of the same library to be specified
5. THE IDE Requirement File SHALL use markdown format for human readability

### Requirement 3

**User Story:** As an agent, I want to read and interpret the ide_requirement.md file, so that I can automatically apply the correct library versions when generating or modifying code.

#### Acceptance Criteria

1. WHEN the Agent processes a project, THE Agent SHALL read the ide_requirement.md file from the project root
2. WHEN a library is referenced in code, THE Agent SHALL match it against configured libraries in ide_requirement.md
3. IF a library version is specified in ide_requirement.md, THEN THE Agent SHALL use that version in generated code
4. THE Agent SHALL validate unpkg URL format before applying version changes
5. IF ide_requirement.md is missing or invalid, THEN THE Agent SHALL use default library versions

### Requirement 4

**User Story:** As a developer, I want clear documentation on the unpkg URL format, so that I can correctly configure library versions without errors.

#### Acceptance Criteria

1. THE IDE Requirement File SHALL include examples of exact version URLs (e.g., unpkg.com/preact@10.26.4/dist/preact.min.js)
2. THE IDE Requirement File SHALL include examples of semver range URLs (e.g., unpkg.com/react@^18/umd/react.production.min.js)
3. THE IDE Requirement File SHALL include examples of npm tag URLs (e.g., unpkg.com/preact@latest/dist/preact.min.js)
4. THE IDE Requirement File SHALL include comments explaining each URL format type
5. THE IDE Requirement File SHALL provide guidance on when to use each version specification type

### Requirement 5

**User Story:** As an agent, I want to handle version conflicts gracefully, so that the system remains stable when multiple version specifications exist.

#### Acceptance Criteria

1. WHEN multiple versions of the same library are specified, THE Agent SHALL use the first occurrence in the file
2. WHEN an invalid unpkg URL is encountered, THE Agent SHALL log a warning and skip that entry
3. WHEN a library version cannot be resolved, THE Agent SHALL fall back to the latest stable version
4. THE Agent SHALL provide clear error messages indicating which URL caused a parsing failure
5. THE Agent SHALL continue processing remaining URLs after encountering an error

### Requirement 6

**User Story:** As a developer, I want the system to validate unpkg URLs before using them, so that I can catch configuration errors early.

#### Acceptance Criteria

1. THE Version Switcher SHALL verify that URLs start with "unpkg.com/" or "https://unpkg.com/"
2. THE Version Switcher SHALL verify that library names contain only valid npm package characters
3. THE Version Switcher SHALL verify that version specifications follow semver or npm tag conventions
4. WHEN validation fails, THE Version Switcher SHALL provide specific feedback about the invalid component
5. THE Version Switcher SHALL support both scoped (@org/package) and unscoped package names


### Requirement 7

**User Story:** As a developer, I want a CLI tool to backup my ide_requirement.md configuration, so that I can restore library versions if needed.

#### Acceptance Criteria

1. THE CLI Tool SHALL provide a backup command that saves the current ide_requirement.md file
2. THE CLI Tool SHALL store backups with timestamps in a designated backup directory
3. THE CLI Tool SHALL list all available backups with their creation dates
4. THE CLI Tool SHALL restore a specific backup to the current ide_requirement.md file
5. THE CLI Tool SHALL validate the backup file before restoration

### Requirement 8

**User Story:** As a developer, I want the CLI tool to validate my ide_requirement.md file, so that I can catch configuration errors before the agent uses it.

#### Acceptance Criteria

1. THE CLI Tool SHALL provide a validate command that checks ide_requirement.md syntax
2. WHEN validation is run, THE CLI Tool SHALL report all invalid unpkg URLs with line numbers
3. WHEN validation is run, THE CLI Tool SHALL verify all version specifications are valid
4. THE CLI Tool SHALL provide suggestions for fixing invalid configurations
5. THE CLI Tool SHALL exit with appropriate status codes for CI/CD integration

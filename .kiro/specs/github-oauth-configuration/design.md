# Design Document

## Overview

This design implements a robust GitHub OAuth configuration system that supports dynamic redirect URI detection and provides clear configuration guidance. The solution ensures seamless authentication across development and production environments using a single GitHub OAuth application.

## Architecture

### Environment Detection Flow
```
User Request → Environment Detection → Redirect URI Selection → OAuth Flow
```

### OAuth Configuration Validation
```
App Initialization → Check OAuth Config → Display Instructions (if needed) → Proceed with Auth
```

## Components and Interfaces

### 1. Enhanced Environment Detection
- **Location**: `src/utils/environment.ts`
- **Purpose**: Detect current environment and provide appropriate redirect URIs
- **Key Functions**:
  - `getEnvironment()`: Determine if running in development or production
  - `getRedirectUri()`: Return appropriate redirect URI for current environment
  - `validateOAuthConfig()`: Check if OAuth app is properly configured

### 2. OAuth Configuration Validator
- **Location**: `src/services/oauthValidator.ts` (new)
- **Purpose**: Validate GitHub OAuth app configuration and provide setup instructions
- **Key Functions**:
  - `checkOAuthConfiguration()`: Test if redirect URIs are configured
  - `getConfigurationInstructions()`: Return step-by-step setup guide
  - `validateRedirectUri()`: Verify specific redirect URI is accepted

### 3. Configuration Instructions Component
- **Location**: `src/components/OAuthSetupInstructions.tsx` (new)
- **Purpose**: Display clear setup instructions when OAuth is misconfigured
- **Features**:
  - Step-by-step GitHub OAuth app setup
  - Copy-paste ready redirect URIs
  - Visual indicators for configuration status

### 4. Enhanced Error Handling
- **Location**: `src/services/githubAuth.ts` (enhanced)
- **Purpose**: Provide better error messages and recovery options
- **Enhancements**:
  - Detect redirect URI mismatch errors
  - Show configuration instructions on OAuth errors
  - Retry mechanism after configuration

## Data Models

### OAuth Configuration Status
```typescript
interface OAuthConfigStatus {
  isConfigured: boolean;
  missingRedirectUris: string[];
  configuredRedirectUris: string[];
  instructions: ConfigurationStep[];
}

interface ConfigurationStep {
  step: number;
  title: string;
  description: string;
  action: string;
  copyText?: string;
}
```

### Environment Configuration
```typescript
interface EnvironmentConfig {
  environment: 'development' | 'production';
  redirectUri: string;
  baseUrl: string;
  requiresConfiguration: boolean;
}
```

## Error Handling

### OAuth Redirect URI Errors
1. **Detection**: Monitor for "redirect_uri is not associated" errors
2. **Response**: Display configuration instructions immediately
3. **Recovery**: Allow retry after user confirms configuration

### Environment Detection Failures
1. **Fallback**: Default to production configuration for unknown environments
2. **Logging**: Record environment detection decisions for debugging
3. **Override**: Allow manual environment specification via environment variable

### Network and API Errors
1. **Retry Logic**: Implement exponential backoff for transient failures
2. **User Feedback**: Show clear error messages with suggested actions
3. **Graceful Degradation**: Provide offline-capable error states

## Testing Strategy

### Unit Tests
- Environment detection logic
- Redirect URI generation
- OAuth configuration validation
- Error handling scenarios

### Integration Tests
- OAuth flow in development environment
- OAuth flow in production environment
- Error recovery workflows
- Configuration validation

### Manual Testing Scenarios
1. **Fresh Setup**: Test with unconfigured GitHub OAuth app
2. **Partial Configuration**: Test with only one redirect URI configured
3. **Environment Switching**: Test moving between development and production
4. **Error Recovery**: Test configuration and retry workflow

## Implementation Approach

### Phase 1: Enhanced Error Detection
1. Improve error handling in `githubAuth.ts`
2. Add specific detection for redirect URI errors
3. Create configuration status checking

### Phase 2: Configuration Instructions
1. Create OAuth setup instructions component
2. Add configuration validation service
3. Integrate instructions into auth flow

### Phase 3: Environment Robustness
1. Enhance environment detection reliability
2. Add configuration override capabilities
3. Improve error recovery mechanisms

### Phase 4: User Experience Polish
1. Add visual configuration status indicators
2. Implement copy-to-clipboard functionality
3. Add configuration testing tools

## Security Considerations

### Redirect URI Validation
- Strict hostname matching for production
- Localhost-only for development
- No wildcard or dynamic redirect URIs

### Environment Variable Security
- Client ID can be public (as designed by GitHub)
- Client secret must remain server-side only
- No sensitive data in client-side environment detection

### Error Message Security
- Avoid exposing internal configuration details
- Provide helpful but not overly specific error information
- Log detailed errors server-side only
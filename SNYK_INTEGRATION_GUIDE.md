# 🔐 Snyk Integration for Security Scanning

## Overview

Integrate Snyk's vulnerability database API to enhance security scanning with real-time vulnerability data.

---

## 🚀 Quick Setup

### 1. Get Snyk API Token

```bash
# Sign up at https://snyk.io
# Get your API token from: https://app.snyk.io/account

export SNYK_TOKEN=your_snyk_token_here
```

### 2. Install Snyk Dependency

```bash
cd packages/security
npm install axios
```

### 3. Update Security Analyzer

The code below adds Snyk integration to your security analyzer.

---

## 📝 Implementation

### File: `packages/security/src/snyk-integration.ts`

```typescript
import axios from 'axios';

export interface SnykVulnerability {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cvssScore: number;
  cve?: string[];
  cwe?: string[];
  description: string;
  fixedIn?: string[];
  references: string[];
}

export interface SnykPackageVulnerability {
  package: string;
  version: string;
  vulnerabilities: SnykVulnerability[];
}

export class SnykIntegration {
  private apiToken: string;
  private baseUrl = 'https://api.snyk.io/v1';

  constructor(apiToken?: string) {
    this.apiToken = apiToken || process.env.SNYK_TOKEN || '';
  }

  /**
   * Check if Snyk is configured
   */
  isConfigured(): boolean {
    return !!this.apiToken;
  }

  /**
   * Test a package for vulnerabilities using Snyk API
   */
  async testPackage(
    packageName: string,
    version: string,
    ecosystem: 'npm' | 'pip' | 'maven' | 'go' = 'npm'
  ): Promise<SnykPackageVulnerability | null> {
    if (!this.isConfigured()) {
      console.log('⚠️  Snyk not configured. Set SNYK_TOKEN environment variable.');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/test/${ecosystem}/${packageName}/${version}`,
        {},
        {
          headers: {
            'Authorization': `token ${this.apiToken}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      const vulnerabilities: SnykVulnerability[] = response.data.issues?.vulnerabilities?.map((vuln: any) => ({
        id: vuln.id,
        title: vuln.title,
        severity: vuln.severity,
        cvssScore: vuln.cvssScore || 0,
        cve: vuln.identifiers?.CVE || [],
        cwe: vuln.identifiers?.CWE || [],
        description: vuln.description || '',
        fixedIn: vuln.fixedIn || [],
        references: vuln.references || [],
      })) || [];

      return {
        package: packageName,
        version,
        vulnerabilities,
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Package not found or no vulnerabilities
        return {
          package: packageName,
          version,
          vulnerabilities: [],
        };
      }
      console.error(`Snyk API error for ${packageName}:`, error.message);
      return null;
    }
  }

  /**
   * Test multiple packages
   */
  async testPackages(
    packages: Array<{ name: string; version: string; ecosystem?: 'npm' | 'pip' | 'maven' | 'go' }>
  ): Promise<SnykPackageVulnerability[]> {
    const results: SnykPackageVulnerability[] = [];

    for (const pkg of packages) {
      const result = await this.testPackage(pkg.name, pkg.version, pkg.ecosystem);
      if (result && result.vulnerabilities.length > 0) {
        results.push(result);
      }
      // Rate limiting: wait 100ms between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    return results;
  }

  /**
   * Get vulnerability details by ID
   */
  async getVulnerabilityDetails(vulnId: string): Promise<SnykVulnerability | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/vuln/${vulnId}`,
        {
          headers: {
            'Authorization': `token ${this.apiToken}`,
          },
          timeout: 10000,
        }
      );

      return {
        id: response.data.id,
        title: response.data.title,
        severity: response.data.severity,
        cvssScore: response.data.cvssScore || 0,
        cve: response.data.identifiers?.CVE || [],
        cwe: response.data.identifiers?.CWE || [],
        description: response.data.description || '',
        fixedIn: response.data.fixedIn || [],
        references: response.data.references || [],
      };
    } catch (error) {
      console.error(`Error fetching vulnerability ${vulnId}:`, error);
      return null;
    }
  }
}

export default SnykIntegration;
```

---

## 🔧 Update Security Analyzer

### File: `packages/security/src/index.ts`

Add Snyk integration to the existing SecurityAnalyzer class:

```typescript
import SnykIntegration, { SnykPackageVulnerability } from './snyk-integration';

export class SecurityAnalyzer {
  private octokit: Octokit;
  private snyk: SnykIntegration;

  constructor(githubToken: string, snykToken?: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.snyk = new SnykIntegration(snykToken);
  }

  /**
   * Check dependencies using Snyk
   */
  private async checkDependenciesWithSnyk(
    owner: string,
    repo: string,
    branch: string
  ): Promise<DependencyVulnerability[]> {
    const vulnerabilities: DependencyVulnerability[] = [];

    if (!this.snyk.isConfigured()) {
      console.log('💡 Tip: Set SNYK_TOKEN for enhanced vulnerability scanning');
      return vulnerabilities;
    }

    try {
      // Check package.json
      const packageJson = await this.getFile(owner, repo, 'package.json', branch);
      if (packageJson) {
        const deps = JSON.parse(packageJson);
        const allDeps = { ...deps.dependencies, ...deps.devDependencies };
        
        const packages = Object.entries(allDeps).map(([name, version]) => ({
          name,
          version: (version as string).replace(/^[\^~]/, ''), // Remove ^ or ~
          ecosystem: 'npm' as const,
        }));

        console.log(`🔍 Scanning ${packages.length} npm packages with Snyk...`);
        const snykResults = await this.snyk.testPackages(packages);

        for (const result of snykResults) {
          for (const vuln of result.vulnerabilities) {
            vulnerabilities.push({
              package: result.package,
              version: result.version,
              severity: vuln.severity,
              cve: vuln.cve?.[0] || vuln.id,
              description: vuln.title,
              patchedVersions: vuln.fixedIn || [],
              recommendation: vuln.fixedIn?.length 
                ? `Update to ${vuln.fixedIn.join(' or ')}`
                : 'No fix available yet',
            });
          }
        }
      }
    } catch (error) {
      console.error('Snyk scanning error:', error);
    }

    try {
      // Check requirements.txt for Python
      const requirements = await this.getFile(owner, repo, 'requirements.txt', branch);
      if (requirements) {
        const lines = requirements.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        const packages = lines.map(line => {
          const match = line.match(/^([a-zA-Z0-9-_]+)==(.+)$/);
          if (match) {
            return { name: match[1], version: match[2], ecosystem: 'pip' as const };
          }
          return null;
        }).filter(Boolean) as Array<{ name: string; version: string; ecosystem: 'pip' }>;

        if (packages.length > 0) {
          console.log(`🔍 Scanning ${packages.length} Python packages with Snyk...`);
          const snykResults = await this.snyk.testPackages(packages);

          for (const result of snykResults) {
            for (const vuln of result.vulnerabilities) {
              vulnerabilities.push({
                package: result.package,
                version: result.version,
                severity: vuln.severity,
                cve: vuln.cve?.[0] || vuln.id,
                description: vuln.title,
                patchedVersions: vuln.fixedIn || [],
                recommendation: vuln.fixedIn?.length 
                  ? `Update to ${vuln.fixedIn.join(' or ')}`
                  : 'No fix available yet',
              });
            }
          }
        }
      }
    } catch {}

    return vulnerabilities;
  }

  /**
   * Analyze security vulnerabilities in a GitHub repository
   */
  async analyzeRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<SecurityAnalysisResult> {
    // ... existing code ...

    // Add Snyk scanning
    const snykVulns = await this.checkDependenciesWithSnyk(owner, repo, branch);
    dependencies.push(...snykVulns);

    // ... rest of existing code ...
  }
}
```

---

## 🎯 Usage

### With Snyk Token:
```bash
# Set both tokens
export GITHUB_TOKEN=your_github_token
export SNYK_TOKEN=your_snyk_token

# Run analysis
security-analyzer analyze --owner facebook --repo react
```

### Without Snyk Token:
```bash
# Only GitHub token
export GITHUB_TOKEN=your_github_token

# Run analysis (will show tip about Snyk)
security-analyzer analyze --owner facebook --repo react
```

---

## 📊 Enhanced Output

With Snyk integration, you'll see:

```
🔍 Analyzing facebook/react (main)...
🔍 Scanning 245 npm packages with Snyk...

✅ === Security Analysis Results ===

Security Score: 85/100
Total Issues: 8
  Critical: 1
  High: 2
  Medium: 3
  Low: 2

Dependency Vulnerabilities: 5 (from Snyk)

=== DEPENDENCY VULNERABILITIES (Snyk) ===

[CRITICAL] lodash@4.17.15
  CVE: CVE-2020-8203
  Prototype Pollution
  Patched Versions: 4.17.19, 4.17.20, 4.17.21
  Recommendation: Update to 4.17.21

[HIGH] axios@0.19.0
  CVE: CVE-2020-28168
  Server-Side Request Forgery
  Patched Versions: 0.21.1
  Recommendation: Update to 0.21.1
```

---

## 🔑 Getting Snyk API Token

1. **Sign up:** https://snyk.io
2. **Login:** https://app.snyk.io
3. **Get token:** https://app.snyk.io/account
4. **Copy token** and set environment variable:
   ```bash
   export SNYK_TOKEN=your_token_here
   ```

---

## 💡 Benefits of Snyk Integration

### 1. **Real Vulnerability Data**
- Access to Snyk's extensive vulnerability database
- Up-to-date CVE information
- Accurate severity ratings

### 2. **Better Recommendations**
- Specific version fixes
- Patch availability
- Upgrade paths

### 3. **Multiple Ecosystems**
- npm (JavaScript/TypeScript)
- pip (Python)
- Maven (Java)
- Go modules

### 4. **Enhanced Reporting**
- CVE IDs
- CWE categories
- CVSS scores
- Reference links

---

## 🎓 API Limits

### Free Tier:
- 200 tests/month
- Public projects only
- Basic vulnerability data

### Paid Tiers:
- Unlimited tests
- Private projects
- Advanced features
- Priority support

---

## 🔧 Configuration Options

### Environment Variables:
```bash
# Required
export GITHUB_TOKEN=your_github_token

# Optional (for enhanced scanning)
export SNYK_TOKEN=your_snyk_token
```

### CLI Options:
```bash
# With Snyk
security-analyzer analyze --owner test --repo test --snyk-token YOUR_SNYK_TOKEN

# Without Snyk (basic scanning)
security-analyzer analyze --owner test --repo test
```

---

## 📝 Update CLI to Accept Snyk Token

### File: `packages/security/src/cli.ts`

```typescript
program
  .command('analyze')
  .description('Analyze a GitHub repository for security issues')
  .requiredOption('-o, --owner <owner>', 'Repository owner')
  .requiredOption('-r, --repo <repo>', 'Repository name')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token')
  .option('--snyk-token <token>', 'Snyk API token (optional)')
  .option('--max-files <number>', 'Maximum files to analyze', '50')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const githubToken = options.token || process.env.GITHUB_TOKEN || loadEnvToken();
    const snykToken = options.snykToken || process.env.SNYK_TOKEN;
    
    if (!githubToken) {
      console.error('Error: GitHub token is required.');
      process.exit(1);
    }

    try {
      console.log(`\n🔍 Analyzing ${options.owner}/${options.repo} (${options.branch})...`);
      if (snykToken) {
        console.log('🔐 Snyk integration enabled');
      }
      
      const analyzer = new SecurityAnalyzer(githubToken, snykToken);
      analyzer.maxFiles = parseInt(options.maxFiles);
      const result = await analyzer.analyzeRepository(options.owner, options.repo, options.branch);

      // ... rest of output code ...
    } catch (error: any) {
      console.error('\n❌ Error:', error?.message || error);
      process.exit(1);
    }
  });
```

---

## 🎉 Summary

### What You Get:
- ✅ Real vulnerability data from Snyk
- ✅ CVE and CWE information
- ✅ Specific fix recommendations
- ✅ Multi-ecosystem support
- ✅ Enhanced security scoring

### How to Use:
1. Get Snyk API token
2. Set `SNYK_TOKEN` environment variable
3. Run security-analyzer as usual
4. Get enhanced vulnerability reports!

---

## 📚 Resources

- **Snyk API Docs:** https://snyk.docs.apiary.io/
- **Snyk Dashboard:** https://app.snyk.io
- **Get API Token:** https://app.snyk.io/account
- **Vulnerability Database:** https://security.snyk.io/

---

**Ready to enhance your security scanning!** 🚀

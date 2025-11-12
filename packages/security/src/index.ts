import { Octokit } from '@octokit/rest';

export interface SecurityIssue {
  file: string;
  line: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  title: string;
  description: string;
  cwe?: string;
  cve?: string;
  recommendation: string;
  source?: string;
}

export interface DependencyVulnerability {
  package: string;
  version: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  cve: string;
  description: string;
  patchedVersions: string[];
  recommendation: string;
}

export interface SecurityAnalysisResult {
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  issues: SecurityIssue[];
  dependencies: DependencyVulnerability[];
  summary: {
    bySeverity: Record<string, number>;
    byCategory: Record<string, number>;
    byFile: Record<string, number>;
  };
  securityScore: number;
  timestamp: string;
}

export class SecurityAnalyzer {
  private octokit: Octokit;

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Analyze security vulnerabilities in a GitHub repository
   */
  async analyzeRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<SecurityAnalysisResult> {
    const issues: SecurityIssue[] = [];
    const dependencies: DependencyVulnerability[] = [];
    const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
    const byCategory: Record<string, number> = {};
    const byFile: Record<string, number> = {};

    try {
      // Check for security advisories
      const advisories = await this.getSecurityAdvisories(owner, repo);
      dependencies.push(...advisories);

      // Check for vulnerable dependencies
      const depVulns = await this.checkDependencies(owner, repo, branch);
      dependencies.push(...depVulns);

      // Analyze source code for security issues
      const sourceFiles = await this.getSourceFiles(owner, repo, branch);
      
      for (const file of sourceFiles) {
        const fileIssues = await this.analyzeFile(owner, repo, file, branch);
        issues.push(...fileIssues);
        
        // Update statistics
        fileIssues.forEach(issue => {
          bySeverity[issue.severity]++;
          byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
          byFile[issue.file] = (byFile[issue.file] || 0) + 1;
        });
      }

      // Check for secrets
      const secretIssues = await this.scanForSecrets(owner, repo, branch);
      issues.push(...secretIssues);
      secretIssues.forEach(issue => {
        bySeverity[issue.severity]++;
        byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
        byFile[issue.file] = (byFile[issue.file] || 0) + 1;
      });

      // Calculate security score (0-100)
      const securityScore = this.calculateSecurityScore(bySeverity, dependencies.length);

      return {
        totalIssues: issues.length,
        criticalIssues: bySeverity.critical,
        highIssues: bySeverity.high,
        mediumIssues: bySeverity.medium,
        lowIssues: bySeverity.low,
        issues,
        dependencies,
        summary: {
          bySeverity,
          byCategory,
          byFile,
        },
        securityScore,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error}`);
    }
  }

  /**
   * Get security advisories from GitHub
   */
  private async getSecurityAdvisories(owner: string, repo: string): Promise<DependencyVulnerability[]> {
    const vulnerabilities: DependencyVulnerability[] = [];

    try {
      // Use GitHub's vulnerability alerts API
      const { data: alerts } = await this.octokit.request(
        'GET /repos/{owner}/{repo}/vulnerability-alerts',
        { owner, repo }
      );

      // Note: This requires special permissions
    } catch (error) {
      // Vulnerability alerts may not be accessible
      console.log('Unable to fetch vulnerability alerts');
    }

    return vulnerabilities;
  }

  /**
   * Check dependencies for vulnerabilities
   */
  private async checkDependencies(
    owner: string,
    repo: string,
    branch: string
  ): Promise<DependencyVulnerability[]> {
    const vulnerabilities: DependencyVulnerability[] = [];

    try {
      // Check package.json
      const packageJson = await this.getFile(owner, repo, 'package.json', branch);
      if (packageJson) {
        const deps = JSON.parse(packageJson);
        const allDeps = { ...deps.dependencies, ...deps.devDependencies };
        
        for (const [pkg, version] of Object.entries(allDeps)) {
          const vulns = await this.checkPackageVulnerability(pkg, version as string);
          vulnerabilities.push(...vulns);
        }
      }
    } catch {}

    try {
      // Check requirements.txt
      const requirements = await this.getFile(owner, repo, 'requirements.txt', branch);
      if (requirements) {
        const lines = requirements.split('\n');
        for (const line of lines) {
          const match = line.match(/^([a-zA-Z0-9-_]+)==(.+)$/);
          if (match) {
            const [, pkg, version] = match;
            const vulns = await this.checkPackageVulnerability(pkg, version);
            vulnerabilities.push(...vulns);
          }
        }
      }
    } catch {}

    return vulnerabilities;
  }

  /**
   * Check if a package has known vulnerabilities
   */
  private async checkPackageVulnerability(
    packageName: string,
    version: string
  ): Promise<DependencyVulnerability[]> {
    // This would integrate with vulnerability databases
    // For now, return empty array
    return [];
  }

  /**
   * Analyze a single file for security issues
   */
  private async analyzeFile(
    owner: string,
    repo: string,
    filePath: string,
    branch: string
  ): Promise<SecurityIssue[]> {
    try {
      const content = await this.getFile(owner, repo, filePath, branch);
      if (!content) return [];

      return this.scanContent(content, filePath);
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Scan content for security issues
   */
  private scanContent(content: string, filePath: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // SQL Injection
      if (/execute\s*\(\s*["'`].*\$\{.*\}.*["'`]/.test(line) || 
          /query\s*\(\s*["'`].*\+.*["'`]/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'high',
          category: 'sql-injection',
          title: 'Potential SQL Injection',
          description: 'SQL query constructed using string concatenation or template literals',
          cwe: 'CWE-89',
          recommendation: 'Use parameterized queries or prepared statements',
          source: line.trim(),
        });
      }

      // XSS
      if (/innerHTML\s*=/.test(line) || /dangerouslySetInnerHTML/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'medium',
          category: 'xss',
          title: 'Potential XSS Vulnerability',
          description: 'Direct HTML injection detected',
          cwe: 'CWE-79',
          recommendation: 'Sanitize user input before rendering',
          source: line.trim(),
        });
      }

      // Command Injection
      if (/exec\s*\(/.test(line) || /spawn\s*\(/.test(line) || /system\s*\(/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'critical',
          category: 'command-injection',
          title: 'Potential Command Injection',
          description: 'Execution of system commands detected',
          cwe: 'CWE-78',
          recommendation: 'Avoid executing system commands with user input',
          source: line.trim(),
        });
      }

      // Hardcoded credentials
      if (/password\s*=\s*["'][^"']+["']/.test(line) || 
          /api[_-]?key\s*=\s*["'][^"']+["']/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'critical',
          category: 'hardcoded-credentials',
          title: 'Hardcoded Credentials',
          description: 'Credentials found in source code',
          cwe: 'CWE-798',
          recommendation: 'Use environment variables or secure vaults',
          source: '[REDACTED]',
        });
      }

      // Insecure random
      if (/Math\.random\(\)/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'low',
          category: 'weak-random',
          title: 'Weak Random Number Generator',
          description: 'Math.random() is not cryptographically secure',
          cwe: 'CWE-338',
          recommendation: 'Use crypto.randomBytes() for security-sensitive operations',
          source: line.trim(),
        });
      }

      // eval usage
      if (/\beval\s*\(/.test(line)) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'high',
          category: 'code-injection',
          title: 'Use of eval()',
          description: 'eval() can execute arbitrary code',
          cwe: 'CWE-95',
          recommendation: 'Avoid using eval(), use safer alternatives',
          source: line.trim(),
        });
      }

      // Insecure HTTP
      if (/http:\/\//.test(line) && !line.includes('localhost')) {
        issues.push({
          file: filePath,
          line: index + 1,
          severity: 'medium',
          category: 'insecure-transport',
          title: 'Insecure HTTP Connection',
          description: 'HTTP connection detected instead of HTTPS',
          cwe: 'CWE-319',
          recommendation: 'Use HTTPS for all external connections',
          source: line.trim(),
        });
      }
    });

    return issues;
  }

  /**
   * Scan for exposed secrets
   */
  private async scanForSecrets(
    owner: string,
    repo: string,
    branch: string
  ): Promise<SecurityIssue[]> {
    const issues: SecurityIssue[] = [];

    try {
      // Check common secret files
      const secretFiles = ['.env', '.env.local', 'config.json', 'secrets.json'];
      
      for (const file of secretFiles) {
        try {
          const content = await this.getFile(owner, repo, file, branch);
          if (content) {
            issues.push({
              file,
              line: 0,
              severity: 'critical',
              category: 'exposed-secrets',
              title: 'Exposed Secret File',
              description: `Secret file ${file} is committed to repository`,
              cwe: 'CWE-540',
              recommendation: 'Remove secret files from repository and add to .gitignore',
            });
          }
        } catch {}
      }
    } catch (error) {
      console.error('Error scanning for secrets:', error);
    }

    return issues;
  }

  /**
   * Calculate security score (0-100)
   */
  private calculateSecurityScore(
    bySeverity: Record<string, number>,
    dependencyVulns: number
  ): number {
    let score = 100;
    
    score -= bySeverity.critical * 20;
    score -= bySeverity.high * 10;
    score -= bySeverity.medium * 5;
    score -= bySeverity.low * 2;
    score -= dependencyVulns * 3;
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Get file content
   */
  private async getFile(
    owner: string,
    repo: string,
    path: string,
    branch: string
  ): Promise<string | null> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if ('content' in data) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get all source files
   */
  private async getSourceFiles(
    owner: string,
    repo: string,
    branch: string,
    path: string = ''
  ): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.php', '.rb'];

    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path,
        ref: branch,
      });

      if (Array.isArray(data)) {
        for (const item of data) {
          if (item.type === 'file' && extensions.some(ext => item.name.endsWith(ext))) {
            files.push(item.path);
          } else if (item.type === 'dir' && !item.name.startsWith('.') && item.name !== 'node_modules') {
            const subFiles = await this.getSourceFiles(owner, repo, branch, item.path);
            files.push(...subFiles);
          }
        }
      }
    } catch (error) {
      console.error(`Error getting source files from ${path}:`, error);
    }

    return files;
  }
}

export default SecurityAnalyzer;

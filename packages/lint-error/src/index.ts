import { Octokit } from '@octokit/rest';

export interface LintError {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning' | 'info';
  message: string;
  rule: string;
  source: string;
}

export interface LintAnalysisResult {
  totalErrors: number;
  totalWarnings: number;
  totalInfo: number;
  errors: LintError[];
  filesAnalyzed?: number;
  summary: {
    byFile: Record<string, number>;
    byRule: Record<string, number>;
    bySeverity: Record<string, number>;
  };
  timestamp: string;
}

export class LintErrorAnalyzer {
  private octokit: Octokit;
  public maxFiles: number = 50; // Limit files to analyze for faster testing

  constructor(githubToken: string) {
    this.octokit = new Octokit({ auth: githubToken });
  }

  /**
   * Analyze lint errors in a GitHub repository
   */
  async analyzeRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<LintAnalysisResult> {
    const errors: LintError[] = [];
    const byFile: Record<string, number> = {};
    const byRule: Record<string, number> = {};
    const bySeverity: Record<string, number> = { error: 0, warning: 0, info: 0 };

    try {
      // Get repository contents
      const { data: contents } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: '',
        ref: branch,
      });

      // Find lint configuration files
      const lintConfigs = await this.findLintConfigs(owner, repo, branch);
      
      // Analyze source files (limit for performance)
      const sourceFiles = await this.getSourceFiles(owner, repo, branch);
      const filesToAnalyze = sourceFiles.slice(0, this.maxFiles);
      
      console.log(`Found ${sourceFiles.length} source files, analyzing first ${filesToAnalyze.length}...`);
      
      for (const file of filesToAnalyze) {
        const fileErrors = await this.analyzeFile(owner, repo, file, branch);
        errors.push(...fileErrors);
        
        // Update statistics
        fileErrors.forEach(error => {
          byFile[error.file] = (byFile[error.file] || 0) + 1;
          byRule[error.rule] = (byRule[error.rule] || 0) + 1;
          bySeverity[error.severity]++;
        });
      }

      return {
        totalErrors: bySeverity.error,
        totalWarnings: bySeverity.warning,
        totalInfo: bySeverity.info,
        errors,
        filesAnalyzed: filesToAnalyze.length,
        summary: {
          byFile,
          byRule,
          bySeverity,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error}`);
    }
  }

  /**
   * Analyze a single file for lint errors
   */
  private async analyzeFile(
    owner: string,
    repo: string,
    filePath: string,
    branch: string
  ): Promise<LintError[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return this.lintContent(content, filePath);
      }

      return [];
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Lint file content
   */
  private lintContent(content: string, filePath: string): LintError[] {
    const errors: LintError[] = [];
    const lines = content.split('\n');

    // Basic lint checks
    lines.forEach((line, index) => {
      // Check for console.log
      if (line.includes('console.log')) {
        errors.push({
          file: filePath,
          line: index + 1,
          column: line.indexOf('console.log') + 1,
          severity: 'warning',
          message: 'Unexpected console statement',
          rule: 'no-console',
          source: line.trim(),
        });
      }

      // Check for debugger
      if (line.includes('debugger')) {
        errors.push({
          file: filePath,
          line: index + 1,
          column: line.indexOf('debugger') + 1,
          severity: 'error',
          message: 'Unexpected debugger statement',
          rule: 'no-debugger',
          source: line.trim(),
        });
      }

      // Check for trailing whitespace
      if (line.endsWith(' ') || line.endsWith('\t')) {
        errors.push({
          file: filePath,
          line: index + 1,
          column: line.length,
          severity: 'info',
          message: 'Trailing whitespace',
          rule: 'no-trailing-spaces',
          source: line,
        });
      }

      // Check for var usage
      if (/\bvar\s+/.test(line)) {
        errors.push({
          file: filePath,
          line: index + 1,
          column: line.indexOf('var') + 1,
          severity: 'warning',
          message: 'Unexpected var, use let or const instead',
          rule: 'no-var',
          source: line.trim(),
        });
      }
    });

    return errors;
  }

  /**
   * Find lint configuration files
   */
  private async findLintConfigs(
    owner: string,
    repo: string,
    branch: string
  ): Promise<string[]> {
    const configFiles = [
      '.eslintrc',
      '.eslintrc.js',
      '.eslintrc.json',
      '.eslintrc.yml',
      'eslint.config.js',
      '.prettierrc',
      '.prettierrc.js',
      '.prettierrc.json',
    ];

    const found: string[] = [];

    for (const config of configFiles) {
      try {
        await this.octokit.repos.getContent({
          owner,
          repo,
          path: config,
          ref: branch,
        });
        found.push(config);
      } catch {
        // File doesn't exist
      }
    }

    return found;
  }

  /**
   * Get all source files from repository
   */
  private async getSourceFiles(
    owner: string,
    repo: string,
    branch: string,
    path: string = ''
  ): Promise<string[]> {
    const files: string[] = [];
    const extensions = ['.js', '.jsx', '.ts', '.tsx', '.vue', '.py', '.java', '.go'];

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

export default LintErrorAnalyzer;

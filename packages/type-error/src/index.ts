import { Octokit } from '@octokit/rest';

export interface TypeError {
  file: string;
  line: number;
  column: number;
  severity: 'error' | 'warning';
  message: string;
  code: string;
  source: string;
  category: string;
}

export interface TypeAnalysisResult {
  totalErrors: number;
  totalWarnings: number;
  errors: TypeError[];
  summary: {
    byFile: Record<string, number>;
    byCategory: Record<string, number>;
    byCode: Record<string, number>;
  };
  languageInfo: {
    language: string;
    version?: string;
    configFiles: string[];
  };
  timestamp: string;
}

export class TypeErrorAnalyzer {
  private octokit: Octokit;
  private mcpEnabled: boolean;

  constructor(githubToken: string, mcpEnabled: boolean = true) {
    this.octokit = new Octokit({ auth: githubToken });
    this.mcpEnabled = mcpEnabled;
  }

  /**
   * Analyze type errors in a GitHub repository using MCP
   */
  async analyzeRepository(
    owner: string,
    repo: string,
    branch: string = 'main'
  ): Promise<TypeAnalysisResult> {
    const errors: TypeError[] = [];
    const byFile: Record<string, number> = {};
    const byCategory: Record<string, number> = {};
    const byCode: Record<string, number> = {};
    let totalErrors = 0;
    let totalWarnings = 0;

    try {
      // Detect language and configuration
      const languageInfo = await this.detectLanguage(owner, repo, branch);
      
      // Get source files
      const sourceFiles = await this.getSourceFiles(owner, repo, branch, languageInfo.language);
      
      // Analyze each file for type errors
      for (const file of sourceFiles) {
        const fileErrors = await this.analyzeFile(owner, repo, file, branch, languageInfo.language);
        errors.push(...fileErrors);
        
        // Update statistics
        fileErrors.forEach(error => {
          byFile[error.file] = (byFile[error.file] || 0) + 1;
          byCategory[error.category] = (byCategory[error.category] || 0) + 1;
          byCode[error.code] = (byCode[error.code] || 0) + 1;
          
          if (error.severity === 'error') totalErrors++;
          else totalWarnings++;
        });
      }

      // Use GitHub MCP for advanced type checking if enabled
      if (this.mcpEnabled) {
        const mcpErrors = await this.analyzeMCP(owner, repo, branch, languageInfo);
        errors.push(...mcpErrors);
        
        mcpErrors.forEach(error => {
          byFile[error.file] = (byFile[error.file] || 0) + 1;
          byCategory[error.category] = (byCategory[error.category] || 0) + 1;
          byCode[error.code] = (byCode[error.code] || 0) + 1;
          
          if (error.severity === 'error') totalErrors++;
          else totalWarnings++;
        });
      }

      return {
        totalErrors,
        totalWarnings,
        errors,
        summary: {
          byFile,
          byCategory,
          byCode,
        },
        languageInfo,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      throw new Error(`Failed to analyze repository: ${error}`);
    }
  }

  /**
   * Analyze using GitHub MCP (Model Context Protocol)
   */
  private async analyzeMCP(
    owner: string,
    repo: string,
    branch: string,
    languageInfo: any
  ): Promise<TypeError[]> {
    const errors: TypeError[] = [];

    try {
      // GitHub MCP integration for advanced type checking
      // This would integrate with GitHub's code analysis APIs
      const { data: checks } = await this.octokit.checks.listForRef({
        owner,
        repo,
        ref: branch,
      });

      // Process check runs for type errors
      for (const check of checks.check_runs) {
        if (check.conclusion === 'failure' || check.conclusion === 'neutral') {
          // Fetch annotations from check run
          const annotations = await this.getCheckAnnotations(owner, repo, check.id);
          
          annotations.forEach(annotation => {
            if (this.isTypeError(annotation.message)) {
              errors.push({
                file: annotation.path,
                line: annotation.start_line || 0,
                column: annotation.start_column || 0,
                severity: annotation.annotation_level === 'failure' ? 'error' : 'warning',
                message: annotation.message,
                code: this.extractErrorCode(annotation.message),
                source: annotation.title || '',
                category: 'type-check',
              });
            }
          });
        }
      }
    } catch (error) {
      console.error('MCP analysis error:', error);
    }

    return errors;
  }

  /**
   * Get check annotations
   */
  private async getCheckAnnotations(owner: string, repo: string, checkRunId: number): Promise<any[]> {
    try {
      const { data } = await this.octokit.checks.listAnnotations({
        owner,
        repo,
        check_run_id: checkRunId,
      });
      return data;
    } catch {
      return [];
    }
  }

  /**
   * Check if message is a type error
   */
  private isTypeError(message: string): boolean {
    const typeErrorPatterns = [
      /type/i,
      /cannot find name/i,
      /property.*does not exist/i,
      /is not assignable to/i,
      /expected.*arguments/i,
      /undefined.*not.*object/i,
    ];
    
    return typeErrorPatterns.some(pattern => pattern.test(message));
  }

  /**
   * Extract error code from message
   */
  private extractErrorCode(message: string): string {
    const match = message.match(/TS(\d+)|error (\w+)/i);
    return match ? match[0] : 'UNKNOWN';
  }

  /**
   * Analyze a single file for type errors
   */
  private async analyzeFile(
    owner: string,
    repo: string,
    filePath: string,
    branch: string,
    language: string
  ): Promise<TypeError[]> {
    try {
      const { data } = await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
        ref: branch,
      });

      if ('content' in data) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        return this.checkTypes(content, filePath, language);
      }

      return [];
    } catch (error) {
      console.error(`Error analyzing file ${filePath}:`, error);
      return [];
    }
  }

  /**
   * Check types in file content
   */
  private checkTypes(content: string, filePath: string, language: string): TypeError[] {
    const errors: TypeError[] = [];
    const lines = content.split('\n');

    if (language === 'typescript' || language === 'javascript') {
      lines.forEach((line, index) => {
        // Check for any type
        if (/:\s*any\b/.test(line)) {
          errors.push({
            file: filePath,
            line: index + 1,
            column: line.indexOf('any') + 1,
            severity: 'warning',
            message: 'Unexpected any. Specify a different type',
            code: 'TS2571',
            source: line.trim(),
            category: 'type-annotation',
          });
        }

        // Check for implicit any
        if (/function\s+\w+\s*\([^)]*\)\s*{/.test(line) && !line.includes(':')) {
          errors.push({
            file: filePath,
            line: index + 1,
            column: 0,
            severity: 'warning',
            message: 'Parameter implicitly has an any type',
            code: 'TS7006',
            source: line.trim(),
            category: 'implicit-any',
          });
        }

        // Check for non-null assertion
        if (/!\./.test(line) || /!\[/.test(line)) {
          errors.push({
            file: filePath,
            line: index + 1,
            column: line.indexOf('!') + 1,
            severity: 'warning',
            message: 'Forbidden non-null assertion',
            code: 'TS2322',
            source: line.trim(),
            category: 'non-null-assertion',
          });
        }
      });
    }

    return errors;
  }

  /**
   * Detect programming language and configuration
   */
  private async detectLanguage(
    owner: string,
    repo: string,
    branch: string
  ): Promise<any> {
    const configFiles: string[] = [];
    let language = 'unknown';
    let version: string | undefined;

    // Check for TypeScript
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'tsconfig.json',
        ref: branch,
      });
      configFiles.push('tsconfig.json');
      language = 'typescript';
    } catch {}

    // Check for Python
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'pyproject.toml',
        ref: branch,
      });
      configFiles.push('pyproject.toml');
      language = 'python';
    } catch {}

    // Check for Java
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'pom.xml',
        ref: branch,
      });
      configFiles.push('pom.xml');
      language = 'java';
    } catch {}

    // Check for Go
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: 'go.mod',
        ref: branch,
      });
      configFiles.push('go.mod');
      language = 'go';
    } catch {}

    return { language, version, configFiles };
  }

  /**
   * Get source files based on language
   */
  private async getSourceFiles(
    owner: string,
    repo: string,
    branch: string,
    language: string,
    path: string = ''
  ): Promise<string[]> {
    const files: string[] = [];
    const extensionMap: Record<string, string[]> = {
      typescript: ['.ts', '.tsx'],
      javascript: ['.js', '.jsx'],
      python: ['.py'],
      java: ['.java'],
      go: ['.go'],
    };

    const extensions = extensionMap[language] || ['.ts', '.js', '.py'];

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
            const subFiles = await this.getSourceFiles(owner, repo, branch, language, item.path);
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

export default TypeErrorAnalyzer;

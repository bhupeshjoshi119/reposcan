#!/usr/bin/env node

import { Command } from 'commander';
import { SecurityAnalyzer } from './index.js';

const program = new Command();

program
  .name('security-analyzer')
  .description('Analyze security vulnerabilities in GitHub repositories')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a GitHub repository for security issues')
  .requiredOption('-o, --owner <owner>', 'Repository owner')
  .requiredOption('-r, --repo <repo>', 'Repository name')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token', process.env.GITHUB_TOKEN)
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    if (!options.token) {
      console.error('Error: GitHub token is required. Set GITHUB_TOKEN environment variable or use --token flag');
      process.exit(1);
    }

    try {
      console.log(`Analyzing ${options.owner}/${options.repo} (${options.branch})...`);
      
      const analyzer = new SecurityAnalyzer(options.token);
      const result = await analyzer.analyzeRepository(options.owner, options.repo, options.branch);

      if (options.json) {
        console.log(JSON.stringify(result, null, 2));
        return;
      }

      console.log('\n=== Security Analysis Results ===\n');
      console.log(`Security Score: ${result.securityScore}/100`);
      console.log(`Total Issues: ${result.totalIssues}`);
      console.log(`  Critical: ${result.criticalIssues}`);
      console.log(`  High: ${result.highIssues}`);
      console.log(`  Medium: ${result.mediumIssues}`);
      console.log(`  Low: ${result.lowIssues}`);
      console.log(`\nDependency Vulnerabilities: ${result.dependencies.length}`);
      console.log(`Timestamp: ${result.timestamp}`);

      if (result.criticalIssues > 0) {
        console.log('\n=== CRITICAL ISSUES ===\n');
        result.issues
          .filter(i => i.severity === 'critical')
          .slice(0, 10)
          .forEach(issue => {
            console.log(`[CRITICAL] ${issue.file}:${issue.line}`);
            console.log(`  ${issue.title}`);
            console.log(`  ${issue.description}`);
            if (issue.cwe) console.log(`  CWE: ${issue.cwe}`);
            console.log(`  Recommendation: ${issue.recommendation}\n`);
          });
      }

      if (result.highIssues > 0) {
        console.log('\n=== HIGH SEVERITY ISSUES ===\n');
        result.issues
          .filter(i => i.severity === 'high')
          .slice(0, 10)
          .forEach(issue => {
            console.log(`[HIGH] ${issue.file}:${issue.line}`);
            console.log(`  ${issue.title}`);
            console.log(`  ${issue.description}`);
            if (issue.cwe) console.log(`  CWE: ${issue.cwe}`);
            console.log(`  Recommendation: ${issue.recommendation}\n`);
          });
      }

      if (result.dependencies.length > 0) {
        console.log('\n=== DEPENDENCY VULNERABILITIES ===\n');
        result.dependencies.slice(0, 10).forEach(dep => {
          console.log(`[${dep.severity.toUpperCase()}] ${dep.package}@${dep.version}`);
          console.log(`  CVE: ${dep.cve}`);
          console.log(`  ${dep.description}`);
          console.log(`  Patched Versions: ${dep.patchedVersions.join(', ')}`);
          console.log(`  Recommendation: ${dep.recommendation}\n`);
        });
      }

      console.log('\n=== Summary by Category ===');
      Object.entries(result.summary.byCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} issues`);
        });

      console.log('\n=== Most Vulnerable Files ===');
      Object.entries(result.summary.byFile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count]) => {
          console.log(`  ${file}: ${count} issues`);
        });

      // Exit with error code if critical issues found
      if (result.criticalIssues > 0) {
        process.exit(1);
      }

    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();

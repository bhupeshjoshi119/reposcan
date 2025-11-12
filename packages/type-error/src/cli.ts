#!/usr/bin/env node

import { Command } from 'commander';
import { TypeErrorAnalyzer } from './index.js';

const program = new Command();

program
  .name('type-error')
  .description('Analyze type errors in GitHub repositories using MCP')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a GitHub repository for type errors')
  .requiredOption('-o, --owner <owner>', 'Repository owner')
  .requiredOption('-r, --repo <repo>', 'Repository name')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token', process.env.GITHUB_TOKEN)
  .option('--no-mcp', 'Disable MCP integration')
  .action(async (options) => {
    if (!options.token) {
      console.error('Error: GitHub token is required. Set GITHUB_TOKEN environment variable or use --token flag');
      process.exit(1);
    }

    try {
      console.log(`Analyzing ${options.owner}/${options.repo} (${options.branch})...`);
      console.log(`MCP Integration: ${options.mcp ? 'Enabled' : 'Disabled'}`);
      
      const analyzer = new TypeErrorAnalyzer(options.token, options.mcp);
      const result = await analyzer.analyzeRepository(options.owner, options.repo, options.branch);

      console.log('\n=== Type Analysis Results ===\n');
      console.log(`Language: ${result.languageInfo.language}`);
      if (result.languageInfo.version) {
        console.log(`Version: ${result.languageInfo.version}`);
      }
      console.log(`Config Files: ${result.languageInfo.configFiles.join(', ') || 'None'}`);
      console.log(`\nTotal Errors: ${result.totalErrors}`);
      console.log(`Total Warnings: ${result.totalWarnings}`);
      console.log(`Timestamp: ${result.timestamp}`);

      if (result.errors.length > 0) {
        console.log('\n=== Top Type Errors ===\n');
        result.errors.slice(0, 15).forEach(error => {
          console.log(`[${error.severity.toUpperCase()}] ${error.file}:${error.line}:${error.column}`);
          console.log(`  ${error.message} (${error.code})`);
          console.log(`  Category: ${error.category}`);
          console.log(`  ${error.source}\n`);
        });
      }

      console.log('\n=== Summary by File ===');
      Object.entries(result.summary.byFile)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([file, count]) => {
          console.log(`  ${file}: ${count} issues`);
        });

      console.log('\n=== Summary by Category ===');
      Object.entries(result.summary.byCategory)
        .sort(([, a], [, b]) => b - a)
        .forEach(([category, count]) => {
          console.log(`  ${category}: ${count} occurrences`);
        });

      console.log('\n=== Summary by Error Code ===');
      Object.entries(result.summary.byCode)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .forEach(([code, count]) => {
          console.log(`  ${code}: ${count} occurrences`);
        });

    } catch (error) {
      console.error('Error:', error);
      process.exit(1);
    }
  });

program.parse();

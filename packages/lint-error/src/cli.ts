#!/usr/bin/env node

import { Command } from 'commander';
import { LintErrorAnalyzer } from './index.js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Try to load .env file
function loadEnvToken() {
  try {
    const envPath = resolve(process.cwd(), '.env');
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/GITHUB_TOKEN=(.+)/);
    if (match) {
      return match[1].trim();
    }
  } catch {
    // .env file not found or not readable
  }
  return null;
}

const program = new Command();

program
  .name('lint-error')
  .description('Analyze lint errors in GitHub repositories')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a GitHub repository for lint errors')
  .requiredOption('-o, --owner <owner>', 'Repository owner')
  .requiredOption('-r, --repo <repo>', 'Repository name')
  .option('-b, --branch <branch>', 'Branch name', 'main')
  .option('-t, --token <token>', 'GitHub token')
  .option('--max-files <number>', 'Maximum files to analyze', '50')
  .action(async (options) => {
    // Try to get token from: CLI flag > env var > .env file
    const token = options.token || process.env.GITHUB_TOKEN || loadEnvToken();
    
    if (!token) {
      console.error('Error: GitHub token is required.');
      console.error('Options:');
      console.error('  1. Use --token flag: lint-error analyze --token YOUR_TOKEN');
      console.error('  2. Set environment: export GITHUB_TOKEN=YOUR_TOKEN');
      console.error('  3. Create .env file with: GITHUB_TOKEN=YOUR_TOKEN');
      process.exit(1);
    }

    try {
      console.log(`\n🔍 Analyzing ${options.owner}/${options.repo} (${options.branch})...`);
      console.log(`📊 Max files to analyze: ${options.maxFiles}\n`);
      
      const analyzer = new LintErrorAnalyzer(token);
      analyzer.maxFiles = parseInt(options.maxFiles);
      const result = await analyzer.analyzeRepository(options.owner, options.repo, options.branch);

      console.log('\n✅ === Lint Analysis Results ===\n');
      console.log(`📊 Files Analyzed: ${result.filesAnalyzed || 0}`);
      console.log(`❌ Total Errors: ${result.totalErrors}`);
      console.log(`⚠️  Total Warnings: ${result.totalWarnings}`);
      console.log(`ℹ️  Total Info: ${result.totalInfo}`);
      console.log(`⏰ Timestamp: ${result.timestamp}`);

      if (result.errors.length > 0) {
        console.log('\n🔴 === Top Issues (showing first 10) ===\n');
        result.errors.slice(0, 10).forEach(error => {
          console.log(`[${error.severity.toUpperCase()}] ${error.file}:${error.line}:${error.column}`);
          console.log(`  ${error.message} (${error.rule})`);
          console.log(`  ${error.source}\n`);
        });
      } else {
        console.log('\n✨ No lint issues found!');
      }

      if (Object.keys(result.summary.byFile).length > 0) {
        console.log('\n📁 === Summary by File (top 10) ===');
        Object.entries(result.summary.byFile)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .forEach(([file, count]) => {
            console.log(`  ${file}: ${count} issues`);
          });
      }

      if (Object.keys(result.summary.byRule).length > 0) {
        console.log('\n📋 === Summary by Rule (top 10) ===');
        Object.entries(result.summary.byRule)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 10)
          .forEach(([rule, count]) => {
            console.log(`  ${rule}: ${count} occurrences`);
          });
      }

      console.log('\n✅ Analysis complete!\n');

    } catch (error: any) {
      console.error('\n❌ Error:', error?.message || error);
      if (error?.message?.includes('rate limit')) {
        console.error('💡 Tip: You may have hit GitHub API rate limits. Wait a bit and try again.');
      }
      process.exit(1);
    }
  });

program.parse();

#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';
import { Octokit } from '@octokit/rest';
import { LightweightPDFGenerator } from '../services/lightweightPDFGenerator';

/**
 * Simple Issue Analyzer - Works immediately!
 * Memory optimized and user-friendly
 */

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🚀 GitHub Issue Analyzer - Simple Version                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  npm run simple-analyze <github-issue-url>
  npm run simple-analyze <owner> <repo> [max-issues]

Examples:
  npm run simple-analyze https://github.com/facebook/react/issues/1
  npm run simple-analyze flutter flutter 10
  npm run simple-analyze facebook react 100

Features:
  ✅ Memory optimized
  ✅ Interactive token setup
  ✅ Works with any repository
  ✅ Generates PDF reports
  ✅ Stack Overflow solutions
    `);
    process.exit(0);
  }

  // Get GitHub token
  let githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.log('\n🔑 GitHub Token Setup');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Get your token at: https://github.com/settings/tokens');
    console.log('Select scopes: repo + public_repo\n');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    githubToken = await new Promise<string>((resolve) => {
      rl.question('Enter your GitHub token: ', (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!githubToken) {
      console.error('\n❌ GitHub token is required');
      process.exit(1);
    }

    // Ask to save
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const shouldSave = await new Promise<string>((resolve) => {
      rl2.question('\nSave token to .env file? (y/n): ', (answer: string) => {
        rl2.close();
        resolve(answer.trim().toLowerCase());
      });
    });

    if (shouldSave === 'y' || shouldSave === 'yes') {
      const envContent = `GITHUB_TOKEN=${githubToken}\n`;
      fs.appendFileSync('.env', envContent);
      
      // Add to .gitignore
      try {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (!gitignore.includes('.env')) {
          fs.appendFileSync('.gitignore', '\n.env\n');
        }
      } catch (err) {
        fs.writeFileSync('.gitignore', '.env\n');
      }
      
      console.log('✅ Token saved to .env file');
    }
    
    console.log();
  }

  try {
    if (args[0].startsWith('https://github.com/')) {
      // Single issue analysis
      await analyzeSingleIssue(args[0], githubToken);
    } else if (args.length >= 2) {
      // Batch analysis
      const owner = args[0];
      const repo = args[1];
      const maxIssues = args[2] ? parseInt(args[2]) : 50; // Default to 50 for memory
      
      await analyzeBatch(owner, repo, maxIssues, githubToken);
    } else {
      console.error('❌ Invalid arguments');
      process.exit(1);
    }
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function analyzeSingleIssue(issueUrl: string, githubToken: string) {
  console.log(`🔍 Analyzing single issue: ${issueUrl}\n`);

  try {
    // Simple fetch and analysis
    const { owner, repo, issueNumber } = parseGitHubUrl(issueUrl);
    
    const octokit = new Octokit({ auth: githubToken });
    const issue = await octokit.rest.issues.get({
      owner,
      repo,
      issue_number: issueNumber
    });

    console.log(`📋 Issue #${issue.data.number}: ${issue.data.title}`);
    console.log(`📊 State: ${issue.data.state.toUpperCase()}`);
    console.log(`💬 Comments: ${issue.data.comments}`);
    console.log(`👍 Reactions: ${issue.data.reactions?.total_count || 0}`);
    console.log(`🔗 URL: ${issue.data.html_url}\n`);

    // Simple Stack Overflow search
    const searchQuery = encodeURIComponent(issue.data.title);
    const soUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${searchQuery}&site=stackoverflow&pagesize=5`;
    
    console.log('🔍 Searching Stack Overflow...');
    const soResponse = await fetch(soUrl);
    const soData = await soResponse.json();

    if (soData.items && soData.items.length > 0) {
      console.log(`✅ Found ${soData.items.length} Stack Overflow solutions:\n`);
      
      soData.items.slice(0, 3).forEach((item: any, index: number) => {
        console.log(`${index + 1}. ${item.title}`);
        console.log(`   Score: ${item.score} | Views: ${item.view_count.toLocaleString()}`);
        console.log(`   Link: ${item.link}\n`);
      });
    } else {
      console.log('❌ No Stack Overflow solutions found\n');
    }

    // Generate simple report
    const report = {
      issue: {
        number: issue.data.number,
        title: issue.data.title,
        state: issue.data.state,
        url: issue.data.html_url,
        comments: issue.data.comments,
        reactions: issue.data.reactions?.total_count || 0
      },
      stackOverflowSolutions: soData.items?.slice(0, 5) || [],
      analyzedAt: new Date().toISOString()
    };

    const reportFile = `issue-${issue.data.number}-report.json`;
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
    console.log(`✅ Report saved: ${reportFile}`);

    // Generate PDF report
    try {
      const pdfGenerator = new LightweightPDFGenerator();
      const pdfFile = await pdfGenerator.generatePDF(report, {
        filename: `issue-${issue.data.number}-report.pdf`
      });
      console.log(`📄 PDF report: ${pdfFile}`);
    } catch (error) {
      console.log('📄 PDF generation skipped (HTML fallback available)');
    }

  } catch (error: any) {
    console.error('❌ Error analyzing issue:', error.message);
  }
}

async function analyzeBatch(owner: string, repo: string, maxIssues: number, githubToken: string) {
  console.log(`🔍 Analyzing ${owner}/${repo} (max ${maxIssues} issues)\n`);

  try {
    const octokit = new Octokit({ auth: githubToken });
    
    // Fetch issues
    console.log('📥 Fetching issues...');
    const issues = [];
    let page = 1;
    
    while (issues.length < maxIssues) {
      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: Math.min(100, maxIssues - issues.length),
        page
      });

      if (response.data.length === 0) break;
      
      const filteredIssues = response.data.filter(issue => !issue.pull_request);
      issues.push(...filteredIssues);
      
      console.log(`   Fetched ${issues.length} issues...`);
      
      if (response.data.length < 100) break;
      page++;
      
      await delay(500);
    }

    console.log(`✅ Fetched ${issues.length} total issues\n`);

    // Analyze in small batches
    const results = [];
    const batchSize = 5;

    for (let i = 0; i < issues.length; i += batchSize) {
      const batch = issues.slice(i, i + batchSize);
      console.log(`🔍 Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(issues.length / batchSize)}`);
      
      for (const issue of batch) {
        try {
          // Simple analysis
          const searchQuery = encodeURIComponent(issue.title);
          const soUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${searchQuery}&site=stackoverflow&pagesize=3`;
          
          const soResponse = await fetch(soUrl);
          const soData = await soResponse.json();

          results.push({
            issueNumber: issue.number,
            title: issue.title,
            state: issue.state,
            url: issue.html_url,
            stackOverflowSolutions: soData.items?.slice(0, 3) || []
          });

          await delay(300);
        } catch (error) {
          console.error(`   Error with issue #${issue.number}`);
        }
      }
      
      const progress = ((i + batchSize) / issues.length * 100).toFixed(1);
      console.log(`   Progress: ${Math.min(i + batchSize, issues.length)}/${issues.length} (${progress}%)`);
      
      await delay(1000);
    }

    // Save results
    const reportFile = `${owner}-${repo}-batch-report.json`;
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    console.log(`\n✅ Analysis complete!`);
    console.log(`📊 Analyzed: ${results.length} issues`);
    console.log(`💾 Report saved: ${reportFile}`);
    
    const withSolutions = results.filter(r => r.stackOverflowSolutions.length > 0);
    console.log(`💡 Issues with solutions: ${withSolutions.length} (${(withSolutions.length / results.length * 100).toFixed(1)}%)`);

    // Generate PDF report
    try {
      const pdfGenerator = new LightweightPDFGenerator();
      const pdfFile = await pdfGenerator.generatePDF(results, {
        filename: `${owner}-${repo}-batch-report.pdf`,
        owner,
        repo
      });
      console.log(`📄 PDF report: ${pdfFile}`);
    } catch (error) {
      console.log('📄 PDF generation skipped (HTML fallback available)');
    }

  } catch (error: any) {
    console.error('❌ Error in batch analysis:', error.message);
  }
}

function parseGitHubUrl(url: string): { owner: string; repo: string; issueNumber: number } {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
  if (!match) {
    throw new Error('Invalid GitHub issue URL');
  }
  return {
    owner: match[1],
    repo: match[2],
    issueNumber: parseInt(match[3])
  };
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export interface MemoryOptimizedOptions {
  batchSize?: number;
  maxIssues?: number;
  outputFile?: string;
}

main();
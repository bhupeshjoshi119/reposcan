#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';
import { Octokit } from '@octokit/rest';
import { ComprehensiveIssuePDFGenerator } from '../services/comprehensiveIssuePDFGenerator';

/**
 * Comprehensive Issue Analyzer
 * Built for developers who work day and night
 * Handles 100+ issues with deep analysis
 */

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║         🚀 GitHub Issue Analyzer - Comprehensive Edition                    ║
║                                                                              ║
║         Built for Developers, By Developers                                 ║
║         Helping you solve problems faster                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
Usage:
  npm run comprehensive-analyze <owner> <repo> [max-issues]

Examples:
  npm run comprehensive-analyze flutter flutter 100
  npm run comprehensive-analyze facebook react 150
  npm run comprehensive-analyze microsoft vscode 200

Features:
  ✅ Comprehensive PDF reports (100+ pages)
  ✅ Deep issue analysis
  ✅ Stack Overflow solutions with quality scores
  ✅ Statistical insights and trends
  ✅ Actionable recommendations
  ✅ Beautiful formatting
  ✅ Memory optimized for large datasets

Default: Analyzes 100 issues if not specified
    `);
    process.exit(0);
  }

  if (args.length < 2) {
    console.error('❌ Please provide owner and repo');
    console.error('Example: npm run comprehensive-analyze flutter flutter 100');
    process.exit(1);
  }

  const owner = args[0];
  const repo = args[1];
  const maxIssues = args[2] ? parseInt(args[2]) : 100;

  // Get GitHub token
  let githubToken = process.env.GITHUB_TOKEN;
  
  if (!githubToken) {
    console.log('\n🔑 GitHub Token Required');
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
  }

  try {
    await analyzeComprehensive(owner, repo, maxIssues, githubToken);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

async function analyzeComprehensive(
  owner: string,
  repo: string,
  maxIssues: number,
  githubToken: string
) {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  🔍 Comprehensive Analysis                                                   ║
╚══════════════════════════════════════════════════════════════════════════════╝

Repository: ${owner}/${repo}
Max Issues: ${maxIssues}
Analysis Type: Deep analysis with Stack Overflow solutions

`);

  const startTime = Date.now();
  
  try {
    const octokit = new Octokit({ auth: githubToken });
    
    // Step 1: Fetch issues
    console.log('📥 Step 1/4: Fetching issues from GitHub...');
    const issues = await fetchAllIssues(octokit, owner, repo, maxIssues);
    console.log(`✅ Fetched ${issues.length} issues\n`);
    
    // Step 2: Analyze issues with Stack Overflow
    console.log('🔍 Step 2/4: Analyzing issues and searching Stack Overflow...');
    const results = await analyzeIssuesWithSolutions(issues);
    console.log(`✅ Analysis complete\n`);
    
    // Step 3: Save JSON report
    console.log('💾 Step 3/4: Saving JSON report...');
    const jsonFile = `${owner}-${repo}-comprehensive-${maxIssues}.json`;
    fs.writeFileSync(jsonFile, JSON.stringify(results, null, 2));
    console.log(`✅ JSON saved: ${jsonFile}\n`);
    
    // Step 4: Generate comprehensive PDF
    console.log('📄 Step 4/4: Generating comprehensive PDF report...');
    console.log('   This may take a few minutes for large datasets...\n');
    
    const withSolutions = results.filter(r => r.stackOverflowSolutions?.length > 0);
    const totalSolutions = results.reduce((sum, r) => sum + (r.stackOverflowSolutions?.length || 0), 0);
    
    const pdfGenerator = new ComprehensiveIssuePDFGenerator();
    const pdfFile = await pdfGenerator.generateBatchPDF(results, {
      owner,
      repo,
      filename: `${owner}-${repo}-comprehensive-${maxIssues}.pdf`,
      totalIssues: results.length,
      issuesWithSolutions: withSolutions.length,
      totalSolutions
    });
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);
    
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║  ✅ Analysis Complete!                                                       ║
╚══════════════════════════════════════════════════════════════════════════════╝

📊 Summary:
   • Total Issues Analyzed: ${results.length}
   • Issues with Solutions: ${withSolutions.length} (${(withSolutions.length / results.length * 100).toFixed(1)}%)
   • Total Stack Overflow Solutions: ${totalSolutions}
   • Average Solutions per Issue: ${(totalSolutions / results.length).toFixed(2)}
   
📄 Reports Generated:
   • JSON Report: ${jsonFile}
   • PDF Report: ${pdfFile}
   
⏱️  Time Taken: ${duration} minutes

💡 Next Steps:
   1. Open the PDF report for comprehensive analysis
   2. Review issues with high-quality Stack Overflow solutions
   3. Use insights to prioritize issue resolution
   4. Share findings with your team

🎉 Thank you for using our tool!
   Built with ❤️  for developers who work day and night
`);

  } catch (error: any) {
    console.error('❌ Error during analysis:', error.message);
    throw error;
  }
}

async function fetchAllIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  maxIssues: number
): Promise<any[]> {
  const issues: any[] = [];
  let page = 1;
  const perPage = 100;
  
  while (issues.length < maxIssues) {
    try {
      const response = await octokit.rest.issues.listForRepo({
        owner,
        repo,
        state: 'all',
        per_page: Math.min(perPage, maxIssues - issues.length),
        page,
        sort: 'created',
        direction: 'desc'
      });

      if (response.data.length === 0) break;
      
      // Filter out pull requests
      const filteredIssues = response.data.filter(issue => !issue.pull_request);
      issues.push(...filteredIssues);
      
      console.log(`   Fetched ${issues.length}/${maxIssues} issues...`);
      
      if (response.data.length < perPage) break;
      page++;
      
      // Rate limiting
      await delay(1000);
      
    } catch (error: any) {
      if (error.status === 403) {
        console.log('   Rate limit reached, waiting 60 seconds...');
        await delay(60000);
      } else {
        throw error;
      }
    }
  }
  
  return issues.slice(0, maxIssues);
}

async function analyzeIssuesWithSolutions(issues: any[]): Promise<any[]> {
  const results: any[] = [];
  const batchSize = 5; // Process 5 at a time to respect rate limits
  
  for (let i = 0; i < issues.length; i += batchSize) {
    const batch = issues.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(issues.length / batchSize);
    
    console.log(`   Batch ${batchNum}/${totalBatches} (${i + 1}-${Math.min(i + batchSize, issues.length)}/${issues.length})`);
    
    for (const issue of batch) {
      try {
        // Search Stack Overflow
        const searchQuery = encodeURIComponent(issue.title);
        const soUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${searchQuery}&site=stackoverflow&pagesize=5`;
        
        const soResponse = await fetch(soUrl);
        const soData = await soResponse.json();
        
        // Check for rate limiting
        if (soData.backoff) {
          console.log(`   Stack Overflow backoff: waiting ${soData.backoff} seconds...`);
          await delay(soData.backoff * 1000);
        }
        
        results.push({
          issueNumber: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          comments: issue.comments,
          reactions: issue.reactions?.total_count || 0,
          labels: issue.labels?.map((l: any) => l.name) || [],
          stackOverflowSolutions: soData.items?.slice(0, 5).map((item: any) => ({
            title: item.title,
            link: item.link,
            score: item.score,
            view_count: item.view_count,
            answer_count: item.answer_count,
            is_answered: item.is_answered,
            creation_date: item.creation_date,
            tags: item.tags
          })) || []
        });
        
        await delay(300); // Be nice to Stack Overflow API
        
      } catch (error: any) {
        console.error(`   ⚠️  Error with issue #${issue.number}: ${error.message}`);
        
        // Add issue without solutions
        results.push({
          issueNumber: issue.number,
          title: issue.title,
          state: issue.state,
          url: issue.html_url,
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          comments: issue.comments,
          reactions: issue.reactions?.total_count || 0,
          labels: issue.labels?.map((l: any) => l.name) || [],
          stackOverflowSolutions: []
        });
      }
    }
    
    // Progress update
    const progress = ((i + batchSize) / issues.length * 100).toFixed(1);
    console.log(`   Progress: ${Math.min(i + batchSize, issues.length)}/${issues.length} (${progress}%)`);
    
    // Delay between batches
    await delay(2000);
  }
  
  return results;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

main();

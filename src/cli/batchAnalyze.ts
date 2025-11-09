#!/usr/bin/env node

import { BatchIssueAnalyzer } from '../services/batchIssueAnalyzer.js';
import { ComprehensivePDFGenerator } from '../services/comprehensivePDFGenerator.js';
import { BeautifulPDFGenerator } from '../services/pdfGenerator.js';
import * as fs from 'fs';
import * as readline from 'readline';
import 'dotenv/config';

/**
 * CLI tool for batch analysis of ALL issues
 * Generates comprehensive PDFs with ALL issues and solutions
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🚀 Comprehensive Batch Issue Analyzer                          ║
║                                                                              ║
║              Analyze ALL issues from ANY repository                         ║
║              Perfect for educators and open-source collaboration            ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
  npm run batch-analyze <owner> <repo> [options]

Examples:
  npm run batch-analyze flutter flutter
  npm run batch-analyze facebook react --max=500
  npm run batch-analyze microsoft vscode --state=open

Options:
  --max=N          Maximum number of issues to analyze (default: all)
  --state=STATE    Issue state: open, closed, or all (default: all)
  --batch=N        Batch size for parallel processing (default: 10)

Environment Variables:
  GITHUB_TOKEN - Your GitHub personal access token (required)
  STACK_EXCHANGE_KEY - Your Stack Exchange API key (optional)

Features:
  ✅ Analyzes ALL issues (no limits)
  ✅ Deep Stack Overflow search for each issue
  ✅ Finds related issues
  ✅ Generates comprehensive PDF (can be several MB)
  ✅ Perfect for educators and learning
  ✅ Complete solution documentation

The tool will:
  1. Fetch ALL issues from the repository
  2. Analyze each issue with deep search
  3. Find Stack Overflow solutions (4 strategies)
  4. Discover related issues
  5. Generate comprehensive analysis
  6. Create detailed PDF report with ALL issues
  7. Provide statistics and insights

Perfect for:
  • Large repositories (Flutter, React, VSCode)
  • Educational purposes
  • Open-source collaboration
  • Complete documentation
  • Learning resources

Note: For large repositories (10k+ issues), this may take 30-60 minutes.
      The generated PDF will be comprehensive (several MB).
    `);
    process.exit(0);
  }

  const owner = args[0];
  const repo = args[1];
  
  // Parse options
  const options: any = {};
  args.slice(2).forEach(arg => {
    if (arg.startsWith('--max=')) {
      options.maxIssues = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--state=')) {
      options.state = arg.split('=')[1];
    } else if (arg.startsWith('--batch=')) {
      options.batchSize = parseInt(arg.split('=')[1]);
    }
  });

  // Check for tokens in multiple places
  let githubToken = process.env.GITHUB_TOKEN;
  let stackExchangeKey = process.env.STACK_EXCHANGE_KEY;

  // If not in env, prompt user
  if (!githubToken) {
    console.log('\n🔑 GitHub Token Required');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('You can provide your token in three ways:\n');
    console.log('1. Environment variable:');
    console.log('   export GITHUB_TOKEN=your_token\n');
    console.log('2. .env file:');
    console.log('   Create .env file with: GITHUB_TOKEN=your_token\n');
    console.log('3. Enter now (will be stored temporarily):\n');
    
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    githubToken = await new Promise<string>((resolve) => {
      rl.question('Enter your GitHub token (or press Ctrl+C to exit): ', (answer: string) => {
        rl.close();
        resolve(answer.trim());
      });
    });

    if (!githubToken) {
      console.error('\n❌ GitHub token is required');
      console.log('\nGet your token at: https://github.com/settings/tokens');
      process.exit(1);
    }

    // Ask if they want to save it
    const rl2 = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const shouldSave = await new Promise<string>((resolve) => {
      rl2.question('\nSave token to .env file for future use? (y/n): ', (answer: string) => {
        rl2.close();
        resolve(answer.trim().toLowerCase());
      });
    });

    if (shouldSave === 'y' || shouldSave === 'yes') {
      const fs = require('fs');
      const envContent = `GITHUB_TOKEN=${githubToken}\n`;
      fs.appendFileSync('.env', envContent);
      console.log('✅ Token saved to .env file');
      
      // Add to .gitignore if not already there
      try {
        const gitignore = fs.readFileSync('.gitignore', 'utf8');
        if (!gitignore.includes('.env')) {
          fs.appendFileSync('.gitignore', '\n.env\n');
          console.log('✅ Added .env to .gitignore');
        }
      } catch (err) {
        fs.writeFileSync('.gitignore', '.env\n');
        console.log('✅ Created .gitignore with .env');
      }
    }
    
    console.log();
  }

  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🚀 Starting Batch Analysis                               ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
  `);

  console.log(`📊 Repository: ${owner}/${repo}`);
  console.log(`📋 State: ${options.state || 'all'}`);
  console.log(`📊 Max Issues: ${options.maxIssues || 'unlimited'}`);
  console.log(`⚙️  Batch Size: ${options.batchSize || 10}`);
  console.log();

  try {
    const analyzer = new BatchIssueAnalyzer(githubToken, stackExchangeKey);
    
    // Analyze all issues
    const result = await analyzer.analyzeAllIssues(owner, repo, options);

    // Display results
    displayResults(result);

    // Generate comprehensive PDF
    console.log('\n📄 Generating comprehensive PDF report...');
    console.log('   This may take a few minutes for large reports...\n');
    
    const pdfContent = ComprehensivePDFGenerator.generateComprehensivePDF(result);
    const pdfGenerator = new BeautifulPDFGenerator();
    const pdf = await pdfGenerator.generatePDF(pdfContent);

    const filename = `${owner}-${repo}-comprehensive-analysis.pdf`;
    
    // Save PDF
    if (typeof pdf === 'string') {
      fs.writeFileSync(filename, Buffer.from(pdf, 'base64'));
    } else {
      // Assuming pdf is a jsPDF object
      (pdf as any).save(filename);
    }

    const stats = fs.statSync(filename);
    const fileSizeMB = (stats.size / 1024 / 1024).toFixed(2);
    console.log(`✅ PDF report saved: ${filename}`);
    console.log(`📊 File size: ${fileSizeMB} MB`);
    console.log(`📄 Total pages: ~${Math.ceil(result.analyzedIssues * 0.5)} pages`);
    console.log(`\n🎉 Comprehensive analysis complete!`);
    console.log(`\n💡 This PDF contains ALL ${result.analyzedIssues} issues with complete solutions.`);
    console.log(`   Perfect for educators, developers, and open-source collaboration!`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

function displayResults(result: any) {
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log('                        📊 BATCH ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log(`📋 Repository: ${result.repository.owner}/${result.repository.repo}`);
  console.log(`📊 Total Issues: ${result.totalIssues.toLocaleString()}`);
  console.log(`✅ Successfully Analyzed: ${result.analyzedIssues.toLocaleString()}`);
  console.log(`⏱️  Duration: ${result.duration.toFixed(2)} minutes\n`);

  console.log('📈 STATISTICS:');
  console.log(`  • Stack Overflow Solutions: ${result.statistics.totalStackOverflowSolutions.toLocaleString()}`);
  console.log(`  • Related Issues: ${result.statistics.totalRelatedIssues.toLocaleString()}`);
  console.log(`  • Community Views: ${result.statistics.totalCommunityViews.toLocaleString()}`);
  console.log(`  • Solution Coverage: ${result.statistics.solutionCoverage}`);
  console.log(`  • Accepted Answer Rate: ${result.statistics.acceptedAnswerRate}`);
  console.log(`  • Average Confidence: ${result.statistics.averageConfidence.toFixed(1)}%\n`);

  console.log('🎯 COMPLEXITY DISTRIBUTION:');
  console.log(`  • ⚡ Low (Quick Fixes): ${result.statistics.complexityDistribution.low}`);
  console.log(`  • 🔧 Medium (Standard): ${result.statistics.complexityDistribution.medium}`);
  console.log(`  • 🧩 High (Complex): ${result.statistics.complexityDistribution.high}\n`);

  console.log('💡 KEY INSIGHTS:');
  console.log(`  • ${result.statistics.issuesWithSolutions} issues have Stack Overflow solutions`);
  console.log(`  • ${result.statistics.issuesWithAcceptedAnswers} issues have accepted answers`);
  console.log(`  • Average ${(result.statistics.totalStackOverflowSolutions / result.analyzedIssues).toFixed(1)} solutions per issue`);
  console.log(`  • Average ${(result.statistics.totalRelatedIssues / result.analyzedIssues).toFixed(1)} related issues per issue\n`);
}

main();

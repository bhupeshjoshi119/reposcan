#!/usr/bin/env node

import { DeepIssueAnalyzer } from '../services/deepIssueAnalyzer.js';
import { BeautifulPDFGenerator } from '../services/pdfGenerator.js';
import * as fs from 'fs';
import * as readline from 'readline';
import 'dotenv/config';

/**
 * CLI tool to analyze specific GitHub issues
 * Usage: npm run analyze-issue <github-issue-url>
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🔍 Deep Issue Analyzer CLI Tool                          ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
  npm run analyze-issue <github-issue-url>

Examples:
  npm run analyze-issue https://github.com/flutter/flutter/issues/12345
  npm run analyze-issue https://github.com/facebook/react/issues/67890

Environment Variables:
  GITHUB_TOKEN - Your GitHub personal access token (required)
  STACK_EXCHANGE_KEY - Your Stack Exchange API key (optional, increases rate limit)

Features:
  ✅ Deep analysis of any GitHub issue
  ✅ Comprehensive Stack Overflow search
  ✅ Related issues discovery
  ✅ Direct solution links
  ✅ Estimated resolution time
  ✅ Step-by-step approach
  ✅ Beautiful PDF report

The tool will:
  1. Fetch complete issue data (comments, events, timeline)
  2. Extract errors, stack traces, and technologies
  3. Perform deep Stack Overflow search (4 strategies)
  4. Find related issues in the repository
  5. Generate comprehensive analysis
  6. Create detailed PDF report
  7. Provide direct links to solutions

Perfect for:
  • Large repositories (10k+ issues like Flutter)
  • Complex issues requiring deep investigation
  • Learning from community solutions
  • Quick issue resolution
    `);
    process.exit(0);
  }

  const issueUrl = args[0];
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

  console.log('🚀 Starting deep issue analysis...\n');
  console.log(`📋 Issue URL: ${issueUrl}\n`);

  try {
    const analyzer = new DeepIssueAnalyzer(githubToken, stackExchangeKey);
    
    // Analyze the issue
    const analysis = await analyzer.analyzeIssueByUrl(issueUrl);

    // Display results
    displayResults(analysis);

    // Generate main PDF report
    console.log('\n📄 Generating PDF reports...');
    const pdfContent = generatePDFContent(analysis);
    const pdfGenerator = new BeautifulPDFGenerator();
    const pdf = pdfGenerator.generatePDF(pdfContent);

    const mainFilename = `issue-${analysis.issue.number}-analysis.pdf`;
    pdf.save(mainFilename);
    console.log(`✅ Main report saved: ${mainFilename}`);

    // Generate individual solution PDFs
    if (analysis.stackOverflowSolutions && analysis.stackOverflowSolutions.length > 0) {
      console.log(`\n📄 Generating ${analysis.stackOverflowSolutions.length} solution PDFs...`);
      
      for (let i = 0; i < analysis.stackOverflowSolutions.length; i++) {
        const solution = analysis.stackOverflowSolutions[i];
        const solutionPdfContent = generateSolutionPDFContent(analysis, solution, i + 1);
        const solutionPdfGenerator = new BeautifulPDFGenerator();
        const solutionPdf = solutionPdfGenerator.generatePDF(solutionPdfContent);
        
        const solutionFilename = `solution-${i + 1}.pdf`;
        solutionPdf.save(solutionFilename);
        console.log(`   ✅ ${solutionFilename} - ${solution.question.title.substring(0, 60)}...`);
      }
      
      console.log(`\n✅ Generated ${analysis.stackOverflowSolutions.length + 1} PDF files total`);
    } else {
      console.log('\n💡 No Stack Overflow solutions found - only main report generated');
    }

    console.log(`\n🎉 Analysis complete!`);

  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

function displayResults(analysis: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                           📊 ANALYSIS RESULTS');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log(`📋 Issue: #${analysis.issue.number} - ${analysis.issue.title}`);
  console.log(`🔗 URL: ${analysis.issue.html_url}`);
  console.log(`📊 State: ${analysis.issue.state.toUpperCase()}`);
  console.log(`💬 Comments: ${analysis.issue.comments}`);
  console.log(`👍 Reactions: ${analysis.issue.reactions.total_count}\n`);

  console.log('🔍 SEARCH TERMS EXTRACTED:');
  console.log(`  • Error Messages: ${analysis.searchTerms.errorMessages.length}`);
  console.log(`  • Stack Traces: ${analysis.searchTerms.stackTraces.length}`);
  console.log(`  • Technologies: ${analysis.searchTerms.technologies.join(', ')}`);
  console.log(`  • Exception Types: ${analysis.searchTerms.exceptionTypes.join(', ')}\n`);

  console.log('💡 STACK OVERFLOW SOLUTIONS:');
  console.log(`  Found ${analysis.stackOverflowSolutions.length} relevant solutions\n`);
  
  analysis.stackOverflowSolutions.slice(0, 5).forEach((sol: any, i: number) => {
    const relevanceEmoji = sol.relevanceScore >= 90 ? '🟢' : sol.relevanceScore >= 70 ? '🟡' : '🟠';
    console.log(`  ${i + 1}. ${relevanceEmoji} ${sol.question.title}`);
    console.log(`     Relevance: ${sol.relevanceScore}% | Strategy: ${sol.searchStrategy}`);
    console.log(`     Score: ${sol.question.score} | Views: ${sol.question.view_count.toLocaleString()}`);
    console.log(`     Answers: ${sol.question.answer_count} | Accepted: ${sol.question.is_answered ? '✅' : '❌'}`);
    console.log(`     Link: ${sol.question.link}\n`);
  });

  console.log('🔗 RELATED ISSUES:');
  console.log(`  Found ${analysis.relatedIssues.length} related issues\n`);
  
  analysis.relatedIssues.slice(0, 5).forEach((issue: any, i: number) => {
    const stateEmoji = issue.state === 'closed' ? '✅' : '🔓';
    console.log(`  ${i + 1}. ${stateEmoji} #${issue.number}: ${issue.title}`);
    console.log(`     ${issue.html_url}\n`);
  });

  console.log('📈 ANALYSIS:');
  console.log(`  • Complexity: ${analysis.analysis.complexity}`);
  console.log(`  • Solvability: ${analysis.analysis.solvability}`);
  console.log(`  • Estimated Time: ${analysis.analysis.estimatedTime}`);
  console.log(`  • Confidence: ${analysis.analysis.confidence}%`);
  console.log(`  • Community Interest: ${analysis.analysis.communityInterest.toLocaleString()} views\n`);

  console.log('🎯 RECOMMENDED APPROACH:');
  analysis.analysis.recommendedApproach.forEach((step: string) => {
    console.log(`  ${step}`);
  });
  console.log();

  console.log('💡 KEY INSIGHTS:');
  analysis.analysis.insights.forEach((insight: string) => {
    console.log(`  • ${insight}`);
  });
  console.log();

  console.log('🔗 QUICK LINKS:');
  console.log(`  • GitHub Issue: ${analysis.directLinks.githubIssue}`);
  console.log(`  • Google Search: ${analysis.directLinks.searchUrls.googleSearch}`);
  console.log(`  • Stack Overflow Search: ${analysis.directLinks.searchUrls.stackOverflowSearch}`);
  console.log(`  • GitHub Search: ${analysis.directLinks.searchUrls.githubSearch}\n`);
}

function generateSolutionPDFContent(analysis: any, solution: any, solutionNumber: number): any {
  // Generate PDF for individual Stack Overflow solution
  return {
    title: `Solution ${solutionNumber} for Issue #${analysis.issue.number}`,
    sections: [
      {
        heading: '📋 GitHub Issue',
        content: [
          { type: 'bold', content: `Issue #${analysis.issue.number}` },
          { type: 'text', content: analysis.issue.title },
          { type: 'text', content: ' ' },
          { type: 'text', content: `State: ${analysis.issue.state.toUpperCase()}` },
          { type: 'link', content: analysis.issue.html_url },
        ],
        level: 1
      },
      {
        heading: '💡 Stack Overflow Solution',
        content: [
          { type: 'highlight', content: solution.question.title },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'Solution Quality:' },
          { type: 'text', content: `Relevance Score: ${solution.relevanceScore}%` },
          { type: 'text', content: `Search Strategy: ${solution.searchStrategy}` },
          { type: 'text', content: `Community Score: ${solution.question.score}` },
          { type: 'text', content: `Views: ${solution.question.view_count.toLocaleString()}` },
          { type: 'text', content: `Answers: ${solution.question.answer_count}` },
          { type: 'text', content: `Accepted Answer: ${solution.question.is_answered ? 'Yes ✅' : 'No ❌'}` },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'Tags:' },
          { type: 'text', content: solution.question.tags.join(', ') },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'View Full Solution:' },
          { type: 'link', content: solution.question.link },
        ],
        level: 1
      },
      {
        heading: '🎯 Why This Solution is Relevant',
        content: [
          { type: 'text', content: `This solution was found using the "${solution.searchStrategy}" search strategy.` },
          { type: 'text', content: `It has a relevance score of ${solution.relevanceScore}%, indicating ${solution.relevanceScore >= 90 ? 'excellent' : solution.relevanceScore >= 70 ? 'good' : 'moderate'} match with your issue.` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `The Stack Overflow community has given this question a score of ${solution.question.score}, and it has been viewed ${solution.question.view_count.toLocaleString()} times.` },
          { type: 'text', content: solution.question.is_answered ? 'This question has an accepted answer, which typically indicates a working solution.' : 'While this question doesn\'t have an accepted answer yet, the community discussion may still provide valuable insights.' },
        ],
        level: 1
      },
      {
        heading: '📝 How to Use This Solution',
        content: [
          { type: 'bullet', content: 'Click the link above to view the full Stack Overflow discussion' },
          { type: 'bullet', content: 'Read through the accepted answer (if available) and top-voted answers' },
          { type: 'bullet', content: 'Check the comments for additional insights and edge cases' },
          { type: 'bullet', content: 'Adapt the solution to your specific use case' },
          { type: 'bullet', content: 'Test thoroughly in your environment' },
          { type: 'bullet', content: 'Consider contributing back if you find improvements' },
        ],
        level: 1
      },
      {
        heading: '🔗 Quick Links',
        content: [
          { type: 'bold', content: 'Stack Overflow Solution:' },
          { type: 'link', content: solution.question.link },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'GitHub Issue:' },
          { type: 'link', content: analysis.issue.html_url },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'Search on Google:' },
          { type: 'link', content: `https://www.google.com/search?q=${encodeURIComponent(solution.question.title)}` },
        ],
        level: 1
      }
    ],
    metadata: {
      author: 'Deep Issue Analyzer',
      subject: `Solution ${solutionNumber} for Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Stack Overflow', 'Solution', ...solution.question.tags],
      createdAt: new Date(),
    }
  };
}

function generatePDFContent(analysis: any): any {
  // Generate comprehensive PDF content
  return {
    title: `Deep Analysis: Issue #${analysis.issue.number}`,
    sections: [
      {
        heading: '📋 Issue Overview',
        content: [
          { type: 'highlight', content: `Issue #${analysis.issue.number}: ${analysis.issue.title}` },
          { type: 'text', content: `State: ${analysis.issue.state.toUpperCase()}` },
          { type: 'text', content: `Comments: ${analysis.issue.comments}` },
          { type: 'text', content: `Reactions: ${analysis.issue.reactions.total_count}` },
          { type: 'link', content: analysis.issue.html_url },
        ],
        level: 1
      },
      {
        heading: '💡 Stack Overflow Solutions',
        content: analysis.stackOverflowSolutions.flatMap((sol: any) => [
          { type: 'bold', content: sol.question.title },
          { type: 'text', content: `Relevance: ${sol.relevanceScore}% | Strategy: ${sol.searchStrategy}` },
          { type: 'text', content: `Score: ${sol.question.score} | Views: ${sol.question.view_count.toLocaleString()}` },
          { type: 'link', content: sol.question.link },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      },
      {
        heading: '🔗 Related Issues',
        content: analysis.relatedIssues.flatMap((issue: any) => [
          { type: 'bold', content: `#${issue.number}: ${issue.title}` },
          { type: 'text', content: `State: ${issue.state}` },
          { type: 'link', content: issue.html_url },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      },
      {
        heading: '📈 Analysis',
        content: [
          { type: 'bold', content: 'Complexity:' },
          { type: 'text', content: analysis.analysis.complexity },
          { type: 'bold', content: 'Solvability:' },
          { type: 'text', content: analysis.analysis.solvability },
          { type: 'bold', content: 'Estimated Time:' },
          { type: 'text', content: analysis.analysis.estimatedTime },
          { type: 'bold', content: 'Confidence:' },
          { type: 'text', content: `${analysis.analysis.confidence}%` },
        ],
        level: 1
      },
      {
        heading: '🎯 Recommended Approach',
        content: analysis.analysis.recommendedApproach.map((step: string) => ({
          type: 'bullet',
          content: step
        })),
        level: 1
      }
    ],
    metadata: {
      author: 'Deep Issue Analyzer',
      subject: `Analysis of Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Analysis', 'Stack Overflow', 'Solutions'],
      createdAt: new Date(),
    }
  };
}

main();

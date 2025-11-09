#!/usr/bin/env node

import 'dotenv/config';
import * as readline from 'readline';
import * as fs from 'fs';
import { DeepIssueAnalyzer } from '../services/deepIssueAnalyzer.js';
import { BeautifulPDFGenerator } from '../services/pdfGenerator.js';

/**
 * User-Friendly Solution Finder CLI
 * Built for developers who need quick solutions
 */

interface Solution {
  number: number;
  title: string;
  link: string;
  score: number;
  views: number;
  answers: number;
  accepted: boolean;
  relevance: number;
  strategy: string;
  tags: string[];
}

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║                    🔍 GitHub Issue Solution Finder                          ║
║                                                                              ║
║                    Find Stack Overflow solutions fast!                      ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
`);

  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const issueUrl = args[0];
  let githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    githubToken = await promptForToken();
  }

  try {
    await findAndDisplaySolutions(issueUrl, githubToken);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
Usage:
  npm run find-solutions <github-issue-url>

Examples:
  npm run find-solutions https://github.com/facebook/react/issues/12345
  npm run find-solutions https://github.com/flutter/flutter/issues/67890

What you get:
  ✅ Interactive solution browser
  ✅ Solutions ranked by relevance
  ✅ Quick preview of each solution
  ✅ Direct links to Stack Overflow
  ✅ One-click PDF generation
  ✅ Copy-paste ready commands

Perfect for:
  • Quick problem solving
  • Learning from community
  • Finding proven solutions
  • Saving time debugging
  `);
}

async function promptForToken(): Promise<string> {
  console.log('🔑 GitHub Token Required\n');
  console.log('Get your token at: https://github.com/settings/tokens\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise<string>((resolve) => {
    rl.question('Enter your GitHub token: ', (answer: string) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function findAndDisplaySolutions(issueUrl: string, githubToken: string) {
  console.log('🔍 Analyzing issue and searching for solutions...\n');

  const analyzer = new DeepIssueAnalyzer(githubToken);
  const analysis = await analyzer.analyzeIssueByUrl(issueUrl);

  // Display issue info
  displayIssueHeader(analysis);

  // Check if solutions found
  if (!analysis.stackOverflowSolutions || analysis.stackOverflowSolutions.length === 0) {
    displayNoSolutions(analysis);
    return;
  }

  // Display solutions
  const solutions = formatSolutions(analysis.stackOverflowSolutions);
  displaySolutions(solutions, analysis);

  // Interactive menu
  await interactiveMenu(solutions, analysis);
}

function displayIssueHeader(analysis: any) {
  const stateEmoji = analysis.issue.state === 'open' ? '🔓' : '✅';
  const stateColor = analysis.issue.state === 'open' ? '\x1b[33m' : '\x1b[32m';
  const reset = '\x1b[0m';

  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`${stateEmoji} Issue #${analysis.issue.number} - ${stateColor}${analysis.issue.state.toUpperCase()}${reset}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  console.log(`📋 ${analysis.issue.title}\n`);
  console.log(`🔗 ${analysis.issue.html_url}`);
  console.log(`💬 ${analysis.issue.comments} comments | 👍 ${analysis.issue.reactions.total_count} reactions\n`);
}

function displayNoSolutions(analysis: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                        😔 No Solutions Found');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  
  console.log('We couldn\'t find Stack Overflow solutions for this issue.\n');
  
  console.log('💡 Try these alternatives:\n');
  console.log('1. Search manually on Stack Overflow:');
  console.log(`   https://stackoverflow.com/search?q=${encodeURIComponent(analysis.issue.title)}\n`);
  
  console.log('2. Check related GitHub issues:');
  if (analysis.relatedIssues && analysis.relatedIssues.length > 0) {
    analysis.relatedIssues.slice(0, 3).forEach((issue: any, i: number) => {
      const emoji = issue.state === 'closed' ? '✅' : '🔓';
      console.log(`   ${emoji} #${issue.number}: ${issue.title}`);
      console.log(`      ${issue.html_url}\n`);
    });
  }
  
  console.log('3. Ask the community:');
  console.log('   • Post on Stack Overflow with relevant tags');
  console.log('   • Comment on the GitHub issue');
  console.log('   • Join relevant Discord/Slack communities\n');
}

function formatSolutions(rawSolutions: any[]): Solution[] {
  return rawSolutions.map((sol, index) => ({
    number: index + 1,
    title: sol.question.title,
    link: sol.question.link,
    score: sol.question.score,
    views: sol.question.view_count,
    answers: sol.question.answer_count,
    accepted: sol.question.is_answered,
    relevance: sol.relevanceScore,
    strategy: sol.searchStrategy,
    tags: sol.question.tags || []
  }));
}

function displaySolutions(solutions: Solution[], analysis: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`                    💡 Found ${solutions.length} Stack Overflow Solutions`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  solutions.forEach((sol) => {
    displaySolutionCard(sol);
  });
}

function displaySolutionCard(sol: Solution) {
  // Relevance indicator
  const relevanceColor = sol.relevance >= 90 ? '\x1b[32m' : sol.relevance >= 70 ? '\x1b[33m' : '\x1b[36m';
  const relevanceLabel = sol.relevance >= 90 ? '🟢 EXCELLENT' : sol.relevance >= 70 ? '🟡 GOOD' : '🔵 MODERATE';
  const reset = '\x1b[0m';
  
  console.log(`┌─────────────────────────────────────────────────────────────────────────────┐`);
  console.log(`│ ${relevanceColor}${relevanceLabel}${reset} - Solution #${sol.number} (${sol.relevance}% match)`);
  console.log(`├─────────────────────────────────────────────────────────────────────────────┤`);
  console.log(`│`);
  console.log(`│ 📝 ${truncate(sol.title, 70)}`);
  console.log(`│`);
  console.log(`│ 📊 Quality Metrics:`);
  console.log(`│    Score: ${sol.score} | Views: ${formatNumber(sol.views)} | Answers: ${sol.answers}`);
  console.log(`│    Accepted Answer: ${sol.accepted ? '✅ Yes' : '❌ No'}`);
  console.log(`│`);
  console.log(`│ 🏷️  Tags: ${sol.tags.slice(0, 5).join(', ')}`);
  console.log(`│`);
  console.log(`│ 🔗 ${sol.link}`);
  console.log(`│`);
  console.log(`└─────────────────────────────────────────────────────────────────────────────┘\n`);
}

async function interactiveMenu(solutions: Solution[], analysis: any) {
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log('                            🎯 What would you like to do?');
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log('Options:');
  console.log('  1️⃣  View solution #1 (highest relevance)');
  console.log('  2️⃣  View solution #2');
  console.log('  3️⃣  View solution #3');
  console.log('  📄 Generate PDF reports for all solutions');
  console.log('  🔗 Open all solutions in browser');
  console.log('  📋 Copy solution links to clipboard');
  console.log('  ❌ Exit\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  const choice = await new Promise<string>((resolve) => {
    rl.question('Enter your choice (1-3, pdf, open, copy, exit): ', (answer: string) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });

  await handleChoice(choice, solutions, analysis);
}

async function handleChoice(choice: string, solutions: Solution[], analysis: any) {
  switch (choice) {
    case '1':
    case '2':
    case '3':
      const num = parseInt(choice);
      if (num <= solutions.length) {
        displayDetailedSolution(solutions[num - 1], analysis);
      } else {
        console.log(`\n❌ Solution #${num} not found. Only ${solutions.length} solutions available.\n`);
      }
      break;

    case 'pdf':
      await generateAllPDFs(solutions, analysis);
      break;

    case 'open':
      openAllInBrowser(solutions);
      break;

    case 'copy':
      copyLinksToClipboard(solutions);
      break;

    case 'exit':
      console.log('\n👋 Thanks for using Solution Finder!\n');
      process.exit(0);
      break;

    default:
      console.log('\n❌ Invalid choice. Please try again.\n');
      await interactiveMenu(solutions, analysis);
  }
}

function displayDetailedSolution(sol: Solution, analysis: any) {
  console.log('\n═══════════════════════════════════════════════════════════════════════════════');
  console.log(`                    📖 Detailed View - Solution #${sol.number}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  console.log(`📝 Title:\n   ${sol.title}\n`);

  console.log(`🎯 Relevance: ${sol.relevance}%`);
  console.log(`   ${sol.relevance >= 90 ? '🟢 Excellent match - highly likely to solve your issue' : 
              sol.relevance >= 70 ? '🟡 Good match - worth trying' : 
              '🔵 Moderate match - may provide insights'}\n`);

  console.log(`📊 Community Validation:`);
  console.log(`   • Score: ${sol.score} (community votes)`);
  console.log(`   • Views: ${formatNumber(sol.views)} developers viewed this`);
  console.log(`   • Answers: ${sol.answers} solutions provided`);
  console.log(`   • Accepted: ${sol.accepted ? '✅ Yes (verified solution)' : '❌ No (review all answers)'}\n`);

  console.log(`🔍 Search Strategy: ${sol.strategy}\n`);

  console.log(`🏷️  Related Technologies:`);
  console.log(`   ${sol.tags.join(', ')}\n`);

  console.log(`🔗 View on Stack Overflow:`);
  console.log(`   ${sol.link}\n`);

  console.log(`💡 Quick Actions:`);
  console.log(`   • Open in browser: open "${sol.link}"`);
  console.log(`   • Generate PDF: Will be created if you choose 'pdf' option`);
  console.log(`   • Copy link: ${sol.link}\n`);

  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // Ask if they want to continue
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.question('Press Enter to return to menu...', () => {
    rl.close();
    interactiveMenu([sol], analysis);
  });
}

async function generateAllPDFs(solutions: Solution[], analysis: any) {
  console.log('\n📄 Generating PDF reports...\n');

  // Generate main report
  const pdfContent = generateMainPDFContent(analysis);
  const pdfGenerator = new BeautifulPDFGenerator();
  const pdf = pdfGenerator.generatePDF(pdfContent);
  const mainFilename = `issue-${analysis.issue.number}-analysis.pdf`;
  pdf.save(mainFilename);
  console.log(`✅ Main report: ${mainFilename}`);

  // Generate solution PDFs
  for (let i = 0; i < solutions.length; i++) {
    const sol = solutions[i];
    const solutionPdfContent = generateSolutionPDFContent(analysis, sol, i + 1);
    const solutionPdfGenerator = new BeautifulPDFGenerator();
    const solutionPdf = solutionPdfGenerator.generatePDF(solutionPdfContent);
    const solutionFilename = `solution-${i + 1}.pdf`;
    solutionPdf.save(solutionFilename);
    console.log(`✅ Solution #${i + 1}: ${solutionFilename}`);
  }

  console.log(`\n✅ Generated ${solutions.length + 1} PDF files\n`);
  console.log('📁 Files created:');
  console.log(`   • ${mainFilename} - Complete analysis`);
  solutions.forEach((_, i) => {
    console.log(`   • solution-${i + 1}.pdf - Solution #${i + 1}`);
  });
  console.log('\n');
}

function openAllInBrowser(solutions: Solution[]) {
  console.log('\n🌐 Opening solutions in browser...\n');
  
  solutions.forEach((sol, i) => {
    console.log(`Opening solution #${i + 1}...`);
    // Note: This would require platform-specific commands
    console.log(`   ${sol.link}`);
  });

  console.log('\n💡 Copy these commands to open in your browser:\n');
  solutions.forEach((sol, i) => {
    console.log(`# Solution ${i + 1}`);
    console.log(`open "${sol.link}"\n`);
  });
}

function copyLinksToClipboard(solutions: Solution[]) {
  console.log('\n📋 Solution Links:\n');
  
  solutions.forEach((sol, i) => {
    console.log(`Solution #${i + 1}:`);
    console.log(`${sol.link}\n`);
  });

  console.log('💡 Copy the links above to share with your team!\n');
}

function generateMainPDFContent(analysis: any): any {
  return {
    title: `Issue #${analysis.issue.number} - Solutions`,
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
        heading: '💡 Stack Overflow Solutions',
        content: analysis.stackOverflowSolutions.flatMap((sol: any, i: number) => [
          { type: 'bold', content: `Solution ${i + 1}: ${sol.question.title}` },
          { type: 'text', content: `Relevance: ${sol.relevanceScore}%` },
          { type: 'text', content: `Score: ${sol.question.score} | Views: ${sol.question.view_count.toLocaleString()}` },
          { type: 'link', content: sol.question.link },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      }
    ],
    metadata: {
      author: 'Solution Finder',
      subject: `Solutions for Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Stack Overflow', 'Solutions'],
      createdAt: new Date(),
    }
  };
}

function generateSolutionPDFContent(analysis: any, sol: Solution, solutionNumber: number): any {
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
          { type: 'highlight', content: sol.title },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'Solution Quality:' },
          { type: 'text', content: `Relevance Score: ${sol.relevance}%` },
          { type: 'text', content: `Search Strategy: ${sol.strategy}` },
          { type: 'text', content: `Community Score: ${sol.score}` },
          { type: 'text', content: `Views: ${formatNumber(sol.views)}` },
          { type: 'text', content: `Answers: ${sol.answers}` },
          { type: 'text', content: `Accepted Answer: ${sol.accepted ? 'Yes ✅' : 'No ❌'}` },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'Tags:' },
          { type: 'text', content: sol.tags.join(', ') },
          { type: 'text', content: ' ' },
          { type: 'bold', content: 'View Full Solution:' },
          { type: 'link', content: sol.link },
        ],
        level: 1
      },
      {
        heading: '🎯 Why This Solution is Relevant',
        content: [
          { type: 'text', content: `This solution was found using the "${sol.strategy}" search strategy.` },
          { type: 'text', content: `It has a relevance score of ${sol.relevance}%, indicating ${sol.relevance >= 90 ? 'excellent' : sol.relevance >= 70 ? 'good' : 'moderate'} match with your issue.` },
          { type: 'text', content: ' ' },
          { type: 'text', content: `The Stack Overflow community has given this question a score of ${sol.score}, and it has been viewed ${formatNumber(sol.views)} times.` },
          { type: 'text', content: sol.accepted ? 'This question has an accepted answer, which typically indicates a working solution.' : 'While this question doesn\'t have an accepted answer yet, the community discussion may still provide valuable insights.' },
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
      }
    ],
    metadata: {
      author: 'Solution Finder',
      subject: `Solution ${solutionNumber} for Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Stack Overflow', 'Solution', ...sol.tags],
      createdAt: new Date(),
    }
  };
}

// Helper functions
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

main();

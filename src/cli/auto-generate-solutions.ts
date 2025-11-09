#!/usr/bin/env node

import 'dotenv/config';
import * as fs from 'fs';
import { DeepIssueAnalyzer } from '../services/deepIssueAnalyzer.js';
import { BeautifulPDFGenerator } from '../services/pdfGenerator.js';

/**
 * Auto-Generate Solution PDFs
 * Non-interactive version that automatically generates all PDFs
 */

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║              🤖 Auto-Generate Solution PDFs                                 ║
║                                                                              ║
║              Automatically generates PDFs for all solutions                 ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

Usage:
  npm run auto-solutions <github-issue-url>

Examples:
  npm run auto-solutions https://github.com/facebook/react/issues/12345
  npm run auto-solutions https://github.com/langchain-ai/langchain/issues/33898

What you get:
  ✅ Automatic PDF generation (no interaction needed)
  ✅ Main analysis PDF
  ✅ Individual solution PDFs (if solutions found)
  ✅ Clear verification of what was generated
  ✅ File list with timestamps

Perfect for:
  • Batch processing
  • Automation scripts
  • CI/CD pipelines
  • Quick PDF generation
    `);
    process.exit(0);
  }

  const issueUrl = args[0];
  let githubToken = process.env.GITHUB_TOKEN;

  if (!githubToken) {
    console.error('\n❌ GitHub token required');
    console.error('Set it with: export GITHUB_TOKEN=your_token');
    console.error('Get token at: https://github.com/settings/tokens\n');
    process.exit(1);
  }

  try {
    await autoGeneratePDFs(issueUrl, githubToken);
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

async function autoGeneratePDFs(issueUrl: string, githubToken: string) {
  console.log('\n🤖 Auto-generating PDFs...\n');
  console.log(`📋 Issue URL: ${issueUrl}\n`);

  // Analyze issue
  console.log('🔍 Step 1/3: Analyzing issue...');
  const analyzer = new DeepIssueAnalyzer(githubToken);
  const analysis = await analyzer.analyzeIssueByUrl(issueUrl);
  console.log(`✅ Analysis complete\n`);

  // Display issue info
  console.log('═══════════════════════════════════════════════════════════════════════════════');
  console.log(`📋 Issue #${analysis.issue.number}: ${analysis.issue.title}`);
  console.log(`📊 State: ${analysis.issue.state.toUpperCase()}`);
  console.log(`💬 Comments: ${analysis.issue.comments} | 👍 Reactions: ${analysis.issue.reactions.total_count}`);
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');

  // Generate main PDF
  console.log('📄 Step 2/3: Generating main analysis PDF...');
  const mainPdfContent = generateMainPDFContent(analysis);
  const mainPdfGenerator = new BeautifulPDFGenerator();
  const mainPdf = mainPdfGenerator.generatePDF(mainPdfContent);
  const mainFilename = `issue-${analysis.issue.number}-analysis.pdf`;
  mainPdf.save(mainFilename);
  console.log(`✅ Main PDF: ${mainFilename}\n`);

  // Generate solution PDFs
  const solutionCount = analysis.stackOverflowSolutions?.length || 0;
  
  if (solutionCount > 0) {
    console.log(`📄 Step 3/3: Generating ${solutionCount} solution PDFs...\n`);
    
    const generatedFiles: string[] = [mainFilename];
    
    for (let i = 0; i < solutionCount; i++) {
      const solution = analysis.stackOverflowSolutions[i];
      const solutionPdfContent = generateSolutionPDFContent(analysis, solution, i + 1);
      const solutionPdfGenerator = new BeautifulPDFGenerator();
      const solutionPdf = solutionPdfGenerator.generatePDF(solutionPdfContent);
      
      const solutionFilename = `solution-${i + 1}-issue-${analysis.issue.number}.pdf`;
      solutionPdf.save(solutionFilename);
      generatedFiles.push(solutionFilename);
      
      const relevanceEmoji = solution.relevanceScore >= 90 ? '🟢' : solution.relevanceScore >= 70 ? '🟡' : '🔵';
      console.log(`   ${relevanceEmoji} ${solutionFilename}`);
      console.log(`      ${truncate(solution.question.title, 70)}`);
      console.log(`      Relevance: ${solution.relevanceScore}% | Score: ${solution.question.score} | Views: ${formatNumber(solution.question.view_count)}\n`);
    }
    
    console.log(`✅ Generated ${generatedFiles.length} PDF files total\n`);
    
    // Verification section
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                          ✅ VERIFICATION');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
    console.log('📁 Files Generated:\n');
    for (const file of generatedFiles) {
      try {
        const stats = fs.statSync(file);
        const sizeMB = (stats.size / 1024).toFixed(1);
        const time = stats.mtime.toLocaleTimeString();
        console.log(`   ✅ ${file}`);
        console.log(`      Size: ${sizeMB} KB | Created: ${time}\n`);
      } catch (err) {
        console.log(`   ❌ ${file} - NOT FOUND\n`);
      }
    }
    
    console.log('🎯 Quick Commands:\n');
    console.log(`   # View main analysis`);
    console.log(`   open ${mainFilename}\n`);
    console.log(`   # View best solution (highest relevance)`);
    console.log(`   open solution-1-issue-${analysis.issue.number}.pdf\n`);
    console.log(`   # List all PDFs for this issue`);
    console.log(`   ls -lh *${analysis.issue.number}*.pdf\n`);
    
  } else {
    console.log('📄 Step 3/3: Checking for solutions...');
    console.log('💡 No Stack Overflow solutions found\n');
    
    console.log('═══════════════════════════════════════════════════════════════════════════════');
    console.log('                          ℹ️  NO SOLUTIONS FOUND');
    console.log('═══════════════════════════════════════════════════════════════════════════════\n');
    
    console.log('📁 File Generated:\n');
    try {
      const stats = fs.statSync(mainFilename);
      const sizeMB = (stats.size / 1024).toFixed(1);
      const time = stats.mtime.toLocaleTimeString();
      console.log(`   ✅ ${mainFilename}`);
      console.log(`      Size: ${sizeMB} KB | Created: ${time}\n`);
    } catch (err) {
      console.log(`   ❌ ${mainFilename} - NOT FOUND\n`);
    }
    
    console.log('💡 Why no solution PDFs?\n');
    console.log('   • No Stack Overflow solutions found for this issue');
    console.log('   • This could be because:');
    console.log('     - Issue is too new');
    console.log('     - Issue is very specific to this project');
    console.log('     - Issue is a feature request (not a bug)');
    console.log('     - Stack Overflow API didn\'t return results\n');
    
    console.log('🎯 What you can do:\n');
    console.log('   1. Review the main analysis PDF:');
    console.log(`      open ${mainFilename}\n`);
    console.log('   2. Check related GitHub issues (listed in PDF)\n');
    console.log('   3. Search Stack Overflow manually:');
    console.log(`      open "https://stackoverflow.com/search?q=${encodeURIComponent(analysis.issue.title)}"\n`);
    console.log('   4. Try a different issue with known solutions:');
    console.log('      npm run auto-solutions https://github.com/facebook/react/issues/14099\n');
  }
  
  console.log('═══════════════════════════════════════════════════════════════════════════════\n');
  console.log('🎉 Done!\n');
}

function generateMainPDFContent(analysis: any): any {
  return {
    title: `Issue #${analysis.issue.number} - Analysis`,
    sections: [
      {
        heading: '📋 GitHub Issue',
        content: [
          { type: 'bold', content: `Issue #${analysis.issue.number}` },
          { type: 'text', content: analysis.issue.title },
          { type: 'text', content: ' ' },
          { type: 'text', content: `State: ${analysis.issue.state.toUpperCase()}` },
          { type: 'text', content: `Comments: ${analysis.issue.comments}` },
          { type: 'text', content: `Reactions: ${analysis.issue.reactions.total_count}` },
          { type: 'text', content: ' ' },
          { type: 'link', content: analysis.issue.html_url },
        ],
        level: 1
      },
      {
        heading: '💡 Stack Overflow Solutions',
        content: analysis.stackOverflowSolutions && analysis.stackOverflowSolutions.length > 0
          ? analysis.stackOverflowSolutions.flatMap((sol: any, i: number) => [
              { type: 'bold', content: `Solution ${i + 1}: ${sol.question.title}` },
              { type: 'text', content: `Relevance: ${sol.relevanceScore}%` },
              { type: 'text', content: `Score: ${sol.question.score} | Views: ${sol.question.view_count.toLocaleString()}` },
              { type: 'link', content: sol.question.link },
              { type: 'text', content: ' ' },
            ])
          : [{ type: 'text', content: 'No Stack Overflow solutions found for this issue.' }],
        level: 1
      },
      {
        heading: '🔗 Related Issues',
        content: analysis.relatedIssues && analysis.relatedIssues.length > 0
          ? analysis.relatedIssues.slice(0, 5).flatMap((issue: any) => [
              { type: 'bold', content: `#${issue.number}: ${issue.title}` },
              { type: 'text', content: `State: ${issue.state}` },
              { type: 'link', content: issue.html_url },
              { type: 'text', content: ' ' },
            ])
          : [{ type: 'text', content: 'No related issues found.' }],
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
      }
    ],
    metadata: {
      author: 'Auto Solution Generator',
      subject: `Analysis of Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Analysis', 'Stack Overflow'],
      createdAt: new Date(),
    }
  };
}

function generateSolutionPDFContent(analysis: any, solution: any, solutionNumber: number): any {
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
          { type: 'text', content: `Views: ${formatNumber(solution.question.view_count)}` },
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
          { type: 'text', content: `The Stack Overflow community has given this question a score of ${solution.question.score}, and it has been viewed ${formatNumber(solution.question.view_count)} times.` },
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
      }
    ],
    metadata: {
      author: 'Auto Solution Generator',
      subject: `Solution ${solutionNumber} for Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Stack Overflow', 'Solution', ...solution.question.tags],
      createdAt: new Date(),
    }
  };
}

function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

main();

#!/usr/bin/env node

/**
 * Test script to demonstrate solution PDF generation
 * This creates mock data to show how the feature works
 */

import { BeautifulPDFGenerator } from './src/services/pdfGenerator';

// Mock analysis data with Stack Overflow solutions
const mockAnalysis = {
  issue: {
    number: 12345,
    title: 'React hooks causing infinite re-renders',
    state: 'open',
    html_url: 'https://github.com/facebook/react/issues/12345',
    comments: 15,
    reactions: { total_count: 42 }
  },
  stackOverflowSolutions: [
    {
      question: {
        title: 'React useEffect causing infinite loop',
        link: 'https://stackoverflow.com/questions/53070970/infinite-loop-in-useeffect',
        score: 245,
        view_count: 125000,
        answer_count: 8,
        is_answered: true,
        tags: ['reactjs', 'react-hooks', 'useeffect']
      },
      relevanceScore: 95,
      searchStrategy: 'Error message exact match'
    },
    {
      question: {
        title: 'How to fix infinite re-renders in React',
        link: 'https://stackoverflow.com/questions/54954385/react-useeffect-causing-infinite-loop',
        score: 189,
        view_count: 98000,
        answer_count: 12,
        is_answered: true,
        tags: ['reactjs', 'hooks', 'infinite-loop']
      },
      relevanceScore: 88,
      searchStrategy: 'Title similarity search'
    },
    {
      question: {
        title: 'React hooks dependency array best practices',
        link: 'https://stackoverflow.com/questions/55840294/how-to-fix-missing-dependency-warning-when-using-useeffect-react-hook',
        score: 156,
        view_count: 75000,
        answer_count: 6,
        is_answered: true,
        tags: ['reactjs', 'react-hooks', 'eslint']
      },
      relevanceScore: 82,
      searchStrategy: 'Technology + keywords'
    }
  ]
};

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

async function main() {
  console.log('🧪 Testing Solution PDF Generation\n');
  console.log(`📋 Mock Issue: #${mockAnalysis.issue.number} - ${mockAnalysis.issue.title}`);
  console.log(`💡 Found ${mockAnalysis.stackOverflowSolutions.length} Stack Overflow solutions\n`);
  
  console.log('📄 Generating solution PDFs...\n');
  
  for (let i = 0; i < mockAnalysis.stackOverflowSolutions.length; i++) {
    const solution = mockAnalysis.stackOverflowSolutions[i];
    const solutionPdfContent = generateSolutionPDFContent(mockAnalysis, solution, i + 1);
    const solutionPdfGenerator = new BeautifulPDFGenerator();
    const solutionPdf = solutionPdfGenerator.generatePDF(solutionPdfContent);
    
    const solutionFilename = `solution-${i + 1}.pdf`;
    solutionPdf.save(solutionFilename);
    console.log(`   ✅ ${solutionFilename}`);
    console.log(`      Title: ${solution.question.title}`);
    console.log(`      Relevance: ${solution.relevanceScore}%`);
    console.log(`      Score: ${solution.question.score} | Views: ${solution.question.view_count.toLocaleString()}`);
    console.log(`      Link: ${solution.question.link}\n`);
  }
  
  console.log(`✅ Generated ${mockAnalysis.stackOverflowSolutions.length} solution PDFs`);
  console.log('\n📁 Files created:');
  console.log('   • solution-1.pdf - Highest relevance (95%)');
  console.log('   • solution-2.pdf - High relevance (88%)');
  console.log('   • solution-3.pdf - Good relevance (82%)');
  console.log('\n🎉 Test complete! Open the PDFs to see the results.');
}

main();

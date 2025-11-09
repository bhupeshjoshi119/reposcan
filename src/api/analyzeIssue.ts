import { DeepIssueAnalyzer } from '../services/deepIssueAnalyzer';
import { BeautifulPDFGenerator } from '../services/pdfGenerator';
import * as fs from 'fs';
import * as path from 'path';

/**
 * API endpoint for single issue analysis
 */
export async function analyzeIssueAPI(req: any, res: any) {
  try {
    const { issueUrl, githubToken, stackExchangeKey } = req.body;

    if (!issueUrl || !githubToken) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Analyze issue
    const analyzer = new DeepIssueAnalyzer(githubToken, stackExchangeKey);
    const analysis = await analyzer.analyzeIssueByUrl(issueUrl);

    // Generate PDF
    const pdfContent = generatePDFContent(analysis);
    const pdfGenerator = new BeautifulPDFGenerator();
    const pdf = await pdfGenerator.generatePDF(pdfContent);

    // Save PDF
    const filename = `issue-${analysis.issue.number}-${Date.now()}.pdf`;
    const filepath = path.join(process.cwd(), 'public', 'pdfs', filename);
    
    // Ensure directory exists
    const dir = path.dirname(filepath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save PDF
    if (typeof pdf === 'string') {
      fs.writeFileSync(filepath, Buffer.from(pdf, 'base64'));
    } else {
      (pdf as any).save(filepath);
    }

    // Return result
    res.json({
      success: true,
      totalIssues: 1,
      totalSolutions: analysis.stackOverflowSolutions.length,
      totalRelated: analysis.relatedIssues.length,
      confidence: analysis.analysis.confidence,
      summary: analysis.analysis.summary,
      pdfUrl: `/pdfs/${filename}`,
      analysis
    });
  } catch (error: any) {
    console.error('Error analyzing issue:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
}

function generatePDFContent(analysis: any): any {
  return {
    title: `Analysis: Issue #${analysis.issue.number}`,
    sections: [
      {
        heading: '📋 Issue Overview',
        content: [
          { type: 'highlight', content: `Issue #${analysis.issue.number}: ${analysis.issue.title}` },
          { type: 'text', content: `State: ${analysis.issue.state.toUpperCase()}` },
          { type: 'text', content: `Comments: ${analysis.issue.comments}` },
          { type: 'link', content: analysis.issue.html_url },
        ],
        level: 1
      },
      {
        heading: '💡 Stack Overflow Solutions',
        content: analysis.stackOverflowSolutions.flatMap((sol: any) => [
          { type: 'bold', content: sol.question.title },
          { type: 'text', content: `Relevance: ${sol.relevanceScore}%` },
          { type: 'link', content: sol.question.link },
          { type: 'text', content: ' ' },
        ]),
        level: 1
      },
      {
        heading: '📈 Analysis',
        content: [
          { type: 'bold', content: 'Complexity:' },
          { type: 'text', content: analysis.analysis.complexity },
          { type: 'bold', content: 'Estimated Time:' },
          { type: 'text', content: analysis.analysis.estimatedTime },
          { type: 'bold', content: 'Confidence:' },
          { type: 'text', content: `${analysis.analysis.confidence}%` },
        ],
        level: 1
      }
    ],
    metadata: {
      author: 'Issue Analyzer',
      subject: `Analysis of Issue #${analysis.issue.number}`,
      keywords: ['GitHub', 'Issue', 'Analysis'],
      createdAt: new Date(),
    }
  };
}

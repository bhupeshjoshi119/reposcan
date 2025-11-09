import { BeautifulPDFGenerator, PDFContent } from '@/services/pdfGenerator';

// Demo function to test PDF generation with sample data
export const generateDemoPDF = async (): Promise<void> => {
  const sampleContent: PDFContent = {
    title: 'Beautiful PDF Demo Report',
    sections: [
      {
        heading: 'Executive Summary',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: 'This is a demonstration of our beautiful PDF generation system',
            style: { fontSize: 14 }
          },
          {
            type: 'text',
            content: 'This report showcases all the formatting features available in our PDF generator, including professional styling, dynamic content, and beautiful presentation.'
          },
          {
            type: 'underline',
            content: 'Key Features Demonstrated:',
            style: { fontSize: 13 }
          },
          {
            type: 'bullet',
            content: 'Bold headings for clear structure and hierarchy',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Bullet points for easy reading and scanning',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Highlighted text with yellow background for emphasis',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Underlined important sections and headings',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Professional color scheme and typography',
            style: { indent: 5 }
          }
        ]
      },
      {
        heading: 'Formatting Examples',
        level: 1,
        content: [
          {
            type: 'bold',
            content: 'This is bold text that stands out from regular content'
          },
          {
            type: 'text',
            content: 'This is regular text that provides detailed information and context for the reader.'
          },
          {
            type: 'highlight',
            content: 'This text is highlighted with a yellow background to draw attention'
          },
          {
            type: 'underline',
            content: 'This text is underlined to emphasize its importance'
          },
          {
            type: 'code',
            content: 'const example = "This is a code block with syntax highlighting";'
          },
          {
            type: 'link',
            content: 'https://github.com/example/repository'
          }
        ]
      },
      {
        heading: 'Nested Content Structure',
        level: 1,
        content: [
          {
            type: 'text',
            content: 'Our PDF generator supports complex nested structures with proper indentation:'
          },
          {
            type: 'bullet',
            content: 'Main bullet point with standard indentation',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Sub-bullet point with increased indentation',
            style: { indent: 15 }
          },
          {
            type: 'bullet',
            content: 'Another sub-bullet with detailed information',
            style: { indent: 15 }
          },
          {
            type: 'bullet',
            content: 'Back to main level bullet point',
            style: { indent: 5 }
          }
        ]
      },
      {
        heading: 'Technical Implementation',
        level: 2,
        content: [
          {
            type: 'underline',
            content: 'PDF Generation Features:',
            style: { fontSize: 13 }
          },
          {
            type: 'bullet',
            content: 'Dynamic page breaks and layout management',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Professional typography with multiple font weights',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Color-coded elements for better visual hierarchy',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Clickable links and interactive elements',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Metadata and document properties for Adobe Reader compatibility',
            style: { indent: 5 }
          }
        ]
      },
      {
        heading: 'Integration Capabilities',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: 'GitHub and Stack Overflow Integration'
          },
          {
            type: 'text',
            content: 'Our system seamlessly integrates with external APIs to provide comprehensive analysis:'
          },
          {
            type: 'bold',
            content: 'GitHub Integration:'
          },
          {
            type: 'bullet',
            content: 'Real-time issue analysis and statistics',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Contributor activity and engagement metrics',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Trend analysis and resolution tracking',
            style: { indent: 10 }
          },
          {
            type: 'bold',
            content: 'Stack Overflow Integration:'
          },
          {
            type: 'bullet',
            content: 'Related community discussions and questions',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Answer quality and community engagement analysis',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Documentation gap identification',
            style: { indent: 10 }
          }
        ]
      }
    ],
    metadata: {
      author: 'Beautiful PDF Generator Demo',
      subject: 'Demonstration of PDF formatting capabilities',
      keywords: ['PDF', 'Demo', 'Formatting', 'Beautiful', 'Professional'],
      createdAt: new Date()
    }
  };

  const generator = new BeautifulPDFGenerator();
  await generator.downloadPDF(sampleContent, 'beautiful-pdf-demo.pdf');
};

// Function to generate a sample issue analysis report
export const generateSampleIssueReport = async (): Promise<void> => {
  const sampleIssueContent: PDFContent = {
    title: 'Sample Repository Issue Analysis',
    sections: [
      {
        heading: 'Executive Summary',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: 'Repository: sample-project/awesome-app',
            style: { fontSize: 14 }
          },
          {
            type: 'text',
            content: 'This sample report demonstrates how our system analyzes GitHub repository issues and provides actionable insights.'
          },
          {
            type: 'underline',
            content: 'Key Metrics:',
            style: { fontSize: 13 }
          },
          {
            type: 'bullet',
            content: 'Total Issues Analyzed: 247',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Open Issues: 23 (9.3%)',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Closed Issues: 224 (90.7%)',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Average Resolution Time: 4.2 days',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Critical Issues Identified: 3',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Related Stack Overflow Questions: 8',
            style: { indent: 5 }
          }
        ]
      },
      {
        heading: 'Critical Issues Analysis',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: '3 critical issues require immediate attention'
          },
          {
            type: 'text',
            content: 'Critical issues are identified based on high community engagement, number of reactions, comments, or critical/urgent labels.'
          },
          {
            type: 'bold',
            content: '1. Issue #142: Memory leak in data processing module',
            style: { fontSize: 12 }
          },
          {
            type: 'bullet',
            content: 'Status: OPEN',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Reactions: 15 | Comments: 23',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Created: 2024-10-15',
            style: { indent: 10 }
          },
          {
            type: 'bullet',
            content: 'Labels: bug, critical, performance',
            style: { indent: 10 }
          }
        ]
      },
      {
        heading: 'Stack Overflow Community Analysis',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: 'Stack Overflow Integration Analysis'
          },
          {
            type: 'text',
            content: 'Found 8 related discussions on Stack Overflow, indicating active community engagement and potential documentation gaps.'
          },
          {
            type: 'underline',
            content: 'Stack Overflow Metrics:',
            style: { fontSize: 13 }
          },
          {
            type: 'bullet',
            content: 'Questions with Accepted Answers: 6 (75.0%)',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Total Views: 12,450',
            style: { indent: 5 }
          },
          {
            type: 'bullet',
            content: 'Average Question Score: 3.2',
            style: { indent: 5 }
          }
        ]
      },
      {
        heading: 'Recommendations',
        level: 1,
        content: [
          {
            type: 'highlight',
            content: 'Strategic Recommendations for Issue Management'
          },
          {
            type: 'text',
            content: 'Based on the analysis, the following recommendations can help improve issue management and community engagement:'
          },
          {
            type: 'bold',
            content: '1. Recommendation:',
            style: { fontSize: 12 }
          },
          {
            type: 'bullet',
            content: 'Address the critical memory leak issue (#142) as it has high community engagement and affects performance.',
            style: { indent: 10 }
          },
          {
            type: 'bold',
            content: '2. Recommendation:',
            style: { fontSize: 12 }
          },
          {
            type: 'bullet',
            content: 'Create better documentation based on Stack Overflow questions to reduce community confusion.',
            style: { indent: 10 }
          }
        ]
      }
    ],
    metadata: {
      author: 'GitHub Repository Analyzer',
      subject: 'Sample issue analysis for demonstration',
      keywords: ['GitHub', 'Issues', 'Analysis', 'Sample', 'Demo'],
      createdAt: new Date()
    }
  };

  const generator = new BeautifulPDFGenerator();
  await generator.downloadPDF(sampleIssueContent, 'sample-issue-analysis-report.pdf');
};
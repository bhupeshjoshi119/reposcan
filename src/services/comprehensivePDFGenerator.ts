import { PDFSection, PDFContentItem } from './pdfGenerator';
import { BatchAnalysisResult } from './batchIssueAnalyzer';
import { DeepIssueAnalysis } from './deepIssueAnalyzer';

/**
 * Comprehensive PDF Generator
 * Generates large, detailed PDFs with ALL issues and solutions
 * Perfect for educators and open-source collaboration
 */
export class ComprehensivePDFGenerator {
  
  /**
   * Generate comprehensive PDF content with ALL issues
   */
  static generateComprehensivePDF(result: BatchAnalysisResult): any {
    const sections: PDFSection[] = [];

    // Executive Summary
    sections.push(this.createExecutiveSummary(result));

    // Statistics Overview
    sections.push(this.createStatisticsOverview(result));

    // ALL Issues with Solutions (grouped by complexity)
    sections.push(...this.createAllIssuesSections(result.analyses));

    // Technology Analysis
    sections.push(this.createTechnologyAnalysis(result.analyses));

    // Solution Patterns
    sections.push(this.createSolutionPatterns(result.analyses));

    // Learning Resources
    sections.push(this.createLearningResources(result.analyses));

    // Quick Reference Index
    sections.push(this.createQuickReferenceIndex(result.analyses));

    return {
      title: `Comprehensive Analysis: ${result.repository.owner}/${result.repository.repo}`,
      sections,
      metadata: {
        author: 'Comprehensive Issue Analyzer',
        subject: `Complete analysis of ${result.totalIssues} issues with Stack Overflow solutions`,
        keywords: ['GitHub', 'Issues', 'Stack Overflow', 'Solutions', 'Analysis', 'Education'],
        createdAt: new Date(),
      }
    };
  }

  private static createExecutiveSummary(result: BatchAnalysisResult): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `📊 Comprehensive Analysis: ${result.repository.owner}/${result.repository.repo}`,
      style: { fontSize: 18 }
    });

    content.push({
      type: 'text',
      content: `This comprehensive report analyzes ALL ${result.totalIssues} issues from the repository, providing Stack Overflow solutions, related issues, and detailed analysis for each one. Perfect for educators, developers, and open-source collaboration.`,
    });

    content.push({
      type: 'underline',
      content: '📈 Key Metrics:',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'bullet',
      content: `📋 Total Issues Analyzed: ${result.analyzedIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `💡 Stack Overflow Solutions Found: ${result.statistics.totalStackOverflowSolutions.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔗 Related Issues Discovered: ${result.statistics.totalRelatedIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `👀 Total Community Views: ${result.statistics.totalCommunityViews.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Solution Coverage: ${result.statistics.solutionCoverage}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Average Confidence: ${result.statistics.averageConfidence.toFixed(1)}%`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⏱️  Analysis Duration: ${result.duration.toFixed(2)} minutes`,
      style: { indent: 5 }
    });

    return {
      heading: '🎯 Executive Summary',
      content,
      level: 1
    };
  }

  private static createStatisticsOverview(result: BatchAnalysisResult): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '📊 Comprehensive Statistics',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'underline',
      content: 'Complexity Distribution:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `⚡ Low Complexity: ${result.statistics.complexityDistribution.low} issues (quick fixes)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔧 Medium Complexity: ${result.statistics.complexityDistribution.medium} issues (standard debugging)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🧩 High Complexity: ${result.statistics.complexityDistribution.high} issues (deep investigation)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: 'Solution Quality:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Issues with Solutions: ${result.statistics.issuesWithSolutions} (${result.statistics.solutionCoverage})`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Issues with Accepted Answers: ${result.statistics.issuesWithAcceptedAnswers} (${result.statistics.acceptedAnswerRate})`,
      style: { indent: 5 }
    });

    return {
      heading: '📊 Statistics Overview',
      content,
      level: 1
    };
  }

  private static createAllIssuesSections(analyses: DeepIssueAnalysis[]): PDFSection[] {
    const sections: PDFSection[] = [];

    // Group by complexity
    const lowComplexity = analyses.filter(a => a.analysis.complexity.includes('Low'));
    const mediumComplexity = analyses.filter(a => a.analysis.complexity.includes('Medium'));
    const highComplexity = analyses.filter(a => a.analysis.complexity.includes('High'));

    // Low complexity issues
    if (lowComplexity.length > 0) {
      sections.push(this.createComplexitySection('⚡ Low Complexity Issues - Quick Fixes', lowComplexity));
    }

    // Medium complexity issues
    if (mediumComplexity.length > 0) {
      sections.push(this.createComplexitySection('🔧 Medium Complexity Issues - Standard Debugging', mediumComplexity));
    }

    // High complexity issues
    if (highComplexity.length > 0) {
      sections.push(this.createComplexitySection('🧩 High Complexity Issues - Deep Investigation', highComplexity));
    }

    return sections;
  }

  private static createComplexitySection(title: string, analyses: DeepIssueAnalysis[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: title,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: `This section contains ${analyses.length} issues with detailed analysis, Stack Overflow solutions, and recommended approaches.`,
    });

    // Add ALL issues in this complexity category
    analyses.forEach((analysis, index) => {
      this.addIssueDetails(content, analysis, index + 1);
    });

    return {
      heading: title,
      content,
      level: 1
    };
  }

  private static addIssueDetails(
    content: PDFContentItem[],
    analysis: DeepIssueAnalysis,
    index: number
  ): void {
    const stateEmoji = analysis.issue.state === 'open' ? '🔓' : '✅';

    content.push({
      type: 'bold',
      content: `${index}. ${stateEmoji} Issue #${analysis.issue.number}: ${analysis.issue.title}`,
      style: { fontSize: 12 }
    });

    content.push({
      type: 'bullet',
      content: `🔗 GitHub: ${analysis.issue.html_url}`,
      style: { indent: 10, fontSize: 10 }
    });

    content.push({
      type: 'bullet',
      content: `📊 State: ${analysis.issue.state.toUpperCase()} | Comments: ${analysis.issue.comments} | Reactions: ${analysis.issue.reactions.total_count}`,
      style: { indent: 10, fontSize: 10 }
    });

    // Analysis
    content.push({
      type: 'bullet',
      content: `📈 Complexity: ${analysis.analysis.complexity}`,
      style: { indent: 10, fontSize: 10 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Solvability: ${analysis.analysis.solvability}`,
      style: { indent: 10, fontSize: 10 }
    });

    content.push({
      type: 'bullet',
      content: `⏱️  Estimated Time: ${analysis.analysis.estimatedTime}`,
      style: { indent: 10, fontSize: 10 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Confidence: ${analysis.analysis.confidence}%`,
      style: { indent: 10, fontSize: 10 }
    });

    // Technologies
    if (analysis.searchTerms.technologies.length > 0) {
      content.push({
        type: 'bullet',
        content: `🔧 Technologies: ${analysis.searchTerms.technologies.join(', ')}`,
        style: { indent: 10, fontSize: 10 }
      });
    }

    // Error messages
    if (analysis.searchTerms.errorMessages.length > 0) {
      content.push({
        type: 'bullet',
        content: `❌ Error Messages Found: ${analysis.searchTerms.errorMessages.length}`,
        style: { indent: 10, fontSize: 10 }
      });

      analysis.searchTerms.errorMessages.slice(0, 2).forEach(error => {
        content.push({
          type: 'bullet',
          content: error.substring(0, 150) + (error.length > 150 ? '...' : ''),
          style: { indent: 20, fontSize: 9 }
        });
      });
    }

    // Stack Overflow solutions
    if (analysis.stackOverflowSolutions.length > 0) {
      content.push({
        type: 'underline',
        content: `💡 Stack Overflow Solutions (${analysis.stackOverflowSolutions.length} found):`,
        style: { indent: 10, fontSize: 11 }
      });

      analysis.stackOverflowSolutions.forEach((sol, soIndex) => {
        const relevanceEmoji = sol.relevanceScore >= 90 ? '🟢' : sol.relevanceScore >= 70 ? '🟡' : '🟠';

        content.push({
          type: 'bold',
          content: `${relevanceEmoji} Solution ${soIndex + 1}: ${sol.question.title}`,
          style: { indent: 20, fontSize: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Relevance: ${sol.relevanceScore}% | Strategy: ${sol.searchStrategy}`,
          style: { indent: 30, fontSize: 9 }
        });

        content.push({
          type: 'bullet',
          content: `Score: ${sol.question.score} | Views: ${sol.question.view_count.toLocaleString()} | Answers: ${sol.question.answer_count}`,
          style: { indent: 30, fontSize: 9 }
        });

        content.push({
          type: 'bullet',
          content: `Accepted Answer: ${sol.question.is_answered ? '✅ Yes' : '❌ No'}`,
          style: { indent: 30, fontSize: 9 }
        });

        content.push({
          type: 'link',
          content: sol.question.link,
          style: { indent: 30, fontSize: 8 }
        });
      });
    }

    // Related issues
    if (analysis.relatedIssues.length > 0) {
      content.push({
        type: 'underline',
        content: `🔗 Related Issues (${analysis.relatedIssues.length} found):`,
        style: { indent: 10, fontSize: 11 }
      });

      analysis.relatedIssues.slice(0, 5).forEach(relatedIssue => {
        const relatedStateEmoji = relatedIssue.state === 'closed' ? '✅' : '🔓';
        content.push({
          type: 'bullet',
          content: `${relatedStateEmoji} #${relatedIssue.number}: ${relatedIssue.title}`,
          style: { indent: 20, fontSize: 10 }
        });

        content.push({
          type: 'link',
          content: relatedIssue.html_url,
          style: { indent: 30, fontSize: 8 }
        });
      });
    }

    // Recommended approach
    if (analysis.analysis.recommendedApproach.length > 0) {
      content.push({
        type: 'underline',
        content: `🎯 Recommended Approach:`,
        style: { indent: 10, fontSize: 11 }
      });

      analysis.analysis.recommendedApproach.forEach(step => {
        content.push({
          type: 'bullet',
          content: step,
          style: { indent: 20, fontSize: 10 }
        });
      });
    }

    content.push({
      type: 'text',
      content: ' ', // Spacer
    });
  }

  private static createTechnologyAnalysis(analyses: DeepIssueAnalysis[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🔧 Technology Analysis',
      style: { fontSize: 16 }
    });

    // Group by technology
    const techMap = new Map<string, DeepIssueAnalysis[]>();
    analyses.forEach(analysis => {
      analysis.searchTerms.technologies.forEach(tech => {
        if (!techMap.has(tech)) {
          techMap.set(tech, []);
        }
        techMap.get(tech)!.push(analysis);
      });
    });

    const sortedTechs = Array.from(techMap.entries())
      .sort((a, b) => b[1].length - a[1].length);

    sortedTechs.forEach(([tech, techAnalyses]) => {
      content.push({
        type: 'underline',
        content: `${tech.toUpperCase()}: ${techAnalyses.length} issues`,
        style: { fontSize: 13 }
      });

      const withSolutions = techAnalyses.filter(a => a.stackOverflowSolutions.length > 0).length;
      content.push({
        type: 'bullet',
        content: `Solutions available: ${withSolutions} (${(withSolutions / techAnalyses.length * 100).toFixed(1)}%)`,
        style: { indent: 5 }
      });

      content.push({
        type: 'text',
        content: ' ',
      });
    });

    return {
      heading: '🔧 Technology Analysis',
      content,
      level: 1
    };
  }

  private static createSolutionPatterns(analyses: DeepIssueAnalysis[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🎨 Solution Patterns',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Common patterns identified across all issues and their solutions.',
    });

    // Analyze patterns
    const errorPatterns = new Map<string, number>();
    analyses.forEach(analysis => {
      analysis.searchTerms.exceptionTypes.forEach(exception => {
        errorPatterns.set(exception, (errorPatterns.get(exception) || 0) + 1);
      });
    });

    content.push({
      type: 'underline',
      content: 'Most Common Error Types:',
      style: { fontSize: 13 }
    });

    Array.from(errorPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .forEach(([error, count]) => {
        content.push({
          type: 'bullet',
          content: `${error}: ${count} occurrences`,
          style: { indent: 5 }
        });
      });

    return {
      heading: '🎨 Solution Patterns',
      content,
      level: 1
    };
  }

  private static createLearningResources(analyses: DeepIssueAnalysis[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '📚 Learning Resources',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Curated learning resources based on the issues and solutions in this repository.',
    });

    // Top Stack Overflow questions
    const allSolutions = analyses.flatMap(a => a.stackOverflowSolutions);
    const topSolutions = allSolutions
      .sort((a, b) => b.question.view_count - a.question.view_count)
      .slice(0, 20);

    content.push({
      type: 'underline',
      content: 'Top Stack Overflow Resources:',
      style: { fontSize: 13 }
    });

    topSolutions.forEach((sol, index) => {
      content.push({
        type: 'bullet',
        content: `${index + 1}. ${sol.question.title} (${sol.question.view_count.toLocaleString()} views)`,
        style: { indent: 5, fontSize: 10 }
      });

      content.push({
        type: 'link',
        content: sol.question.link,
        style: { indent: 15, fontSize: 9 }
      });
    });

    return {
      heading: '📚 Learning Resources',
      content,
      level: 1
    };
  }

  private static createQuickReferenceIndex(analyses: DeepIssueAnalysis[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '📇 Quick Reference Index',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Quick index of all issues for easy reference.',
    });

    analyses.forEach(analysis => {
      const stateEmoji = analysis.issue.state === 'open' ? '🔓' : '✅';
      content.push({
        type: 'bullet',
        content: `${stateEmoji} #${analysis.issue.number}: ${analysis.issue.title} (${analysis.stackOverflowSolutions.length} solutions)`,
        style: { indent: 5, fontSize: 10 }
      });
    });

    return {
      heading: '📇 Quick Reference Index',
      content,
      level: 1
    };
  }
}

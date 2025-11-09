import { PDFSection, PDFContentItem } from './pdfGenerator';
import { IssueSolution } from './stackOverflowSolutionService';
import { GitHubIssue } from './issueAnalyzer';

export class PDFSolutionsSection {
  /**
   * Create comprehensive solutions section for PDF
   */
  static createIssueSolutionsSection(solutions: IssueSolution[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `🎯 Complete Issue Solutions Guide - Solve Every Task in One Day!`,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: `This section provides comprehensive, actionable solutions for ${solutions.length} issues, combining Stack Overflow community wisdom with similar closed issues from your repository. Each solution includes error analysis, step-by-step resolution, and estimated solve time to help developers fix issues quickly.`,
    });

    // Statistics
    const openSolutions = solutions.filter(s => s.issueState === 'open');
    const closedSolutions = solutions.filter(s => s.issueState === 'closed');
    const withSOSolutions = solutions.filter(s => s.stackOverflowSolutions.length > 0);
    const withSimilarIssues = solutions.filter(s => s.similarClosedIssues.length > 0);

    content.push({
      type: 'underline',
      content: '📊 Solutions Overview:',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'bullet',
      content: `🔓 Open Issues with Solutions: ${openSolutions.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Closed Issues (Learning Resources): ${closedSolutions.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `💡 Issues with Stack Overflow Solutions: ${withSOSolutions.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔗 Issues with Similar Closed Issues: ${withSimilarIssues.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'text',
      content: ' ',
    });

    // Group solutions by complexity
    const quickFixes = solutions.filter(s => s.estimatedSolveTime.includes('Quick fix'));
    const moderateFixes = solutions.filter(s => s.estimatedSolveTime.includes('Moderate'));
    const complexFixes = solutions.filter(s => s.estimatedSolveTime.includes('Complex'));

    if (quickFixes.length > 0) {
      content.push({
        type: 'highlight',
        content: `⚡ Quick Fixes (${quickFixes.length} issues) - Can be solved in < 4 hours`,
      });

      content.push({
        type: 'text',
        content: 'These issues have clear solutions available and can be resolved quickly. Perfect for getting started or making quick progress.',
      });

      // Show ALL quick fixes for maximum learning value
      quickFixes.forEach((solution, index) => {
        this.addSolutionDetails(content, solution, index + 1);
      });
    }

    if (moderateFixes.length > 0) {
      content.push({
        type: 'highlight',
        content: `🔧 Moderate Complexity (${moderateFixes.length} issues) - 4-8 hours`,
      });

      content.push({
        type: 'text',
        content: 'These issues require more investigation but have good community solutions available. Great learning opportunities.',
      });

      // Show ALL moderate fixes
      moderateFixes.forEach((solution, index) => {
        this.addSolutionDetails(content, solution, index + 1);
      });
    }

    if (complexFixes.length > 0) {
      content.push({
        type: 'highlight',
        content: `🧩 Complex Issues (${complexFixes.length} issues) - Requires deep investigation`,
      });

      content.push({
        type: 'text',
        content: 'These issues are more challenging and may require architectural changes or deep debugging. Excellent for advanced learning.',
      });

      // Show ALL complex fixes
      complexFixes.forEach((solution, index) => {
        this.addSolutionDetails(content, solution, index + 1);
      });
    }

    return {
      heading: '🎯 Complete Solutions Guide - One Day Resolution',
      content,
      level: 1
    };
  }

  /**
   * Add detailed solution information
   */
  private static addSolutionDetails(
    content: PDFContentItem[],
    solution: IssueSolution,
    index: number
  ): void {
    const stateEmoji = solution.issueState === 'open' ? '🔓' : '✅';

    content.push({
      type: 'bold',
      content: `${index}. ${stateEmoji} Issue #${solution.issueNumber}: ${solution.issueTitle}`,
      style: { fontSize: 12 }
    });

    content.push({
      type: 'bullet',
      content: `⏱️ Estimated Solve Time: ${solution.estimatedSolveTime}`,
      style: { indent: 10, fontSize: 11 }
    });

    content.push({
      type: 'bullet',
      content: `🔗 Issue URL: ${solution.issueUrl}`,
      style: { indent: 10, fontSize: 10 }
    });

    // AI Summary
    content.push({
      type: 'bullet',
      content: `🤖 AI Analysis: ${solution.aiGeneratedSummary}`,
      style: { indent: 10, fontSize: 10 }
    });

    // Error Messages
    if (solution.errorMessages.length > 0) {
      content.push({
        type: 'bullet',
        content: `❌ Error Messages Found:`,
        style: { indent: 10, fontSize: 11 }
      });

      solution.errorMessages.forEach(error => {
        content.push({
          type: 'bullet',
          content: error.substring(0, 150) + (error.length > 150 ? '...' : ''),
          style: { indent: 20, fontSize: 9 }
        });
      });
    }

    // Technologies
    if (solution.technologies.length > 0) {
      content.push({
        type: 'bullet',
        content: `🔧 Technologies: ${solution.technologies.join(', ')}`,
        style: { indent: 10, fontSize: 10 }
      });
    }

    // Stack Overflow Solutions
    if (solution.stackOverflowSolutions.length > 0) {
      content.push({
        type: 'underline',
        content: `💡 Stack Overflow Solutions (${solution.stackOverflowSolutions.length} found):`,
        style: { indent: 10, fontSize: 11 }
      });

      solution.stackOverflowSolutions.forEach((soSolution, soIndex) => {
        const relevanceEmoji = soSolution.relevanceScore >= 90 ? '🟢' : 
                              soSolution.relevanceScore >= 70 ? '🟡' : '🟠';

        content.push({
          type: 'bold',
          content: `${relevanceEmoji} Solution ${soIndex + 1}: ${soSolution.question.title}`,
          style: { indent: 20, fontSize: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Relevance: ${soSolution.relevanceScore}% | Match Reason: ${soSolution.matchReason}`,
          style: { indent: 30, fontSize: 9 }
        });

        content.push({
          type: 'bullet',
          content: `Score: ${soSolution.question.score} | Views: ${soSolution.question.view_count.toLocaleString()} | Answers: ${soSolution.question.answer_count}`,
          style: { indent: 30, fontSize: 9 }
        });

        content.push({
          type: 'bullet',
          content: `Applicability: ${soSolution.applicabilityNotes}`,
          style: { indent: 30, fontSize: 9 }
        });

        // Top Answer
        if (soSolution.topAnswer) {
          const acceptedBadge = soSolution.topAnswer.is_accepted ? ' ✅ ACCEPTED' : '';
          const answerPreview = soSolution.topAnswer.body
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .substring(0, 200) + '...';

          content.push({
            type: 'bullet',
            content: `Top Answer (Score: ${soSolution.topAnswer.score}${acceptedBadge}): ${answerPreview}`,
            style: { indent: 30, fontSize: 9 }
          });
        }

        content.push({
          type: 'link',
          content: soSolution.question.link,
          style: { indent: 30, fontSize: 8 }
        });
      });
    }

    // Similar Closed Issues
    if (solution.similarClosedIssues.length > 0) {
      content.push({
        type: 'underline',
        content: `🔗 Similar Closed Issues (${solution.similarClosedIssues.length} found):`,
        style: { indent: 10, fontSize: 11 }
      });

      solution.similarClosedIssues.forEach((closedIssue, ciIndex) => {
        content.push({
          type: 'bullet',
          content: `#${closedIssue.number}: ${closedIssue.title}`,
          style: { indent: 20, fontSize: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Closed: ${new Date(closedIssue.closed_at!).toLocaleDateString()} | Comments: ${closedIssue.comments}`,
          style: { indent: 30, fontSize: 9 }
        });

        if (closedIssue.labels.length > 0) {
          content.push({
            type: 'bullet',
            content: `Labels: ${closedIssue.labels.map(l => l.name).join(', ')}`,
            style: { indent: 30, fontSize: 9 }
          });
        }

        content.push({
          type: 'link',
          content: closedIssue.html_url,
          style: { indent: 30, fontSize: 8 }
        });
      });
    }

    // Resolution Steps
    if (solution.resolutionSteps.length > 0) {
      content.push({
        type: 'underline',
        content: `📋 Step-by-Step Resolution Guide:`,
        style: { indent: 10, fontSize: 11 }
      });

      solution.resolutionSteps.forEach(step => {
        content.push({
          type: 'bullet',
          content: step,
          style: { indent: 20, fontSize: 10 }
        });
      });
    }

    // Add learning notes
    content.push({
      type: 'underline',
      content: `💡 Learning Notes:`,
      style: { indent: 10, fontSize: 11 }
    });

    const learningNotes = this.generateLearningNotes(solution);
    learningNotes.forEach(note => {
      content.push({
        type: 'bullet',
        content: note,
        style: { indent: 20, fontSize: 10 }
      });
    });

    // Add prevention tips
    content.push({
      type: 'underline',
      content: `🛡️ Prevention Tips:`,
      style: { indent: 10, fontSize: 11 }
    });

    const preventionTips = this.generatePreventionTips(solution);
    preventionTips.forEach(tip => {
      content.push({
        type: 'bullet',
        content: tip,
        style: { indent: 20, fontSize: 10 }
      });
    });

    content.push({
      type: 'text',
      content: ' ', // Spacer
    });
  }

  /**
   * Create learning section from closed issues
   */
  static createClosedIssuesLearningSection(solutions: IssueSolution[]): PDFSection {
    const content: PDFContentItem[] = [];
    const closedSolutions = solutions.filter(s => s.issueState === 'closed');

    content.push({
      type: 'highlight',
      content: `📚 Learning from Closed Issues - ${closedSolutions.length} Resolved Problems`,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Closed issues are valuable learning resources. This section analyzes how previous issues were resolved, providing patterns and solutions that can be applied to current problems.',
    });

    // Group by resolution patterns
    const patternsMap = new Map<string, IssueSolution[]>();

    closedSolutions.forEach(solution => {
      solution.technologies.forEach(tech => {
        if (!patternsMap.has(tech)) {
          patternsMap.set(tech, []);
        }
        patternsMap.get(tech)!.push(solution);
      });
    });

    content.push({
      type: 'underline',
      content: '🔍 Resolution Patterns by Technology:',
      style: { fontSize: 14 }
    });

    Array.from(patternsMap.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 10)
      .forEach(([tech, techSolutions]) => {
        content.push({
          type: 'bold',
          content: `${tech}: ${techSolutions.length} resolved issues`,
          style: { fontSize: 12 }
        });

        techSolutions.slice(0, 5).forEach(solution => {
          content.push({
            type: 'bullet',
            content: `#${solution.issueNumber}: ${solution.issueTitle}`,
            style: { indent: 10, fontSize: 10 }
          });

          if (solution.stackOverflowSolutions.length > 0) {
            content.push({
              type: 'bullet',
              content: `✅ Resolved using Stack Overflow solution: ${solution.stackOverflowSolutions[0].question.title}`,
              style: { indent: 20, fontSize: 9 }
            });
          }
        });

        content.push({
          type: 'text',
          content: ' ',
        });
      });

    return {
      heading: '📚 Learning from Closed Issues',
      content,
      level: 1
    };
  }

  /**
   * Create quick reference section
   */
  static createQuickReferenceSection(solutions: IssueSolution[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '⚡ Quick Reference Guide - Common Issues & Solutions',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Fast lookup table for common issues and their solutions. Use this as a first reference when encountering similar problems.',
    });

    // Group by error type
    const errorGroups = new Map<string, IssueSolution[]>();

    solutions.forEach(solution => {
      if (solution.errorMessages.length > 0) {
        const errorType = this.categorizeError(solution.errorMessages[0]);
        if (!errorGroups.has(errorType)) {
          errorGroups.set(errorType, []);
        }
        errorGroups.get(errorType)!.push(solution);
      }
    });

    Array.from(errorGroups.entries())
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([errorType, errorSolutions]) => {
        content.push({
          type: 'underline',
          content: `${errorType} (${errorSolutions.length} issues)`,
          style: { fontSize: 13 }
        });

        errorSolutions.slice(0, 3).forEach(solution => {
          content.push({
            type: 'bullet',
            content: `Issue #${solution.issueNumber}: ${solution.estimatedSolveTime}`,
            style: { indent: 5, fontSize: 10 }
          });

          if (solution.stackOverflowSolutions.length > 0) {
            content.push({
              type: 'bullet',
              content: `Solution: ${solution.stackOverflowSolutions[0].question.link}`,
              style: { indent: 15, fontSize: 9 }
            });
          }
        });

        content.push({
          type: 'text',
          content: ' ',
        });
      });

    return {
      heading: '⚡ Quick Reference Guide',
      content,
      level: 1
    };
  }

  /**
   * Categorize error type
   */
  private static categorizeError(errorMessage: string): string {
    const lower = errorMessage.toLowerCase();

    if (lower.includes('typeerror') || lower.includes('type error')) return '🔤 Type Errors';
    if (lower.includes('referenceerror') || lower.includes('undefined')) return '🔗 Reference Errors';
    if (lower.includes('syntaxerror') || lower.includes('syntax')) return '📝 Syntax Errors';
    if (lower.includes('networkerror') || lower.includes('fetch') || lower.includes('api')) return '🌐 Network Errors';
    if (lower.includes('permission') || lower.includes('auth') || lower.includes('forbidden')) return '🔒 Permission Errors';
    if (lower.includes('timeout') || lower.includes('slow')) return '⏱️ Timeout Errors';
    if (lower.includes('memory') || lower.includes('heap')) return '💾 Memory Errors';
    if (lower.includes('validation') || lower.includes('invalid')) return '✅ Validation Errors';

    return '❓ Other Errors';
  }

  /**
   * Generate learning notes for a solution
   */
  private static generateLearningNotes(solution: IssueSolution): string[] {
    const notes: string[] = [];

    // Add notes based on error type
    if (solution.errorMessages.length > 0) {
      const errorType = this.categorizeError(solution.errorMessages[0]);
      notes.push(`This is a ${errorType} - common in ${solution.technologies.join(', ')} development`);
    }

    // Add notes based on Stack Overflow solutions
    if (solution.stackOverflowSolutions.length > 0) {
      const topSolution = solution.stackOverflowSolutions[0];
      notes.push(`${topSolution.question.view_count.toLocaleString()} developers have viewed similar issues on Stack Overflow`);
      
      if (topSolution.topAnswer?.is_accepted) {
        notes.push('The top answer is accepted by the community, indicating high reliability');
      }
    }

    // Add notes based on similar closed issues
    if (solution.similarClosedIssues.length > 0) {
      notes.push(`${solution.similarClosedIssues.length} similar issues have been successfully resolved in this repository`);
    }

    // Add complexity-based notes
    if (solution.estimatedSolveTime.includes('Quick fix')) {
      notes.push('This is a common issue with well-documented solutions - great for learning basic debugging');
    } else if (solution.estimatedSolveTime.includes('Moderate')) {
      notes.push('This issue requires understanding of the underlying technology - good intermediate learning opportunity');
    } else {
      notes.push('This complex issue offers deep learning about system architecture and advanced debugging');
    }

    return notes;
  }

  /**
   * Generate prevention tips for a solution
   */
  private static generatePreventionTips(solution: IssueSolution): string[] {
    const tips: string[] = [];

    // Technology-specific tips
    if (solution.technologies.includes('react')) {
      tips.push('Use React.StrictMode to catch potential issues early');
      tips.push('Implement PropTypes or TypeScript for type safety');
    }

    if (solution.technologies.includes('typescript')) {
      tips.push('Enable strict mode in tsconfig.json');
      tips.push('Use type guards for runtime type checking');
    }

    if (solution.technologies.includes('javascript')) {
      tips.push('Use ESLint to catch common mistakes');
      tips.push('Enable strict mode with "use strict"');
    }

    // Error-type specific tips
    if (solution.errorMessages.some(e => e.toLowerCase().includes('undefined'))) {
      tips.push('Always validate data before accessing nested properties');
      tips.push('Use optional chaining (?.) for safer property access');
    }

    if (solution.errorMessages.some(e => e.toLowerCase().includes('async') || e.toLowerCase().includes('promise'))) {
      tips.push('Always handle promise rejections with .catch() or try-catch');
      tips.push('Use async/await for cleaner asynchronous code');
    }

    // General tips if no specific ones
    if (tips.length === 0) {
      tips.push('Write unit tests to catch issues early');
      tips.push('Use code reviews to share knowledge and catch bugs');
      tips.push('Keep dependencies up to date');
    }

    return tips;
  }
}

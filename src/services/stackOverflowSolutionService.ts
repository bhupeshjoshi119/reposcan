import { GitHubIssue, StackOverflowQuestion, StackOverflowAnswer } from './issueAnalyzer';

export interface IssueSolution {
  issueNumber: number;
  issueTitle: string;
  issueState: 'open' | 'closed';
  issueUrl: string;
  errorMessages: string[];
  stackTraces: string[];
  technologies: string[];
  stackOverflowSolutions: StackOverflowSolutionMatch[];
  aiGeneratedSummary: string;
  resolutionSteps: string[];
  estimatedSolveTime: string;
  similarClosedIssues: GitHubIssue[];
}

export interface StackOverflowSolutionMatch {
  question: StackOverflowQuestion;
  relevanceScore: number;
  matchReason: string;
  topAnswer?: StackOverflowAnswer;
  applicabilityNotes: string;
}

export class StackOverflowSolutionService {
  private stackOverflowApiBase = 'https://api.stackexchange.com/2.3';

  /**
   * Find comprehensive solutions for all issues (open and closed)
   */
  async findSolutionsForAllIssues(issues: GitHubIssue[]): Promise<IssueSolution[]> {
    console.log(`🔍 Finding Stack Overflow solutions for ${issues.length} issues...`);
    
    const solutions: IssueSolution[] = [];

    for (const issue of issues) {
      try {
        const solution = await this.findSolutionForIssue(issue, issues);
        solutions.push(solution);
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));
      } catch (error) {
        console.error(`Error finding solution for issue #${issue.number}:`, error);
      }
    }

    return solutions;
  }

  /**
   * Find solution for a single issue
   */
  private async findSolutionForIssue(
    issue: GitHubIssue,
    allIssues: GitHubIssue[]
  ): Promise<IssueSolution> {
    // Extract error messages and stack traces
    const errorMessages = this.extractErrorMessages(issue);
    const stackTraces = this.extractStackTraces(issue);
    const technologies = this.extractTechnologies(issue);

    // Search Stack Overflow with multiple strategies
    const stackOverflowSolutions = await this.searchStackOverflowMultiStrategy(
      issue,
      errorMessages,
      stackTraces,
      technologies
    );

    // Find similar closed issues that might have solutions
    const similarClosedIssues = this.findSimilarClosedIssues(issue, allIssues);

    // Generate AI-powered summary and resolution steps
    const aiGeneratedSummary = this.generateAISummary(
      issue,
      stackOverflowSolutions,
      similarClosedIssues
    );

    const resolutionSteps = this.generateResolutionSteps(
      issue,
      stackOverflowSolutions,
      similarClosedIssues
    );

    const estimatedSolveTime = this.estimateSolveTime(
      issue,
      stackOverflowSolutions,
      similarClosedIssues
    );

    return {
      issueNumber: issue.number,
      issueTitle: issue.title,
      issueState: issue.state,
      issueUrl: issue.html_url,
      errorMessages,
      stackTraces,
      technologies,
      stackOverflowSolutions,
      aiGeneratedSummary,
      resolutionSteps,
      estimatedSolveTime,
      similarClosedIssues,
    };
  }

  /**
   * Extract error messages from issue body and comments
   */
  private extractErrorMessages(issue: GitHubIssue): string[] {
    const errors: string[] = [];
    const text = issue.body + ' ' + (issue.comments_data?.map(c => c.body).join(' ') || '');

    // Common error patterns
    const errorPatterns = [
      /Error:\s*(.+?)(?:\n|$)/gi,
      /Exception:\s*(.+?)(?:\n|$)/gi,
      /Failed:\s*(.+?)(?:\n|$)/gi,
      /TypeError:\s*(.+?)(?:\n|$)/gi,
      /ReferenceError:\s*(.+?)(?:\n|$)/gi,
      /SyntaxError:\s*(.+?)(?:\n|$)/gi,
      /ValidationError:\s*(.+?)(?:\n|$)/gi,
      /RuntimeError:\s*(.+?)(?:\n|$)/gi,
    ];

    errorPatterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          errors.push(match[1].trim().substring(0, 200));
        }
      }
    });

    return [...new Set(errors)].slice(0, 5);
  }

  /**
   * Extract stack traces from issue
   */
  private extractStackTraces(issue: GitHubIssue): string[] {
    const traces: string[] = [];
    const text = issue.body + ' ' + (issue.comments_data?.map(c => c.body).join(' ') || '');

    // Look for code blocks that might contain stack traces
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = text.match(codeBlockPattern) || [];

    codeBlocks.forEach(block => {
      // Check if it looks like a stack trace
      if (
        block.includes('at ') ||
        block.includes('File "') ||
        block.includes('Traceback') ||
        block.includes('.js:') ||
        block.includes('.py:') ||
        block.includes('.java:')
      ) {
        traces.push(block.substring(0, 500));
      }
    });

    return traces.slice(0, 3);
  }

  /**
   * Extract technologies mentioned in the issue
   */
  private extractTechnologies(issue: GitHubIssue): string[] {
    const technologies = new Set<string>();

    // From labels
    issue.labels.forEach(label => {
      technologies.add(label.name.toLowerCase());
    });

    // Common technology keywords
    const techKeywords = [
      'react', 'vue', 'angular', 'node', 'python', 'java', 'typescript',
      'javascript', 'docker', 'kubernetes', 'aws', 'azure', 'gcp',
      'mongodb', 'postgresql', 'mysql', 'redis', 'graphql', 'rest',
      'webpack', 'vite', 'nextjs', 'express', 'fastapi', 'django',
      'spring', 'laravel', 'rails', 'flutter', 'swift', 'kotlin'
    ];

    const text = (issue.title + ' ' + issue.body).toLowerCase();
    techKeywords.forEach(tech => {
      if (text.includes(tech)) {
        technologies.add(tech);
      }
    });

    return Array.from(technologies).slice(0, 10);
  }

  /**
   * Search Stack Overflow using multiple strategies
   */
  private async searchStackOverflowMultiStrategy(
    issue: GitHubIssue,
    errorMessages: string[],
    stackTraces: string[],
    technologies: string[]
  ): Promise<StackOverflowSolutionMatch[]> {
    const solutions: StackOverflowSolutionMatch[] = [];

    // Strategy 1: Search by exact error message
    for (const error of errorMessages.slice(0, 2)) {
      const results = await this.searchStackOverflow(error, technologies);
      results.forEach(q => {
        solutions.push({
          question: q,
          relevanceScore: 95,
          matchReason: 'Exact error message match',
          topAnswer: q.answers?.[0],
          applicabilityNotes: 'High confidence - same error message found'
        });
      });
    }

    // Strategy 2: Search by issue title + technologies
    const titleResults = await this.searchStackOverflow(
      issue.title,
      technologies
    );
    titleResults.forEach(q => {
      if (!solutions.find(s => s.question.question_id === q.question_id)) {
        solutions.push({
          question: q,
          relevanceScore: 80,
          matchReason: 'Issue title similarity',
          topAnswer: q.answers?.[0],
          applicabilityNotes: 'Good match - similar problem description'
        });
      }
    });

    // Strategy 3: Search by technology tags
    if (technologies.length > 0) {
      const tagResults = await this.searchByTags(technologies.slice(0, 3));
      tagResults.forEach(q => {
        if (!solutions.find(s => s.question.question_id === q.question_id)) {
          solutions.push({
            question: q,
            relevanceScore: 60,
            matchReason: 'Technology tag match',
            topAnswer: q.answers?.[0],
            applicabilityNotes: 'Related technology - may provide insights'
          });
        }
      });
    }

    // Sort by relevance and return top 5
    return solutions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 5);
  }

  /**
   * Search Stack Overflow by query
   */
  private async searchStackOverflow(
    query: string,
    tags: string[] = []
  ): Promise<StackOverflowQuestion[]> {
    try {
      const tagFilter = tags.length > 0 ? `tagged=${tags.join(';')}&` : '';
      const searchUrl = `${this.stackOverflowApiBase}/search/advanced?${tagFilter}order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=10&filter=withbody`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data.items) return [];

      // Fetch answers for top questions
      const questionsWithAnswers = await Promise.all(
        data.items.slice(0, 5).map(async (item: any) => {
          const question: StackOverflowQuestion = {
            question_id: item.question_id,
            title: item.title,
            body: item.body || '',
            tags: item.tags || [],
            score: item.score,
            view_count: item.view_count,
            answer_count: item.answer_count,
            creation_date: item.creation_date,
            last_activity_date: item.last_activity_date,
            link: item.link,
            is_answered: item.is_answered,
            accepted_answer_id: item.accepted_answer_id,
            owner: {
              display_name: item.owner?.display_name || 'Unknown',
              reputation: item.owner?.reputation || 0,
              user_id: item.owner?.user_id || 0,
            },
          };

          // Fetch answers
          if (item.answer_count > 0) {
            question.answers = await this.fetchAnswers(item.question_id);
          }

          return question;
        })
      );

      return questionsWithAnswers;
    } catch (error) {
      console.error('Error searching Stack Overflow:', error);
      return [];
    }
  }

  /**
   * Search Stack Overflow by tags
   */
  private async searchByTags(tags: string[]): Promise<StackOverflowQuestion[]> {
    try {
      const searchUrl = `${this.stackOverflowApiBase}/questions?order=desc&sort=votes&tagged=${tags.join(';')}&site=stackoverflow&pagesize=5&filter=withbody`;

      const response = await fetch(searchUrl);
      const data = await response.json();

      if (!data.items) return [];

      return data.items.map((item: any) => ({
        question_id: item.question_id,
        title: item.title,
        body: item.body || '',
        tags: item.tags || [],
        score: item.score,
        view_count: item.view_count,
        answer_count: item.answer_count,
        creation_date: item.creation_date,
        last_activity_date: item.last_activity_date,
        link: item.link,
        is_answered: item.is_answered,
        accepted_answer_id: item.accepted_answer_id,
        owner: {
          display_name: item.owner?.display_name || 'Unknown',
          reputation: item.owner?.reputation || 0,
          user_id: item.owner?.user_id || 0,
        },
      }));
    } catch (error) {
      console.error('Error searching by tags:', error);
      return [];
    }
  }

  /**
   * Fetch answers for a question
   */
  private async fetchAnswers(questionId: number): Promise<StackOverflowAnswer[]> {
    try {
      const answersUrl = `${this.stackOverflowApiBase}/questions/${questionId}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody&pagesize=3`;
      const response = await fetch(answersUrl);
      const data = await response.json();

      if (!data.items) return [];

      return data.items.map((answer: any) => ({
        answer_id: answer.answer_id,
        score: answer.score,
        is_accepted: answer.is_accepted || false,
        body: answer.body || '',
        creation_date: answer.creation_date,
        owner: {
          display_name: answer.owner?.display_name || 'Unknown',
          reputation: answer.owner?.reputation || 0,
        },
      }));
    } catch (error) {
      console.error('Error fetching answers:', error);
      return [];
    }
  }

  /**
   * Find similar closed issues that might have solutions
   */
  private findSimilarClosedIssues(
    issue: GitHubIssue,
    allIssues: GitHubIssue[]
  ): GitHubIssue[] {
    const closedIssues = allIssues.filter(i => i.state === 'closed' && i.number !== issue.number);

    // Calculate similarity score
    const scoredIssues = closedIssues.map(closedIssue => {
      let score = 0;

      // Title similarity (simple word matching)
      const issueWords = new Set(issue.title.toLowerCase().split(/\s+/));
      const closedWords = new Set(closedIssue.title.toLowerCase().split(/\s+/));
      const commonWords = [...issueWords].filter(word => closedWords.has(word) && word.length > 3);
      score += commonWords.length * 10;

      // Label similarity
      const issueLabels = new Set(issue.labels.map(l => l.name));
      const closedLabels = new Set(closedIssue.labels.map(l => l.name));
      const commonLabels = [...issueLabels].filter(label => closedLabels.has(label));
      score += commonLabels.length * 20;

      // Bonus for issues with solutions in comments
      if (closedIssue.comments > 2) score += 15;

      return { issue: closedIssue, score };
    });

    return scoredIssues
      .filter(s => s.score > 20)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(s => s.issue);
  }

  /**
   * Generate AI-powered summary
   */
  private generateAISummary(
    issue: GitHubIssue,
    stackOverflowSolutions: StackOverflowSolutionMatch[],
    similarClosedIssues: GitHubIssue[]
  ): string {
    const parts: string[] = [];

    // Issue analysis
    parts.push(`This ${issue.state} issue "${issue.title}" has been analyzed for solutions.`);

    // Stack Overflow insights
    if (stackOverflowSolutions.length > 0) {
      const topSolution = stackOverflowSolutions[0];
      parts.push(
        `Found ${stackOverflowSolutions.length} relevant Stack Overflow discussions. ` +
        `Top match: "${topSolution.question.title}" with ${topSolution.question.view_count.toLocaleString()} views ` +
        `and ${topSolution.question.answer_count} answers.`
      );
    }

    // Similar issues insights
    if (similarClosedIssues.length > 0) {
      parts.push(
        `Identified ${similarClosedIssues.length} similar closed issues in this repository that may provide resolution patterns.`
      );
    }

    // Complexity assessment
    const complexity = this.assessComplexity(issue, stackOverflowSolutions);
    parts.push(`Complexity: ${complexity}`);

    return parts.join(' ');
  }

  /**
   * Generate step-by-step resolution steps
   */
  private generateResolutionSteps(
    issue: GitHubIssue,
    stackOverflowSolutions: StackOverflowSolutionMatch[],
    similarClosedIssues: GitHubIssue[]
  ): string[] {
    const steps: string[] = [];

    steps.push('1. Review the issue description and error messages carefully');

    if (stackOverflowSolutions.length > 0) {
      steps.push(
        `2. Check the top Stack Overflow solution: ${stackOverflowSolutions[0].question.link}`
      );
      
      if (stackOverflowSolutions[0].topAnswer) {
        steps.push('3. Implement the accepted answer approach from Stack Overflow');
      }
    }

    if (similarClosedIssues.length > 0) {
      steps.push(
        `4. Review similar closed issue #${similarClosedIssues[0].number}: ${similarClosedIssues[0].title}`
      );
      steps.push('5. Apply the resolution pattern from the closed issue');
    }

    steps.push('6. Test the solution thoroughly');
    steps.push('7. Document the fix for future reference');

    return steps;
  }

  /**
   * Estimate time to solve
   */
  private estimateSolveTime(
    issue: GitHubIssue,
    stackOverflowSolutions: StackOverflowSolutionMatch[],
    similarClosedIssues: GitHubIssue[]
  ): string {
    let hours = 8; // Base estimate

    // Reduce time if we have good solutions
    if (stackOverflowSolutions.length > 0 && stackOverflowSolutions[0].topAnswer) {
      hours -= 4;
    }

    if (similarClosedIssues.length > 0) {
      hours -= 2;
    }

    // Increase time for complex issues
    if (issue.labels.some(l => l.name.toLowerCase().includes('complex'))) {
      hours += 4;
    }

    hours = Math.max(1, Math.min(hours, 24));

    if (hours <= 4) return `${hours} hours (Quick fix available)`;
    if (hours <= 8) return `${hours} hours (Moderate complexity)`;
    return `${hours} hours (Complex issue)`;
  }

  /**
   * Assess issue complexity
   */
  private assessComplexity(
    issue: GitHubIssue,
    stackOverflowSolutions: StackOverflowSolutionMatch[]
  ): string {
    let complexityScore = 5; // Base score

    // Increase for lack of solutions
    if (stackOverflowSolutions.length === 0) complexityScore += 3;

    // Increase for many comments (indicates difficulty)
    if (issue.comments > 10) complexityScore += 2;

    // Decrease if we have accepted answers
    if (stackOverflowSolutions.some(s => s.topAnswer?.is_accepted)) complexityScore -= 2;

    // Check labels
    if (issue.labels.some(l => l.name.toLowerCase().includes('easy'))) complexityScore -= 2;
    if (issue.labels.some(l => l.name.toLowerCase().includes('hard'))) complexityScore += 3;

    complexityScore = Math.max(1, Math.min(complexityScore, 10));

    if (complexityScore <= 3) return 'Low - Quick fix available';
    if (complexityScore <= 6) return 'Medium - Standard debugging required';
    return 'High - Requires deep investigation';
  }
}

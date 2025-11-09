import { Octokit } from '@octokit/rest';
import { GitHubIssue, StackOverflowQuestion } from './issueAnalyzer';

/**
 * Deep Issue Analyzer - Handles large repositories with 10k+ issues
 * Provides comprehensive analysis with direct links and deep search
 */
export class DeepIssueAnalyzer {
  private octokit: Octokit;
  private stackOverflowApiBase = 'https://api.stackexchange.com/2.3';
  private apiKey?: string;

  constructor(githubToken?: string, stackExchangeKey?: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.apiKey = stackExchangeKey;
  }

  /**
   * Analyze specific issue by URL or number
   */
  async analyzeIssueByUrl(issueUrl: string): Promise<DeepIssueAnalysis> {
    const { owner, repo, issueNumber } = this.parseGitHubUrl(issueUrl);
    return this.analyzeSpecificIssue(owner, repo, issueNumber);
  }

  /**
   * Analyze specific issue with deep search
   */
  async analyzeSpecificIssue(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<DeepIssueAnalysis> {
    console.log(`🔍 Deep analyzing issue #${issueNumber} from ${owner}/${repo}...`);

    // Fetch complete issue data
    const issue = await this.fetchCompleteIssue(owner, repo, issueNumber);
    
    // Extract all searchable content
    const searchTerms = this.extractSearchTerms(issue);
    
    // Perform deep Stack Overflow search
    const soSolutions = await this.deepStackOverflowSearch(searchTerms);
    
    // Find related issues
    const relatedIssues = await this.findRelatedIssues(owner, repo, issue);
    
    // Generate comprehensive analysis
    return {
      issue,
      searchTerms,
      stackOverflowSolutions: soSolutions,
      relatedIssues,
      directLinks: this.generateDirectLinks(issue, soSolutions),
      analysis: this.generateDeepAnalysis(issue, soSolutions, relatedIssues)
    };
  }

  /**
   * Fetch complete issue with all comments and events
   */
  private async fetchCompleteIssue(
    owner: string,
    repo: string,
    issueNumber: number
  ): Promise<GitHubIssue> {
    console.log(`📥 Fetching complete data for issue #${issueNumber}...`);

    const [issueResponse, commentsResponse, eventsResponse] = await Promise.all([
      this.octokit.rest.issues.get({ owner, repo, issue_number: issueNumber }),
      this.octokit.rest.issues.listComments({ owner, repo, issue_number: issueNumber, per_page: 100 }),
      this.octokit.rest.issues.listEventsForTimeline({ owner, repo, issue_number: issueNumber, per_page: 100 })
    ]);

    const issue = issueResponse.data;

    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state as 'open' | 'closed',
      labels: issue.labels.map(label => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      assignees: issue.assignees?.map(assignee => ({
        login: assignee?.login || '',
        avatar_url: assignee?.avatar_url || '',
      })) || [],
      created_at: issue.created_at,
      updated_at: issue.updated_at,
      closed_at: issue.closed_at,
      html_url: issue.html_url,
      user: {
        login: issue.user?.login || '',
        avatar_url: issue.user?.avatar_url || '',
      },
      comments: issue.comments,
      reactions: {
        total_count: issue.reactions?.total_count || 0,
        '+1': issue.reactions?.['+1'] || 0,
        '-1': issue.reactions?.['-1'] || 0,
        laugh: issue.reactions?.laugh || 0,
        hooray: issue.reactions?.hooray || 0,
        confused: issue.reactions?.confused || 0,
        heart: issue.reactions?.heart || 0,
        rocket: issue.reactions?.rocket || 0,
        eyes: issue.reactions?.eyes || 0,
      },
      locked: issue.locked,
      comments_data: commentsResponse.data.map(comment => ({
        id: comment.id,
        user: {
          login: comment.user?.login || '',
          avatar_url: comment.user?.avatar_url || '',
        },
        created_at: comment.created_at,
        updated_at: comment.updated_at,
        body: comment.body || '',
        reactions: {
          total_count: comment.reactions?.total_count || 0,
          '+1': comment.reactions?.['+1'] || 0,
          '-1': comment.reactions?.['-1'] || 0,
          laugh: comment.reactions?.laugh || 0,
          hooray: comment.reactions?.hooray || 0,
          confused: comment.reactions?.confused || 0,
          heart: comment.reactions?.heart || 0,
          rocket: comment.reactions?.rocket || 0,
          eyes: comment.reactions?.eyes || 0,
        },
      })),
      timeline_events: eventsResponse.data.map((event: any) => ({
        event: event.event || '',
        created_at: event.created_at || '',
        actor: event.actor ? {
          login: event.actor.login || '',
          avatar_url: event.actor.avatar_url || '',
        } : undefined,
      }))
    };
  }

  /**
   * Extract comprehensive search terms from issue
   */
  private extractSearchTerms(issue: GitHubIssue): SearchTerms {
    const allText = [
      issue.title,
      issue.body,
      ...(issue.comments_data?.map(c => c.body) || [])
    ].join(' ');

    return {
      errorMessages: this.extractErrors(allText),
      stackTraces: this.extractStackTraces(allText),
      technologies: this.extractTechnologies(issue, allText),
      keywords: this.extractKeywords(allText),
      codeSnippets: this.extractCodeSnippets(allText),
      exceptionTypes: this.extractExceptionTypes(allText)
    };
  }

  private extractErrors(text: string): string[] {
    const errors: string[] = [];
    const patterns = [
      /Error:\s*(.+?)(?:\n|$)/gi,
      /Exception:\s*(.+?)(?:\n|$)/gi,
      /Failed:\s*(.+?)(?:\n|$)/gi,
      /TypeError:\s*(.+?)(?:\n|$)/gi,
      /ReferenceError:\s*(.+?)(?:\n|$)/gi,
      /SyntaxError:\s*(.+?)(?:\n|$)/gi,
      /AssertionError:\s*(.+?)(?:\n|$)/gi,
      /RuntimeError:\s*(.+?)(?:\n|$)/gi,
      /\[ERROR\]\s*(.+?)(?:\n|$)/gi,
      /ERROR:\s*(.+?)(?:\n|$)/gi,
    ];

    patterns.forEach(pattern => {
      const matches = text.matchAll(pattern);
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 10) {
          errors.push(match[1].trim().substring(0, 300));
        }
      }
    });

    return [...new Set(errors)];
  }

  private extractStackTraces(text: string): string[] {
    const traces: string[] = [];
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = text.match(codeBlockPattern) || [];

    codeBlocks.forEach(block => {
      if (
        block.includes('at ') ||
        block.includes('File "') ||
        block.includes('Traceback') ||
        block.includes('.dart:') ||
        block.includes('.java:') ||
        block.includes('.kt:') ||
        block.includes('.swift:')
      ) {
        traces.push(block.substring(0, 1000));
      }
    });

    return traces;
  }

  private extractTechnologies(issue: GitHubIssue, text: string): string[] {
    const technologies = new Set<string>();

    // From labels
    issue.labels.forEach(label => {
      technologies.add(label.name.toLowerCase());
    });

    // Common technologies
    const techKeywords = [
      'flutter', 'dart', 'android', 'ios', 'react', 'vue', 'angular',
      'node', 'python', 'java', 'kotlin', 'swift', 'typescript',
      'javascript', 'docker', 'kubernetes', 'firebase', 'aws',
      'mongodb', 'postgresql', 'mysql', 'redis', 'graphql'
    ];

    const lowerText = text.toLowerCase();
    techKeywords.forEach(tech => {
      if (lowerText.includes(tech)) {
        technologies.add(tech);
      }
    });

    return Array.from(technologies);
  }

  private extractKeywords(text: string): string[] {
    const keywords: string[] = [];
    
    // Extract important words (3+ chars, not common words)
    const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
    const commonWords = new Set(['the', 'and', 'for', 'with', 'this', 'that', 'from', 'have', 'been', 'when', 'where', 'what', 'which']);
    
    const wordCounts = new Map<string, number>();
    words.forEach(word => {
      if (!commonWords.has(word)) {
        wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
      }
    });

    // Get top keywords
    return Array.from(wordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word]) => word);
  }

  private extractCodeSnippets(text: string): string[] {
    const snippets: string[] = [];
    const codeBlockPattern = /```[\s\S]*?```/g;
    const codeBlocks = text.match(codeBlockPattern) || [];

    codeBlocks.forEach(block => {
      snippets.push(block.substring(0, 500));
    });

    return snippets.slice(0, 5);
  }

  private extractExceptionTypes(text: string): string[] {
    const exceptions = new Set<string>();
    const exceptionPattern = /(\w+(?:Error|Exception))/g;
    const matches = text.matchAll(exceptionPattern);

    for (const match of matches) {
      exceptions.add(match[1]);
    }

    return Array.from(exceptions);
  }

  /**
   * Deep Stack Overflow search with multiple strategies
   */
  private async deepStackOverflowSearch(searchTerms: SearchTerms): Promise<StackOverflowSolution[]> {
    console.log('🔍 Performing deep Stack Overflow search...');
    const solutions: StackOverflowSolution[] = [];

    // Strategy 1: Search by exact error messages
    for (const error of searchTerms.errorMessages.slice(0, 3)) {
      const results = await this.searchStackOverflow(error, searchTerms.technologies);
      results.forEach(q => {
        solutions.push({
          question: q,
          relevanceScore: 95,
          matchReason: 'Exact error message match',
          searchStrategy: 'error-based'
        });
      });
      await this.delay(200);
    }

    // Strategy 2: Search by exception types
    for (const exception of searchTerms.exceptionTypes.slice(0, 2)) {
      const query = `${exception} ${searchTerms.technologies.slice(0, 2).join(' ')}`;
      const results = await this.searchStackOverflow(query, searchTerms.technologies);
      results.forEach(q => {
        if (!solutions.find(s => s.question.question_id === q.question_id)) {
          solutions.push({
            question: q,
            relevanceScore: 85,
            matchReason: 'Exception type match',
            searchStrategy: 'exception-based'
          });
        }
      });
      await this.delay(200);
    }

    // Strategy 3: Search by keywords + technologies
    const keywordQuery = searchTerms.keywords.slice(0, 5).join(' ') + ' ' + searchTerms.technologies.slice(0, 2).join(' ');
    const keywordResults = await this.searchStackOverflow(keywordQuery, searchTerms.technologies);
    keywordResults.forEach(q => {
      if (!solutions.find(s => s.question.question_id === q.question_id)) {
        solutions.push({
          question: q,
          relevanceScore: 70,
          matchReason: 'Keyword and technology match',
          searchStrategy: 'keyword-based'
        });
      }
    });

    // Strategy 4: Search by technology tags only (for broader context)
    if (searchTerms.technologies.length > 0) {
      const tagResults = await this.searchByTags(searchTerms.technologies.slice(0, 3));
      tagResults.forEach(q => {
        if (!solutions.find(s => s.question.question_id === q.question_id)) {
          solutions.push({
            question: q,
            relevanceScore: 60,
            matchReason: 'Technology tag match',
            searchStrategy: 'tag-based'
          });
        }
      });
    }

    // Fetch answers for top solutions
    const topSolutions = solutions
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 10);

    for (const solution of topSolutions) {
      if (solution.question.answer_count > 0) {
        solution.question.answers = await this.fetchAnswers(solution.question.question_id);
        await this.delay(150);
      }
    }

    console.log(`✅ Found ${solutions.length} Stack Overflow solutions`);
    return topSolutions;
  }

  private async searchStackOverflow(
    query: string,
    tags: string[] = []
  ): Promise<StackOverflowQuestion[]> {
    try {
      const tagFilter = tags.length > 0 ? `tagged=${tags.slice(0, 3).join(';')}&` : '';
      const keyParam = this.apiKey ? `&key=${this.apiKey}` : '';
      const searchUrl = `${this.stackOverflowApiBase}/search/advanced?${tagFilter}order=desc&sort=relevance&q=${encodeURIComponent(query)}&site=stackoverflow&pagesize=10&filter=withbody${keyParam}`;

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
      console.error('Error searching Stack Overflow:', error);
      return [];
    }
  }

  private async searchByTags(tags: string[]): Promise<StackOverflowQuestion[]> {
    try {
      const keyParam = this.apiKey ? `&key=${this.apiKey}` : '';
      const searchUrl = `${this.stackOverflowApiBase}/questions?order=desc&sort=votes&tagged=${tags.join(';')}&site=stackoverflow&pagesize=5&filter=withbody${keyParam}`;

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

  private async fetchAnswers(questionId: number): Promise<any[]> {
    try {
      const keyParam = this.apiKey ? `&key=${this.apiKey}` : '';
      const answersUrl = `${this.stackOverflowApiBase}/questions/${questionId}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody&pagesize=5${keyParam}`;
      
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
   * Find related issues in the repository
   */
  private async findRelatedIssues(
    owner: string,
    repo: string,
    issue: GitHubIssue
  ): Promise<GitHubIssue[]> {
    console.log('🔗 Finding related issues...');
    
    try {
      // Search for issues with similar titles or labels
      const searchQueries = [
        issue.title.split(' ').slice(0, 5).join(' '),
        ...issue.labels.slice(0, 3).map(l => l.name)
      ];

      const relatedIssues: GitHubIssue[] = [];

      for (const query of searchQueries) {
        const searchResults = await this.octokit.rest.search.issuesAndPullRequests({
          q: `repo:${owner}/${repo} ${query} is:issue`,
          sort: 'reactions',
          order: 'desc',
          per_page: 10
        });

        for (const item of searchResults.data.items) {
          if (item.number !== issue.number && !item.pull_request) {
            const existingIssue = await this.octokit.rest.issues.get({
              owner,
              repo,
              issue_number: item.number
            });

            relatedIssues.push({
              id: existingIssue.data.id,
              number: existingIssue.data.number,
              title: existingIssue.data.title,
              body: existingIssue.data.body || '',
              state: existingIssue.data.state as 'open' | 'closed',
              labels: existingIssue.data.labels.map(label => ({
                name: typeof label === 'string' ? label : label.name || '',
                color: typeof label === 'string' ? '' : label.color || '',
              })),
              assignees: [],
              created_at: existingIssue.data.created_at,
              updated_at: existingIssue.data.updated_at,
              closed_at: existingIssue.data.closed_at,
              html_url: existingIssue.data.html_url,
              user: {
                login: existingIssue.data.user?.login || '',
                avatar_url: existingIssue.data.user?.avatar_url || '',
              },
              comments: existingIssue.data.comments,
              reactions: {
                total_count: existingIssue.data.reactions?.total_count || 0,
                '+1': existingIssue.data.reactions?.['+1'] || 0,
                '-1': existingIssue.data.reactions?.['-1'] || 0,
                laugh: existingIssue.data.reactions?.laugh || 0,
                hooray: existingIssue.data.reactions?.hooray || 0,
                confused: existingIssue.data.reactions?.confused || 0,
                heart: existingIssue.data.reactions?.heart || 0,
                rocket: existingIssue.data.reactions?.rocket || 0,
                eyes: existingIssue.data.reactions?.eyes || 0,
              },
              locked: existingIssue.data.locked,
            });
          }
        }

        await this.delay(300);
      }

      // Remove duplicates and sort by relevance
      const uniqueIssues = Array.from(
        new Map(relatedIssues.map(i => [i.number, i])).values()
      );

      console.log(`✅ Found ${uniqueIssues.length} related issues`);
      return uniqueIssues.slice(0, 10);
    } catch (error) {
      console.error('Error finding related issues:', error);
      return [];
    }
  }

  /**
   * Generate direct links for easy access
   */
  private generateDirectLinks(
    issue: GitHubIssue,
    solutions: StackOverflowSolution[]
  ): DirectLinks {
    return {
      githubIssue: issue.html_url,
      stackOverflowSolutions: solutions.map(s => ({
        title: s.question.title,
        url: s.question.link,
        relevance: s.relevanceScore,
        hasAcceptedAnswer: s.question.is_answered
      })),
      searchUrls: {
        googleSearch: `https://www.google.com/search?q=${encodeURIComponent(issue.title)}`,
        stackOverflowSearch: `https://stackoverflow.com/search?q=${encodeURIComponent(issue.title)}`,
        githubSearch: `https://github.com/search?q=${encodeURIComponent(issue.title)}&type=issues`
      }
    };
  }

  /**
   * Generate comprehensive analysis
   */
  private generateDeepAnalysis(
    issue: GitHubIssue,
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): DeepAnalysisResult {
    const hasErrors = solutions.some(s => s.searchStrategy === 'error-based');
    const hasAcceptedAnswers = solutions.filter(s => s.question.is_answered).length;
    const totalViews = solutions.reduce((sum, s) => sum + s.question.view_count, 0);
    const closedRelated = relatedIssues.filter(i => i.state === 'closed').length;

    return {
      summary: `Issue #${issue.number}: ${issue.title}`,
      complexity: this.assessComplexity(issue, solutions, relatedIssues),
      solvability: this.assessSolvability(solutions, relatedIssues),
      communityInterest: totalViews,
      recommendedApproach: this.generateRecommendedApproach(issue, solutions, relatedIssues),
      estimatedTime: this.estimateResolutionTime(issue, solutions, relatedIssues),
      confidence: this.calculateConfidence(solutions, relatedIssues),
      insights: [
        `Found ${solutions.length} Stack Overflow discussions`,
        `${hasAcceptedAnswers} solutions have accepted answers`,
        `${totalViews.toLocaleString()} total community views`,
        `${relatedIssues.length} related issues in repository`,
        `${closedRelated} similar issues already resolved`
      ]
    };
  }

  private assessComplexity(
    issue: GitHubIssue,
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): string {
    let score = 5;

    if (solutions.length === 0) score += 3;
    if (solutions.filter(s => s.question.is_answered).length === 0) score += 2;
    if (issue.comments > 20) score += 2;
    if (relatedIssues.filter(i => i.state === 'closed').length === 0) score += 2;
    if (issue.labels.some(l => l.name.toLowerCase().includes('complex'))) score += 3;

    if (score <= 5) return 'Low - Clear solutions available';
    if (score <= 10) return 'Medium - Requires investigation';
    return 'High - Complex issue requiring deep analysis';
  }

  private assessSolvability(
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): string {
    const hasAccepted = solutions.some(s => s.question.is_answered);
    const hasHighScore = solutions.some(s => s.question.score > 10);
    const hasClosedRelated = relatedIssues.some(i => i.state === 'closed');

    if (hasAccepted && hasHighScore) return 'High - Proven solutions available';
    if (hasAccepted || hasClosedRelated) return 'Medium - Potential solutions exist';
    return 'Low - May require custom solution';
  }

  private generateRecommendedApproach(
    issue: GitHubIssue,
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): string[] {
    const steps: string[] = [];

    steps.push('1. Review the complete issue description and all comments');

    if (solutions.length > 0) {
      const topSolution = solutions[0];
      steps.push(`2. Check the top Stack Overflow solution: ${topSolution.question.link}`);
      
      if (topSolution.question.is_answered) {
        steps.push('3. Implement the accepted answer approach');
      }
    }

    const closedRelated = relatedIssues.filter(i => i.state === 'closed');
    if (closedRelated.length > 0) {
      steps.push(`4. Review similar closed issue #${closedRelated[0].number}: ${closedRelated[0].html_url}`);
      steps.push('5. Apply the resolution pattern from the closed issue');
    }

    steps.push('6. Test the solution thoroughly in your environment');
    steps.push('7. Document the fix and share with the community');

    return steps;
  }

  private estimateResolutionTime(
    issue: GitHubIssue,
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): string {
    let hours = 8;

    if (solutions.some(s => s.question.is_answered)) hours -= 4;
    if (relatedIssues.some(i => i.state === 'closed')) hours -= 2;
    if (issue.comments > 20) hours += 4;
    if (solutions.length === 0) hours += 4;

    hours = Math.max(1, Math.min(hours, 40));

    if (hours <= 4) return `${hours} hours - Quick fix available`;
    if (hours <= 8) return `${hours} hours - Standard debugging`;
    if (hours <= 16) return `${hours} hours - Moderate complexity`;
    return `${hours} hours - Complex investigation required`;
  }

  private calculateConfidence(
    solutions: StackOverflowSolution[],
    relatedIssues: GitHubIssue[]
  ): number {
    let confidence = 50;

    confidence += solutions.filter(s => s.question.is_answered).length * 10;
    confidence += solutions.filter(s => s.question.score > 10).length * 5;
    confidence += relatedIssues.filter(i => i.state === 'closed').length * 5;
    confidence += Math.min(solutions.length * 2, 20);

    return Math.min(confidence, 100);
  }

  private parseGitHubUrl(url: string): { owner: string; repo: string; issueNumber: number } {
    const match = url.match(/github\.com\/([^\/]+)\/([^\/]+)\/issues\/(\d+)/);
    if (!match) {
      throw new Error('Invalid GitHub issue URL');
    }
    return {
      owner: match[1],
      repo: match[2],
      issueNumber: parseInt(match[3])
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Types
export interface DeepIssueAnalysis {
  issue: GitHubIssue;
  searchTerms: SearchTerms;
  stackOverflowSolutions: StackOverflowSolution[];
  relatedIssues: GitHubIssue[];
  directLinks: DirectLinks;
  analysis: DeepAnalysisResult;
}

export interface SearchTerms {
  errorMessages: string[];
  stackTraces: string[];
  technologies: string[];
  keywords: string[];
  codeSnippets: string[];
  exceptionTypes: string[];
}

export interface StackOverflowSolution {
  question: StackOverflowQuestion;
  relevanceScore: number;
  matchReason: string;
  searchStrategy: string;
}

export interface DirectLinks {
  githubIssue: string;
  stackOverflowSolutions: Array<{
    title: string;
    url: string;
    relevance: number;
    hasAcceptedAnswer: boolean;
  }>;
  searchUrls: {
    googleSearch: string;
    stackOverflowSearch: string;
    githubSearch: string;
  };
}

export interface DeepAnalysisResult {
  summary: string;
  complexity: string;
  solvability: string;
  communityInterest: number;
  recommendedApproach: string[];
  estimatedTime: string;
  confidence: number;
  insights: string[];
}

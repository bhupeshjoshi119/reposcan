import { Octokit } from '@octokit/rest';
import { DeepIssueAnalyzer, DeepIssueAnalysis } from './deepIssueAnalyzer';
import { GitHubIssue } from './issueAnalyzer';

/**
 * Batch Issue Analyzer - Analyzes ALL issues from a repository
 * Generates comprehensive reports with ALL issues and solutions
 * Perfect for educators and open-source collaboration
 */
export class BatchIssueAnalyzer {
  private octokit: Octokit;
  private deepAnalyzer: DeepIssueAnalyzer;

  constructor(githubToken?: string, stackExchangeKey?: string) {
    this.octokit = new Octokit({ auth: githubToken });
    this.deepAnalyzer = new DeepIssueAnalyzer(githubToken, stackExchangeKey);
  }

  /**
   * Analyze ALL issues from a repository
   * No limits - fetches everything
   */
  async analyzeAllIssues(
    owner: string,
    repo: string,
    options: BatchAnalysisOptions = {}
  ): Promise<BatchAnalysisResult> {
    console.log(`\n🚀 Starting batch analysis of ${owner}/${repo}...`);
    console.log(`📊 Fetching ALL issues (this may take a while for large repos)...\n`);

    const startTime = Date.now();

    // Fetch ALL issues (no limit)
    const allIssues = await this.fetchAllIssues(owner, repo, options);
    
    console.log(`\n✅ Fetched ${allIssues.length} total issues`);
    console.log(`📊 Open: ${allIssues.filter(i => i.state === 'open').length}`);
    console.log(`📊 Closed: ${allIssues.filter(i => i.state === 'closed').length}\n`);

    // Analyze each issue with deep search
    const analyses: DeepIssueAnalysis[] = [];
    const batchSize = options.batchSize || 10;
    
    for (let i = 0; i < allIssues.length; i += batchSize) {
      const batch = allIssues.slice(i, i + batchSize);
      console.log(`🔍 Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allIssues.length / batchSize)} (issues ${i + 1}-${Math.min(i + batchSize, allIssues.length)})...`);
      
      const batchAnalyses = await Promise.all(
        batch.map(issue => this.analyzeIssueWithRetry(owner, repo, issue.number))
      );
      
      analyses.push(...batchAnalyses.filter(a => a !== null) as DeepIssueAnalysis[]);
      
      // Progress update
      const progress = ((i + batchSize) / allIssues.length * 100).toFixed(1);
      console.log(`   Progress: ${Math.min(i + batchSize, allIssues.length)}/${allIssues.length} (${progress}%)`);
      
      // Rate limiting delay
      await this.delay(1000);
    }

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000 / 60).toFixed(2);

    console.log(`\n✅ Analysis complete!`);
    console.log(`📊 Total issues analyzed: ${analyses.length}`);
    console.log(`⏱️  Total time: ${duration} minutes\n`);

    return {
      repository: { owner, repo },
      totalIssues: allIssues.length,
      analyzedIssues: analyses.length,
      analyses,
      statistics: this.calculateStatistics(analyses),
      duration: parseFloat(duration)
    };
  }

  /**
   * Fetch ALL issues from repository (no pagination limit)
   */
  private async fetchAllIssues(
    owner: string,
    repo: string,
    options: BatchAnalysisOptions
  ): Promise<GitHubIssue[]> {
    const allIssues: GitHubIssue[] = [];
    let page = 1;
    const perPage = 100;
    const maxIssues = options.maxIssues || Infinity;

    while (allIssues.length < maxIssues) {
      try {
        const response = await this.octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: options.state || 'all',
          sort: 'created',
          direction: 'desc',
          per_page: perPage,
          page,
        });

        if (response.data.length === 0) break;

        const filteredIssues = response.data
          .filter(issue => !issue.pull_request)
          .map(issue => this.mapToGitHubIssue(issue));

        allIssues.push(...filteredIssues);

        console.log(`   Fetched page ${page}: ${allIssues.length} issues so far...`);

        if (response.data.length < perPage) break;
        
        page++;
        await this.delay(500); // Rate limiting
      } catch (error) {
        console.error(`Error fetching page ${page}:`, error);
        break;
      }
    }

    return allIssues.slice(0, maxIssues);
  }

  /**
   * Analyze issue with retry logic
   */
  private async analyzeIssueWithRetry(
    owner: string,
    repo: string,
    issueNumber: number,
    retries = 3
  ): Promise<DeepIssueAnalysis | null> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        return await this.deepAnalyzer.analyzeSpecificIssue(owner, repo, issueNumber);
      } catch (error) {
        console.error(`   Error analyzing issue #${issueNumber} (attempt ${attempt}/${retries}):`, error);
        if (attempt < retries) {
          await this.delay(2000 * attempt); // Exponential backoff
        }
      }
    }
    return null;
  }

  /**
   * Calculate comprehensive statistics
   */
  private calculateStatistics(analyses: DeepIssueAnalysis[]): BatchStatistics {
    const totalSolutions = analyses.reduce((sum, a) => sum + a.stackOverflowSolutions.length, 0);
    const totalRelatedIssues = analyses.reduce((sum, a) => sum + a.relatedIssues.length, 0);
    const totalViews = analyses.reduce((sum, a) => 
      sum + a.stackOverflowSolutions.reduce((s, sol) => s + sol.question.view_count, 0), 0
    );

    const withSolutions = analyses.filter(a => a.stackOverflowSolutions.length > 0);
    const withAcceptedAnswers = analyses.filter(a => 
      a.stackOverflowSolutions.some(s => s.question.is_answered)
    );

    const complexityDistribution = {
      low: analyses.filter(a => a.analysis.complexity.includes('Low')).length,
      medium: analyses.filter(a => a.analysis.complexity.includes('Medium')).length,
      high: analyses.filter(a => a.analysis.complexity.includes('High')).length,
    };

    const avgConfidence = analyses.reduce((sum, a) => sum + a.analysis.confidence, 0) / analyses.length;

    return {
      totalIssuesAnalyzed: analyses.length,
      totalStackOverflowSolutions: totalSolutions,
      totalRelatedIssues,
      totalCommunityViews: totalViews,
      issuesWithSolutions: withSolutions.length,
      issuesWithAcceptedAnswers: withAcceptedAnswers.length,
      averageConfidence: avgConfidence,
      complexityDistribution,
      solutionCoverage: (withSolutions.length / analyses.length * 100).toFixed(1) + '%',
      acceptedAnswerRate: (withAcceptedAnswers.length / analyses.length * 100).toFixed(1) + '%'
    };
  }

  private mapToGitHubIssue(issue: any): GitHubIssue {
    return {
      id: issue.id,
      number: issue.number,
      title: issue.title,
      body: issue.body || '',
      state: issue.state as 'open' | 'closed',
      labels: issue.labels.map((label: any) => ({
        name: typeof label === 'string' ? label : label.name || '',
        color: typeof label === 'string' ? '' : label.color || '',
      })),
      assignees: issue.assignees?.map((assignee: any) => ({
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
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Types
export interface BatchAnalysisOptions {
  state?: 'open' | 'closed' | 'all';
  maxIssues?: number;
  batchSize?: number;
}

export interface BatchAnalysisResult {
  repository: {
    owner: string;
    repo: string;
  };
  totalIssues: number;
  analyzedIssues: number;
  analyses: DeepIssueAnalysis[];
  statistics: BatchStatistics;
  duration: number;
}

export interface BatchStatistics {
  totalIssuesAnalyzed: number;
  totalStackOverflowSolutions: number;
  totalRelatedIssues: number;
  totalCommunityViews: number;
  issuesWithSolutions: number;
  issuesWithAcceptedAnswers: number;
  averageConfidence: number;
  complexityDistribution: {
    low: number;
    medium: number;
    high: number;
  };
  solutionCoverage: string;
  acceptedAnswerRate: string;
}

import { Octokit } from '@octokit/rest';
import { SecurityAnalyzer, SecurityAnalysis } from './securityAnalyzer';
import { SmartRecommendationsEngine, SmartRecommendation } from './smartRecommendations';
import { StackOverflowSolutionService, IssueSolution } from './stackOverflowSolutionService';

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  labels: Array<{
    name: string;
    color: string;
  }>;
  assignees: Array<{
    login: string;
    avatar_url: string;
  }>;
  created_at: string;
  updated_at: string;
  closed_at?: string;
  html_url: string;
  user: {
    login: string;
    avatar_url: string;
  };
  comments: number;
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
  milestone?: {
    title: string;
    description: string;
    state: string;
    due_on?: string;
  };
  pull_request?: any;
  locked: boolean;
  active_lock_reason?: string;
  comments_data?: GitHubComment[];
  timeline_events?: GitHubTimelineEvent[];
}

export interface GitHubComment {
  id: number;
  user: {
    login: string;
    avatar_url: string;
  };
  created_at: string;
  updated_at: string;
  body: string;
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    hooray: number;
    confused: number;
    heart: number;
    rocket: number;
    eyes: number;
  };
}

export interface GitHubTimelineEvent {
  event: string;
  created_at: string;
  actor?: {
    login: string;
    avatar_url: string;
  };
  label?: {
    name: string;
    color: string;
  };
  assignee?: {
    login: string;
  };
  milestone?: {
    title: string;
  };
}

export interface StackOverflowQuestion {
  question_id: number;
  title: string;
  body: string;
  tags: string[];
  score: number;
  view_count: number;
  answer_count: number;
  creation_date: number;
  last_activity_date: number;
  link: string;
  is_answered: boolean;
  accepted_answer_id?: number;
  owner: {
    display_name: string;
    reputation: number;
    user_id: number;
  };
  answers?: StackOverflowAnswer[];
}

export interface StackOverflowAnswer {
  answer_id: number;
  score: number;
  is_accepted: boolean;
  body: string;
  creation_date: number;
  owner: {
    display_name: string;
    reputation: number;
  };
}

export interface IssueAnalysis {
  summary: {
    totalIssues: number;
    openIssues: number;
    closedIssues: number;
    averageCloseTime: number;
    mostCommonLabels: Array<{ name: string; count: number; color: string }>;
    topContributors: Array<{ login: string; count: number; avatar_url: string }>;
    surprisingInsights: string[];
  };
  criticalIssues: GitHubIssue[];
  recentIssues: GitHubIssue[];
  allIssues: GitHubIssue[];
  relatedStackOverflowQuestions: StackOverflowQuestion[];
  issueSolutions: IssueSolution[];
  trends: {
    issueCreationTrend: Array<{ date: string; count: number }>;
    resolutionRate: number;
    averageResponseTime: number;
    issuePatterns: Array<{ pattern: string; count: number; examples: string[] }>;
  };
  recommendations: string[];
  smartRecommendations: SmartRecommendation[];
  securityAnalysis: SecurityAnalysis;
  detailedAnalysis: {
    bugPatterns: Array<{ pattern: string; frequency: number; impact: string }>;
    featureRequestTrends: Array<{ category: string; count: number; priority: string }>;
    communityEngagement: {
      mostDiscussedIssues: GitHubIssue[];
      controversialIssues: GitHubIssue[];
      quicklyResolvedIssues: GitHubIssue[];
    };
    stackOverflowCorrelation: {
      commonTopics: string[];
      documentationGaps: string[];
      communityQuestions: StackOverflowQuestion[];
    };
  };
}

export class IssueAnalyzer {
  private octokit: Octokit;
  private stackOverflowApiBase = 'https://api.stackexchange.com/2.3';

  constructor(githubToken?: string) {
    this.octokit = new Octokit({
      auth: githubToken,
    });
  }

  async analyzeRepository(owner: string, repo: string): Promise<IssueAnalysis> {
    try {
      // Fetch GitHub issues
      const issues = await this.fetchGitHubIssues(owner, repo);
      
      // Fetch related Stack Overflow questions
      const stackOverflowQuestions = await this.fetchRelatedStackOverflowQuestions(repo);
      
      // Find comprehensive solutions for all issues
      console.log('🎯 Finding Stack Overflow solutions for all issues...');
      const solutionService = new StackOverflowSolutionService();
      const issueSolutions = await solutionService.findSolutionsForAllIssues(issues.slice(0, 50)); // Limit to top 50 for performance
      
      // Analyze the data
      const analysis = this.performAnalysis(issues, stackOverflowQuestions, issueSolutions);
      
      return analysis;
    } catch (error) {
      console.error('Error analyzing repository:', error);
      throw new Error(`Failed to analyze repository: ${error.message}`);
    }
  }

  private async fetchGitHubIssues(owner: string, repo: string): Promise<GitHubIssue[]> {
    const issues: GitHubIssue[] = [];
    let page = 1;
    const perPage = 100;

    try {
      console.log(`🔍 Fetching comprehensive issue data for ${owner}/${repo}...`);
      
      while (issues.length < 1000) { // Increased limit for comprehensive analysis
        const response = await this.octokit.rest.issues.listForRepo({
          owner,
          repo,
          state: 'all',
          sort: 'updated',
          direction: 'desc',
          per_page: perPage,
          page,
        });

        if (response.data.length === 0) break;

        const filteredIssues = response.data
          .filter(issue => !issue.pull_request) // Exclude pull requests
          .map(issue => ({
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
            milestone: issue.milestone ? {
              title: issue.milestone.title,
              description: issue.milestone.description || '',
              state: issue.milestone.state,
              due_on: issue.milestone.due_on,
            } : undefined,
            locked: issue.locked,
            active_lock_reason: issue.active_lock_reason,
          }));

        issues.push(...filteredIssues);
        page++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Fetch detailed information for top issues
      console.log(`📊 Fetching detailed comments and timeline for top ${Math.min(50, issues.length)} issues...`);
      await this.enrichIssuesWithDetails(owner, repo, issues.slice(0, 50));

    } catch (error) {
      console.error('Error fetching GitHub issues:', error);
    }

    return issues;
  }

  private async enrichIssuesWithDetails(owner: string, repo: string, issues: GitHubIssue[]): Promise<void> {
    for (const issue of issues) {
      try {
        // Fetch comments if the issue has any
        if (issue.comments > 0) {
          const commentsResponse = await this.octokit.rest.issues.listComments({
            owner,
            repo,
            issue_number: issue.number,
            per_page: 100,
          });

          issue.comments_data = commentsResponse.data.map(comment => ({
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
          }));
        }

        // Fetch timeline events for critical issues
        if (issue.reactions.total_count > 5 || issue.comments > 10) {
          try {
            const timelineResponse = await this.octokit.rest.issues.listEventsForTimeline({
              owner,
              repo,
              issue_number: issue.number,
              per_page: 50,
            });

            issue.timeline_events = timelineResponse.data.map((event: any) => ({
              event: event.event || '',
              created_at: event.created_at || '',
              actor: event.actor ? {
                login: event.actor.login || '',
                avatar_url: event.actor.avatar_url || '',
              } : undefined,
              label: event.label ? {
                name: event.label.name || '',
                color: event.label.color || '',
              } : undefined,
              assignee: event.assignee ? {
                login: event.assignee.login || '',
              } : undefined,
              milestone: event.milestone ? {
                title: event.milestone.title || '',
              } : undefined,
            }));
          } catch (timelineError) {
            // Timeline API might not be available for all repos
            console.log(`Timeline not available for issue #${issue.number}`);
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        console.error(`Error enriching issue #${issue.number}:`, error);
      }
    }
  }

  private async fetchRelatedStackOverflowQuestions(repoName: string): Promise<StackOverflowQuestion[]> {
    try {
      console.log(`🔍 Searching Stack Overflow for discussions about ${repoName}...`);
      
      const searchTerms = [
        repoName,
        repoName.replace('-', ' '),
        repoName.replace('_', ' '),
        repoName.split('-').join(' '),
        repoName.split('_').join(' ')
      ];
      
      const questions: StackOverflowQuestion[] = [];

      for (const term of searchTerms) {
        // Search for questions
        const searchUrl = `${this.stackOverflowApiBase}/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(term)}&site=stackoverflow&pagesize=25&filter=withbody`;
        
        const response = await fetch(searchUrl);
        const data = await response.json();

        if (data.items) {
          const questionsWithDetails = await Promise.all(
            data.items.slice(0, 15).map(async (item: any) => {
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

              // Fetch answers for questions with high engagement
              if (item.answer_count > 0 && (item.score > 2 || item.view_count > 100)) {
                try {
                  const answersUrl = `${this.stackOverflowApiBase}/questions/${item.question_id}/answers?order=desc&sort=votes&site=stackoverflow&filter=withbody&pagesize=5`;
                  const answersResponse = await fetch(answersUrl);
                  const answersData = await answersResponse.json();

                  if (answersData.items) {
                    question.answers = answersData.items.map((answer: any) => ({
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
                  }

                  // Rate limiting for API calls
                  await new Promise(resolve => setTimeout(resolve, 150));
                } catch (answerError) {
                  console.log(`Could not fetch answers for question ${item.question_id}`);
                }
              }

              return question;
            })
          );

          questions.push(...questionsWithDetails);
        }

        // Rate limiting between search terms
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      // Remove duplicates and sort by relevance and engagement
      const uniqueQuestions = questions.filter((question, index, self) => 
        index === self.findIndex(q => q.question_id === question.question_id)
      );

      // Sort by engagement score (views + score + answers)
      const sortedQuestions = uniqueQuestions.sort((a, b) => {
        const scoreA = a.view_count + (a.score * 10) + (a.answer_count * 5);
        const scoreB = b.view_count + (b.score * 10) + (b.answer_count * 5);
        return scoreB - scoreA;
      });

      console.log(`📊 Found ${sortedQuestions.length} relevant Stack Overflow discussions`);
      return sortedQuestions.slice(0, 15); // Return top 15 most relevant
    } catch (error) {
      console.error('Error fetching Stack Overflow questions:', error);
      return [];
    }
  }

  private performAnalysis(issues: GitHubIssue[], stackOverflowQuestions: StackOverflowQuestion[], issueSolutions: IssueSolution[]): IssueAnalysis {
    console.log(`🧠 Performing deep analysis on ${issues.length} issues, ${stackOverflowQuestions.length} Stack Overflow questions, and ${issueSolutions.length} solutions...`);
    
    const openIssues = issues.filter(issue => issue.state === 'open');
    const closedIssues = issues.filter(issue => issue.state === 'closed');

    // Calculate average close time
    const closedWithTimes = closedIssues.filter(issue => issue.closed_at);
    const averageCloseTime = closedWithTimes.length > 0 
      ? closedWithTimes.reduce((sum, issue) => {
          const created = new Date(issue.created_at).getTime();
          const closed = new Date(issue.closed_at!).getTime();
          return sum + (closed - created);
        }, 0) / closedWithTimes.length / (1000 * 60 * 60 * 24) // Convert to days
      : 0;

    // Most common labels
    const labelCounts = new Map<string, { count: number; color: string }>();
    issues.forEach(issue => {
      issue.labels.forEach(label => {
        const current = labelCounts.get(label.name) || { count: 0, color: label.color };
        labelCounts.set(label.name, { count: current.count + 1, color: label.color });
      });
    });

    const mostCommonLabels = Array.from(labelCounts.entries())
      .map(([name, data]) => ({ name, count: data.count, color: data.color }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Top contributors
    const contributorCounts = new Map<string, { count: number; avatar_url: string }>();
    issues.forEach(issue => {
      const current = contributorCounts.get(issue.user.login) || { count: 0, avatar_url: issue.user.avatar_url };
      contributorCounts.set(issue.user.login, { count: current.count + 1, avatar_url: issue.user.avatar_url });
    });

    const topContributors = Array.from(contributorCounts.entries())
      .map(([login, data]) => ({ login, count: data.count, avatar_url: data.avatar_url }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // Generate surprising insights
    const surprisingInsights = this.generateSurprisingInsights(issues, stackOverflowQuestions);

    // Critical issues (high priority, many reactions, or long-standing)
    const criticalIssues = issues
      .filter(issue => 
        issue.state === 'open' && (
          issue.reactions.total_count > 3 ||
          issue.comments > 5 ||
          issue.labels.some(label => 
            label.name.toLowerCase().includes('critical') ||
            label.name.toLowerCase().includes('urgent') ||
            label.name.toLowerCase().includes('bug') ||
            label.name.toLowerCase().includes('security')
          )
        )
      )
      .sort((a, b) => (b.reactions.total_count + b.comments) - (a.reactions.total_count + a.comments))
      .slice(0, 20);

    // Recent issues (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentIssues = issues
      .filter(issue => new Date(issue.created_at) > thirtyDaysAgo)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 25);

    // Issue creation trend and patterns
    const issueCreationTrend = this.calculateIssueTrend(issues);
    const issuePatterns = this.analyzeIssuePatterns(issues);

    // Resolution rate
    const resolutionRate = issues.length > 0 ? (closedIssues.length / issues.length) * 100 : 0;

    // Detailed analysis
    const detailedAnalysis = this.performDetailedAnalysis(issues, stackOverflowQuestions);

    // Generate recommendations
    const recommendations = this.generateRecommendations(issues, stackOverflowQuestions);

    // Create preliminary analysis for smart recommendations
    const preliminaryAnalysis: IssueAnalysis = {
      summary: {
        totalIssues: issues.length,
        openIssues: openIssues.length,
        closedIssues: closedIssues.length,
        averageCloseTime,
        mostCommonLabels,
        topContributors,
        surprisingInsights,
      },
      criticalIssues,
      recentIssues,
      allIssues: issues,
      relatedStackOverflowQuestions: stackOverflowQuestions,
      issueSolutions,
      trends: {
        issueCreationTrend,
        resolutionRate,
        averageResponseTime: averageCloseTime,
        issuePatterns,
      },
      recommendations,
      smartRecommendations: [],
      securityAnalysis: {} as SecurityAnalysis,
      detailedAnalysis,
    };

    // Generate smart recommendations
    const smartRecommendations = SmartRecommendationsEngine.generateRecommendations(preliminaryAnalysis);

    // Perform security analysis
    const securityAnalysis = SecurityAnalyzer.analyzeRepositorySecurity(issues);

    return {
      ...preliminaryAnalysis,
      smartRecommendations,
      securityAnalysis,
    };
  }

  private generateSurprisingInsights(issues: GitHubIssue[], stackOverflowQuestions: StackOverflowQuestion[]): string[] {
    const insights: string[] = [];

    // Analyze issue timing patterns
    const hourCounts = new Array(24).fill(0);
    const dayCounts = new Array(7).fill(0);
    
    issues.forEach(issue => {
      const date = new Date(issue.created_at);
      hourCounts[date.getHours()]++;
      dayCounts[date.getDay()]++;
    });

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    const peakDay = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayCounts.indexOf(Math.max(...dayCounts))];

    insights.push(`🕐 Most issues are reported at ${peakHour}:00 on ${peakDay}s - suggesting when users are most active`);

    // Analyze emoji usage in issues
    const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const issuesWithEmojis = issues.filter(issue => emojiPattern.test(issue.title + issue.body)).length;
    if (issuesWithEmojis > issues.length * 0.1) {
      insights.push(`😊 ${((issuesWithEmojis / issues.length) * 100).toFixed(1)}% of issues contain emojis - indicating an expressive community`);
    }

    // Analyze issue length correlation with resolution
    const longIssues = issues.filter(issue => issue.body.length > 1000);
    const longIssueResolutionRate = longIssues.filter(issue => issue.state === 'closed').length / longIssues.length;
    const shortIssues = issues.filter(issue => issue.body.length < 200);
    const shortIssueResolutionRate = shortIssues.filter(issue => issue.state === 'closed').length / shortIssues.length;

    if (longIssueResolutionRate > shortIssueResolutionRate + 0.1) {
      insights.push(`📝 Detailed issues (>1000 chars) have ${((longIssueResolutionRate - shortIssueResolutionRate) * 100).toFixed(1)}% higher resolution rate than brief ones`);
    }

    // Analyze Stack Overflow correlation
    const totalSOViews = stackOverflowQuestions.reduce((sum, q) => sum + q.view_count, 0);
    if (totalSOViews > 50000) {
      insights.push(`🌟 Stack Overflow discussions about this project have ${totalSOViews.toLocaleString()} total views - indicating significant community interest`);
    }

    // Analyze reaction patterns
    const heartReactions = issues.reduce((sum, issue) => sum + issue.reactions.heart, 0);
    const rocketReactions = issues.reduce((sum, issue) => sum + issue.reactions.rocket, 0);
    if (heartReactions > rocketReactions * 2) {
      insights.push(`❤️ Community shows more love (${heartReactions} hearts) than excitement (${rocketReactions} rockets) for issues`);
    }

    // Analyze milestone usage
    const issuesWithMilestones = issues.filter(issue => issue.milestone).length;
    if (issuesWithMilestones > issues.length * 0.3) {
      insights.push(`🎯 ${((issuesWithMilestones / issues.length) * 100).toFixed(1)}% of issues are milestone-tracked - showing excellent project planning`);
    }

    // Analyze comment engagement
    const totalComments = issues.reduce((sum, issue) => sum + issue.comments, 0);
    const avgCommentsPerIssue = totalComments / issues.length;
    if (avgCommentsPerIssue > 5) {
      insights.push(`💬 Average ${avgCommentsPerIssue.toFixed(1)} comments per issue indicates highly engaged community discussions`);
    }

    return insights.slice(0, 8); // Return top 8 insights
  }

  private analyzeIssuePatterns(issues: GitHubIssue[]): Array<{ pattern: string; count: number; examples: string[] }> {
    const patterns: Array<{ pattern: string; count: number; examples: string[] }> = [];

    // Bug patterns
    const bugKeywords = ['crash', 'error', 'exception', 'fail', 'broken', 'not working', 'bug'];
    const bugIssues = issues.filter(issue => 
      bugKeywords.some(keyword => 
        issue.title.toLowerCase().includes(keyword) || 
        issue.body.toLowerCase().includes(keyword)
      )
    );
    if (bugIssues.length > 0) {
      patterns.push({
        pattern: 'Bug Reports',
        count: bugIssues.length,
        examples: bugIssues.slice(0, 3).map(issue => `#${issue.number}: ${issue.title}`)
      });
    }

    // Feature request patterns
    const featureKeywords = ['feature', 'enhancement', 'add', 'support', 'implement', 'request'];
    const featureIssues = issues.filter(issue => 
      featureKeywords.some(keyword => 
        issue.title.toLowerCase().includes(keyword) || 
        issue.labels.some(label => label.name.toLowerCase().includes(keyword))
      )
    );
    if (featureIssues.length > 0) {
      patterns.push({
        pattern: 'Feature Requests',
        count: featureIssues.length,
        examples: featureIssues.slice(0, 3).map(issue => `#${issue.number}: ${issue.title}`)
      });
    }

    // Documentation patterns
    const docKeywords = ['documentation', 'docs', 'readme', 'guide', 'tutorial', 'example'];
    const docIssues = issues.filter(issue => 
      docKeywords.some(keyword => 
        issue.title.toLowerCase().includes(keyword) || 
        issue.labels.some(label => label.name.toLowerCase().includes(keyword))
      )
    );
    if (docIssues.length > 0) {
      patterns.push({
        pattern: 'Documentation Issues',
        count: docIssues.length,
        examples: docIssues.slice(0, 3).map(issue => `#${issue.number}: ${issue.title}`)
      });
    }

    // Performance patterns
    const perfKeywords = ['performance', 'slow', 'speed', 'optimization', 'memory', 'cpu'];
    const perfIssues = issues.filter(issue => 
      perfKeywords.some(keyword => 
        issue.title.toLowerCase().includes(keyword) || 
        issue.body.toLowerCase().includes(keyword)
      )
    );
    if (perfIssues.length > 0) {
      patterns.push({
        pattern: 'Performance Issues',
        count: perfIssues.length,
        examples: perfIssues.slice(0, 3).map(issue => `#${issue.number}: ${issue.title}`)
      });
    }

    return patterns.sort((a, b) => b.count - a.count);
  }

  private performDetailedAnalysis(issues: GitHubIssue[], stackOverflowQuestions: StackOverflowQuestion[]) {
    // Bug patterns analysis
    const bugPatterns = this.analyzeBugPatterns(issues);
    
    // Feature request trends
    const featureRequestTrends = this.analyzeFeatureRequestTrends(issues);
    
    // Community engagement analysis
    const communityEngagement = this.analyzeCommunityEngagement(issues);
    
    // Stack Overflow correlation
    const stackOverflowCorrelation = this.analyzeStackOverflowCorrelation(issues, stackOverflowQuestions);

    return {
      bugPatterns,
      featureRequestTrends,
      communityEngagement,
      stackOverflowCorrelation,
    };
  }

  private analyzeBugPatterns(issues: GitHubIssue[]) {
    const patterns = [
      { pattern: 'Crash/Exception Reports', keywords: ['crash', 'exception', 'error', 'traceback'], impact: 'High' },
      { pattern: 'UI/UX Issues', keywords: ['ui', 'ux', 'interface', 'display', 'layout'], impact: 'Medium' },
      { pattern: 'Performance Problems', keywords: ['slow', 'performance', 'memory', 'cpu', 'lag'], impact: 'High' },
      { pattern: 'Installation Issues', keywords: ['install', 'setup', 'dependency', 'build'], impact: 'Medium' },
      { pattern: 'Compatibility Issues', keywords: ['compatibility', 'version', 'browser', 'os'], impact: 'Medium' },
    ];

    return patterns.map(pattern => {
      const matchingIssues = issues.filter(issue => 
        pattern.keywords.some(keyword => 
          issue.title.toLowerCase().includes(keyword) || 
          issue.body.toLowerCase().includes(keyword)
        )
      );
      
      return {
        pattern: pattern.pattern,
        frequency: matchingIssues.length,
        impact: pattern.impact,
      };
    }).filter(p => p.frequency > 0);
  }

  private analyzeFeatureRequestTrends(issues: GitHubIssue[]) {
    const categories = [
      { category: 'API Enhancements', keywords: ['api', 'endpoint', 'method', 'function'] },
      { category: 'UI Improvements', keywords: ['ui', 'interface', 'design', 'theme'] },
      { category: 'Integration Features', keywords: ['integration', 'plugin', 'extension', 'webhook'] },
      { category: 'Performance Features', keywords: ['optimization', 'cache', 'speed', 'performance'] },
      { category: 'Security Features', keywords: ['security', 'auth', 'permission', 'encryption'] },
    ];

    return categories.map(category => {
      const matchingIssues = issues.filter(issue => 
        category.keywords.some(keyword => 
          issue.title.toLowerCase().includes(keyword) || 
          issue.body.toLowerCase().includes(keyword)
        ) && (
          issue.labels.some(label => 
            label.name.toLowerCase().includes('feature') || 
            label.name.toLowerCase().includes('enhancement')
          )
        )
      );
      
      const priority = matchingIssues.length > 10 ? 'High' : matchingIssues.length > 5 ? 'Medium' : 'Low';
      
      return {
        category: category.category,
        count: matchingIssues.length,
        priority,
      };
    }).filter(c => c.count > 0);
  }

  private analyzeCommunityEngagement(issues: GitHubIssue[]) {
    // Most discussed issues (by comments + reactions)
    const mostDiscussedIssues = issues
      .sort((a, b) => (b.comments + b.reactions.total_count) - (a.comments + a.reactions.total_count))
      .slice(0, 10);

    // Controversial issues (high engagement but mixed reactions)
    const controversialIssues = issues
      .filter(issue => issue.reactions.total_count > 5 && issue.reactions['-1'] > 0)
      .sort((a, b) => (b.reactions['-1'] + b.reactions.confused) - (a.reactions['-1'] + a.reactions.confused))
      .slice(0, 5);

    // Quickly resolved issues (closed within 24 hours)
    const quicklyResolvedIssues = issues
      .filter(issue => {
        if (!issue.closed_at) return false;
        const created = new Date(issue.created_at).getTime();
        const closed = new Date(issue.closed_at).getTime();
        return (closed - created) < (24 * 60 * 60 * 1000); // 24 hours
      })
      .slice(0, 10);

    return {
      mostDiscussedIssues,
      controversialIssues,
      quicklyResolvedIssues,
    };
  }

  private analyzeStackOverflowCorrelation(issues: GitHubIssue[], stackOverflowQuestions: StackOverflowQuestion[]) {
    // Extract common topics from both GitHub issues and Stack Overflow
    const githubTopics = new Set<string>();
    const soTopics = new Set<string>();

    issues.forEach(issue => {
      issue.labels.forEach(label => githubTopics.add(label.name.toLowerCase()));
    });

    stackOverflowQuestions.forEach(question => {
      question.tags.forEach(tag => soTopics.add(tag.toLowerCase()));
    });

    const commonTopics = Array.from(githubTopics).filter(topic => soTopics.has(topic));

    // Identify documentation gaps (topics discussed on SO but not in GitHub issues)
    const documentationGaps = Array.from(soTopics).filter(topic => !githubTopics.has(topic));

    return {
      commonTopics: commonTopics.slice(0, 10),
      documentationGaps: documentationGaps.slice(0, 10),
      communityQuestions: stackOverflowQuestions.slice(0, 10),
    };
  }

  private calculateIssueTrend(issues: GitHubIssue[]): Array<{ date: string; count: number }> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthCounts = new Map<string, number>();
    
    issues
      .filter(issue => new Date(issue.created_at) > sixMonthsAgo)
      .forEach(issue => {
        const date = new Date(issue.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + 1);
      });

    return Array.from(monthCounts.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private generateRecommendations(issues: GitHubIssue[], stackOverflowQuestions: StackOverflowQuestion[]): string[] {
    const recommendations: string[] = [];
    const openIssues = issues.filter(issue => issue.state === 'open');

    if (openIssues.length > issues.length * 0.7) {
      recommendations.push('High number of open issues detected. Consider prioritizing issue resolution and implementing a triage process.');
    }

    const oldIssues = openIssues.filter(issue => {
      const created = new Date(issue.created_at);
      const monthsOld = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 6;
    });

    if (oldIssues.length > 10) {
      recommendations.push('Multiple stale issues found. Consider reviewing and closing outdated issues or updating their status.');
    }

    const bugIssues = issues.filter(issue => 
      issue.labels.some(label => label.name.toLowerCase().includes('bug'))
    );

    if (bugIssues.length > issues.length * 0.3) {
      recommendations.push('High percentage of bug reports. Consider implementing better testing practices and code review processes.');
    }

    if (stackOverflowQuestions.length > 5) {
      recommendations.push('Active community discussions found on Stack Overflow. Consider creating better documentation or FAQ section.');
    }

    const enhancementRequests = issues.filter(issue =>
      issue.labels.some(label => 
        label.name.toLowerCase().includes('enhancement') ||
        label.name.toLowerCase().includes('feature')
      )
    );

    if (enhancementRequests.length > 20) {
      recommendations.push('Many feature requests detected. Consider creating a roadmap and prioritization framework.');
    }

    return recommendations;
  }
}
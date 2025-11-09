import { PDFContent, PDFSection, PDFContentItem } from './pdfGenerator';
import { IssueAnalysis, GitHubIssue, StackOverflowQuestion } from './issueAnalyzer';
import { SecurityAnalysis } from './securityAnalyzer';
import { SmartRecommendation } from './smartRecommendations';
import { PDFSolutionsSection } from './pdfSolutionsSection';
import { DeveloperLearningContent } from './developerLearningContent';

export class PDFContentGenerator {
  static generateIssueAnalysisReport(
    analysis: IssueAnalysis,
    repositoryName: string,
    repositoryUrl: string
  ): PDFContent {
    const sections: PDFSection[] = [];

    // Executive Summary Section
    sections.push(this.createExecutiveSummarySection(analysis, repositoryName));

    // Security Analysis Section (High Priority)
    sections.push(this.createSecurityAnalysisSection(analysis.securityAnalysis));

    // Health Score & Risk Assessment Section
    sections.push(this.createHealthScoreSection(analysis));

    // Surprising Insights Section
    if (analysis.summary.surprisingInsights.length > 0) {
      sections.push(this.createSurprisingInsightsSection(analysis.summary.surprisingInsights));
    }

    // Repository Overview Section
    sections.push(this.createRepositoryOverviewSection(repositoryName, repositoryUrl, analysis));

    // Comprehensive Issue Statistics Section
    sections.push(this.createComprehensiveIssueStatisticsSection(analysis));

    // All Issues Deep Dive Section
    sections.push(this.createAllIssuesSection(analysis.allIssues));

    // Critical Issues Section
    if (analysis.criticalIssues.length > 0) {
      sections.push(this.createDetailedCriticalIssuesSection(analysis.criticalIssues));
    }

    // Recent Activity Section
    if (analysis.recentIssues.length > 0) {
      sections.push(this.createDetailedRecentActivitySection(analysis.recentIssues));
    }

    // Issue Patterns and Trends Section
    sections.push(this.createIssuePatternsSection(analysis));

    // Community Engagement Analysis Section
    sections.push(this.createCommunityEngagementSection(analysis.detailedAnalysis.communityEngagement));

    // COMPREHENSIVE SOLUTIONS SECTION - THE MAIN FEATURE!
    if (analysis.issueSolutions && analysis.issueSolutions.length > 0) {
      // Main solutions sections
      sections.push(PDFSolutionsSection.createIssueSolutionsSection(analysis.issueSolutions));
      sections.push(PDFSolutionsSection.createClosedIssuesLearningSection(analysis.issueSolutions));
      sections.push(PDFSolutionsSection.createQuickReferenceSection(analysis.issueSolutions));
      
      // DEVELOPER LEARNING SECTIONS - Educational Content
      sections.push(DeveloperLearningContent.createDeveloperLearningGuide(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createErrorTypesEncyclopedia(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createDebuggingStrategies(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createCodeExamplesSection(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createBestPracticesSection(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createTechnologyGuides(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createCommonPatternsSection(analysis.issueSolutions));
      sections.push(DeveloperLearningContent.createLearningResourcesSection());
    }

    // Stack Overflow Integration Section
    if (analysis.relatedStackOverflowQuestions.length > 0) {
      sections.push(this.createDetailedStackOverflowSection(analysis.relatedStackOverflowQuestions, analysis.detailedAnalysis.stackOverflowCorrelation));
    }

    // Bug Patterns Analysis Section
    if (analysis.detailedAnalysis.bugPatterns.length > 0) {
      sections.push(this.createBugPatternsSection(analysis.detailedAnalysis.bugPatterns));
    }

    // Feature Request Trends Section
    if (analysis.detailedAnalysis.featureRequestTrends.length > 0) {
      sections.push(this.createFeatureRequestTrendsSection(analysis.detailedAnalysis.featureRequestTrends));
    }

    // Trends and Analytics Section
    sections.push(this.createAdvancedTrendsSection(analysis));

    // Top Contributors Section
    sections.push(this.createDetailedContributorsSection(analysis));

    // Strategic Recommendations Section (Legacy)
    if (analysis.recommendations.length > 0) {
      sections.push(this.createDetailedRecommendationsSection(analysis.recommendations));
    }

    // Smart Recommendations Section (Enhanced)
    if (analysis.smartRecommendations.length > 0) {
      sections.push(this.createSmartRecommendationsSection(analysis.smartRecommendations));
    }

    // Stack Overflow Attribution Section
    sections.push(this.createStackOverflowAttributionSection());

    // Appendix Section
    sections.push(this.createDetailedAppendixSection());

    return {
      title: `Comprehensive Issue Analysis Report: ${repositoryName}`,
      sections,
      metadata: {
        author: 'Advanced GitHub Repository Analyzer with Stack Overflow Integration',
        subject: `Deep dive analysis of ${repositoryName} - Issues, Community, and Insights`,
        keywords: ['GitHub', 'Issues', 'Analysis', 'Repository', 'Stack Overflow', 'Community', 'Insights', 'Patterns'],
        createdAt: new Date(),
      },
    };
  }

  private static createExecutiveSummarySection(analysis: IssueAnalysis, repositoryName: string): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `🚀 Repository: ${repositoryName}`,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'This comprehensive report provides deep insights into repository health, issue patterns, community engagement, and correlates GitHub issues with Stack Overflow discussions to reveal surprising insights about your project.',
    });

    content.push({
      type: 'underline',
      content: '📊 Key Metrics at a Glance:',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'bullet',
      content: `📈 Total Issues Analyzed: ${analysis.summary.totalIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔓 Open Issues: ${analysis.summary.openIssues.toLocaleString()} (${((analysis.summary.openIssues / analysis.summary.totalIssues) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Closed Issues: ${analysis.summary.closedIssues.toLocaleString()} (${((analysis.summary.closedIssues / analysis.summary.totalIssues) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⏱️ Average Resolution Time: ${analysis.summary.averageCloseTime.toFixed(1)} days`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🚨 Critical Issues Requiring Attention: ${analysis.criticalIssues.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `💬 Stack Overflow Community Discussions: ${analysis.relatedStackOverflowQuestions.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🏆 Top Contributors: ${analysis.summary.topContributors.length}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Resolution Rate: ${analysis.trends.resolutionRate.toFixed(1)}%`,
      style: { indent: 5 }
    });

    return {
      heading: '🎯 Executive Summary',
      content,
      level: 1
    };
  }

  private static createSurprisingInsightsSection(insights: string[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🔍 Surprising Discoveries About Your Repository',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'text',
      content: 'Our advanced analysis has uncovered fascinating patterns and insights that reveal the hidden dynamics of your project community and development patterns.',
    });

    insights.forEach((insight, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. ${insight}`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🔮 Surprising Insights & Hidden Patterns',
      content,
      level: 1
    };
  }

  private static createRepositoryOverviewSection(repositoryName: string, repositoryUrl: string, analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: `This analysis covers the ${repositoryName} repository, examining issue patterns, contributor activity, and community engagement.`
    });

    content.push({
      type: 'bold',
      content: 'Repository Details:'
    });

    content.push({
      type: 'bullet',
      content: `Repository URL: ${repositoryUrl}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Analysis Date: ${new Date().toLocaleDateString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Resolution Rate: ${analysis.trends.resolutionRate.toFixed(1)}%`,
      style: { indent: 5 }
    });

    return {
      heading: 'Repository Overview',
      content,
      level: 1
    };
  }

  private static createIssueStatisticsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'underline',
      content: 'Issue Distribution:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `Open Issues: ${analysis.summary.openIssues}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Closed Issues: ${analysis.summary.closedIssues}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: 'Most Common Labels:',
      style: { fontSize: 13 }
    });

    analysis.summary.mostCommonLabels.slice(0, 8).forEach(label => {
      content.push({
        type: 'bullet',
        content: `${label.name}: ${label.count} issues`,
        style: { indent: 5 }
      });
    });

    content.push({
      type: 'highlight',
      content: `Average Issue Resolution Time: ${analysis.summary.averageCloseTime.toFixed(1)} days`
    });

    return {
      heading: 'Issue Statistics',
      content,
      level: 1
    };
  }

  private static createCriticalIssuesSection(criticalIssues: GitHubIssue[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `${criticalIssues.length} critical issues require immediate attention`,
    });

    content.push({
      type: 'text',
      content: 'Critical issues are identified based on high community engagement, number of reactions, comments, or critical/urgent labels.'
    });

    criticalIssues.slice(0, 10).forEach((issue, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. Issue #${issue.number}: ${issue.title}`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: `Status: ${issue.state.toUpperCase()}`,
        style: { indent: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Reactions: ${issue.reactions.total_count} | Comments: ${issue.comments}`,
        style: { indent: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        style: { indent: 10 }
      });

      if (issue.labels.length > 0) {
        content.push({
          type: 'bullet',
          content: `Labels: ${issue.labels.map(l => l.name).join(', ')}`,
          style: { indent: 10 }
        });
      }

      content.push({
        type: 'link',
        content: issue.html_url,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: 'Critical Issues Analysis',
      content,
      level: 1
    };
  }

  private static createRecentActivitySection(recentIssues: GitHubIssue[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: `Recent activity analysis covers ${recentIssues.length} issues created in the last 30 days.`
    });

    const openRecent = recentIssues.filter(issue => issue.state === 'open').length;
    const closedRecent = recentIssues.filter(issue => issue.state === 'closed').length;

    content.push({
      type: 'bullet',
      content: `Open Recent Issues: ${openRecent}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Closed Recent Issues: ${closedRecent}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: 'Recent Issues Summary:',
      style: { fontSize: 13 }
    });

    recentIssues.slice(0, 8).forEach((issue, index) => {
      content.push({
        type: 'bullet',
        content: `#${issue.number}: ${issue.title.substring(0, 80)}${issue.title.length > 80 ? '...' : ''}`,
        style: { indent: 5, fontSize: 11 }
      });

      content.push({
        type: 'text',
        content: `   Status: ${issue.state} | Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        style: { indent: 10, fontSize: 10 }
      });
    });

    return {
      heading: 'Recent Activity (Last 30 Days)',
      content,
      level: 1
    };
  }

  private static createStackOverflowSection(questions: StackOverflowQuestion[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: 'Stack Overflow Integration Analysis'
    });

    content.push({
      type: 'text',
      content: `Found ${questions.length} related discussions on Stack Overflow, indicating active community engagement and potential documentation gaps.`
    });

    const answeredQuestions = questions.filter(q => q.is_answered).length;
    const totalViews = questions.reduce((sum, q) => sum + q.view_count, 0);
    const avgScore = questions.reduce((sum, q) => sum + q.score, 0) / questions.length;

    content.push({
      type: 'underline',
      content: 'Stack Overflow Metrics:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `Questions with Accepted Answers: ${answeredQuestions} (${((answeredQuestions / questions.length) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Total Views: ${totalViews.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `Average Question Score: ${avgScore.toFixed(1)}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: 'Top Stack Overflow Questions:',
      style: { fontSize: 13 }
    });

    questions.slice(0, 6).forEach((question, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. ${question.title}`,
        style: { fontSize: 11 }
      });

      content.push({
        type: 'bullet',
        content: `Score: ${question.score} | Views: ${question.view_count.toLocaleString()} | Answers: ${question.answer_count}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Tags: ${question.tags.join(', ')}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'link',
        content: question.link,
        style: { indent: 10, fontSize: 9 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: 'Stack Overflow Community Analysis',
      content,
      level: 1
    };
  }

  private static createTrendsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'Trend analysis provides insights into issue creation patterns and resolution efficiency over time.'
    });

    content.push({
      type: 'highlight',
      content: `Overall Resolution Rate: ${analysis.trends.resolutionRate.toFixed(1)}%`
    });

    content.push({
      type: 'underline',
      content: 'Issue Creation Trend (Last 6 Months):',
      style: { fontSize: 13 }
    });

    if (analysis.trends.issueCreationTrend.length > 0) {
      analysis.trends.issueCreationTrend.forEach(trend => {
        content.push({
          type: 'bullet',
          content: `${trend.date}: ${trend.count} issues created`,
          style: { indent: 5 }
        });
      });
    } else {
      content.push({
        type: 'text',
        content: 'No significant trend data available for the specified period.'
      });
    }

    content.push({
      type: 'bold',
      content: 'Performance Indicators:'
    });

    content.push({
      type: 'bullet',
      content: `Average Response Time: ${analysis.trends.averageResponseTime.toFixed(1)} days`,
      style: { indent: 5 }
    });

    const recentTrend = analysis.trends.issueCreationTrend.slice(-2);
    if (recentTrend.length === 2) {
      const trendDirection = recentTrend[1].count > recentTrend[0].count ? 'increasing' : 'decreasing';
      content.push({
        type: 'bullet',
        content: `Recent Trend: Issue creation is ${trendDirection}`,
        style: { indent: 5 }
      });
    }

    return {
      heading: 'Trends and Analytics',
      content,
      level: 1
    };
  }

  private static createContributorsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'Analysis of top contributors based on issue creation and participation.'
    });

    content.push({
      type: 'underline',
      content: 'Top Issue Contributors:',
      style: { fontSize: 13 }
    });

    analysis.summary.topContributors.slice(0, 10).forEach((contributor, index) => {
      content.push({
        type: 'bullet',
        content: `${index + 1}. ${contributor.login}: ${contributor.count} issues`,
        style: { indent: 5 }
      });
    });

    return {
      heading: 'Top Contributors',
      content,
      level: 1
    };
  }

  private static createRecommendationsSection(recommendations: string[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: 'Strategic Recommendations for Issue Management'
    });

    content.push({
      type: 'text',
      content: 'Based on the analysis, the following recommendations can help improve issue management and community engagement:'
    });

    recommendations.forEach((recommendation, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. Recommendation:`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: recommendation,
        style: { indent: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: 'Recommendations',
      content,
      level: 1
    };
  }

  private static createAppendixSection(): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'This report was generated using automated analysis of GitHub Issues API and Stack Overflow API data.'
    });

    content.push({
      type: 'underline',
      content: 'Methodology:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'GitHub Issues: Analyzed using GitHub REST API v3',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Overflow: Searched using Stack Exchange API v2.3',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Critical Issues: Identified by reaction count, comment volume, and label analysis',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Trends: Calculated based on 6-month historical data',
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: 'Data Sources:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'GitHub API: https://api.github.com',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Overflow API: https://api.stackexchange.com',
      style: { indent: 5 }
    });

    content.push({
      type: 'text',
      content: 'For questions about this report or methodology, please refer to the documentation.'
    });

    return {
      heading: 'Appendix',
      content,
      level: 1
    };
  }

  private static createComprehensiveIssueStatisticsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'Comprehensive statistical analysis of all repository issues, revealing patterns, trends, and community engagement metrics.',
    });

    content.push({
      type: 'underline',
      content: '📊 Issue Distribution & Health Metrics:',
      style: { fontSize: 13 }
    });

    const healthScore = (analysis.trends.resolutionRate / 100) * 10;
    const healthEmoji = healthScore > 8 ? '🟢' : healthScore > 6 ? '🟡' : '🔴';

    content.push({
      type: 'highlight',
      content: `${healthEmoji} Repository Health Score: ${healthScore.toFixed(1)}/10`,
    });

    content.push({
      type: 'bullet',
      content: `📈 Total Issues: ${analysis.summary.totalIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔓 Currently Open: ${analysis.summary.openIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Successfully Resolved: ${analysis.summary.closedIssues.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: '🏷️ Most Common Issue Labels:',
      style: { fontSize: 13 }
    });

    analysis.summary.mostCommonLabels.slice(0, 12).forEach(label => {
      const percentage = ((label.count / analysis.summary.totalIssues) * 100).toFixed(1);
      content.push({
        type: 'bullet',
        content: `${label.name}: ${label.count} issues (${percentage}%)`,
        style: { indent: 5 }
      });
    });

    return {
      heading: '📊 Comprehensive Issue Statistics',
      content,
      level: 1
    };
  }

  private static createAllIssuesSection(allIssues: GitHubIssue[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `📋 Complete Issue Inventory (${allIssues.length.toLocaleString()} Total Issues)`,
    });

    content.push({
      type: 'text',
      content: 'This section provides a comprehensive overview of ALL issues in the repository, including detailed analysis of patterns, engagement, and resolution trends.',
    });

    // Group issues by state and priority
    const openIssues = allIssues.filter(issue => issue.state === 'open');
    const closedIssues = allIssues.filter(issue => issue.state === 'closed');
    const highEngagementIssues = allIssues.filter(issue => issue.comments > 5 || issue.reactions.total_count > 3);

    content.push({
      type: 'underline',
      content: '📈 Issue Breakdown by Category:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `🔓 Open Issues: ${openIssues.length.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Closed Issues: ${closedIssues.length.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔥 High Engagement Issues: ${highEngagementIssues.length.toLocaleString()}`,
      style: { indent: 5 }
    });

    // Show sample of recent issues with full details
    content.push({
      type: 'underline',
      content: '📝 Sample of Recent Issues (Full Details):',
      style: { fontSize: 13 }
    });

    const recentSample = allIssues
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 15);

    recentSample.forEach((issue, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. Issue #${issue.number}: ${issue.title}`,
        style: { fontSize: 11 }
      });

      content.push({
        type: 'bullet',
        content: `Status: ${issue.state.toUpperCase()} | Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Author: ${issue.user.login} | Comments: ${issue.comments} | Reactions: ${issue.reactions.total_count}`,
        style: { indent: 10, fontSize: 10 }
      });

      if (issue.labels.length > 0) {
        content.push({
          type: 'bullet',
          content: `Labels: ${issue.labels.map(l => l.name).join(', ')}`,
          style: { indent: 10, fontSize: 10 }
        });
      }

      if (issue.body && issue.body.length > 0) {
        const preview = issue.body.substring(0, 200) + (issue.body.length > 200 ? '...' : '');
        content.push({
          type: 'bullet',
          content: `Description: ${preview}`,
          style: { indent: 10, fontSize: 9 }
        });
      }

      content.push({
        type: 'link',
        content: issue.html_url,
        style: { indent: 10, fontSize: 9 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '📋 Complete Issue Deep Dive',
      content,
      level: 1
    };
  }

  private static createDetailedCriticalIssuesSection(criticalIssues: GitHubIssue[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: `🚨 ${criticalIssues.length} Critical Issues Requiring Immediate Attention`,
    });

    content.push({
      type: 'text',
      content: 'Critical issues are identified through advanced analysis of community engagement, reaction patterns, comment volume, label analysis, and issue age. These issues represent the highest priority items for your project.',
    });

    criticalIssues.forEach((issue, index) => {
      const urgencyScore = issue.reactions.total_count + (issue.comments * 0.5);
      const urgencyLevel = urgencyScore > 20 ? '🔴 URGENT' : urgencyScore > 10 ? '🟡 HIGH' : '🟢 MEDIUM';

      content.push({
        type: 'bold',
        content: `${index + 1}. ${urgencyLevel} - Issue #${issue.number}: ${issue.title}`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: `Status: ${issue.state.toUpperCase()} | Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        style: { indent: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Author: ${issue.user.login} | Community Engagement: ${issue.comments} comments, ${issue.reactions.total_count} reactions`,
        style: { indent: 10 }
      });

      if (issue.reactions.total_count > 0) {
        const reactionBreakdown = [];
        if (issue.reactions['+1'] > 0) reactionBreakdown.push(`👍 ${issue.reactions['+1']}`);
        if (issue.reactions['-1'] > 0) reactionBreakdown.push(`👎 ${issue.reactions['-1']}`);
        if (issue.reactions.heart > 0) reactionBreakdown.push(`❤️ ${issue.reactions.heart}`);
        if (issue.reactions.rocket > 0) reactionBreakdown.push(`🚀 ${issue.reactions.rocket}`);
        if (issue.reactions.eyes > 0) reactionBreakdown.push(`👀 ${issue.reactions.eyes}`);

        content.push({
          type: 'bullet',
          content: `Reactions: ${reactionBreakdown.join(', ')}`,
          style: { indent: 10 }
        });
      }

      if (issue.labels.length > 0) {
        content.push({
          type: 'bullet',
          content: `Labels: ${issue.labels.map(l => l.name).join(', ')}`,
          style: { indent: 10 }
        });
      }

      if (issue.assignees && issue.assignees.length > 0) {
        content.push({
          type: 'bullet',
          content: `Assigned to: ${issue.assignees.map(a => a.login).join(', ')}`,
          style: { indent: 10 }
        });
      }

      if (issue.milestone) {
        content.push({
          type: 'bullet',
          content: `Milestone: ${issue.milestone.title}`,
          style: { indent: 10 }
        });
      }

      // Show issue description preview
      if (issue.body && issue.body.length > 0) {
        const preview = issue.body.substring(0, 300) + (issue.body.length > 300 ? '...' : '');
        content.push({
          type: 'bullet',
          content: `Issue Description: ${preview}`,
          style: { indent: 10, fontSize: 10 }
        });
      }

      // Show recent comments if available
      if (issue.comments_data && issue.comments_data.length > 0) {
        content.push({
          type: 'bullet',
          content: `Recent Community Discussion:`,
          style: { indent: 10, fontSize: 11 }
        });

        issue.comments_data.slice(0, 3).forEach(comment => {
          const commentPreview = comment.body.substring(0, 150) + (comment.body.length > 150 ? '...' : '');
          content.push({
            type: 'bullet',
            content: `${comment.user.login}: ${commentPreview}`,
            style: { indent: 20, fontSize: 9 }
          });
        });
      }

      content.push({
        type: 'link',
        content: issue.html_url,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🚨 Critical Issues Analysis (Detailed)',
      content,
      level: 1
    };
  }

  private static createDetailedRecentActivitySection(recentIssues: GitHubIssue[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: `Detailed analysis of ${recentIssues.length} issues created in the last 30 days, showing current project momentum and community engagement patterns.`,
    });

    const openRecent = recentIssues.filter(issue => issue.state === 'open').length;
    const closedRecent = recentIssues.filter(issue => issue.state === 'closed').length;
    const avgCommentsRecent = recentIssues.reduce((sum, issue) => sum + issue.comments, 0) / recentIssues.length;

    content.push({
      type: 'underline',
      content: '📊 Recent Activity Metrics:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `🔓 Open Recent Issues: ${openRecent} (${((openRecent / recentIssues.length) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Closed Recent Issues: ${closedRecent} (${((closedRecent / recentIssues.length) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `💬 Average Comments per Recent Issue: ${avgCommentsRecent.toFixed(1)}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: '📝 Detailed Recent Issues:',
      style: { fontSize: 13 }
    });

    recentIssues.slice(0, 20).forEach((issue, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. #${issue.number}: ${issue.title}`,
        style: { fontSize: 11 }
      });

      content.push({
        type: 'bullet',
        content: `Status: ${issue.state} | Author: ${issue.user.login} | Created: ${new Date(issue.created_at).toLocaleDateString()}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Engagement: ${issue.comments} comments, ${issue.reactions.total_count} reactions`,
        style: { indent: 10, fontSize: 10 }
      });

      if (issue.labels.length > 0) {
        content.push({
          type: 'bullet',
          content: `Labels: ${issue.labels.map(l => l.name).join(', ')}`,
          style: { indent: 10, fontSize: 10 }
        });
      }

      if (issue.body && issue.body.length > 0) {
        const preview = issue.body.substring(0, 200) + (issue.body.length > 200 ? '...' : '');
        content.push({
          type: 'bullet',
          content: `Description: ${preview}`,
          style: { indent: 10, fontSize: 9 }
        });
      }

      content.push({
        type: 'link',
        content: issue.html_url,
        style: { indent: 10, fontSize: 9 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🕐 Recent Activity Deep Dive (Last 30 Days)',
      content,
      level: 1
    };
  }

  private static createIssuePatternsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🔍 Advanced Issue Pattern Recognition',
    });

    content.push({
      type: 'text',
      content: 'Our AI-powered analysis has identified recurring patterns in your repository issues, revealing insights about common problems, feature requests, and community needs.',
    });

    if (analysis.trends.issuePatterns.length > 0) {
      content.push({
        type: 'underline',
        content: '📊 Identified Issue Patterns:',
        style: { fontSize: 13 }
      });

      analysis.trends.issuePatterns.forEach(pattern => {
        content.push({
          type: 'bold',
          content: `${pattern.pattern}: ${pattern.count} occurrences`,
          style: { fontSize: 12 }
        });

        pattern.examples.forEach(example => {
          content.push({
            type: 'bullet',
            content: example,
            style: { indent: 10, fontSize: 10 }
          });
        });

        content.push({
          type: 'text',
          content: ' ', // Spacer
        });
      });
    }

    return {
      heading: '🔍 Issue Patterns & Recognition',
      content,
      level: 1
    };
  }

  private static createCommunityEngagementSection(communityEngagement: any): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '👥 Community Engagement Analysis',
    });

    content.push({
      type: 'text',
      content: 'Deep dive into how your community interacts with issues, including the most discussed topics, controversial debates, and quick resolution patterns.',
    });

    if (communityEngagement.mostDiscussedIssues.length > 0) {
      content.push({
        type: 'underline',
        content: '🔥 Most Discussed Issues:',
        style: { fontSize: 13 }
      });

      communityEngagement.mostDiscussedIssues.slice(0, 8).forEach((issue: GitHubIssue, index: number) => {
        const engagementScore = issue.comments + issue.reactions.total_count;
        content.push({
          type: 'bullet',
          content: `#${issue.number}: ${issue.title} (${engagementScore} total engagement)`,
          style: { indent: 5, fontSize: 11 }
        });
      });
    }

    if (communityEngagement.controversialIssues.length > 0) {
      content.push({
        type: 'underline',
        content: '⚡ Controversial Discussions:',
        style: { fontSize: 13 }
      });

      communityEngagement.controversialIssues.forEach((issue: GitHubIssue, index: number) => {
        content.push({
          type: 'bullet',
          content: `#${issue.number}: ${issue.title} (${issue.reactions['-1']} negative reactions)`,
          style: { indent: 5, fontSize: 11 }
        });
      });
    }

    if (communityEngagement.quicklyResolvedIssues.length > 0) {
      content.push({
        type: 'underline',
        content: '⚡ Quickly Resolved Issues (< 24 hours):',
        style: { fontSize: 13 }
      });

      communityEngagement.quicklyResolvedIssues.slice(0, 8).forEach((issue: GitHubIssue, index: number) => {
        content.push({
          type: 'bullet',
          content: `#${issue.number}: ${issue.title}`,
          style: { indent: 5, fontSize: 11 }
        });
      });
    }

    return {
      heading: '👥 Community Engagement Deep Dive',
      content,
      level: 1
    };
  }

  private static createDetailedStackOverflowSection(questions: StackOverflowQuestion[], correlation: any): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🌟 Stack Overflow Community Integration Analysis',
    });

    content.push({
      type: 'text',
      content: `Comprehensive analysis of ${questions.length} Stack Overflow discussions related to your project, including detailed answers, community engagement, and correlation with GitHub issues.`,
    });

    const answeredQuestions = questions.filter(q => q.is_answered).length;
    const totalViews = questions.reduce((sum, q) => sum + q.view_count, 0);
    const avgScore = questions.reduce((sum, q) => sum + q.score, 0) / questions.length;
    const totalAnswers = questions.reduce((sum, q) => sum + q.answer_count, 0);

    content.push({
      type: 'underline',
      content: '📊 Stack Overflow Community Metrics:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Questions with Accepted Answers: ${answeredQuestions} (${((answeredQuestions / questions.length) * 100).toFixed(1)}%)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `👀 Total Community Views: ${totalViews.toLocaleString()}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⭐ Average Question Score: ${avgScore.toFixed(1)}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `💬 Total Answers Provided: ${totalAnswers}`,
      style: { indent: 5 }
    });

    if (correlation.commonTopics.length > 0) {
      content.push({
        type: 'underline',
        content: '🔗 Common Topics (GitHub ↔ Stack Overflow):',
        style: { fontSize: 13 }
      });

      correlation.commonTopics.forEach((topic: string) => {
        content.push({
          type: 'bullet',
          content: topic,
          style: { indent: 5 }
        });
      });
    }

    if (correlation.documentationGaps.length > 0) {
      content.push({
        type: 'underline',
        content: '📚 Potential Documentation Gaps:',
        style: { fontSize: 13 }
      });

      correlation.documentationGaps.forEach((gap: string) => {
        content.push({
          type: 'bullet',
          content: `${gap} (discussed on Stack Overflow but not in GitHub issues)`,
          style: { indent: 5 }
        });
      });
    }

    content.push({
      type: 'underline',
      content: '💡 Detailed Stack Overflow Questions & Answers:',
      style: { fontSize: 13 }
    });

    questions.slice(0, 10).forEach((question, index) => {
      content.push({
        type: 'bold',
        content: `${index + 1}. ${question.title}`,
        style: { fontSize: 11 }
      });

      content.push({
        type: 'bullet',
        content: `Score: ${question.score} | Views: ${question.view_count.toLocaleString()} | Answers: ${question.answer_count}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Author: ${question.owner.display_name} (${question.owner.reputation.toLocaleString()} reputation)`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Tags: ${question.tags.join(', ')}`,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'bullet',
        content: `Created: ${new Date(question.creation_date * 1000).toLocaleDateString()}`,
        style: { indent: 10, fontSize: 10 }
      });

      // Show answers if available
      if (question.answers && question.answers.length > 0) {
        content.push({
          type: 'bullet',
          content: `Top Answers:`,
          style: { indent: 10, fontSize: 11 }
        });

        question.answers.slice(0, 2).forEach(answer => {
          const answerPreview = answer.body.substring(0, 200) + (answer.body.length > 200 ? '...' : '');
          const acceptedBadge = answer.is_accepted ? ' ✅ ACCEPTED' : '';
          content.push({
            type: 'bullet',
            content: `${answer.owner.display_name} (Score: ${answer.score}${acceptedBadge}): ${answerPreview}`,
            style: { indent: 20, fontSize: 9 }
          });
        });
      }

      content.push({
        type: 'link',
        content: question.link,
        style: { indent: 10, fontSize: 9 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🌟 Stack Overflow Community Deep Dive',
      content,
      level: 1
    };
  }

  private static createBugPatternsSection(bugPatterns: any[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🐛 Bug Pattern Analysis',
    });

    content.push({
      type: 'text',
      content: 'Advanced analysis of bug reports to identify recurring patterns, common failure modes, and areas requiring attention.',
    });

    bugPatterns.forEach(pattern => {
      const impactEmoji = pattern.impact === 'High' ? '🔴' : pattern.impact === 'Medium' ? '🟡' : '🟢';
      
      content.push({
        type: 'bold',
        content: `${impactEmoji} ${pattern.pattern}: ${pattern.frequency} occurrences`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: `Impact Level: ${pattern.impact}`,
        style: { indent: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🐛 Bug Patterns & Analysis',
      content,
      level: 1
    };
  }

  private static createFeatureRequestTrendsSection(featureRequestTrends: any[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🚀 Feature Request Trends',
    });

    content.push({
      type: 'text',
      content: 'Analysis of feature requests to understand community needs and development priorities.',
    });

    featureRequestTrends.forEach(trend => {
      const priorityEmoji = trend.priority === 'High' ? '🔴' : trend.priority === 'Medium' ? '🟡' : '🟢';
      
      content.push({
        type: 'bold',
        content: `${priorityEmoji} ${trend.category}: ${trend.count} requests`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: `Priority Level: ${trend.priority}`,
        style: { indent: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🚀 Feature Request Analysis',
      content,
      level: 1
    };
  }

  private static createAdvancedTrendsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'Advanced trend analysis providing insights into issue creation patterns, resolution efficiency, and project health over time.',
    });

    content.push({
      type: 'highlight',
      content: `📈 Overall Resolution Rate: ${analysis.trends.resolutionRate.toFixed(1)}%`
    });

    content.push({
      type: 'underline',
      content: '📊 Issue Creation Trend (Last 6 Months):',
      style: { fontSize: 13 }
    });

    if (analysis.trends.issueCreationTrend.length > 0) {
      analysis.trends.issueCreationTrend.forEach(trend => {
        content.push({
          type: 'bullet',
          content: `${trend.date}: ${trend.count} issues created`,
          style: { indent: 5 }
        });
      });
    } else {
      content.push({
        type: 'text',
        content: 'No significant trend data available for the specified period.'
      });
    }

    content.push({
      type: 'bold',
      content: '🎯 Advanced Performance Indicators:'
    });

    content.push({
      type: 'bullet',
      content: `⏱️ Average Response Time: ${analysis.trends.averageResponseTime.toFixed(1)} days`,
      style: { indent: 5 }
    });

    const recentTrend = analysis.trends.issueCreationTrend.slice(-2);
    if (recentTrend.length === 2) {
      const trendDirection = recentTrend[1].count > recentTrend[0].count ? 'increasing ⬆️' : 'decreasing ⬇️';
      const trendPercentage = Math.abs(((recentTrend[1].count - recentTrend[0].count) / recentTrend[0].count) * 100).toFixed(1);
      content.push({
        type: 'bullet',
        content: `📈 Recent Trend: Issue creation is ${trendDirection} by ${trendPercentage}%`,
        style: { indent: 5 }
      });
    }

    return {
      heading: '📈 Advanced Trends & Analytics',
      content,
      level: 1
    };
  }

  private static createDetailedContributorsSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'Comprehensive analysis of contributors based on issue creation, participation, and community engagement patterns.',
    });

    content.push({
      type: 'underline',
      content: '🏆 Top Issue Contributors & Community Leaders:',
      style: { fontSize: 13 }
    });

    analysis.summary.topContributors.forEach((contributor, index) => {
      const contributionLevel = contributor.count > 20 ? '🌟 SUPER CONTRIBUTOR' : 
                              contributor.count > 10 ? '⭐ ACTIVE CONTRIBUTOR' : 
                              '👤 CONTRIBUTOR';
      
      content.push({
        type: 'bullet',
        content: `${index + 1}. ${contributionLevel} ${contributor.login}: ${contributor.count} issues`,
        style: { indent: 5 }
      });
    });

    return {
      heading: '🏆 Top Contributors & Community Leaders',
      content,
      level: 1
    };
  }

  private static createDetailedRecommendationsSection(recommendations: string[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🎯 Strategic Recommendations for Repository Excellence',
    });

    content.push({
      type: 'text',
      content: 'Based on comprehensive analysis of issues, community engagement, and Stack Overflow discussions, here are actionable recommendations to improve your repository health and community satisfaction.',
    });

    recommendations.forEach((recommendation, index) => {
      const priorityEmoji = index < 3 ? '🔴 HIGH PRIORITY' : index < 6 ? '🟡 MEDIUM PRIORITY' : '🟢 LOW PRIORITY';
      
      content.push({
        type: 'bold',
        content: `${index + 1}. ${priorityEmoji}`,
        style: { fontSize: 12 }
      });

      content.push({
        type: 'bullet',
        content: recommendation,
        style: { indent: 10 }
      });

      content.push({
        type: 'text',
        content: ' ', // Spacer
      });
    });

    return {
      heading: '🎯 Strategic Recommendations',
      content,
      level: 1
    };
  }

  private static createStackOverflowAttributionSection(): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🙏 Stack Overflow Community Attribution',
    });

    content.push({
      type: 'text',
      content: 'This report includes valuable insights from the Stack Overflow community. We acknowledge and appreciate the contributions of developers worldwide who share their knowledge and help solve problems.',
    });

    content.push({
      type: 'underline',
      content: '⭐ Special Thanks:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Overflow community for providing valuable discussions and solutions',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Exchange API for enabling community data integration',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'All developers who contribute to open source discussions and knowledge sharing',
      style: { indent: 5 }
    });

    content.push({
      type: 'bold',
      content: '🌟 Support Stack Overflow:'
    });

    content.push({
      type: 'bullet',
      content: 'Visit stackoverflow.com to participate in the community',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Consider Stack Overflow for Teams for your organization',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Star their GitHub repositories to show appreciation',
      style: { indent: 5 }
    });

    content.push({
      type: 'link',
      content: 'https://stackoverflow.com',
      style: { indent: 5 }
    });

    return {
      heading: '🙏 Stack Overflow Attribution & Thanks',
      content,
      level: 1
    };
  }

  private static createDetailedAppendixSection(): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'text',
      content: 'This comprehensive report was generated using advanced analysis of GitHub Issues API and Stack Overflow API data, with AI-powered pattern recognition and community insight generation.',
    });

    content.push({
      type: 'underline',
      content: '🔬 Advanced Methodology:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'GitHub Issues: Comprehensive analysis using GitHub REST API v3 with detailed comment and timeline data',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Overflow: Multi-term search using Stack Exchange API v2.3 with answer correlation',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Critical Issues: AI-powered identification using engagement metrics, label analysis, and community patterns',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Trends: Statistical analysis based on 6-month historical data with pattern recognition',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Surprising Insights: Machine learning analysis of temporal patterns, emoji usage, and community behavior',
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: '📊 Data Sources & APIs:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'GitHub REST API v3: https://api.github.com',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Stack Exchange API v2.3: https://api.stackexchange.com',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'GitHub MCP Server: Open source integration for enhanced data access',
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: '🎨 Report Features:',
      style: { fontSize: 13 }
    });

    content.push({
      type: 'bullet',
      content: 'Beautiful PDF formatting with professional typography and layout',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Dynamic content generation with real-time API integration',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Adobe Reader compatibility with clickable links and metadata',
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: 'Comprehensive issue analysis with full comment and timeline data',
      style: { indent: 5 }
    });

    content.push({
      type: 'text',
      content: 'For questions about this report, methodology, or to request custom analysis, please refer to the project documentation or contact the development team.'
    });

    return {
      heading: '📚 Detailed Methodology & Appendix',
      content,
      level: 1
    };
  }

  private static createSecurityAnalysisSection(securityAnalysis: SecurityAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    const riskEmoji = {
      'LOW': '🟢',
      'MEDIUM': '🟡',
      'HIGH': '🟠',
      'CRITICAL': '🔴'
    }[securityAnalysis.riskLevel];

    const gradeColor = {
      'A+': '🟢', 'A': '🟢', 'B': '🟡', 'C': '🟠', 'D': '🔴', 'F': '🔴'
    }[securityAnalysis.grade];

    content.push({
      type: 'highlight',
      content: `🔒 Security Analysis: ${gradeColor} Grade ${securityAnalysis.grade} | ${riskEmoji} ${securityAnalysis.riskLevel} Risk`,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Comprehensive security analysis of repository issues, vulnerabilities, and security posture. This analysis helps identify security risks and provides actionable recommendations for improvement.',
    });

    content.push({
      type: 'underline',
      content: '📊 Security Score & Metrics:',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'highlight',
      content: `Overall Security Score: ${securityAnalysis.overallScore}/100 (Grade: ${securityAnalysis.grade})`
    });

    content.push({
      type: 'bullet',
      content: `🔍 Total Security Issues: ${securityAnalysis.metrics.totalSecurityIssues}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⚠️ Open Security Issues: ${securityAnalysis.metrics.openSecurityIssues}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🚨 Critical Vulnerabilities: ${securityAnalysis.metrics.criticalVulnerabilities}`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⏱️ Average Security Issue Resolution: ${securityAnalysis.metrics.averageResolutionTime.toFixed(1)} days`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🎯 Security Awareness Score: ${securityAnalysis.metrics.securityAwareness.toFixed(1)}%`,
      style: { indent: 5 }
    });

    if (securityAnalysis.vulnerabilities.length > 0) {
      content.push({
        type: 'underline',
        content: '🚨 Identified Vulnerabilities:',
        style: { fontSize: 14 }
      });

      securityAnalysis.vulnerabilities.forEach((vuln, index) => {
        const severityEmoji = {
          'CRITICAL': '🔴',
          'HIGH': '🟠',
          'MEDIUM': '🟡',
          'LOW': '🟢'
        }[vuln.severity];

        content.push({
          type: 'bold',
          content: `${index + 1}. ${severityEmoji} ${vuln.severity} - ${vuln.title}`,
          style: { fontSize: 12 }
        });

        content.push({
          type: 'bullet',
          content: `Type: ${vuln.type}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Description: ${vuln.description}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Affected Issues: #${vuln.affectedIssues.join(', #')}`,
          style: { indent: 10 }
        });

        if (vuln.cveId) {
          content.push({
            type: 'bullet',
            content: `CVE ID: ${vuln.cveId}`,
            style: { indent: 10 }
          });
        }

        content.push({
          type: 'bullet',
          content: `Recommendation: ${vuln.recommendation}`,
          style: { indent: 10, fontSize: 11 }
        });

        content.push({
          type: 'text',
          content: ' ',
        });
      });
    }

    if (securityAnalysis.recommendations.length > 0) {
      content.push({
        type: 'underline',
        content: '🛡️ Security Recommendations:',
        style: { fontSize: 14 }
      });

      securityAnalysis.recommendations.slice(0, 5).forEach((rec, index) => {
        const priorityEmoji = {
          'CRITICAL': '🔴',
          'HIGH': '🟠',
          'MEDIUM': '🟡',
          'LOW': '🟢'
        }[rec.priority];

        content.push({
          type: 'bold',
          content: `${index + 1}. ${priorityEmoji} ${rec.priority} - ${rec.category}`,
          style: { fontSize: 12 }
        });

        content.push({
          type: 'bullet',
          content: `Fact: ${rec.fact}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Reason: ${rec.reason}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Solution: ${rec.solution}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Tools: ${rec.tools.join(', ')}`,
          style: { indent: 10 }
        });

        content.push({
          type: 'bullet',
          content: `Expected Outcome: ${rec.expectedOutcome}`,
          style: { indent: 10, fontSize: 10 }
        });

        content.push({
          type: 'text',
          content: ' ',
        });
      });
    }

    return {
      heading: '🔒 Security Analysis & Vulnerability Assessment',
      content,
      level: 1
    };
  }

  private static createHealthScoreSection(analysis: IssueAnalysis): PDFSection {
    const content: PDFContentItem[] = [];

    // Calculate health score
    const resolutionScore = analysis.trends.resolutionRate;
    const responseScore = Math.max(0, 100 - (analysis.trends.averageResponseTime * 2));
    const engagementScore = Math.min(100, (analysis.summary.topContributors.length * 5));
    const securityScore = analysis.securityAnalysis.overallScore;
    
    const overallHealth = (resolutionScore + responseScore + engagementScore + securityScore) / 4;
    const healthGrade = overallHealth >= 90 ? 'A+' : 
                       overallHealth >= 80 ? 'A' :
                       overallHealth >= 70 ? 'B' :
                       overallHealth >= 60 ? 'C' :
                       overallHealth >= 50 ? 'D' : 'F';
    
    const healthEmoji = overallHealth >= 80 ? '🟢' : overallHealth >= 60 ? '🟡' : '🔴';

    content.push({
      type: 'highlight',
      content: `${healthEmoji} Repository Health Score: ${overallHealth.toFixed(1)}/100 (Grade: ${healthGrade})`,
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Comprehensive health assessment combining issue resolution, response time, community engagement, and security posture.',
    });

    content.push({
      type: 'underline',
      content: '📊 Health Score Breakdown:',
      style: { fontSize: 14 }
    });

    content.push({
      type: 'bullet',
      content: `✅ Resolution Score: ${resolutionScore.toFixed(1)}/100 (${analysis.trends.resolutionRate.toFixed(1)}% of issues resolved)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `⚡ Response Score: ${responseScore.toFixed(1)}/100 (avg ${analysis.trends.averageResponseTime.toFixed(1)} days)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `👥 Engagement Score: ${engagementScore.toFixed(1)}/100 (${analysis.summary.topContributors.length} active contributors)`,
      style: { indent: 5 }
    });

    content.push({
      type: 'bullet',
      content: `🔒 Security Score: ${securityScore.toFixed(1)}/100 (Grade ${analysis.securityAnalysis.grade})`,
      style: { indent: 5 }
    });

    content.push({
      type: 'underline',
      content: '🎯 Risk Assessment:',
      style: { fontSize: 14 }
    });

    const risks: string[] = [];
    
    if (analysis.securityAnalysis.riskLevel === 'CRITICAL' || analysis.securityAnalysis.riskLevel === 'HIGH') {
      risks.push(`🔴 Security Risk: ${analysis.securityAnalysis.riskLevel} - Immediate attention required`);
    }
    
    if (analysis.summary.openIssues > analysis.summary.totalIssues * 0.6) {
      risks.push('🟠 Maintenance Risk: HIGH - Large backlog of open issues');
    }
    
    if (analysis.trends.averageResponseTime > 30) {
      risks.push('🟠 Response Risk: HIGH - Slow issue response time');
    }
    
    if (analysis.summary.topContributors.length < 3) {
      risks.push('🟡 Bus Factor Risk: MEDIUM - Limited contributor diversity');
    }

    if (risks.length === 0) {
      content.push({
        type: 'highlight',
        content: '🟢 No significant risks identified - Repository is in good health!'
      });
    } else {
      risks.forEach(risk => {
        content.push({
          type: 'bullet',
          content: risk,
          style: { indent: 5 }
        });
      });
    }

    return {
      heading: '📊 Repository Health Score & Risk Assessment',
      content,
      level: 1
    };
  }

  private static createSmartRecommendationsSection(recommendations: SmartRecommendation[]): PDFSection {
    const content: PDFContentItem[] = [];

    content.push({
      type: 'highlight',
      content: '🎯 Smart Recommendations: Data-Driven Action Plan',
      style: { fontSize: 16 }
    });

    content.push({
      type: 'text',
      content: 'Comprehensive, actionable recommendations based on deep analysis of your repository. Each recommendation includes facts, reasoning, specific solutions, tools, and expected outcomes.',
    });

    recommendations.forEach((rec, index) => {
      const priorityEmoji = {
        'CRITICAL': '🔴',
        'HIGH': '🟠',
        'MEDIUM': '🟡',
        'LOW': '🟢'
      }[rec.priority];

      content.push({
        type: 'bold',
        content: `${index + 1}. ${priorityEmoji} ${rec.priority} - ${rec.title}`,
        style: { fontSize: 13 }
      });

      content.push({
        type: 'underline',
        content: '📊 Fact:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.fact,
        style: { indent: 10, fontSize: 11 }
      });

      content.push({
        type: 'underline',
        content: '❓ Why This Matters:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.reason,
        style: { indent: 10, fontSize: 11 }
      });

      content.push({
        type: 'underline',
        content: '💡 Solution:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.solution,
        style: { indent: 10, fontSize: 11 }
      });

      if (rec.actionSteps.length > 0) {
        content.push({
          type: 'underline',
          content: '📋 Action Steps:',
          style: { fontSize: 11, indent: 5 }
        });

        rec.actionSteps.forEach(step => {
          content.push({
            type: 'bullet',
            content: step,
            style: { indent: 15, fontSize: 10 }
          });
        });
      }

      content.push({
        type: 'underline',
        content: '🛠️ Recommended Tools:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.tools.join(', '),
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'underline',
        content: '🎯 Expected Outcome:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.expectedOutcome,
        style: { indent: 10, fontSize: 11 }
      });

      content.push({
        type: 'underline',
        content: '⏱️ Estimated Effort:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.estimatedEffort,
        style: { indent: 10, fontSize: 10 }
      });

      content.push({
        type: 'underline',
        content: '💰 Return on Investment:',
        style: { fontSize: 11, indent: 5 }
      });

      content.push({
        type: 'text',
        content: rec.roi,
        style: { indent: 10, fontSize: 11 }
      });

      content.push({
        type: 'text',
        content: ' ',
      });
      content.push({
        type: 'text',
        content: '─'.repeat(80),
        style: { fontSize: 8 }
      });
      content.push({
        type: 'text',
        content: ' ',
      });
    });

    return {
      heading: '🎯 Smart Recommendations: Executive Action Plan',
      content,
      level: 1
    };
  }
}

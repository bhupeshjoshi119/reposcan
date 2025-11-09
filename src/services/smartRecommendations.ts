import { GitHubIssue, IssueAnalysis, StackOverflowQuestion } from './issueAnalyzer';

export interface SmartRecommendation {
  id: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  title: string;
  fact: string;
  reason: string;
  impact: string;
  solution: string;
  actionSteps: string[];
  tools: string[];
  expectedOutcome: string;
  estimatedEffort: string;
  roi: string;
  metrics: string[];
}

export class SmartRecommendationsEngine {
  static generateRecommendations(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];

    // Issue Management Recommendations
    recommendations.push(...this.analyzeIssueManagement(analysis));

    // Community Engagement Recommendations
    recommendations.push(...this.analyzeCommunityEngagement(analysis));

    // Documentation Recommendations
    recommendations.push(...this.analyzeDocumentation(analysis));

    // Performance Recommendations
    recommendations.push(...this.analyzePerformance(analysis));

    // Quality Recommendations
    recommendations.push(...this.analyzeQuality(analysis));

    // Growth Recommendations
    recommendations.push(...this.analyzeGrowth(analysis));

    // Sort by priority
    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static analyzeIssueManagement(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { summary, allIssues } = analysis;

    // High open issue ratio
    const openRatio = summary.openIssues / summary.totalIssues;
    if (openRatio > 0.6) {
      recommendations.push({
        id: 'issue-mgmt-001',
        priority: 'HIGH',
        category: 'Issue Management',
        title: 'High Open Issue Ratio Detected',
        fact: `${(openRatio * 100).toFixed(1)}% of issues (${summary.openIssues} out of ${summary.totalIssues}) remain open`,
        reason: 'High open issue ratios signal poor project maintenance, discourage new contributors, and reduce user confidence. Enterprise users often evaluate open issue counts before adoption.',
        impact: 'Reduced adoption rates, decreased contributor engagement, negative perception of project health',
        solution: 'Implement systematic issue triage and resolution process',
        actionSteps: [
          'Conduct weekly issue triage meetings to prioritize and assign issues',
          'Close stale issues (>6 months inactive) with clear communication',
          'Create issue templates to improve quality and reduce noise',
          'Set up automated stale issue bot to flag inactive issues',
          'Establish SLAs: Critical (48h), High (1 week), Medium (2 weeks), Low (1 month)',
        ],
        tools: ['GitHub Projects', 'Stale Bot', 'Issue Templates', 'ZenHub', 'Linear'],
        expectedOutcome: 'Reduce open issues by 40% within 60 days, improve response time by 50%',
        estimatedEffort: '4-6 hours/week for 2 months',
        roi: 'Increased adoption (20-30%), improved contributor satisfaction, better project reputation',
        metrics: ['Open issue count', 'Average resolution time', 'Issue close rate', 'Contributor satisfaction'],
      });
    }

    // Stale issues
    const staleIssues = allIssues.filter(issue => {
      if (issue.state !== 'open') return false;
      const monthsOld = (Date.now() - new Date(issue.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsOld > 6;
    });

    if (staleIssues.length > 20) {
      recommendations.push({
        id: 'issue-mgmt-002',
        priority: 'MEDIUM',
        category: 'Issue Management',
        title: 'Significant Number of Stale Issues',
        fact: `${staleIssues.length} issues have been open for more than 6 months without resolution`,
        reason: 'Stale issues clutter the issue tracker, make it harder to find active issues, and create impression of abandoned project',
        impact: 'Reduced project credibility, harder issue navigation, wasted contributor time',
        solution: 'Implement stale issue management strategy',
        actionSteps: [
          'Review all issues older than 6 months for relevance',
          'Close outdated issues with explanation and thank contributors',
          'Update still-relevant issues with current status',
          'Set up automated stale issue detection (30 days inactive)',
          'Create "help wanted" labels for issues needing contributors',
        ],
        tools: ['Stale Bot', 'GitHub Actions', 'Probot', 'Issue Metrics'],
        expectedOutcome: 'Clean issue tracker, improved findability, better contributor experience',
        estimatedEffort: '8-12 hours initial cleanup + 1 hour/week maintenance',
        roi: 'Improved project perception, easier issue management, increased contributor efficiency',
        metrics: ['Stale issue count', 'Issue tracker cleanliness', 'Time to find relevant issues'],
      });
    }

    return recommendations;
  }

  private static analyzeCommunityEngagement(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { summary, allIssues } = analysis;

    // Low engagement
    const avgComments = allIssues.reduce((sum, issue) => sum + issue.comments, 0) / allIssues.length;
    if (avgComments < 2) {
      recommendations.push({
        id: 'community-001',
        priority: 'MEDIUM',
        category: 'Community Engagement',
        title: 'Low Community Engagement Detected',
        fact: `Average of only ${avgComments.toFixed(1)} comments per issue indicates limited community interaction`,
        reason: 'Low engagement suggests users aren\'t getting help, maintainers aren\'t responding, or community isn\'t active. This creates negative feedback loop.',
        impact: 'Reduced user satisfaction, slower issue resolution, decreased project growth',
        solution: 'Implement community engagement strategy',
        actionSteps: [
          'Respond to all new issues within 24 hours (even just acknowledgment)',
          'Create "good first issue" labels to attract new contributors',
          'Set up GitHub Discussions for community Q&A',
          'Recognize and thank contributors publicly',
          'Host monthly community calls or AMAs',
          'Create contributor recognition program',
        ],
        tools: ['GitHub Discussions', 'Discord', 'Slack', 'All Contributors Bot', 'Community Health Files'],
        expectedOutcome: 'Increase engagement by 200%, faster issue resolution, growing contributor base',
        estimatedEffort: '2-3 hours/week',
        roi: 'Stronger community, faster development, better support, increased adoption',
        metrics: ['Comments per issue', 'Response time', 'Active contributors', 'Community growth rate'],
      });
    }

    // Top contributor concentration
    if (summary.topContributors.length > 0) {
      const topContributorIssues = summary.topContributors[0].count;
      const concentration = topContributorIssues / summary.totalIssues;
      
      if (concentration > 0.3) {
        recommendations.push({
          id: 'community-002',
          priority: 'MEDIUM',
          category: 'Community Health',
          title: 'High Contributor Concentration Risk',
          fact: `Top contributor created ${(concentration * 100).toFixed(1)}% of all issues, indicating potential bus factor risk`,
          reason: 'Over-reliance on single contributor creates sustainability risk. If they leave, project knowledge and momentum are lost.',
          impact: 'Project sustainability risk, knowledge silos, reduced resilience',
          solution: 'Diversify contributor base and distribute knowledge',
          actionSteps: [
            'Document project knowledge and processes',
            'Mentor new contributors actively',
            'Create comprehensive contribution guidelines',
            'Rotate issue triage responsibilities',
            'Recognize and empower multiple community leaders',
            'Create maintainer succession plan',
          ],
          tools: ['Contributing.md', 'Code of Conduct', 'Mentorship Programs', 'Documentation'],
          expectedOutcome: 'Reduced bus factor, more resilient project, distributed knowledge',
          estimatedEffort: '1-2 weeks documentation + ongoing mentorship',
          roi: 'Project sustainability, reduced single-point-of-failure risk, stronger community',
          metrics: ['Contributor diversity', 'Bus factor', 'Knowledge distribution', 'Active maintainers'],
        });
      }
    }

    return recommendations;
  }

  private static analyzeDocumentation(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { allIssues, relatedStackOverflowQuestions } = analysis;

    // High Stack Overflow activity
    if (relatedStackOverflowQuestions.length > 10) {
      const totalViews = relatedStackOverflowQuestions.reduce((sum, q) => sum + q.view_count, 0);
      
      recommendations.push({
        id: 'docs-001',
        priority: 'HIGH',
        category: 'Documentation',
        title: 'Documentation Gaps Identified',
        fact: `${relatedStackOverflowQuestions.length} Stack Overflow questions with ${totalViews.toLocaleString()} total views indicate documentation gaps`,
        reason: 'Users seeking help on Stack Overflow instead of finding answers in docs signals missing or unclear documentation. This increases support burden and reduces user success.',
        impact: 'Increased support burden, reduced user success rate, slower adoption',
        solution: 'Comprehensive documentation improvement initiative',
        actionSteps: [
          'Analyze top Stack Overflow questions to identify documentation gaps',
          'Create FAQ section addressing common questions',
          'Add code examples and tutorials for common use cases',
          'Improve API documentation with real-world examples',
          'Create troubleshooting guide',
          'Add video tutorials for complex features',
          'Set up documentation feedback mechanism',
        ],
        tools: ['Docusaurus', 'GitBook', 'ReadTheDocs', 'Swagger/OpenAPI', 'Loom', 'Scribe'],
        expectedOutcome: 'Reduce support questions by 50%, improve user onboarding, increase successful implementations',
        estimatedEffort: '2-4 weeks initial + ongoing updates',
        roi: 'Reduced support burden (save 10-15 hours/week), faster user onboarding, higher satisfaction',
        metrics: ['Documentation page views', 'Support question volume', 'User success rate', 'Time to first success'],
      });
    }

    // Documentation-related issues
    const docIssues = allIssues.filter(issue =>
      issue.labels.some(label => label.name.toLowerCase().includes('documentation')) ||
      issue.title.toLowerCase().includes('documentation') ||
      issue.title.toLowerCase().includes('docs')
    );

    if (docIssues.length > 15) {
      recommendations.push({
        id: 'docs-002',
        priority: 'MEDIUM',
        category: 'Documentation',
        title: 'High Volume of Documentation Issues',
        fact: `${docIssues.length} open documentation issues indicate systematic documentation problems`,
        reason: 'Multiple documentation issues suggest docs are outdated, incomplete, or confusing. This directly impacts user experience and adoption.',
        impact: 'Poor user experience, increased support burden, reduced adoption',
        solution: 'Documentation quality improvement program',
        actionSteps: [
          'Audit all documentation for accuracy and completeness',
          'Prioritize and resolve documentation issues',
          'Implement documentation review process for code changes',
          'Add "docs" label to PRs requiring documentation updates',
          'Create documentation style guide',
          'Set up automated documentation testing',
        ],
        tools: ['Vale', 'Grammarly', 'Documentation Linters', 'Link Checkers', 'Spell Checkers'],
        expectedOutcome: 'Resolve 80% of documentation issues, improve documentation quality score',
        estimatedEffort: '1-2 weeks + ongoing maintenance',
        roi: 'Better user experience, reduced support time, increased adoption',
        metrics: ['Documentation issue count', 'Documentation quality score', 'User satisfaction'],
      });
    }

    return recommendations;
  }

  private static analyzePerformance(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { allIssues, summary } = analysis;

    // Slow resolution time
    if (summary.averageCloseTime > 30) {
      recommendations.push({
        id: 'perf-001',
        priority: 'HIGH',
        category: 'Performance',
        title: 'Slow Issue Resolution Time',
        fact: `Average issue resolution time of ${summary.averageCloseTime.toFixed(1)} days is significantly above industry standard (14-21 days)`,
        reason: 'Slow resolution times frustrate users, discourage bug reports, and signal poor project maintenance. Fast resolution builds trust and encourages adoption.',
        impact: 'User frustration, reduced bug reporting, negative project perception',
        solution: 'Optimize issue resolution workflow',
        actionSteps: [
          'Implement issue triage process with clear priorities',
          'Set up automated CI/CD for faster testing and deployment',
          'Create issue resolution SLAs by severity',
          'Assign dedicated issue responders',
          'Implement automated testing to catch regressions',
          'Use feature flags for safer, faster releases',
        ],
        tools: ['GitHub Actions', 'CircleCI', 'Jenkins', 'LaunchDarkly', 'Automated Testing Frameworks'],
        expectedOutcome: 'Reduce average resolution time to under 14 days, improve user satisfaction',
        estimatedEffort: '2-3 weeks setup + ongoing optimization',
        roi: 'Improved user satisfaction, faster development cycle, better project reputation',
        metrics: ['Average resolution time', 'Time to first response', 'Resolution rate', 'User satisfaction'],
      });
    }

    return recommendations;
  }

  private static analyzeQuality(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { allIssues } = analysis;

    // High bug ratio
    const bugIssues = allIssues.filter(issue =>
      issue.labels.some(label => label.name.toLowerCase().includes('bug'))
    );
    const bugRatio = bugIssues.length / allIssues.length;

    if (bugRatio > 0.4) {
      recommendations.push({
        id: 'quality-001',
        priority: 'HIGH',
        category: 'Code Quality',
        title: 'High Bug Report Ratio',
        fact: `${(bugRatio * 100).toFixed(1)}% of issues are bug reports (${bugIssues.length} bugs), indicating potential quality issues`,
        reason: 'High bug ratios suggest inadequate testing, poor code review, or technical debt. This increases maintenance burden and reduces user confidence.',
        impact: 'Increased maintenance burden, reduced user confidence, slower feature development',
        solution: 'Implement comprehensive quality assurance program',
        actionSteps: [
          'Increase test coverage to >80% (unit, integration, e2e)',
          'Implement mandatory code review process',
          'Set up automated testing in CI/CD pipeline',
          'Add static code analysis and linting',
          'Conduct regular code quality audits',
          'Implement pre-commit hooks for quality checks',
          'Create testing guidelines and best practices',
        ],
        tools: ['Jest', 'Pytest', 'Cypress', 'SonarQube', 'ESLint', 'Prettier', 'Husky', 'CodeClimate'],
        expectedOutcome: 'Reduce bug reports by 50%, improve code quality score, faster development',
        estimatedEffort: '3-4 weeks setup + ongoing maintenance',
        roi: 'Reduced maintenance time (save 20+ hours/month), fewer production issues, happier users',
        metrics: ['Bug report ratio', 'Test coverage', 'Code quality score', 'Production incidents'],
      });
    }

    return recommendations;
  }

  private static analyzeGrowth(analysis: IssueAnalysis): SmartRecommendation[] {
    const recommendations: SmartRecommendation[] = [];
    const { trends, summary } = analysis;

    // Declining issue creation
    if (trends.issueCreationTrend.length >= 2) {
      const recent = trends.issueCreationTrend.slice(-2);
      if (recent[1].count < recent[0].count * 0.7) {
        recommendations.push({
          id: 'growth-001',
          priority: 'MEDIUM',
          category: 'Project Growth',
          title: 'Declining User Engagement',
          fact: `Issue creation decreased by ${(((recent[0].count - recent[1].count) / recent[0].count) * 100).toFixed(1)}% in recent period`,
          reason: 'Declining engagement may indicate users moving to alternatives, lack of new features, or poor community management',
          impact: 'Reduced project relevance, declining user base, potential project stagnation',
          solution: 'Implement growth and engagement strategy',
          actionSteps: [
            'Survey users to understand needs and pain points',
            'Create public roadmap with exciting features',
            'Increase marketing and community outreach',
            'Write blog posts and tutorials',
            'Present at conferences and meetups',
            'Engage with users on social media',
            'Create showcase of projects using your tool',
          ],
          tools: ['GitHub Discussions', 'Twitter', 'Dev.to', 'Hashnode', 'Product Hunt', 'Reddit'],
          expectedOutcome: 'Reverse declining trend, increase engagement by 50%, attract new users',
          estimatedEffort: '4-6 hours/week ongoing',
          roi: 'Growing user base, increased adoption, stronger community, more contributors',
          metrics: ['Issue creation rate', 'Star growth', 'Fork rate', 'Active users', 'Social mentions'],
        });
      }
    }

    return recommendations;
  }
}

import { GitHubIssue } from './issueAnalyzer';

export interface SecurityAnalysis {
  overallScore: number; // 0-100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  vulnerabilities: SecurityVulnerability[];
  securityIssues: GitHubIssue[];
  metrics: {
    totalSecurityIssues: number;
    openSecurityIssues: number;
    criticalVulnerabilities: number;
    averageResolutionTime: number;
    securityAwareness: number; // 0-100
  };
  recommendations: SecurityRecommendation[];
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface SecurityVulnerability {
  type: 'CVE' | 'DEPENDENCY' | 'CODE_PATTERN' | 'CONFIGURATION';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedIssues: number[];
  cveId?: string;
  recommendation: string;
}

export interface SecurityRecommendation {
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  fact: string;
  reason: string;
  solution: string;
  tools: string[];
  expectedOutcome: string;
  estimatedEffort: string;
}

export class SecurityAnalyzer {
  private static readonly SECURITY_KEYWORDS = [
    'security', 'vulnerability', 'exploit', 'xss', 'sql injection', 'csrf',
    'authentication', 'authorization', 'cve', 'dos', 'ddos', 'breach',
    'leak', 'exposure', 'malicious', 'attack', 'threat', 'risk',
    'encryption', 'password', 'token', 'credential', 'privilege escalation'
  ];

  private static readonly CVE_PATTERN = /CVE-\d{4}-\d{4,7}/gi;

  private static readonly CRITICAL_PATTERNS = [
    { pattern: /remote code execution|rce/i, severity: 'CRITICAL' as const },
    { pattern: /sql injection|sqli/i, severity: 'CRITICAL' as const },
    { pattern: /authentication bypass/i, severity: 'CRITICAL' as const },
    { pattern: /privilege escalation/i, severity: 'CRITICAL' as const },
    { pattern: /arbitrary file upload/i, severity: 'HIGH' as const },
    { pattern: /xss|cross.site.scripting/i, severity: 'HIGH' as const },
    { pattern: /csrf|cross.site.request/i, severity: 'HIGH' as const },
    { pattern: /information disclosure/i, severity: 'MEDIUM' as const },
    { pattern: /denial of service|dos/i, severity: 'MEDIUM' as const },
  ];

  static analyzeRepositorySecurity(issues: GitHubIssue[]): SecurityAnalysis {
    // Identify security-related issues
    const securityIssues = this.identifySecurityIssues(issues);
    
    // Detect vulnerabilities
    const vulnerabilities = this.detectVulnerabilities(securityIssues);
    
    // Calculate security metrics
    const metrics = this.calculateSecurityMetrics(issues, securityIssues);
    
    // Calculate overall security score
    const overallScore = this.calculateSecurityScore(metrics, vulnerabilities);
    
    // Determine grade and risk level
    const grade = this.calculateGrade(overallScore);
    const riskLevel = this.determineRiskLevel(vulnerabilities, metrics);
    
    // Generate security recommendations
    const recommendations = this.generateSecurityRecommendations(
      securityIssues,
      vulnerabilities,
      metrics
    );

    return {
      overallScore,
      grade,
      vulnerabilities,
      securityIssues,
      metrics,
      recommendations,
      riskLevel,
    };
  }

  private static identifySecurityIssues(issues: GitHubIssue[]): GitHubIssue[] {
    return issues.filter(issue => {
      const text = `${issue.title} ${issue.body}`.toLowerCase();
      const hasSecurityLabel = issue.labels.some(label =>
        label.name.toLowerCase().includes('security') ||
        label.name.toLowerCase().includes('vulnerability')
      );
      const hasSecurityKeyword = this.SECURITY_KEYWORDS.some(keyword =>
        text.includes(keyword.toLowerCase())
      );
      const hasCVE = this.CVE_PATTERN.test(text);

      return hasSecurityLabel || hasSecurityKeyword || hasCVE;
    });
  }

  private static detectVulnerabilities(securityIssues: GitHubIssue[]): SecurityVulnerability[] {
    const vulnerabilities: SecurityVulnerability[] = [];
    const cveMap = new Map<string, number[]>();

    securityIssues.forEach(issue => {
      const text = `${issue.title} ${issue.body}`;
      
      // Check for CVEs
      const cveMatches = text.match(this.CVE_PATTERN);
      if (cveMatches) {
        cveMatches.forEach(cve => {
          const existing = cveMap.get(cve) || [];
          existing.push(issue.number);
          cveMap.set(cve, existing);
        });
      }

      // Check for critical patterns
      this.CRITICAL_PATTERNS.forEach(({ pattern, severity }) => {
        if (pattern.test(text)) {
          vulnerabilities.push({
            type: 'CODE_PATTERN',
            severity,
            title: issue.title,
            description: issue.body.substring(0, 200),
            affectedIssues: [issue.number],
            recommendation: this.getRecommendationForPattern(pattern.source),
          });
        }
      });
    });

    // Add CVE vulnerabilities
    cveMap.forEach((issueNumbers, cveId) => {
      vulnerabilities.push({
        type: 'CVE',
        severity: 'HIGH',
        title: `Known Vulnerability: ${cveId}`,
        description: `CVE reference found in ${issueNumbers.length} issue(s)`,
        affectedIssues: issueNumbers,
        cveId,
        recommendation: `Review and patch ${cveId}. Check https://cve.mitre.org/cgi-bin/cvename.cgi?name=${cveId}`,
      });
    });

    return vulnerabilities;
  }

  private static calculateSecurityMetrics(
    allIssues: GitHubIssue[],
    securityIssues: GitHubIssue[]
  ) {
    const openSecurityIssues = securityIssues.filter(issue => issue.state === 'open');
    const closedSecurityIssues = securityIssues.filter(issue => issue.state === 'closed');

    // Calculate average resolution time for security issues
    const resolutionTimes = closedSecurityIssues
      .filter(issue => issue.closed_at)
      .map(issue => {
        const created = new Date(issue.created_at).getTime();
        const closed = new Date(issue.closed_at!).getTime();
        return (closed - created) / (1000 * 60 * 60 * 24); // days
      });

    const averageResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
      : 0;

    // Calculate security awareness (% of issues with security labels)
    const issuesWithSecurityLabels = allIssues.filter(issue =>
      issue.labels.some(label =>
        label.name.toLowerCase().includes('security') ||
        label.name.toLowerCase().includes('vulnerability')
      )
    );
    const securityAwareness = allIssues.length > 0
      ? (issuesWithSecurityLabels.length / allIssues.length) * 100
      : 0;

    const criticalVulnerabilities = securityIssues.filter(issue => {
      const text = `${issue.title} ${issue.body}`.toLowerCase();
      return text.includes('critical') || text.includes('severe');
    }).length;

    return {
      totalSecurityIssues: securityIssues.length,
      openSecurityIssues: openSecurityIssues.length,
      criticalVulnerabilities,
      averageResolutionTime,
      securityAwareness,
    };
  }

  private static calculateSecurityScore(
    metrics: ReturnType<typeof SecurityAnalyzer.calculateSecurityMetrics>,
    vulnerabilities: SecurityVulnerability[]
  ): number {
    let score = 100;

    // Deduct points for open security issues
    score -= metrics.openSecurityIssues * 5;

    // Deduct points for critical vulnerabilities
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    score -= criticalVulns * 15;

    // Deduct points for high severity vulnerabilities
    const highVulns = vulnerabilities.filter(v => v.severity === 'HIGH').length;
    score -= highVulns * 10;

    // Deduct points for slow resolution time
    if (metrics.averageResolutionTime > 30) {
      score -= 10;
    } else if (metrics.averageResolutionTime > 14) {
      score -= 5;
    }

    // Add points for good security awareness
    if (metrics.securityAwareness > 5) {
      score += 5;
    }

    // Ensure score is between 0 and 100
    return Math.max(0, Math.min(100, score));
  }

  private static calculateGrade(score: number): 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 95) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 65) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  }

  private static determineRiskLevel(
    vulnerabilities: SecurityVulnerability[],
    metrics: ReturnType<typeof SecurityAnalyzer.calculateSecurityMetrics>
  ): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const criticalVulns = vulnerabilities.filter(v => v.severity === 'CRITICAL').length;
    const highVulns = vulnerabilities.filter(v => v.severity === 'HIGH').length;

    if (criticalVulns > 0 || metrics.openSecurityIssues > 10) {
      return 'CRITICAL';
    }
    if (highVulns > 2 || metrics.openSecurityIssues > 5) {
      return 'HIGH';
    }
    if (highVulns > 0 || metrics.openSecurityIssues > 2) {
      return 'MEDIUM';
    }
    return 'LOW';
  }

  private static generateSecurityRecommendations(
    securityIssues: GitHubIssue[],
    vulnerabilities: SecurityVulnerability[],
    metrics: ReturnType<typeof SecurityAnalyzer.calculateSecurityMetrics>
  ): SecurityRecommendation[] {
    const recommendations: SecurityRecommendation[] = [];

    // Critical vulnerabilities
    if (vulnerabilities.some(v => v.severity === 'CRITICAL')) {
      recommendations.push({
        priority: 'CRITICAL',
        category: 'Vulnerability Management',
        fact: `${vulnerabilities.filter(v => v.severity === 'CRITICAL').length} critical security vulnerabilities detected`,
        reason: 'Critical vulnerabilities can lead to complete system compromise, data breaches, and severe reputational damage',
        solution: 'Immediately patch all critical vulnerabilities. Implement emergency security review process. Deploy fixes within 24-48 hours.',
        tools: ['Snyk', 'Dependabot', 'OWASP Dependency-Check', 'npm audit', 'GitHub Security Advisories'],
        expectedOutcome: 'Eliminate critical security risks, prevent potential breaches, restore user trust',
        estimatedEffort: '1-3 days (emergency priority)',
      });
    }

    // Open security issues
    if (metrics.openSecurityIssues > 5) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security Issue Management',
        fact: `${metrics.openSecurityIssues} open security issues requiring attention`,
        reason: 'Unresolved security issues create attack surface and signal poor security posture to users and enterprises',
        solution: 'Establish security triage process. Assign dedicated security champion. Set SLA for security issue resolution (critical: 48h, high: 1 week, medium: 2 weeks).',
        tools: ['GitHub Security Advisories', 'Security Policy Template', 'Bug Bounty Platform'],
        expectedOutcome: 'Reduce open security issues by 70% within 30 days, improve security response time',
        estimatedEffort: '2-4 weeks',
      });
    }

    // Slow resolution time
    if (metrics.averageResolutionTime > 30) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Security Response Time',
        fact: `Average security issue resolution time is ${metrics.averageResolutionTime.toFixed(1)} days`,
        reason: 'Slow security response increases exposure window and reduces user confidence in project security',
        solution: 'Implement automated security scanning in CI/CD. Create security runbook. Train team on security best practices. Set up security alerts.',
        tools: ['GitHub Actions Security Scanning', 'SonarQube', 'CodeQL', 'Trivy', 'GitGuardian'],
        expectedOutcome: 'Reduce resolution time to under 14 days, catch vulnerabilities before production',
        estimatedEffort: '1-2 weeks setup + ongoing',
      });
    }

    // Low security awareness
    if (metrics.securityAwareness < 2) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'Security Culture',
        fact: `Only ${metrics.securityAwareness.toFixed(1)}% of issues are properly labeled with security tags`,
        reason: 'Poor security labeling leads to missed vulnerabilities and inadequate prioritization of security work',
        solution: 'Create security labeling guidelines. Train contributors on security issue identification. Implement automated security label suggestions.',
        tools: ['GitHub Issue Templates', 'Security.md', 'Contributing Guidelines', 'Label Sync'],
        expectedOutcome: 'Improve security issue identification by 300%, better security prioritization',
        estimatedEffort: '3-5 days',
      });
    }

    // CVE references
    const cveVulns = vulnerabilities.filter(v => v.type === 'CVE');
    if (cveVulns.length > 0) {
      recommendations.push({
        priority: 'HIGH',
        category: 'Known Vulnerabilities',
        fact: `${cveVulns.length} known CVE vulnerabilities referenced in issues`,
        reason: 'Known CVEs are actively exploited by attackers and must be patched immediately',
        solution: 'Review all CVE references. Update affected dependencies. Implement automated CVE monitoring. Publish security advisory.',
        tools: ['CVE Database', 'NVD', 'Snyk', 'Dependabot', 'npm audit', 'OWASP Dependency-Check'],
        expectedOutcome: 'Eliminate known vulnerabilities, prevent exploitation, demonstrate security commitment',
        estimatedEffort: '1-2 weeks',
      });
    }

    // General security best practices
    if (recommendations.length === 0) {
      recommendations.push({
        priority: 'LOW',
        category: 'Security Posture',
        fact: 'Good security posture with minimal open vulnerabilities',
        reason: 'Maintaining security requires continuous monitoring and proactive measures',
        solution: 'Implement regular security audits. Set up automated dependency updates. Create security disclosure policy. Consider bug bounty program.',
        tools: ['Dependabot', 'Snyk', 'GitHub Security Advisories', 'HackerOne', 'Security.md'],
        expectedOutcome: 'Maintain excellent security posture, catch issues before they become problems',
        estimatedEffort: 'Ongoing maintenance',
      });
    }

    return recommendations.sort((a, b) => {
      const priorityOrder = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  private static getRecommendationForPattern(pattern: string): string {
    const recommendations: Record<string, string> = {
      'remote code execution|rce': 'Implement input validation, use parameterized queries, apply principle of least privilege',
      'sql injection|sqli': 'Use prepared statements, ORM frameworks, input sanitization, and WAF',
      'authentication bypass': 'Review authentication logic, implement MFA, use security frameworks',
      'privilege escalation': 'Implement proper RBAC, validate permissions at every level, audit access controls',
      'arbitrary file upload': 'Validate file types, scan uploads, store outside webroot, implement size limits',
      'xss|cross.site.scripting': 'Sanitize user input, use Content Security Policy, encode output',
      'csrf|cross.site.request': 'Implement CSRF tokens, use SameSite cookies, validate origin headers',
      'information disclosure': 'Remove sensitive data from responses, implement proper error handling',
      'denial of service|dos': 'Implement rate limiting, input validation, resource quotas',
    };

    for (const [key, value] of Object.entries(recommendations)) {
      if (new RegExp(key, 'i').test(pattern)) {
        return value;
      }
    }

    return 'Review security best practices and implement appropriate controls';
  }
}

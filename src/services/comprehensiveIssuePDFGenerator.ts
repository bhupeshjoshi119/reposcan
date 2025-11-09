import * as fs from 'fs';
import { jsPDF } from 'jspdf';

/**
 * Comprehensive Issue PDF Generator
 * Built for developers who work day and night
 * Handles 100+ issues with deep analysis and beautiful formatting
 */
export class ComprehensiveIssuePDFGenerator {
  private doc: jsPDF;
  private yPos: number = 20;
  private pageHeight: number = 280;
  private leftMargin: number = 20;
  private rightMargin: number = 190;
  private currentPage: number = 1;
  
  // Color scheme for professional reports
  private colors = {
    primary: [0, 102, 204] as [number, number, number],
    secondary: [51, 51, 51] as [number, number, number],
    success: [40, 167, 69] as [number, number, number],
    danger: [220, 53, 69] as [number, number, number],
    warning: [255, 193, 7] as [number, number, number],
    info: [23, 162, 184] as [number, number, number],
    muted: [108, 117, 125] as [number, number, number],
    light: [248, 249, 250] as [number, number, number]
  };

  constructor() {
    this.doc = new jsPDF();
    this.setupDocument();
  }

  private setupDocument(): void {
    this.doc.setProperties({
      title: 'Comprehensive GitHub Issue Analysis Report',
      subject: 'Deep analysis with Stack Overflow solutions and insights',
      author: 'GitHub Issue Analyzer - Built for Developers',
      creator: 'Comprehensive Analysis System',
      keywords: 'github, issues, stackoverflow, analysis, developers'
    });
  }

  /**
   * Generate comprehensive PDF for batch analysis
   */
  async generateBatchPDF(
    results: any[],
    options: ComprehensivePDFOptions
  ): Promise<string> {
    console.log('📄 Generating comprehensive PDF report...');
    console.log(`   Processing ${results.length} issues with deep analysis`);

    try {
      // Cover page
      this.addCoverPage(options);

      // Executive summary
      this.addExecutiveSummary(results, options);
      
      // Table of contents
      this.addTableOfContents(results);
      
      // Statistics and insights
      this.addStatisticsSection(results);
      
      // Detailed issue analysis
      this.addDetailedIssueAnalysis(results, options);
      
      // Stack Overflow solutions deep dive
      this.addSolutionsDeepDive(results);
      
      // Recommendations and insights
      this.addRecommendations(results);
      
      // Appendix
      this.addAppendix(results, options);
      
      // Add page numbers and footers
      this.addPageNumbersAndFooters(options);
      
      // Save PDF
      const filename = options.filename || `${options.owner}-${options.repo}-comprehensive-report.pdf`;
      this.doc.save(filename);
      
      const stats = fs.statSync(filename);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`✅ Comprehensive PDF generated: ${filename}`);
      console.log(`   Size: ${sizeMB} MB`);
      console.log(`   Pages: ${this.doc.getNumberOfPages()}`);
      console.log(`   Issues analyzed: ${results.length}`);
      
      return filename;
      
    } catch (error: any) {
      console.error('❌ Error generating PDF:', error.message);
      throw error;
    }
  }

  private addCoverPage(options: ComprehensivePDFOptions): void {
    // Background
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(0, 0, 210, 100, 'F');
    
    // Title
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('GitHub Issue Analysis', 105, 40, { align: 'center' });
    
    this.doc.setFontSize(24);
    this.doc.text('Comprehensive Report', 105, 55, { align: 'center' });
    
    // Repository info
    this.doc.setFontSize(18);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${options.owner}/${options.repo}`, 105, 75, { align: 'center' });
    
    // Subtitle
    this.yPos = 120;
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.setFontSize(14);
    this.doc.text('Built for Developers, By Developers', 105, this.yPos, { align: 'center' });
    
    this.yPos += 20;
    this.doc.setFontSize(12);
    this.doc.setTextColor(...this.colors.muted);
    this.doc.text('Deep analysis with Stack Overflow solutions', 105, this.yPos, { align: 'center' });
    
    // Stats box
    this.yPos = 160;
    this.doc.setDrawColor(...this.colors.primary);
    this.doc.setLineWidth(0.5);
    this.doc.rect(40, this.yPos, 130, 60);
    
    this.doc.setFontSize(11);
    this.doc.setTextColor(...this.colors.secondary);
    this.yPos += 15;
    this.doc.text(`📊 Total Issues Analyzed: ${options.totalIssues || 0}`, 50, this.yPos);
    this.yPos += 10;
    this.doc.text(`💡 Issues with Solutions: ${options.issuesWithSolutions || 0}`, 50, this.yPos);
    this.yPos += 10;
    this.doc.text(`🔍 Stack Overflow Solutions: ${options.totalSolutions || 0}`, 50, this.yPos);
    this.yPos += 10;
    this.doc.text(`📅 Generated: ${new Date().toLocaleDateString()}`, 50, this.yPos);
    
    // Footer
    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.colors.muted);
    this.doc.text('Helping developers solve problems faster', 105, 270, { align: 'center' });
    
    this.doc.addPage();
    this.yPos = 20;
  }

  private addExecutiveSummary(results: any[], options: ComprehensivePDFOptions): void {
    this.addSectionHeader('Executive Summary', '📋');
    
    const withSolutions = results.filter(r => r.stackOverflowSolutions?.length > 0);
    const openIssues = results.filter(r => r.state === 'open');
    const closedIssues = results.filter(r => r.state === 'closed');
    const totalSolutions = results.reduce((sum, r) => sum + (r.stackOverflowSolutions?.length || 0), 0);
    const avgSolutionsPerIssue = (totalSolutions / results.length).toFixed(2);
    
    this.doc.setFontSize(11);
    this.doc.setTextColor(...this.colors.secondary);
    
    const summary = [
      `This comprehensive report analyzes ${results.length} issues from the ${options.owner}/${options.repo} repository.`,
      ``,
      `Key Findings:`,
      `• ${withSolutions.length} issues (${(withSolutions.length / results.length * 100).toFixed(1)}%) have Stack Overflow solutions`,
      `• ${totalSolutions} total Stack Overflow solutions identified`,
      `• Average ${avgSolutionsPerIssue} solutions per issue`,
      `• ${openIssues.length} open issues, ${closedIssues.length} closed issues`,
      ``,
      `This analysis helps developers:`,
      `• Find existing solutions faster`,
      `• Understand common problem patterns`,
      `• Learn from community knowledge`,
      `• Reduce debugging time`,
      ``,
      `The report includes detailed analysis, Stack Overflow solutions, code examples,`,
      `and actionable recommendations for each issue.`
    ];
    
    summary.forEach(line => {
      this.checkPageBreak();
      this.doc.text(line, this.leftMargin, this.yPos);
      this.yPos += 6;
    });
    
    this.yPos += 10;
  }

  private addTableOfContents(results: any[]): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Table of Contents', '📑');
    
    const sections = [
      { title: 'Executive Summary', page: 2 },
      { title: 'Statistics and Insights', page: 3 },
      { title: 'Issue Analysis Overview', page: 4 },
      { title: 'Detailed Issue Analysis', page: 5 },
      { title: 'Stack Overflow Solutions Deep Dive', page: 5 + Math.ceil(results.length / 3) },
      { title: 'Recommendations', page: 5 + Math.ceil(results.length / 3) + 5 },
      { title: 'Appendix', page: 5 + Math.ceil(results.length / 3) + 7 }
    ];
    
    this.doc.setFontSize(11);
    sections.forEach(section => {
      this.checkPageBreak();
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.text(section.title, this.leftMargin, this.yPos);
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text(`Page ${section.page}`, this.rightMargin, this.yPos, { align: 'right' });
      this.yPos += 8;
    });
    
    this.yPos += 10;
  }

  private addStatisticsSection(results: any[]): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Statistics and Insights', '📈');
    
    // Calculate comprehensive statistics
    const stats = this.calculateStatistics(results);
    
    // Issue state distribution
    this.addSubsectionHeader('Issue State Distribution');
    this.addStatBox('Open Issues', stats.openIssues, this.colors.warning);
    this.addStatBox('Closed Issues', stats.closedIssues, this.colors.success);
    this.yPos += 15;
    
    // Solution coverage
    this.addSubsectionHeader('Solution Coverage');
    this.addStatBox('Issues with Solutions', stats.issuesWithSolutions, this.colors.info);
    this.addStatBox('Total Solutions Found', stats.totalSolutions, this.colors.primary);
    this.addStatBox('Avg Solutions per Issue', stats.avgSolutions, this.colors.secondary);
    this.yPos += 15;
    
    // Quality metrics
    this.addSubsectionHeader('Solution Quality Metrics');
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.secondary);
    
    const qualityMetrics = [
      `• High-quality solutions (score > 10): ${stats.highQualitySolutions}`,
      `• Medium-quality solutions (score 5-10): ${stats.mediumQualitySolutions}`,
      `• Total solution views: ${stats.totalViews.toLocaleString()}`,
      `• Average solution score: ${stats.avgScore.toFixed(1)}`,
      `• Most viewed solution: ${stats.maxViews.toLocaleString()} views`
    ];
    
    qualityMetrics.forEach(metric => {
      this.checkPageBreak();
      this.doc.text(metric, this.leftMargin + 5, this.yPos);
      this.yPos += 7;
    });
    
    this.yPos += 15;
    
    // Top issues by solution count
    this.addSubsectionHeader('Top 10 Issues by Solution Count');
    const topIssues = results
      .filter(r => r.stackOverflowSolutions?.length > 0)
      .sort((a, b) => (b.stackOverflowSolutions?.length || 0) - (a.stackOverflowSolutions?.length || 0))
      .slice(0, 10);
    
    this.doc.setFontSize(9);
    topIssues.forEach((issue, index) => {
      this.checkPageBreak();
      const stateColor = issue.state === 'open' ? this.colors.warning : this.colors.success;
      this.doc.setTextColor(...stateColor);
      this.doc.text(`${index + 1}.`, this.leftMargin, this.yPos);
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.text(
        `#${issue.issueNumber}: ${this.truncateText(issue.title, 60)} (${issue.stackOverflowSolutions.length} solutions)`,
        this.leftMargin + 8,
        this.yPos
      );
      this.yPos += 6;
    });
    
    this.yPos += 10;
  }

  private calculateStatistics(results: any[]): any {
    const withSolutions = results.filter(r => r.stackOverflowSolutions?.length > 0);
    const allSolutions = results.flatMap(r => r.stackOverflowSolutions || []);
    
    return {
      openIssues: results.filter(r => r.state === 'open').length,
      closedIssues: results.filter(r => r.state === 'closed').length,
      issuesWithSolutions: withSolutions.length,
      totalSolutions: allSolutions.length,
      avgSolutions: (allSolutions.length / results.length).toFixed(2),
      highQualitySolutions: allSolutions.filter(s => s.score > 10).length,
      mediumQualitySolutions: allSolutions.filter(s => s.score >= 5 && s.score <= 10).length,
      totalViews: allSolutions.reduce((sum, s) => sum + (s.view_count || 0), 0),
      avgScore: allSolutions.reduce((sum, s) => sum + (s.score || 0), 0) / allSolutions.length || 0,
      maxViews: Math.max(...allSolutions.map(s => s.view_count || 0), 0)
    };
  }

  private addDetailedIssueAnalysis(results: any[], options: ComprehensivePDFOptions): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Detailed Issue Analysis', '🔍');
    
    // Analyze each issue in detail
    results.forEach((issue, index) => {
      this.checkPageBreak(60); // Need more space for issue details
      
      // Issue header
      this.doc.setFillColor(...this.colors.light);
      this.doc.rect(this.leftMargin - 5, this.yPos - 5, this.rightMargin - this.leftMargin + 10, 12, 'F');
      
      const stateColor = issue.state === 'open' ? this.colors.warning : this.colors.success;
      this.doc.setTextColor(...stateColor);
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      
      const stateEmoji = issue.state === 'open' ? '🔓' : '✅';
      this.doc.text(`${stateEmoji} Issue #${issue.issueNumber}`, this.leftMargin, this.yPos);
      this.yPos += 10;
      
      // Issue title
      this.doc.setFontSize(11);
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.setFont('helvetica', 'normal');
      const titleLines = this.doc.splitTextToSize(issue.title, this.rightMargin - this.leftMargin);
      titleLines.forEach((line: string) => {
        this.checkPageBreak();
        this.doc.text(line, this.leftMargin, this.yPos);
        this.yPos += 6;
      });
      
      this.yPos += 5;
      
      // Issue metadata
      this.doc.setFontSize(9);
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text(`State: ${issue.state.toUpperCase()}`, this.leftMargin, this.yPos);
      this.doc.text(`Solutions: ${issue.stackOverflowSolutions?.length || 0}`, this.leftMargin + 50, this.yPos);
      this.yPos += 10;
      
      // Stack Overflow solutions for this issue
      if (issue.stackOverflowSolutions && issue.stackOverflowSolutions.length > 0) {
        this.doc.setFontSize(10);
        this.doc.setTextColor(...this.colors.info);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('💡 Stack Overflow Solutions:', this.leftMargin + 5, this.yPos);
        this.yPos += 8;
        
        issue.stackOverflowSolutions.slice(0, 5).forEach((solution: any, solIndex: number) => {
          this.checkPageBreak();
          
          this.doc.setFontSize(9);
          this.doc.setTextColor(...this.colors.secondary);
          this.doc.setFont('helvetica', 'normal');
          
          const solTitle = this.truncateText(solution.title, 70);
          this.doc.text(`${solIndex + 1}. ${solTitle}`, this.leftMargin + 10, this.yPos);
          this.yPos += 5;
          
          this.doc.setFontSize(8);
          this.doc.setTextColor(...this.colors.muted);
          this.doc.text(
            `Score: ${solution.score} | Views: ${solution.view_count?.toLocaleString() || 'N/A'}`,
            this.leftMargin + 15,
            this.yPos
          );
          this.yPos += 4;
          
          if (solution.link) {
            this.doc.setTextColor(...this.colors.primary);
            this.doc.textWithLink('View Solution →', this.leftMargin + 15, this.yPos, { url: solution.link });
          }
          this.yPos += 7;
        });
      } else {
        this.doc.setFontSize(9);
        this.doc.setTextColor(...this.colors.muted);
        this.doc.text('No Stack Overflow solutions found', this.leftMargin + 5, this.yPos);
        this.yPos += 7;
      }
      
      // Issue URL
      if (issue.url) {
        this.doc.setFontSize(8);
        this.doc.setTextColor(...this.colors.primary);
        this.doc.textWithLink('View on GitHub →', this.leftMargin + 5, this.yPos, { url: issue.url });
      }
      
      this.yPos += 15;
      
      // Progress indicator every 10 issues
      if ((index + 1) % 10 === 0) {
        console.log(`   Processed ${index + 1}/${results.length} issues`);
      }
    });
  }

  private addSolutionsDeepDive(results: any[]): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Stack Overflow Solutions Deep Dive', '💡');
    
    // Get all unique solutions
    const allSolutions = results.flatMap(r => 
      (r.stackOverflowSolutions || []).map((sol: any) => ({
        ...sol,
        issueNumber: r.issueNumber,
        issueTitle: r.title
      }))
    );
    
    // Sort by score and views
    const topSolutions = allSolutions
      .sort((a, b) => {
        const scoreA = (a.score || 0) * 10 + (a.view_count || 0) / 1000;
        const scoreB = (b.score || 0) * 10 + (b.view_count || 0) / 1000;
        return scoreB - scoreA;
      })
      .slice(0, 50); // Top 50 solutions
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text(
      `Analyzing top ${topSolutions.length} Stack Overflow solutions by quality and relevance`,
      this.leftMargin,
      this.yPos
    );
    this.yPos += 15;
    
    topSolutions.forEach((solution, index) => {
      this.checkPageBreak(40);
      
      // Solution rank badge
      this.doc.setFillColor(...this.colors.primary);
      this.doc.circle(this.leftMargin + 3, this.yPos - 2, 4, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text(`${index + 1}`, this.leftMargin + 3, this.yPos, { align: 'center' });
      
      // Solution title
      this.doc.setFontSize(10);
      this.doc.setTextColor(...this.colors.secondary);
      this.doc.setFont('helvetica', 'bold');
      const titleLines = this.doc.splitTextToSize(solution.title, this.rightMargin - this.leftMargin - 15);
      titleLines.forEach((line: string, lineIndex: number) => {
        this.doc.text(line, this.leftMargin + 10, this.yPos + (lineIndex * 5));
      });
      this.yPos += titleLines.length * 5 + 5;
      
      // Related issue
      this.doc.setFontSize(8);
      this.doc.setTextColor(...this.colors.muted);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(
        `Related to Issue #${solution.issueNumber}: ${this.truncateText(solution.issueTitle, 50)}`,
        this.leftMargin + 10,
        this.yPos
      );
      this.yPos += 6;
      
      // Quality metrics
      const qualityScore = this.calculateQualityScore(solution);
      const qualityLabel = qualityScore > 80 ? 'Excellent' : qualityScore > 60 ? 'Good' : 'Fair';
      const qualityColor = qualityScore > 80 ? this.colors.success : qualityScore > 60 ? this.colors.info : this.colors.warning;
      
      this.doc.setTextColor(...qualityColor);
      this.doc.text(`Quality: ${qualityLabel} (${qualityScore}/100)`, this.leftMargin + 10, this.yPos);
      
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text(
        `Score: ${solution.score} | Views: ${solution.view_count?.toLocaleString() || 'N/A'}`,
        this.leftMargin + 60,
        this.yPos
      );
      this.yPos += 6;
      
      // Link
      if (solution.link) {
        this.doc.setTextColor(...this.colors.primary);
        this.doc.textWithLink('View Full Solution →', this.leftMargin + 10, this.yPos, { url: solution.link });
      }
      
      this.yPos += 12;
    });
  }

  private calculateQualityScore(solution: any): number {
    const scorePoints = Math.min((solution.score || 0) * 5, 50);
    const viewPoints = Math.min((solution.view_count || 0) / 1000, 30);
    const answerPoints = solution.is_answered ? 20 : 0;
    return Math.round(scorePoints + viewPoints + answerPoints);
  }

  private addRecommendations(results: any[]): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Recommendations and Insights', '🎯');
    
    const stats = this.calculateStatistics(results);
    const recommendations: string[] = [];
    
    // Generate intelligent recommendations
    if (stats.issuesWithSolutions / results.length < 0.5) {
      recommendations.push(
        '⚠️ Low Solution Coverage',
        'Only ' + ((stats.issuesWithSolutions / results.length * 100).toFixed(1)) + '% of issues have Stack Overflow solutions.',
        'Consider:',
        '• Creating more detailed issue descriptions',
        '• Adding relevant tags and labels',
        '• Searching with alternative keywords',
        ''
      );
    }
    
    if (stats.openIssues > stats.closedIssues * 2) {
      recommendations.push(
        '📊 High Open Issue Ratio',
        'There are significantly more open issues than closed ones.',
        'Recommendations:',
        '• Prioritize issues with existing Stack Overflow solutions',
        '• Focus on high-impact issues first',
        '• Consider community contributions',
        ''
      );
    }
    
    if (stats.avgScore < 5) {
      recommendations.push(
        '💡 Solution Quality Insights',
        'Average solution score is relatively low.',
        'Tips:',
        '• Look for solutions with higher view counts',
        '• Check accepted answers',
        '• Review multiple solutions for best practices',
        ''
      );
    }
    
    // Always add these
    recommendations.push(
      '🚀 Best Practices for Using This Report',
      '• Start with issues that have high-quality solutions (score > 10)',
      '• Review multiple solutions to understand different approaches',
      '• Check solution dates - newer solutions may use modern practices',
      '• Verify solutions work with your specific use case',
      '• Contribute back by updating issue status or adding comments',
      '',
      '📚 Learning Opportunities',
      '• Study patterns in frequently occurring issues',
      '• Learn from highly-viewed Stack Overflow solutions',
      '• Identify common pitfalls and edge cases',
      '• Build a knowledge base from these insights',
      '',
      '🔄 Continuous Improvement',
      '• Run this analysis periodically to track progress',
      '• Monitor solution coverage trends',
      '• Update documentation based on common issues',
      '• Share findings with your team'
    );
    
    this.doc.setFontSize(10);
    recommendations.forEach(line => {
      this.checkPageBreak();
      
      if (line.startsWith('⚠️') || line.startsWith('📊') || line.startsWith('💡') || 
          line.startsWith('🚀') || line.startsWith('📚') || line.startsWith('🔄')) {
        this.doc.setFont('helvetica', 'bold');
        this.doc.setTextColor(...this.colors.primary);
        this.doc.text(line, this.leftMargin, this.yPos);
        this.yPos += 8;
      } else if (line.startsWith('•')) {
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(line, this.leftMargin + 5, this.yPos);
        this.yPos += 6;
      } else if (line === '') {
        this.yPos += 5;
      } else {
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(...this.colors.secondary);
        this.doc.text(line, this.leftMargin, this.yPos);
        this.yPos += 6;
      }
    });
  }

  private addAppendix(results: any[], options: ComprehensivePDFOptions): void {
    this.doc.addPage();
    this.yPos = 20;
    
    this.addSectionHeader('Appendix', '📎');
    
    // Methodology
    this.addSubsectionHeader('Methodology');
    this.doc.setFontSize(9);
    this.doc.setTextColor(...this.colors.secondary);
    
    const methodology = [
      'This report was generated using the following process:',
      '',
      '1. Issue Collection',
      '   • Fetched issues from GitHub API',
      '   • Filtered out pull requests',
      '   • Collected metadata and state information',
      '',
      '2. Stack Overflow Search',
      '   • Searched using issue titles as keywords',
      '   • Retrieved top 5 relevant solutions per issue',
      '   • Ranked by relevance, score, and views',
      '',
      '3. Quality Analysis',
      '   • Calculated quality scores based on:',
      '     - Solution score (community votes)',
      '     - View count (popularity)',
      '     - Answer status (accepted/not accepted)',
      '',
      '4. Report Generation',
      '   • Comprehensive analysis of all issues',
      '   • Statistical insights and trends',
      '   • Actionable recommendations'
    ];
    
    methodology.forEach(line => {
      this.checkPageBreak();
      this.doc.text(line, this.leftMargin, this.yPos);
      this.yPos += 5;
    });
    
    this.yPos += 10;
    
    // Data sources
    this.addSubsectionHeader('Data Sources');
    this.doc.setFontSize(9);
    this.doc.text('• GitHub API: https://api.github.com', this.leftMargin, this.yPos);
    this.yPos += 5;
    this.doc.text('• Stack Exchange API: https://api.stackexchange.com', this.leftMargin, this.yPos);
    this.yPos += 10;
    
    // About
    this.addSubsectionHeader('About This Tool');
    this.doc.setFontSize(9);
    const about = [
      'Built for developers who work day and night to solve problems.',
      'Our mission: Simplify developers\' lives by connecting GitHub issues',
      'with Stack Overflow solutions.',
      '',
      'Everything is not business - this is about helping the community.',
      '',
      'Generated with ❤️ by developers, for developers.'
    ];
    
    about.forEach(line => {
      this.checkPageBreak();
      this.doc.text(line, this.leftMargin, this.yPos);
      this.yPos += 5;
    });
  }

  // Helper methods
  
  private addSectionHeader(title: string, emoji: string): void {
    this.doc.setFillColor(...this.colors.primary);
    this.doc.rect(this.leftMargin - 5, this.yPos - 5, this.rightMargin - this.leftMargin + 10, 12, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(`${emoji} ${title}`, this.leftMargin, this.yPos);
    
    this.yPos += 15;
    this.doc.setFont('helvetica', 'normal');
  }

  private addSubsectionHeader(title: string): void {
    this.checkPageBreak();
    this.doc.setFontSize(12);
    this.doc.setTextColor(...this.colors.primary);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.leftMargin, this.yPos);
    this.yPos += 10;
    this.doc.setFont('helvetica', 'normal');
  }

  private addStatBox(label: string, value: any, color: [number, number, number]): void {
    this.checkPageBreak();
    
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.5);
    this.doc.rect(this.leftMargin, this.yPos - 5, 80, 12);
    
    this.doc.setFontSize(10);
    this.doc.setTextColor(...this.colors.secondary);
    this.doc.text(label, this.leftMargin + 3, this.yPos);
    
    this.doc.setFontSize(12);
    this.doc.setTextColor(...color);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(String(value), this.leftMargin + 70, this.yPos, { align: 'right' });
    this.doc.setFont('helvetica', 'normal');
    
    this.yPos += 15;
  }

  private checkPageBreak(minSpace: number = 20): void {
    if (this.yPos > this.pageHeight - minSpace) {
      this.doc.addPage();
      this.yPos = 20;
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }

  private addPageNumbersAndFooters(options: ComprehensivePDFOptions): void {
    const pageCount = this.doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      
      // Footer line
      this.doc.setDrawColor(...this.colors.muted);
      this.doc.setLineWidth(0.5);
      this.doc.line(this.leftMargin, 285, this.rightMargin, 285);
      
      // Page number
      this.doc.setFontSize(9);
      this.doc.setTextColor(...this.colors.muted);
      this.doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
      
      // Repository info
      this.doc.text(`${options.owner}/${options.repo}`, this.leftMargin, 290);
      
      // Date
      this.doc.text(new Date().toLocaleDateString(), this.rightMargin, 290, { align: 'right' });
    }
  }
}

export interface ComprehensivePDFOptions {
  filename?: string;
  owner: string;
  repo: string;
  totalIssues?: number;
  issuesWithSolutions?: number;
  totalSolutions?: number;
}

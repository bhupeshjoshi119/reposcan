import jsPDF from "jspdf";

interface Repository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  topics?: string[];
  license?: { name: string } | null;
  private?: boolean;
}

interface PDFGenerationOptions {
  includeInfographics?: boolean;
  prediction?: any;
  method?: 'direct' | 'canvas' | 'hybrid';
}

export class LimitedPDFGenerator {
  private pdf: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number = 20;
  private currentY: number = 30;
  private lineHeight: number = 5;

  constructor() {
    this.pdf = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  async generateLimitedReport(
    repository: Repository, 
    analysis: string, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    try {
      // Add title page
      this.addTitlePage(repository);

      // Add executive summary (limited)
      this.addPage();
      this.addLimitedExecutiveSummary(repository, analysis);

      // Add key insights (abstracted)
      this.addPage();
      this.addKeyInsights(analysis);

      // Add basic recommendations (generic)
      this.addPage();
      this.addBasicRecommendations();

      // Add upgrade prompt
      this.addPage();
      this.addUpgradePrompt();

      // Add footer to all pages
      this.addFooterToAllPages(repository);

      // Save the PDF
      const fileName = `${repository.name}_basic_report_${new Date().toISOString().split('T')[0]}.pdf`;
      this.pdf.save(fileName);

      // Dispatch success event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pdf-generated', { 
          detail: { fileName, repository: repository.full_name, type: 'limited' } 
        }));
      }

    } catch (error) {
      console.error("Limited PDF generation error:", error);
      throw new Error("Failed to generate basic PDF report");
    }
  }

  private addTitlePage(repository: Repository): void {
    // Simple gradient background
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight / 3, 'F');
    
    this.pdf.setFillColor(147, 51, 234);
    this.pdf.rect(0, this.pageHeight / 3, this.pageWidth, this.pageHeight / 3, 'F');

    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Overview Report', this.pageWidth / 2, 40, { align: 'center' });

    // Repository name
    this.pdf.setFontSize(20);
    this.pdf.text(repository.full_name, this.pageWidth / 2, 60, { align: 'center' });

    // Date and "Basic Version" indicator
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    this.pdf.text(`Generated on ${date}`, this.pageWidth / 2, 80, { align: 'center' });
    
    this.pdf.setFontSize(10);
    this.pdf.text('📊 Basic Analysis Report', this.pageWidth / 2, 95, { align: 'center' });

    // Repository stats box
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.roundedRect(this.margin, 120, this.pageWidth - 2 * this.margin, 80, 5, 5, 'FD');

    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Statistics', this.margin + 10, 135);

    // Basic stats only
    const stats = [
      [`⭐ Stars`, repository.stargazers_count?.toLocaleString() || 'N/A'],
      [`🔀 Forks`, repository.forks_count?.toLocaleString() || 'N/A'],
      [`🐛 Open Issues`, repository.open_issues_count?.toLocaleString() || 'N/A'],
      [`📝 Language`, repository.language || 'N/A'],
      [`📅 Created`, new Date(repository.created_at).toLocaleDateString()],
      [`🔄 Last Updated`, new Date(repository.updated_at).toLocaleDateString()],
      [`🏷 Topics`, repository.topics?.join(', ') || 'N/A'],
      [`🔒 Private`, repository.private ? 'Yes' : 'No']
    ];

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    stats.forEach(([label, value], index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = this.margin + 10 + (col * 80);
      const y = 150 + (row * 12);
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(label, x, y);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.text(value, x + 35, y);
    });

    // Limited description
    if (repository.description) {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setTextColor(60, 60, 60);
      
      const maxDescLength = 150; // Shorter description
      const description = repository.description.length > maxDescLength 
        ? repository.description.substring(0, maxDescLength) + '...' 
        : repository.description;
      
      this.pdf.text(description, this.pageWidth / 2, 220, { 
        align: 'center', 
        maxWidth: this.pageWidth - 2 * this.margin - 20 
      });
    }
  }

  private addLimitedExecutiveSummary(repository: Repository, analysis: string): void {
    this.currentY = 30;
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 25;

    // Basic health score with better visuals
    const healthScore = this.extractBasicHealthScore(repository);
    this.addBasicHealthScore(healthScore);
    this.currentY += 50;

    // Quick insights cards (NEW - surprising visual element)
    this.addQuickInsightsCards(repository);
    this.currentY += 15;

    // Limited key findings
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Key Observations', this.margin, this.currentY);
    this.currentY += 15;

    const basicFindings = this.generateBasicFindings(repository);
    basicFindings.forEach((finding, index) => {
      this.currentY = this.checkPageBreak(this.currentY, 15);
      
      // Better visual styling
      this.pdf.setFillColor(239, 246, 255);
      this.pdf.setDrawColor(191, 219, 254);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 12, 3, 3, 'FD');
      
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      
      const bulletText = `• ${finding}`;
      this.pdf.text(bulletText, this.margin + 8, this.currentY + 5);
      this.currentY += 15;
    });

    // Upgrade teaser (tasteful)
    this.currentY += 10;
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.setDrawColor(209, 213, 219);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 4, 4, 'FD');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(59, 130, 246);
    this.pdf.text('💡 Want More Insights?', this.margin + 10, this.currentY + 12);
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Enhanced: Smart recommendations + issue analysis ($10/month)', this.margin + 10, this.currentY + 20);
    this.pdf.text('Premium: AI analysis + security scanning ($20/month)', this.margin + 10, this.currentY + 26);
  }

  // NEW: Quick insights cards for visual appeal
  private addQuickInsightsCards(repository: Repository): void {
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Quick Insights', this.margin, this.currentY);
    this.currentY += 15;

    const cardWidth = (this.pageWidth - 2 * this.margin - 10) / 3;
    const cardHeight = 35;

    // Card 1: Activity Status
    const daysSinceUpdate = (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    const activityStatus = daysSinceUpdate < 30 ? 'Active' : daysSinceUpdate < 90 ? 'Moderate' : 'Stale';
    const activityColor = daysSinceUpdate < 30 ? [34, 197, 94] : daysSinceUpdate < 90 ? [245, 158, 11] : [239, 68, 68];
    
    this.pdf.setFillColor(activityColor[0], activityColor[1], activityColor[2], 0.1);
    this.pdf.setDrawColor(activityColor[0], activityColor[1], activityColor[2]);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(this.margin, this.currentY, cardWidth, cardHeight, 3, 3, 'FD');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(activityColor[0], activityColor[1], activityColor[2]);
    this.pdf.text(activityStatus, this.margin + 5, this.currentY + 12);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Activity Status', this.margin + 5, this.currentY + 20);
    this.pdf.text(`Updated ${Math.floor(daysSinceUpdate)}d ago`, this.margin + 5, this.currentY + 28);

    // Card 2: Community Size
    const communitySize = repository.stargazers_count > 1000 ? 'Large' : 
                         repository.stargazers_count > 100 ? 'Medium' : 'Small';
    const communityColor = [59, 130, 246];
    
    this.pdf.setFillColor(communityColor[0], communityColor[1], communityColor[2], 0.1);
    this.pdf.setDrawColor(communityColor[0], communityColor[1], communityColor[2]);
    this.pdf.roundedRect(this.margin + cardWidth + 5, this.currentY, cardWidth, cardHeight, 3, 3, 'FD');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(communityColor[0], communityColor[1], communityColor[2]);
    this.pdf.text(communitySize, this.margin + cardWidth + 10, this.currentY + 12);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Community', this.margin + cardWidth + 10, this.currentY + 20);
    this.pdf.text(`${repository.stargazers_count} stars`, this.margin + cardWidth + 10, this.currentY + 28);

    // Card 3: Issue Load
    const issueLoad = repository.open_issues_count < 20 ? 'Light' : 
                     repository.open_issues_count < 100 ? 'Moderate' : 'Heavy';
    const issueColor = repository.open_issues_count < 20 ? [34, 197, 94] : 
                      repository.open_issues_count < 100 ? [245, 158, 11] : [239, 68, 68];
    
    this.pdf.setFillColor(issueColor[0], issueColor[1], issueColor[2], 0.1);
    this.pdf.setDrawColor(issueColor[0], issueColor[1], issueColor[2]);
    this.pdf.roundedRect(this.margin + 2 * cardWidth + 10, this.currentY, cardWidth, cardHeight, 3, 3, 'FD');
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(issueColor[0], issueColor[1], issueColor[2]);
    this.pdf.text(issueLoad, this.margin + 2 * cardWidth + 15, this.currentY + 12);
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Issue Load', this.margin + 2 * cardWidth + 15, this.currentY + 20);
    this.pdf.text(`${repository.open_issues_count} open`, this.margin + 2 * cardWidth + 15, this.currentY + 28);

    this.currentY += cardHeight + 10;
  }

  private addKeyInsights(analysis: string): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Insights', this.margin, this.currentY);
    this.currentY += 25;

    // Generic insights (no specific analysis details)
    const genericInsights = [
      {
        title: "Activity Level",
        content: "Repository shows regular commit activity with community engagement.",
        icon: "📈"
      },
      {
        title: "Code Quality",
        content: "Standard development practices observed in repository structure.",
        icon: "⚡"
      },
      {
        title: "Community",
        content: "Repository has established community interaction patterns.",
        icon: "👥"
      },
      {
        title: "Maintenance",
        content: "Regular updates and issue management practices in place.",
        icon: "🔧"
      }
    ];

    genericInsights.forEach((insight, index) => {
      this.currentY = this.checkPageBreak(this.currentY, 40);
      
      // Insight box
      this.pdf.setFillColor(250, 250, 250);
      this.pdf.setDrawColor(220, 220, 220);
      this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 4, 4, 'FD');
      
      // Icon and title
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(59, 130, 246);
      this.pdf.text(`${insight.icon} ${insight.title}`, this.margin + 10, this.currentY + 15);
      
      // Content
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(insight.content, this.margin + 10, this.currentY + 25);
      
      this.currentY += 45;
    });

    // Upgrade prompt
    this.currentY += 10;
    this.pdf.setFillColor(239, 246, 255);
    this.pdf.setDrawColor(59, 130, 246);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 4, 4, 'FD');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(59, 130, 246);
    this.pdf.text('💎 Want Detailed Analysis?', this.margin + 10, this.currentY + 12);
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Get specific code quality metrics, security insights, and performance analysis', this.margin + 10, this.currentY + 22);
  }

  private addBasicRecommendations(): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('General Recommendations', this.margin, this.currentY);
    this.currentY += 25;

    // Generic recommendations (no specific analysis)
    const genericRecommendations = [
      "Consider implementing automated testing for better code reliability",
      "Improve documentation to help new contributors understand the project",
      "Set up issue templates to streamline bug reporting and feature requests",
      "Regular dependency updates help maintain security and performance",
      "Code review processes can improve overall code quality"
    ];

    genericRecommendations.forEach((rec, index) => {
      this.currentY = this.checkPageBreak(this.currentY, 25);
      
      // Basic recommendation box
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.setDrawColor(203, 213, 225);
      this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 3, 3, 'FD');
      
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      
      this.pdf.text(`${index + 1}. ${rec}`, this.margin + 10, this.currentY + 12);
      this.currentY += 25;
    });

    // Upgrade prompt for detailed recommendations
    this.currentY += 10;
    this.pdf.setFillColor(254, 242, 242);
    this.pdf.setDrawColor(239, 68, 68);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 4, 4, 'FD');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(239, 68, 68);
    this.pdf.text('🎯 Need Specific Recommendations?', this.margin + 10, this.currentY + 12);
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Upgrade to get repository-specific, actionable recommendations', this.margin + 10, this.currentY + 20);
    this.pdf.text('based on detailed code analysis and industry best practices', this.margin + 10, this.currentY + 28);
  }

  private addUpgradePrompt(): void {
    this.currentY = 30;
    
    // Upgrade page with compelling offer
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.rect(0, 0, this.pageWidth, 80, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Unlock Full Analysis', this.pageWidth / 2, 35, { align: 'center' });
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Get comprehensive insights your repository deserves', this.pageWidth / 2, 55, { align: 'center' });

    this.currentY = 100;

    // Feature comparison
    const features = [
      { feature: 'Repository Statistics', basic: '✅', premium: '✅' },
      { feature: 'Basic Health Score', basic: '✅', premium: '✅' },
      { feature: 'Generic Recommendations', basic: '✅', premium: '✅' },
      { feature: 'Detailed Code Analysis', basic: '❌', premium: '✅' },
      { feature: 'Security Vulnerability Scan', basic: '❌', premium: '✅' },
      { feature: 'Performance Insights', basic: '❌', premium: '✅' },
      { feature: 'Custom Recommendations', basic: '❌', premium: '✅' },
      { feature: 'Trend Analysis & Predictions', basic: '❌', premium: '✅' },
      { feature: 'Competitive Benchmarking', basic: '❌', premium: '✅' },
      { feature: 'Export Options (JSON, CSV)', basic: '❌', premium: '✅' }
    ];

    // Table header
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.rect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 15, 'F');
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Feature', this.margin + 5, this.currentY + 10);
    this.pdf.text('Basic', this.margin + 100, this.currentY + 10);
    this.pdf.text('Premium', this.margin + 140, this.currentY + 10);
    
    this.currentY += 20;

    // Feature rows
    features.forEach((item, index) => {
      if (index % 2 === 0) {
        this.pdf.setFillColor(252, 252, 252);
        this.pdf.rect(this.margin, this.currentY - 2, this.pageWidth - 2 * this.margin, 12, 'F');
      }
      
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      
      this.pdf.text(item.feature, this.margin + 5, this.currentY + 6);
      this.pdf.text(item.basic, this.margin + 105, this.currentY + 6);
      
      if (item.premium === '✅') {
        this.pdf.setTextColor(34, 197, 94);
      } else {
        this.pdf.setTextColor(239, 68, 68);
      }
      this.pdf.text(item.premium, this.margin + 145, this.currentY + 6);
      this.pdf.setTextColor(0, 0, 0);
      
      this.currentY += 12;
    });

    // Call to action
    this.currentY += 20;
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 5, 5, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('🚀 Upgrade to Premium Analysis', this.pageWidth / 2, this.currentY + 16, { align: 'center' });

    this.currentY += 35;
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Visit our platform to unlock detailed repository insights and actionable recommendations', this.pageWidth / 2, this.currentY, { align: 'center' });
  }

  // Helper methods
  private extractBasicHealthScore(repository: Repository): number {
    // Simple scoring based on basic metrics
    let score = 50; // Base score
    
    if (repository.stargazers_count > 10) score += 10;
    if (repository.stargazers_count > 100) score += 10;
    if (repository.forks_count > 5) score += 10;
    if (repository.open_issues_count < 20) score += 10;
    if (repository.language) score += 5;
    if (repository.description) score += 5;
    
    return Math.min(score, 100);
  }

  private addBasicHealthScore(score: number): void {
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 5, 5, 'FD');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Basic Health Score', this.margin + 10, this.currentY + 15);
    
    // Simple score bar
    const barY = this.currentY + 20;
    const barWidth = this.pageWidth - 2 * this.margin - 80;
    const scoreWidth = (barWidth * score) / 100;
    
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.roundedRect(this.margin + 10, barY, barWidth, 8, 4, 4, 'F');
    
    const color = score >= 80 ? [34, 197, 94] : score >= 60 ? [59, 130, 246] : [239, 68, 68];
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.roundedRect(this.margin + 10, barY, scoreWidth, 8, 4, 4, 'F');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(color[0], color[1], color[2]);
    this.pdf.text(`${score}/100`, this.pageWidth - this.margin - 40, this.currentY + 25);
  }

  private generateBasicFindings(repository: Repository): string[] {
    const findings = [];
    
    if (repository.stargazers_count > 50) {
      findings.push("Repository has good community interest with significant stars");
    } else {
      findings.push("Repository is in early stages of community adoption");
    }
    
    if (repository.forks_count > 10) {
      findings.push("Active fork activity indicates developer engagement");
    }
    
    if (repository.open_issues_count < 10) {
      findings.push("Well-maintained with manageable issue count");
    } else if (repository.open_issues_count > 50) {
      findings.push("High issue count may indicate active development or maintenance needs");
    }
    
    if (repository.language) {
      findings.push(`Primary language: ${repository.language} - suitable for its domain`);
    }
    
    return findings.slice(0, 4); // Limit to 4 findings
  }

  private addPage(): void {
    this.pdf.addPage();
    this.currentY = 30;
    
    // Clean page initialization
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setLineWidth(0.5);
  }

  private checkPageBreak(currentY: number, requiredHeight: number): number {
    if (currentY + requiredHeight > 270) {
      this.addPage();
      return 30;
    }
    return currentY;
  }

  private addFooterToAllPages(repository: Repository): void {
    const pageCount = this.pdf.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      this.pdf.setPage(i);
      
      // Footer line
      this.pdf.setDrawColor(200, 200, 200);
      this.pdf.setLineWidth(0.5);
      this.pdf.line(20, 280, this.pageWidth - 20, 280);
      
      // Footer text
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(`${repository.full_name} - Basic Report`, 20, 285);
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - 20, 285, { align: 'right' });
      this.pdf.text(`TechHub AI • Basic Analysis`, this.pageWidth / 2, 285, { align: 'center' });
    }
  }
}

// Export convenience function
export async function generateLimitedPDFReport(
  repository: Repository, 
  analysis: string, 
  options: PDFGenerationOptions = {}
): Promise<void> {
  const generator = new LimitedPDFGenerator();
  await generator.generateLimitedReport(repository, analysis, options);
}
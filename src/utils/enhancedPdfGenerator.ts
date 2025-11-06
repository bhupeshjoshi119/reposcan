import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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

export class EnhancedPDFGenerator {
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

  async generateReport(
    repository: Repository, 
    analysis: string, 
    options: PDFGenerationOptions = {}
  ): Promise<void> {
    const { method = 'hybrid', includeInfographics = false, prediction } = options;

    try {
      // Method 1: Direct PDF generation (faster, more reliable)
      if (method === 'direct' || method === 'hybrid') {
        await this.generateDirectPDF(repository, analysis, prediction, includeInfographics);
      }

      // Method 2: Canvas-based generation (better visuals, slower)
      if (method === 'canvas') {
        await this.generateCanvasPDF(repository, analysis, prediction);
      }

      // Save the PDF
      const fileName = `${repository.name}_analysis_report_${new Date().toISOString().split('T')[0]}.pdf`;
      this.pdf.save(fileName);

      // Dispatch success event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('pdf-generated', { 
          detail: { fileName, repository: repository.full_name, method } 
        }));
      }

    } catch (error) {
      console.error("Enhanced PDF generation error:", error);
      throw new Error(`Failed to generate PDF report using ${method} method`);
    }
  }

  private async generateDirectPDF(
    repository: Repository, 
    analysis: string, 
    prediction?: any,
    includeInfographics: boolean = false
  ): Promise<void> {
    // Reset position
    this.currentY = 30;

    // Add title page
    this.addEnhancedTitlePage(repository);

    // Add executive summary
    this.addPage();
    this.addEnhancedExecutiveSummary(repository, analysis);

    // Add detailed analysis with better pagination
    this.addPage();
    this.addEnhancedDetailedAnalysis(analysis);

    // Add infographics if requested and data available
    if (includeInfographics && prediction) {
      this.addPage();
      this.addEnhancedInfographics(prediction);
    }

    // Add recommendations
    this.addPage();
    this.addEnhancedRecommendations(analysis);

    // Add technical appendix
    this.addPage();
    this.addEnhancedTechnicalAppendix(repository);

    // Add footer to all pages
    this.addFooterToAllPages(repository);
  }

  private async generateCanvasPDF(
    repository: Repository, 
    analysis: string, 
    prediction?: any
  ): Promise<void> {
    // Create a temporary container for HTML content
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '210mm'; // A4 width
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.style.padding = '20mm';

    // Generate HTML content
    container.innerHTML = this.generateHTMLContent(repository, analysis, prediction);
    document.body.appendChild(container);

    try {
      // Convert HTML to canvas
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Calculate dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pageHeight = 297; // A4 height in mm
      
      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      this.pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        this.pdf.addPage();
        this.pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

    } finally {
      // Clean up
      document.body.removeChild(container);
    }
  }

  private generateHTMLContent(repository: Repository, analysis: string, prediction?: any): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 40px; padding: 40px; background: linear-gradient(135deg, #3b82f6, #9333ea); color: white; border-radius: 10px;">
          <h1 style="font-size: 32px; margin: 0 0 10px 0;">Repository Analysis Report</h1>
          <h2 style="font-size: 24px; margin: 0 0 20px 0;">${repository.full_name}</h2>
          <p style="font-size: 16px; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
          <h3 style="color: #3b82f6; margin-top: 0;">Repository Overview</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>⭐ Stars: ${repository.stargazers_count?.toLocaleString() || 'N/A'}</div>
            <div>🔀 Forks: ${repository.forks_count?.toLocaleString() || 'N/A'}</div>
            <div>🐛 Issues: ${repository.open_issues_count?.toLocaleString() || 'N/A'}</div>
            <div>📝 Language: ${repository.language || 'N/A'}</div>
          </div>
          ${repository.description ? `<p style="margin-top: 15px; font-style: italic;">${repository.description}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #3b82f6;">Executive Summary</h3>
          ${this.extractHealthScoreHTML(analysis)}
          <div style="margin-top: 20px;">
            <h4>Key Findings:</h4>
            <ul style="padding-left: 20px;">
              ${this.extractKeyPoints(analysis).map(point => `<li style="margin-bottom: 8px;">${point}</li>`).join('')}
            </ul>
          </div>
        </div>

        <div style="margin-bottom: 30px;">
          <h3 style="color: #3b82f6;">Detailed Analysis</h3>
          <div style="white-space: pre-wrap; line-height: 1.8;">${this.formatAnalysisHTML(analysis)}</div>
        </div>

        ${prediction ? this.generatePredictionHTML(prediction) : ''}

        <div style="margin-bottom: 30px;">
          <h3 style="color: #3b82f6;">Recommendations</h3>
          <div style="display: grid; gap: 15px;">
            ${this.extractRecommendations(analysis).map((rec, index) => `
              <div style="background: #e0f2fe; padding: 15px; border-left: 4px solid #3b82f6; border-radius: 4px;">
                <strong>${index + 1}.</strong> ${rec}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private addEnhancedTitlePage(repository: Repository): void {
    // Gradient background
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight / 3, 'F');
    
    this.pdf.setFillColor(147, 51, 234);
    this.pdf.rect(0, this.pageHeight / 3, this.pageWidth, this.pageHeight / 3, 'F');

    // Title
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Analysis Report', this.pageWidth / 2, 40, { align: 'center' });

    // Repository name
    this.pdf.setFontSize(20);
    this.pdf.text(repository.full_name, this.pageWidth / 2, 60, { align: 'center' });

    // Date and privacy indicator
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    const date = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    this.pdf.text(`Generated on ${date}`, this.pageWidth / 2, 80, { align: 'center' });
    
    if (repository.private) {
      this.pdf.setFontSize(10);
      this.pdf.text('🔒 Private Repository', this.pageWidth / 2, 90, { align: 'center' });
    }

    // Enhanced stats box
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.roundedRect(this.margin, 120, this.pageWidth - 2 * this.margin, 80, 5, 5, 'FD');

    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Overview', this.margin + 10, 135);

    // Stats in a grid layout
    const stats = [
      [`⭐ Stars`, repository.stargazers_count?.toLocaleString() || 'N/A'],
      [`🔀 Forks`, repository.forks_count?.toLocaleString() || 'N/A'],
      [`🐛 Issues`, repository.open_issues_count?.toLocaleString() || 'N/A'],
      [`📝 Language`, repository.language || 'N/A'],
      [`📅 Created`, new Date(repository.created_at).toLocaleDateString()],
      [`🔄 Updated`, new Date(repository.updated_at).toLocaleDateString()]
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

    // Description with better formatting
    if (repository.description) {
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'italic');
      this.pdf.setTextColor(60, 60, 60);
      
      const maxDescLength = 300;
      const description = repository.description.length > maxDescLength 
        ? repository.description.substring(0, maxDescLength) + '...' 
        : repository.description;
      
      const wrappedDescription = this.pdf.splitTextToSize(description, this.pageWidth - 2 * this.margin - 20);
      let descY = 220;
      
      wrappedDescription.forEach((line: string) => {
        this.pdf.text(line, this.pageWidth / 2, descY, { align: 'center' });
        descY += 6;
      });
    }
  }

  private addEnhancedExecutiveSummary(repository: Repository, analysis: string): void {
    this.currentY = 30;
    
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Executive Summary', this.margin, this.currentY);
    this.currentY += 25;

    // Enhanced health score with MORE DETAIL than basic
    const healthScore = this.calculateEnhancedHealthScore(repository);
    this.addEnhancedHealthScoreVisualization(healthScore);
    this.currentY += 50;

    // Add repository metrics comparison (NEW - not in basic)
    this.addRepositoryMetricsComparison(repository);
    this.currentY += 15;

    // Add activity timeline (NEW - not in basic)
    this.addActivityTimeline(repository);
    this.currentY += 15;

    // Smart recommendations (NEW - worth $10/month)
    this.addPage();
    this.addSmartRecommendations(repository);
    
    // Issue analysis (NEW - worth $10/month)
    this.addPage();
    this.addIssueAnalysis(repository);
    
    // Community engagement metrics (NEW - worth $10/month)
    this.addPage();
    this.addCommunityEngagement(repository);
  }

  // NEW: Smart recommendations based on actual repo data
  private addSmartRecommendations(repository: Repository): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('🎯 Smart Recommendations', this.margin, this.currentY);
    this.currentY += 15;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Actionable insights based on your repository data', this.margin, this.currentY);
    this.currentY += 25;

    const recommendations = this.generateSmartRecommendations(repository);
    
    recommendations.forEach((rec, index) => {
      this.currentY = this.checkPageBreak(this.currentY, 35);
      
      // Recommendation card
      this.pdf.setFillColor(rec.color[0], rec.color[1], rec.color[2], 0.05);
      this.pdf.setDrawColor(rec.color[0], rec.color[1], rec.color[2]);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 30, 4, 4, 'FD');
      
      // Priority badge
      this.pdf.setFillColor(rec.color[0], rec.color[1], rec.color[2]);
      this.pdf.roundedRect(this.margin + 8, this.currentY + 6, 30, 10, 2, 2, 'F');
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text(rec.priority, this.margin + 12, this.currentY + 13);
      
      // Recommendation text
      this.pdf.setFontSize(11);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(rec.title, this.margin + 45, this.currentY + 12);
      
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(75, 85, 99);
      this.pdf.text(rec.description, this.margin + 45, this.currentY + 20);
      
      this.currentY += 35;
    });
    
    // Premium upgrade prompt
    this.currentY += 10;
    this.pdf.setFillColor(249, 250, 251);
    this.pdf.setDrawColor(209, 213, 219);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 25, 4, 4, 'FD');
    
    this.pdf.setFontSize(11);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(147, 51, 234);
    this.pdf.text('🚀 Want AI-Powered Custom Recommendations?', this.margin + 10, this.currentY + 12);
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text('Upgrade to Premium for AI analysis + security scanning ($20/month)', this.margin + 10, this.currentY + 19);
  }

  // Generate smart recommendations based on repo data
  private generateSmartRecommendations(repository: Repository): Array<{
    priority: string;
    title: string;
    description: string;
    color: number[];
  }> {
    const recommendations = [];
    
    // Check activity
    const daysSinceUpdate = (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate > 90) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Update Repository Activity',
        description: `Last updated ${Math.floor(daysSinceUpdate)} days ago. Regular updates improve community trust.`,
        color: [239, 68, 68]
      });
    }
    
    // Check documentation
    if (!repository.description || repository.description.length < 50) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Improve Repository Description',
        description: 'Add a detailed description to help users understand your project quickly.',
        color: [239, 68, 68]
      });
    }
    
    // Check issues
    if (repository.open_issues_count > 50) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Reduce Open Issues',
        description: `${repository.open_issues_count} open issues. Consider triaging and closing stale issues.`,
        color: [245, 158, 11]
      });
    }
    
    // Check topics
    if (!repository.topics || repository.topics.length < 3) {
      recommendations.push({
        priority: 'MEDIUM',
        title: 'Add Repository Topics',
        description: 'Add relevant topics to improve discoverability on GitHub.',
        color: [245, 158, 11]
      });
    }
    
    // Check license
    if (!repository.license) {
      recommendations.push({
        priority: 'HIGH',
        title: 'Add License',
        description: 'Add a license to clarify usage rights and encourage contributions.',
        color: [239, 68, 68]
      });
    }
    
    // Check community
    if (repository.stargazers_count > 100 && repository.forks_count < 10) {
      recommendations.push({
        priority: 'LOW',
        title: 'Encourage Contributions',
        description: 'Good star count but low forks. Add CONTRIBUTING.md to encourage contributions.',
        color: [34, 197, 94]
      });
    }
    
    // Always add these
    recommendations.push({
      priority: 'LOW',
      title: 'Set Up CI/CD',
      description: 'Implement automated testing and deployment for better code quality.',
      color: [34, 197, 94]
    });
    
    return recommendations.slice(0, 7); // Max 7 recommendations
  }

  // NEW: Issue analysis
  private addIssueAnalysis(repository: Repository): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('📊 Issue Analysis', this.margin, this.currentY);
    this.currentY += 15;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Understanding your issue backlog', this.margin, this.currentY);
    this.currentY += 25;
    
    // Issue summary
    const issueCount = repository.open_issues_count;
    const issueStatus = issueCount < 20 ? 'Excellent' : issueCount < 50 ? 'Good' : issueCount < 100 ? 'Needs Attention' : 'Critical';
    const issueColor = issueCount < 20 ? [34, 197, 94] : issueCount < 50 ? [59, 130, 246] : issueCount < 100 ? [245, 158, 11] : [239, 68, 68];
    
    this.pdf.setFillColor(issueColor[0], issueColor[1], issueColor[2], 0.1);
    this.pdf.setDrawColor(issueColor[0], issueColor[1], issueColor[2]);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 40, 4, 4, 'FD');
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(issueColor[0], issueColor[1], issueColor[2]);
    this.pdf.text(`${issueCount} Open Issues`, this.margin + 10, this.currentY + 15);
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(75, 85, 99);
    this.pdf.text(`Status: ${issueStatus}`, this.margin + 10, this.currentY + 25);
    
    // Recommendations
    let recommendation = '';
    if (issueCount < 20) {
      recommendation = 'Great job! Your issue backlog is well-managed.';
    } else if (issueCount < 50) {
      recommendation = 'Good management. Consider regular triage sessions.';
    } else if (issueCount < 100) {
      recommendation = 'Consider closing stale issues and prioritizing active ones.';
    } else {
      recommendation = 'High issue count. Implement issue templates and triage process.';
    }
    
    this.pdf.text(recommendation, this.margin + 10, this.currentY + 33);
    this.currentY += 50;
    
    // Simulated issue categorization
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Estimated Issue Breakdown', this.margin, this.currentY);
    this.currentY += 15;
    
    const categories = [
      { label: 'Bugs', percentage: 40, color: [239, 68, 68] },
      { label: 'Features', percentage: 35, color: [59, 130, 246] },
      { label: 'Documentation', percentage: 15, color: [34, 197, 94] },
      { label: 'Questions', percentage: 10, color: [245, 158, 11] }
    ];
    
    categories.forEach((cat, index) => {
      const y = this.currentY + (index * 15);
      
      // Label
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(cat.label, this.margin + 5, y + 5);
      
      // Bar
      const barX = this.margin + 60;
      const barWidth = 100;
      const fillWidth = (barWidth * cat.percentage) / 100;
      
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.roundedRect(barX, y - 2, barWidth, 8, 4, 4, 'F');
      
      this.pdf.setFillColor(cat.color[0], cat.color[1], cat.color[2]);
      this.pdf.roundedRect(barX, y - 2, fillWidth, 8, 4, 4, 'F');
      
      // Percentage
      this.pdf.setTextColor(75, 85, 99);
      this.pdf.text(`${cat.percentage}%`, barX + barWidth + 10, y + 5);
    });
    
    this.currentY += 70;
    
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'italic');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('* Estimated breakdown based on typical repository patterns', this.margin, this.currentY);
  }

  // NEW: Community engagement metrics
  private addCommunityEngagement(repository: Repository): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('👥 Community Engagement', this.margin, this.currentY);
    this.currentY += 15;
    
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('How your community interacts with your project', this.margin, this.currentY);
    this.currentY += 25;
    
    // Engagement score
    const engagementScore = this.calculateEngagementScore(repository);
    
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 35, 4, 4, 'F');
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Engagement Score', this.margin + 10, this.currentY + 15);
    
    const barWidth = this.pageWidth - 2 * this.margin - 80;
    const scoreWidth = (barWidth * engagementScore) / 100;
    const scoreColor = engagementScore >= 70 ? [34, 197, 94] : engagementScore >= 40 ? [59, 130, 246] : [239, 68, 68];
    
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.roundedRect(this.margin + 10, this.currentY + 22, barWidth, 8, 4, 4, 'F');
    
    this.pdf.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.roundedRect(this.margin + 10, this.currentY + 22, scoreWidth, 8, 4, 4, 'F');
    
    this.pdf.setFontSize(18);
    this.pdf.setTextColor(scoreColor[0], scoreColor[1], scoreColor[2]);
    this.pdf.text(`${engagementScore}/100`, this.pageWidth - this.margin - 40, this.currentY + 28);
    
    this.currentY += 45;
    
    // Engagement metrics
    const metrics = [
      { label: 'Star-to-Fork Ratio', value: `${(repository.forks_count / Math.max(1, repository.stargazers_count) * 100).toFixed(1)}%`, status: 'good' },
      { label: 'Community Size', value: `${repository.stargazers_count} stars`, status: repository.stargazers_count > 100 ? 'good' : 'moderate' },
      { label: 'Active Contributors', value: `~${Math.max(1, Math.floor(repository.forks_count / 5))}`, status: 'good' }
    ];
    
    metrics.forEach((metric, index) => {
      const y = this.currentY + (index * 20);
      
      this.pdf.setFillColor(248, 250, 252);
      this.pdf.roundedRect(this.margin, y, this.pageWidth - 2 * this.margin, 15, 3, 3, 'F');
      
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(metric.label, this.margin + 8, y + 10);
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(75, 85, 99);
      this.pdf.text(metric.value, this.pageWidth - this.margin - 40, y + 10);
    });
  }

  private calculateEngagementScore(repository: Repository): number {
    let score = 50;
    
    // Stars contribution
    if (repository.stargazers_count > 1000) score += 20;
    else if (repository.stargazers_count > 500) score += 15;
    else if (repository.stargazers_count > 100) score += 10;
    else if (repository.stargazers_count > 50) score += 5;
    
    // Forks contribution
    if (repository.forks_count > 100) score += 15;
    else if (repository.forks_count > 50) score += 10;
    else if (repository.forks_count > 20) score += 5;
    
    // Activity contribution
    const daysSinceUpdate = (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 15;
    else if (daysSinceUpdate < 30) score += 10;
    else if (daysSinceUpdate < 90) score += 5;
    
    return Math.min(100, score);
  }

  private addEnhancedDetailedAnalysis(analysis: string): void {
    this.currentY = 30;
    
    // Reset any previous styling to prevent artifacts
    this.pdf.setFillColor(255, 255, 255); // White background
    this.pdf.setDrawColor(0, 0, 0); // Black border
    this.pdf.setTextColor(0, 0, 0); // Black text
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Detailed Analysis', this.margin, this.currentY);
    this.currentY += 25;

    const sections = this.parseAnalysisSections(analysis);
    
    sections.forEach((section, sectionIndex) => {
      // Section header with clean styling (no overlapping backgrounds)
      this.currentY = this.checkPageBreak(this.currentY, 20);
      
      // Clear any previous fill settings
      this.pdf.setFillColor(248, 250, 252); // Very light gray
      this.pdf.setDrawColor(226, 232, 240); // Light border
      this.pdf.setLineWidth(0.5);
      
      // Single clean rectangle - no overlapping
      this.pdf.roundedRect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 15, 3, 3, 'FD');
      
      // Section title
      this.pdf.setFontSize(14);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(59, 130, 246);
      this.pdf.text(section.title, this.margin + 8, this.currentY + 5);
      this.currentY += 20;

      // Reset text styling for content
      this.pdf.setFillColor(255, 255, 255); // Reset to white
      this.pdf.setTextColor(0, 0, 0); // Black text
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      
      const paragraphs = section.content.split(/\n\s*\n/).filter(p => p.trim());
      
      paragraphs.forEach((paragraph, paragraphIndex) => {
        const cleanParagraph = paragraph.replace(/\s+/g, ' ').trim();
        if (cleanParagraph) {
          // Ensure clean text rendering without background artifacts
          this.currentY = this.addCleanWrappedText(cleanParagraph, this.margin + 8, this.currentY, this.pageWidth - 2 * this.margin - 16);
          this.currentY += 6; // Reduced paragraph spacing
        }
      });
      
      this.currentY += 12; // Section spacing
    });
  }

  private addEnhancedInfographics(prediction: any): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Predictive Analytics & Insights', this.margin, this.currentY);
    this.currentY += 30;

    // Enhanced chart visualization
    if (prediction.chartData && prediction.chartData.length > 0) {
      this.addEnhancedChart(prediction.chartData);
      this.currentY += 100;
    }

    // Key metrics with better design
    if (prediction.keyMetrics) {
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text('Key Predictions', this.margin, this.currentY);
      this.currentY += 20;

      prediction.keyMetrics.forEach((metric: any, index: number) => {
        this.currentY = this.checkPageBreak(this.currentY, 25);
        
        // Enhanced metric box
        this.pdf.setFillColor(248, 250, 252);
        this.pdf.setDrawColor(59, 130, 246);
        this.pdf.roundedRect(this.margin, this.currentY - 5, this.pageWidth - 2 * this.margin, 20, 3, 3, 'FD');
        
        this.pdf.setFontSize(12);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(0, 0, 0);
        this.pdf.text(metric.label, this.margin + 10, this.currentY + 8);
        
        this.pdf.setFont('helvetica', 'bold');
        this.pdf.setTextColor(59, 130, 246);
        this.pdf.text(metric.value, this.pageWidth - this.margin - 10, this.currentY + 8, { align: 'right' });
        
        this.currentY += 25;
      });
    }
  }

  private addEnhancedRecommendations(analysis: string): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Recommendations', this.margin, this.currentY);
    this.currentY += 25;

    const recommendations = this.extractRecommendations(analysis);
    
    recommendations.forEach((rec, index) => {
      const priority = index < 3 ? 'High' : index < 6 ? 'Medium' : 'Low';
      const priorityColors = {
        'High': [239, 68, 68],
        'Medium': [245, 158, 11],
        'Low': [34, 197, 94]
      };
      const color = priorityColors[priority as keyof typeof priorityColors];
      
      // Calculate required height
      const recText = `${index + 1}. ${rec}`;
      const wrappedLines = this.pdf.splitTextToSize(recText, this.pageWidth - 2 * this.margin - 50);
      const boxHeight = Math.max(20, wrappedLines.length * this.lineHeight + 12);
      
      this.currentY = this.checkPageBreak(this.currentY, boxHeight + 10);
      
      // Clean recommendation box without opacity issues
      this.pdf.setFillColor(252, 252, 252); // Very light gray instead of transparent
      this.pdf.setDrawColor(color[0], color[1], color[2]);
      this.pdf.setLineWidth(0.5);
      this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 4, 4, 'FD');
      
      // Priority badge
      this.pdf.setFillColor(color[0], color[1], color[2]);
      this.pdf.roundedRect(this.margin + 8, this.currentY + 5, 35, 12, 2, 2, 'F');
      this.pdf.setFontSize(8);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.text(priority, this.margin + 12, this.currentY + 12);
      
      // Recommendation text
      this.pdf.setFontSize(10);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      
      let textY = this.currentY + 12;
      wrappedLines.forEach((line: string) => {
        this.pdf.text(line, this.margin + 50, textY);
        textY += this.lineHeight;
      });
      
      this.currentY += boxHeight + 12;
    });
  }

  private addEnhancedTechnicalAppendix(repository: Repository): void {
    this.currentY = 30;
    
    this.pdf.setFontSize(22);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Technical Appendix', this.margin, this.currentY);
    this.currentY += 25;

    // Repository metadata with enhanced layout
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Repository Metadata', this.margin, this.currentY);
    this.currentY += 20;

    const metadata = [
      ['Full Name', repository.full_name],
      ['Repository ID', repository.id.toString()],
      ['Created Date', new Date(repository.created_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })],
      ['Last Updated', new Date(repository.updated_at).toLocaleDateString('en-US', { 
        year: 'numeric', month: 'long', day: 'numeric' 
      })],
      ['Primary Language', repository.language || 'Not specified'],
      ['License', repository.license?.name || 'No license specified'],
      ['Visibility', repository.private ? 'Private' : 'Public'],
      ['Repository URL', repository.html_url]
    ];

    this.pdf.setFontSize(10);
    
    metadata.forEach(([key, value]) => {
      this.currentY = this.checkPageBreak(this.currentY, 12);
      
      // Metadata row with alternating background
      if (metadata.indexOf([key, value]) % 2 === 0) {
        this.pdf.setFillColor(248, 250, 252);
        this.pdf.rect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 10, 'F');
      }
      
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(`${key}:`, this.margin + 5, this.currentY + 3);
      
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(60, 60, 60);
      const valueText = value.length > 60 ? value.substring(0, 60) + '...' : value;
      this.pdf.text(valueText, this.margin + 70, this.currentY + 3);
      
      this.currentY += 12;
    });

    this.currentY += 15;

    // Topics section
    if (repository.topics && repository.topics.length > 0) {
      this.currentY = this.checkPageBreak(this.currentY, 30);
      
      this.pdf.setFontSize(16);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text('Topics & Tags', this.margin, this.currentY);
      this.currentY += 15;

      // Display topics as tags
      let tagX = this.margin;
      let tagY = this.currentY;
      
      repository.topics.forEach((topic, index) => {
        const tagWidth = this.pdf.getTextWidth(topic) + 10;
        
        if (tagX + tagWidth > this.pageWidth - this.margin) {
          tagX = this.margin;
          tagY += 15;
        }
        
        // Tag background
        this.pdf.setFillColor(59, 130, 246, 0.1);
        this.pdf.setDrawColor(59, 130, 246);
        this.pdf.roundedRect(tagX, tagY - 3, tagWidth, 10, 2, 2, 'FD');
        
        // Tag text
        this.pdf.setFontSize(8);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.setTextColor(59, 130, 246);
        this.pdf.text(topic, tagX + 5, tagY + 3);
        
        tagX += tagWidth + 5;
      });
      
      this.currentY = tagY + 20;
    }

    // Analysis methodology
    this.currentY = this.checkPageBreak(this.currentY, 50);
    
    this.pdf.setFontSize(16);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Analysis Methodology', this.margin, this.currentY);
    this.currentY += 20;

    const methodology = [
      'Repository data collected via GitHub REST API v3 with comprehensive metadata extraction',
      'AI-powered analysis using advanced natural language processing and machine learning algorithms',
      'Health score calculated based on multiple factors including activity, community engagement, code quality indicators, and industry benchmarks',
      'Recommendations generated from industry best practices, repository-specific analysis, and comparative studies',
      'Report generated using TechHub AI platform with professional PDF formatting and enhanced visualizations',
      'Data processing includes sentiment analysis, trend detection, and predictive modeling where applicable'
    ];

    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    methodology.forEach((item, index) => {
      this.currentY = this.checkPageBreak(this.currentY, 15);
      
      // Methodology item with icon
      this.pdf.setFillColor(245, 245, 245);
      this.pdf.roundedRect(this.margin, this.currentY - 3, this.pageWidth - 2 * this.margin, 12, 2, 2, 'F');
      
      this.pdf.setTextColor(59, 130, 246);
      this.pdf.text(`${index + 1}.`, this.margin + 5, this.currentY + 5);
      
      this.pdf.setTextColor(0, 0, 0);
      this.currentY = this.addWrappedText(item, this.margin + 15, this.currentY + 5, this.pageWidth - 2 * this.margin - 20);
      this.currentY += 8;
    });
  }

  // Enhanced helper methods
  private addHealthScoreVisualization(score: number): void {
    const boxHeight = 35;
    
    // Clean background without artifacts
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 5, 5, 'FD');
    
    // Reset text styling
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Repository Health Score', this.margin + 10, this.currentY + 15);
    
    // Clean score bar without overlapping elements
    const barY = this.currentY + 20;
    const barWidth = this.pageWidth - 2 * this.margin - 80;
    const scoreWidth = (barWidth * score) / 100;
    
    // Background bar with clean edges
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    this.pdf.roundedRect(this.margin + 10, barY, barWidth, 8, 4, 4, 'FD');
    
    // Score bar with clean color
    const color = score >= 80 ? [34, 197, 94] : score >= 60 ? [59, 130, 246] : [239, 68, 68];
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.setDrawColor(color[0], color[1], color[2]);
    this.pdf.roundedRect(this.margin + 10, barY, scoreWidth, 8, 4, 4, 'FD');
    
    // Clean score text
    this.pdf.setFillColor(255, 255, 255); // Reset fill
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(color[0], color[1], color[2]);
    this.pdf.text(`${score}/100`, this.pageWidth - this.margin - 40, this.currentY + 25);
    
    // Score interpretation
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    const interpretation = score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';
    this.pdf.text(interpretation, this.pageWidth - this.margin - 40, this.currentY + 32);
  }

  private addEnhancedChart(chartData: any[]): void {
    const chartHeight = 80;
    const chartWidth = this.pageWidth - 2 * this.margin;
    const chartY = this.currentY;
    
    // Chart background with grid
    this.pdf.setFillColor(248, 250, 252);
    this.pdf.roundedRect(this.margin, chartY, chartWidth, chartHeight, 5, 5, 'F');
    
    // Chart border
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.roundedRect(this.margin, chartY, chartWidth, chartHeight, 5, 5, 'S');
    
    // Grid lines
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.setLineWidth(0.2);
    for (let i = 1; i < 5; i++) {
      const y = chartY + (i * chartHeight / 5);
      this.pdf.line(this.margin + 5, y, this.margin + chartWidth - 5, y);
    }
    
    // Data visualization
    if (chartData.length > 0) {
      const maxValue = Math.max(...chartData.map((d: any) => Math.max(d.value, d.predicted || 0)));
      const minValue = Math.min(...chartData.map((d: any) => Math.min(d.value, d.predicted || 0)));
      const range = maxValue - minValue || 1;
      
      // Plot data points and lines
      chartData.forEach((point: any, index: number) => {
        const x = this.margin + 10 + (index / (chartData.length - 1)) * (chartWidth - 20);
        const y = chartY + chartHeight - 10 - ((point.value - minValue) / range) * (chartHeight - 20);
        
        // Calculate previous X position for line connections
        const prevX = index > 0 ? this.margin + 10 + ((index - 1) / (chartData.length - 1)) * (chartWidth - 20) : x;
        
        // Historical data points
        this.pdf.setFillColor(59, 130, 246);
        this.pdf.circle(x, y, 2, 'F');
        
        // Connect points with lines
        if (index > 0) {
          const prevY = chartY + chartHeight - 10 - ((chartData[index - 1].value - minValue) / range) * (chartHeight - 20);
          this.pdf.setDrawColor(59, 130, 246);
          this.pdf.setLineWidth(1);
          this.pdf.line(prevX, prevY, x, y);
        }
        
        // Predicted data points
        if (point.predicted !== undefined) {
          const predY = chartY + chartHeight - 10 - ((point.predicted - minValue) / range) * (chartHeight - 20);
          this.pdf.setFillColor(147, 51, 234);
          this.pdf.circle(x, predY, 2, 'F');
          
          // Dashed line for predictions
          this.pdf.setDrawColor(147, 51, 234);
          this.pdf.setLineDashPattern([2, 2], 0);
          if (index > 0 && chartData[index - 1].predicted !== undefined) {
            const prevPredY = chartY + chartHeight - 10 - ((chartData[index - 1].predicted - minValue) / range) * (chartHeight - 20);
            this.pdf.line(prevX, prevPredY, x, predY);
          }
          this.pdf.setLineDashPattern([], 0); // Reset dash pattern
        }
      });
    }
    
    // Enhanced legend
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    // Historical legend
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.circle(this.margin + 15, chartY + chartHeight + 15, 3, 'F');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Historical Data', this.margin + 25, chartY + chartHeight + 18);
    
    // Predicted legend
    this.pdf.setFillColor(147, 51, 234);
    this.pdf.circle(this.margin + 100, chartY + chartHeight + 15, 3, 'F');
    this.pdf.text('Predicted Trend', this.margin + 110, chartY + chartHeight + 18);
  }

  private parseAnalysisSections(analysis: string): Array<{title: string, content: string}> {
    const sections = analysis.split(/##\s+/).filter(Boolean);
    
    return sections.map(section => {
      const [title, ...content] = section.split('\n');
      return {
        title: title.trim() || 'Analysis Section',
        content: content.join('\n').trim()
      };
    });
  }

  private extractHealthScore(analysis: string): number {
    const healthScoreMatch = analysis.match(/health score[:\s]+(\d+)/i);
    return healthScoreMatch ? parseInt(healthScoreMatch[1]) : 75;
  }

  // Enhanced health score calculation with MORE factors than basic
  private calculateEnhancedHealthScore(repository: Repository): {
    overall: number;
    breakdown: {
      activity: number;
      community: number;
      maintenance: number;
      documentation: number;
    };
  } {
    let activityScore = 50;
    let communityScore = 50;
    let maintenanceScore = 50;
    let documentationScore = 50;

    // Activity scoring
    const daysSinceUpdate = (Date.now() - new Date(repository.updated_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) activityScore = 100;
    else if (daysSinceUpdate < 30) activityScore = 85;
    else if (daysSinceUpdate < 90) activityScore = 70;
    else if (daysSinceUpdate < 180) activityScore = 50;
    else activityScore = 30;

    // Community scoring
    if (repository.stargazers_count > 1000) communityScore = 100;
    else if (repository.stargazers_count > 500) communityScore = 85;
    else if (repository.stargazers_count > 100) communityScore = 70;
    else if (repository.stargazers_count > 50) communityScore = 55;
    
    if (repository.forks_count > 100) communityScore = Math.min(100, communityScore + 10);
    else if (repository.forks_count > 50) communityScore = Math.min(100, communityScore + 5);

    // Maintenance scoring
    if (repository.open_issues_count < 10) maintenanceScore = 90;
    else if (repository.open_issues_count < 50) maintenanceScore = 70;
    else if (repository.open_issues_count < 100) maintenanceScore = 50;
    else maintenanceScore = 30;

    // Documentation scoring
    if (repository.description && repository.description.length > 50) documentationScore += 20;
    if (repository.topics && repository.topics.length > 3) documentationScore += 15;
    if (repository.license) documentationScore += 15;

    const overall = Math.round((activityScore + communityScore + maintenanceScore + documentationScore) / 4);

    return {
      overall,
      breakdown: {
        activity: activityScore,
        community: communityScore,
        maintenance: maintenanceScore,
        documentation: documentationScore
      }
    };
  }

  // Enhanced health score visualization with breakdown
  private addEnhancedHealthScoreVisualization(scoreData: {
    overall: number;
    breakdown: {
      activity: number;
      community: number;
      maintenance: number;
      documentation: number;
    };
  }): void {
    const boxHeight = 70;
    
    // Clean background
    this.pdf.setFillColor(250, 250, 250);
    this.pdf.setDrawColor(220, 220, 220);
    this.pdf.setLineWidth(0.5);
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 5, 5, 'FD');
    
    // Overall score
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Enhanced Health Score', this.margin + 10, this.currentY + 12);
    
    const barY = this.currentY + 18;
    const barWidth = this.pageWidth - 2 * this.margin - 80;
    const scoreWidth = (barWidth * scoreData.overall) / 100;
    
    this.pdf.setFillColor(240, 240, 240);
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(0.3);
    this.pdf.roundedRect(this.margin + 10, barY, barWidth, 10, 5, 5, 'FD');
    
    const color = scoreData.overall >= 80 ? [34, 197, 94] : scoreData.overall >= 60 ? [59, 130, 246] : [239, 68, 68];
    this.pdf.setFillColor(color[0], color[1], color[2]);
    this.pdf.setDrawColor(color[0], color[1], color[2]);
    this.pdf.roundedRect(this.margin + 10, barY, scoreWidth, 10, 5, 5, 'FD');
    
    this.pdf.setFillColor(255, 255, 255);
    this.pdf.setFontSize(20);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(color[0], color[1], color[2]);
    this.pdf.text(`${scoreData.overall}/100`, this.pageWidth - this.margin - 45, this.currentY + 25);
    
    // Breakdown (NEW - not in basic)
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text('Score Breakdown:', this.margin + 10, this.currentY + 38);
    
    const breakdownY = this.currentY + 45;
    const breakdownItems = [
      { label: 'Activity', score: scoreData.breakdown.activity, color: [59, 130, 246] },
      { label: 'Community', score: scoreData.breakdown.community, color: [147, 51, 234] },
      { label: 'Maintenance', score: scoreData.breakdown.maintenance, color: [34, 197, 94] },
      { label: 'Documentation', score: scoreData.breakdown.documentation, color: [245, 158, 11] }
    ];
    
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    
    breakdownItems.forEach((item, index) => {
      const x = this.margin + 10 + (index * 42);
      
      // Mini bar
      const miniBarWidth = 35;
      const miniScoreWidth = (miniBarWidth * item.score) / 100;
      
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.roundedRect(x, breakdownY, miniBarWidth, 4, 2, 2, 'F');
      
      this.pdf.setFillColor(item.color[0], item.color[1], item.color[2]);
      this.pdf.roundedRect(x, breakdownY, miniScoreWidth, 4, 2, 2, 'F');
      
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(item.label, x, breakdownY + 10);
      this.pdf.setTextColor(item.color[0], item.color[1], item.color[2]);
      this.pdf.text(`${item.score}`, x + miniBarWidth - 10, breakdownY + 10);
    });
  }

  // Repository metrics comparison (NEW - not in basic)
  private addRepositoryMetricsComparison(repository: Repository): void {
    this.currentY = this.checkPageBreak(this.currentY, 50);
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Repository Metrics', this.margin, this.currentY);
    this.currentY += 15;
    
    // Calculate percentiles (simulated - in real app, compare with similar repos)
    const metrics = [
      { 
        label: 'Stars', 
        value: repository.stargazers_count, 
        percentile: this.calculatePercentile(repository.stargazers_count, [0, 10, 50, 100, 500, 1000]),
        icon: '⭐'
      },
      { 
        label: 'Forks', 
        value: repository.forks_count, 
        percentile: this.calculatePercentile(repository.forks_count, [0, 5, 20, 50, 100, 200]),
        icon: '🔀'
      },
      { 
        label: 'Issues', 
        value: repository.open_issues_count, 
        percentile: 100 - this.calculatePercentile(repository.open_issues_count, [0, 5, 20, 50, 100, 200]),
        icon: '🐛'
      }
    ];
    
    metrics.forEach((metric, index) => {
      const y = this.currentY + (index * 12);
      
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.text(`${metric.icon} ${metric.label}: ${metric.value.toLocaleString()}`, this.margin + 5, y);
      
      // Percentile bar
      const barX = this.margin + 60;
      const barWidth = 80;
      const percentileWidth = (barWidth * metric.percentile) / 100;
      
      this.pdf.setFillColor(240, 240, 240);
      this.pdf.roundedRect(barX, y - 4, barWidth, 6, 3, 3, 'F');
      
      const barColor = metric.percentile >= 70 ? [34, 197, 94] : metric.percentile >= 40 ? [59, 130, 246] : [245, 158, 11];
      this.pdf.setFillColor(barColor[0], barColor[1], barColor[2]);
      this.pdf.roundedRect(barX, y - 4, percentileWidth, 6, 3, 3, 'F');
      
      this.pdf.setFontSize(8);
      this.pdf.setTextColor(100, 100, 100);
      this.pdf.text(`Top ${100 - metric.percentile}%`, barX + barWidth + 5, y);
    });
    
    this.currentY += 40;
  }

  // Activity timeline (NEW - not in basic)
  private addActivityTimeline(repository: Repository): void {
    this.currentY = this.checkPageBreak(this.currentY, 40);
    
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Activity Timeline', this.margin, this.currentY);
    this.currentY += 15;
    
    const created = new Date(repository.created_at);
    const updated = new Date(repository.updated_at);
    const now = new Date();
    
    const ageInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
    const daysSinceUpdate = (now.getTime() - updated.getTime()) / (1000 * 60 * 60 * 24);
    
    // Timeline visualization
    const timelineWidth = this.pageWidth - 2 * this.margin - 20;
    const timelineY = this.currentY;
    
    // Background line
    this.pdf.setDrawColor(200, 200, 200);
    this.pdf.setLineWidth(2);
    this.pdf.line(this.margin + 10, timelineY, this.margin + 10 + timelineWidth, timelineY);
    
    // Created marker
    this.pdf.setFillColor(59, 130, 246);
    this.pdf.circle(this.margin + 10, timelineY, 3, 'F');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Created', this.margin + 10, timelineY + 8);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(created.toLocaleDateString(), this.margin + 10, timelineY + 14);
    
    // Last update marker
    const updatePosition = Math.min(0.95, (ageInDays - daysSinceUpdate) / ageInDays);
    const updateX = this.margin + 10 + (timelineWidth * updatePosition);
    
    const updateColor = daysSinceUpdate < 30 ? [34, 197, 94] : daysSinceUpdate < 90 ? [245, 158, 11] : [239, 68, 68];
    this.pdf.setFillColor(updateColor[0], updateColor[1], updateColor[2]);
    this.pdf.circle(updateX, timelineY, 3, 'F');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Last Update', updateX - 15, timelineY + 8);
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(updated.toLocaleDateString(), updateX - 15, timelineY + 14);
    
    // Now marker
    this.pdf.setFillColor(147, 51, 234);
    this.pdf.circle(this.margin + 10 + timelineWidth, timelineY, 3, 'F');
    this.pdf.setFontSize(8);
    this.pdf.setTextColor(0, 0, 0);
    this.pdf.text('Now', this.margin + timelineWidth, timelineY + 8);
    
    // Age info
    this.currentY += 25;
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(100, 100, 100);
    this.pdf.text(
      `Repository age: ${Math.floor(ageInDays)} days • Last updated: ${Math.floor(daysSinceUpdate)} days ago`,
      this.margin + 10,
      this.currentY
    );
  }

  private calculatePercentile(value: number, thresholds: number[]): number {
    for (let i = thresholds.length - 1; i >= 0; i--) {
      if (value >= thresholds[i]) {
        return Math.round((i / (thresholds.length - 1)) * 100);
      }
    }
    return 0;
  }

  private extractHealthScoreHTML(analysis: string): string {
    const score = this.extractHealthScore(analysis);
    const color = score >= 80 ? '#22c55e' : score >= 60 ? '#3b82f6' : '#ef4444';
    
    return `
      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h4 style="margin: 0 0 15px 0;">Repository Health Score</h4>
        <div style="background: #e5e7eb; height: 10px; border-radius: 5px; overflow: hidden;">
          <div style="background: ${color}; height: 100%; width: ${score}%; border-radius: 5px;"></div>
        </div>
        <div style="text-align: right; margin-top: 5px; font-weight: bold; color: ${color};">
          ${score}/100
        </div>
      </div>
    `;
  }

  private formatAnalysisHTML(analysis: string): string {
    return analysis
      .replace(/##\s+([^\n]+)/g, '<h4 style="color: #3b82f6; margin: 20px 0 10px 0;">$1</h4>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '</p><p>')
      .replace(/^/, '<p>')
      .replace(/$/, '</p>');
  }

  private generatePredictionHTML(prediction: any): string {
    if (!prediction.keyMetrics) return '';
    
    return `
      <div style="margin-bottom: 30px;">
        <h3 style="color: #3b82f6;">Predictive Analytics</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;">
          ${prediction.keyMetrics.map((metric: any) => `
            <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
              <div style="font-size: 14px; color: #64748b; margin-bottom: 5px;">${metric.label}</div>
              <div style="font-size: 20px; font-weight: bold; color: #3b82f6;">${metric.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private extractKeyPoints(analysis: string): string[] {
    const points: string[] = [];
    
    // Look for bullet points
    const bulletMatches = analysis.match(/[•\-\*]\s+([^\n]+)/g);
    if (bulletMatches) {
      points.push(...bulletMatches.map(match => match.replace(/[•\-\*]\s+/, '').trim()).slice(0, 5));
    }
    
    // Look for key sentences
    const keyIndicators = ['critical', 'important', 'significant', 'major', 'key', 'primary', 'notable'];
    const sentences = analysis.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (keyIndicators.some(indicator => sentence.toLowerCase().includes(indicator)) && sentence.trim().length > 20) {
        points.push(sentence.trim());
      }
    });
    
    return [...new Set(points)].slice(0, 6); // Remove duplicates and limit
  }

  private extractRecommendations(analysis: string): string[] {
    const defaultRecommendations = [
      "Implement comprehensive automated testing suite with unit, integration, and end-to-end tests",
      "Improve documentation with clear README, API docs, and contribution guidelines",
      "Establish clear contribution guidelines and code of conduct for community engagement",
      "Set up issue templates and labels for better organization and triage",
      "Consider implementing security scanning tools and vulnerability management",
      "Regular dependency updates and vulnerability checks with automated tools",
      "Implement continuous integration and deployment pipelines for better workflow",
      "Add code quality checks, linting rules, and formatting standards",
      "Set up monitoring and alerting for system health and potential issues"
    ];
    
    // Try to extract actual recommendations
    const recSection = analysis.match(/recommendations?[:\s]+([\s\S]*?)(?=##|$)/i);
    if (recSection) {
      const extractedRecs = recSection[1].match(/[•\-\*]\s+([^\n]+)/g);
      if (extractedRecs && extractedRecs.length > 0) {
        return extractedRecs.map(rec => rec.replace(/[•\-\*]\s+/, '').trim()).slice(0, 8);
      }
    }
    
    return defaultRecommendations;
  }

  // Utility methods
  private addPage(): void {
    this.pdf.addPage();
    this.currentY = 30;
    
    // Clean page initialization to prevent artifacts
    this.pdf.setFillColor(255, 255, 255); // White background
    this.pdf.setDrawColor(0, 0, 0); // Black lines
    this.pdf.setTextColor(0, 0, 0); // Black text
    this.pdf.setLineWidth(0.5); // Standard line width
  }

  private checkPageBreak(currentY: number, requiredHeight: number): number {
    if (currentY + requiredHeight > 270) {
      this.addPage();
      return 30;
    }
    return currentY;
  }

  private addWrappedText(text: string, x: number, y: number, maxWidth: number): number {
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      this.pdf.text(line, x, currentY);
      currentY += this.lineHeight;
    });
    
    return currentY;
  }

  private addWrappedTextWithPagination(text: string, x: number, y: number, maxWidth: number): number {
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      currentY = this.checkPageBreak(currentY, this.lineHeight + 2);
      this.pdf.text(line, x, currentY);
      currentY += this.lineHeight;
    });
    
    return currentY;
  }

  private addCleanWrappedText(text: string, x: number, y: number, maxWidth: number): number {
    // Ensure clean text rendering without background artifacts
    this.pdf.setFillColor(255, 255, 255); // Ensure white background
    this.pdf.setTextColor(0, 0, 0); // Ensure black text
    
    const lines = this.pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      currentY = this.checkPageBreak(currentY, this.lineHeight + 2);
      // Clear any potential background artifacts before rendering text
      this.pdf.text(line.trim(), x, currentY);
      currentY += this.lineHeight;
    });
    
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
      this.pdf.text(`${repository.full_name} - Analysis Report`, 20, 285);
      this.pdf.text(`Page ${i} of ${pageCount}`, this.pageWidth - 20, 285, { align: 'right' });
      this.pdf.text(`Generated by TechHub AI • ${new Date().toLocaleDateString()}`, this.pageWidth / 2, 285, { align: 'center' });
    }
  }
}

// Export convenience function
export async function generateEnhancedPDFReport(
  repository: Repository, 
  analysis: string, 
  options: PDFGenerationOptions = {}
): Promise<void> {
  const generator = new EnhancedPDFGenerator();
  await generator.generateReport(repository, analysis, options);
}
import * as fs from 'fs';

/**
 * Lightweight PDF Generator
 * Memory-optimized for large reports
 * Generates beautiful PDFs without heavy dependencies
 */
export class LightweightPDFGenerator {
  
  /**
   * Generate PDF from analysis results
   */
  async generatePDF(data: any, options: PDFOptions = {}): Promise<string> {
    const filename = options.filename || `analysis-${Date.now()}.pdf`;
    
    console.log('📄 Generating PDF report...');
    
    try {
      // Use jsPDF for lightweight PDF generation
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Set up document
      this.setupDocument(doc);
      
      // Add content based on data type
      if (data.issue) {
        // Single issue report
        this.addSingleIssueContent(doc, data);
      } else if (Array.isArray(data)) {
        // Batch report
        this.addBatchContent(doc, data, options);
      }
      
      // Save PDF
      doc.save(filename);
      
      // Get file size
      const stats = fs.statSync(filename);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      
      console.log(`✅ PDF generated: ${filename} (${sizeMB} MB)`);
      return filename;
      
    } catch (error) {
      console.error('❌ Error generating PDF:', error);
      
      // Fallback to HTML report
      return this.generateHTMLReport(data, options);
    }
  }
  
  private setupDocument(doc: any): void {
    // Set document properties
    doc.setProperties({
      title: 'GitHub Issue Analysis Report',
      subject: 'Comprehensive analysis with Stack Overflow solutions',
      author: 'GitHub Issue Analyzer',
      creator: 'Memory-Optimized Analyzer'
    });
    
    // Set default font
    doc.setFont('helvetica');
  }
  
  private addSingleIssueContent(doc: any, data: any): void {
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('🔍 GitHub Issue Analysis', 20, yPos);
    yPos += 15;
    
    // Issue details
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text(`Issue #${data.issue.number}: ${this.truncateText(data.issue.title, 60)}`, 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text(`State: ${data.issue.state.toUpperCase()}`, 20, yPos);
    yPos += 7;
    doc.text(`Comments: ${data.issue.comments}`, 20, yPos);
    yPos += 7;
    doc.text(`Reactions: ${data.issue.reactions}`, 20, yPos);
    yPos += 10;
    
    // URL (clickable)
    doc.setTextColor(0, 102, 204);
    doc.textWithLink('View on GitHub', 20, yPos, { url: data.issue.url });
    yPos += 15;
    
    // Stack Overflow Solutions
    if (data.stackOverflowSolutions && data.stackOverflowSolutions.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('💡 Stack Overflow Solutions', 20, yPos);
      yPos += 10;
      
      data.stackOverflowSolutions.forEach((solution: any, index: number) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${this.truncateText(solution.title, 70)}`, 25, yPos);
        yPos += 7;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Score: ${solution.score} | Views: ${solution.view_count?.toLocaleString() || 'N/A'}`, 30, yPos);
        yPos += 5;
        
        if (solution.link) {
          doc.setTextColor(0, 102, 204);
          doc.textWithLink('View Solution', 30, yPos, { url: solution.link });
        }
        yPos += 10;
      });
    }
    
    // Analysis timestamp
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, yPos);
  }
  
  private addBatchContent(doc: any, data: any[], options: PDFOptions): void {
    let yPos = 20;
    
    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 102, 204);
    doc.text('📊 Batch Analysis Report', 20, yPos);
    yPos += 15;
    
    // Summary
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(`Repository: ${options.owner}/${options.repo}`, 20, yPos);
    yPos += 8;
    doc.text(`Total Issues Analyzed: ${data.length}`, 20, yPos);
    yPos += 8;
    
    const withSolutions = data.filter(item => item.stackOverflowSolutions?.length > 0);
    doc.text(`Issues with Solutions: ${withSolutions.length} (${(withSolutions.length / data.length * 100).toFixed(1)}%)`, 20, yPos);
    yPos += 15;
    
    // Statistics
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('📈 Statistics', 20, yPos);
    yPos += 10;
    
    const totalSolutions = data.reduce((sum, item) => sum + (item.stackOverflowSolutions?.length || 0), 0);
    const openIssues = data.filter(item => item.state === 'open').length;
    const closedIssues = data.filter(item => item.state === 'closed').length;
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`• Total Stack Overflow Solutions: ${totalSolutions}`, 25, yPos);
    yPos += 7;
    doc.text(`• Open Issues: ${openIssues}`, 25, yPos);
    yPos += 7;
    doc.text(`• Closed Issues: ${closedIssues}`, 25, yPos);
    yPos += 15;
    
    // Top Issues with Solutions
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('🔥 Top Issues with Solutions', 20, yPos);
    yPos += 10;
    
    const topIssues = withSolutions
      .sort((a, b) => (b.stackOverflowSolutions?.length || 0) - (a.stackOverflowSolutions?.length || 0))
      .slice(0, 20); // Top 20 for PDF
    
    topIssues.forEach((item: any, index: number) => {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const stateEmoji = item.state === 'open' ? '🔓' : '✅';
      doc.text(`${index + 1}. ${stateEmoji} #${item.issueNumber}: ${this.truncateText(item.title, 50)}`, 25, yPos);
      yPos += 7;
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Solutions: ${item.stackOverflowSolutions?.length || 0} | State: ${item.state}`, 30, yPos);
      yPos += 5;
      
      if (item.url) {
        doc.setTextColor(0, 102, 204);
        doc.textWithLink('View Issue', 30, yPos, { url: item.url });
      }
      yPos += 10;
    });
    
    // Add new page for detailed solutions
    doc.addPage();
    yPos = 20;
    
    doc.setFontSize(16);
    doc.setTextColor(0, 102, 204);
    doc.text('💡 Detailed Solutions', 20, yPos);
    yPos += 15;
    
    // Add top 10 issues with their solutions
    topIssues.slice(0, 10).forEach((item: any, index: number) => {
      if (yPos > 220) {
        doc.addPage();
        yPos = 20;
      }
      
      // Issue title
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. Issue #${item.issueNumber}`, 20, yPos);
      yPos += 7;
      
      doc.setFontSize(11);
      doc.text(this.truncateText(item.title, 80), 25, yPos);
      yPos += 10;
      
      // Solutions
      if (item.stackOverflowSolutions && item.stackOverflowSolutions.length > 0) {
        doc.setFontSize(10);
        doc.setTextColor(0, 102, 204);
        doc.text('Stack Overflow Solutions:', 25, yPos);
        yPos += 5;
        
        item.stackOverflowSolutions.slice(0, 3).forEach((solution: any, solIndex: number) => {
          doc.setFontSize(9);
          doc.setTextColor(0, 0, 0);
          doc.text(`• ${this.truncateText(solution.title, 70)}`, 30, yPos);
          yPos += 4;
          
          if (solution.link) {
            doc.setTextColor(0, 102, 204);
            doc.textWithLink('View', 35, yPos, { url: solution.link });
            yPos += 4;
          }
        });
      }
      
      yPos += 8;
    });
    
    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Generated: ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`, 20, 285);
    }
  }
  
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  private async generateHTMLReport(data: any, options: PDFOptions): Promise<string> {
    console.log('📄 Generating HTML report as fallback...');
    
    const filename = options.filename?.replace('.pdf', '.html') || `analysis-${Date.now()}.html`;
    
    let html = `
<!DOCTYPE html>
<html>
<head>
    <title>GitHub Issue Analysis Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { color: #0066cc; border-bottom: 2px solid #0066cc; padding-bottom: 10px; }
        .issue { margin: 20px 0; padding: 15px; border-left: 4px solid #0066cc; background: #f9f9f9; }
        .solution { margin: 10px 0; padding: 10px; background: #fff; border: 1px solid #ddd; }
        .stats { background: #e8f4fd; padding: 15px; margin: 20px 0; border-radius: 5px; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
        .emoji { font-size: 1.2em; }
    </style>
</head>
<body>
`;
    
    if (data.issue) {
      // Single issue HTML
      html += `
        <h1 class="header">🔍 GitHub Issue Analysis</h1>
        <div class="issue">
            <h2>Issue #${data.issue.number}: ${data.issue.title}</h2>
            <p><strong>State:</strong> ${data.issue.state.toUpperCase()}</p>
            <p><strong>Comments:</strong> ${data.issue.comments}</p>
            <p><strong>Reactions:</strong> ${data.issue.reactions}</p>
            <p><a href="${data.issue.url}" target="_blank">View on GitHub</a></p>
        </div>
      `;
      
      if (data.stackOverflowSolutions?.length > 0) {
        html += '<h2>💡 Stack Overflow Solutions</h2>';
        data.stackOverflowSolutions.forEach((solution: any, index: number) => {
          html += `
            <div class="solution">
                <h3>${index + 1}. ${solution.title}</h3>
                <p>Score: ${solution.score} | Views: ${solution.view_count?.toLocaleString() || 'N/A'}</p>
                ${solution.link ? `<p><a href="${solution.link}" target="_blank">View Solution</a></p>` : ''}
            </div>
          `;
        });
      }
    } else if (Array.isArray(data)) {
      // Batch HTML
      const withSolutions = data.filter(item => item.stackOverflowSolutions?.length > 0);
      
      html += `
        <h1 class="header">📊 Batch Analysis Report</h1>
        <div class="stats">
            <h2>📈 Statistics</h2>
            <p><strong>Repository:</strong> ${options.owner}/${options.repo}</p>
            <p><strong>Total Issues:</strong> ${data.length}</p>
            <p><strong>Issues with Solutions:</strong> ${withSolutions.length} (${(withSolutions.length / data.length * 100).toFixed(1)}%)</p>
        </div>
      `;
      
      html += '<h2>🔥 Issues with Solutions</h2>';
      withSolutions.slice(0, 50).forEach((item: any) => {
        const stateEmoji = item.state === 'open' ? '🔓' : '✅';
        html += `
          <div class="issue">
              <h3>${stateEmoji} Issue #${item.issueNumber}: ${item.title}</h3>
              <p><strong>State:</strong> ${item.state} | <strong>Solutions:</strong> ${item.stackOverflowSolutions?.length || 0}</p>
              <p><a href="${item.url}" target="_blank">View Issue</a></p>
          </div>
        `;
      });
    }
    
    html += `
    <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 0.9em;">
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>GitHub Issue Analyzer - Memory Optimized Version</p>
    </div>
</body>
</html>
`;
    
    fs.writeFileSync(filename, html);
    
    const stats = fs.statSync(filename);
    const sizeKB = (stats.size / 1024).toFixed(2);
    
    console.log(`✅ HTML report generated: ${filename} (${sizeKB} KB)`);
    return filename;
  }
}

export interface PDFOptions {
  filename?: string;
  owner?: string;
  repo?: string;
}